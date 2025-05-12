const {
    SlashCommandBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ComponentType
} = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('colorgame')
        .setDescription('🎨 Guess the color after a 5-second flash!'),

    async execute(interaction) {
        await interaction.deferReply(); // public

        const colors = [
            { name: 'Red', hex: '#FF0000' },
            { name: 'Blue', hex: '#0000FF' },
            { name: 'Green', hex: '#00FF00' },
            { name: 'Yellow', hex: '#FFFF00' },
            { name: 'Purple', hex: '#800080' },
            { name: 'Orange', hex: '#FFA500' },
            { name: 'Pink', hex: '#FFC0CB' },
            { name: 'Cyan', hex: '#00FFFF' }
        ];

        let score = 0;
        let gameOver = false;

        const startRound = async () => {
            const correct = colors[Math.floor(Math.random() * colors.length)];
            const hex = correct.hex.replace('#', '');
            const imageURL = `https://singlecolorimage.com/get/${hex}/400x100`;

            const embed = new EmbedBuilder()
                .setTitle('🎨 Memorize this color!')
                .setImage(imageURL)
                .setColor(correct.hex)
                .setFooter({ text: 'You have 5 seconds to memorize it...' });

            const colorMsg = await interaction.followUp({
                embeds: [embed],
                fetchReply: true
            });

            // Wait 5 seconds then delete the color
            await new Promise(resolve => setTimeout(resolve, 5000));
            await colorMsg.delete().catch(() => {});

            // Prepare guessing buttons
            const otherOptions = colors.filter(c => c.name !== correct.name)
                .sort(() => 0.5 - Math.random())
                .slice(0, 3);
            const options = [...otherOptions, correct].sort(() => 0.5 - Math.random());

            const row = new ActionRowBuilder().addComponents(
                options.map(c =>
                    new ButtonBuilder()
                        .setCustomId(`guess_${c.name}`)
                        .setLabel(c.name)
                        .setStyle(ButtonStyle.Secondary)
                )
            );

            const guessMsg = await interaction.followUp({
                content: `❓ <@${interaction.user.id}> What color did you just see?\n**Current Score:** ${score}`,
                components: [row],
                fetchReply: true
            });

            const collector = guessMsg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 15000,
                max: 1
            });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({
                        content: "❌ This isn't your game! Run `/colorgame` to play your own.",
                        ephemeral: true
                    });
                }

                const chosen = i.customId.replace('guess_', '');
                const correctGuess = chosen === correct.name;

                if (correctGuess) {
                    score++;
                    await i.update({
                        content: `✅ Correct! That was **${correct.name}**.\nNext round starting...`,
                        components: []
                    });
                    setTimeout(startRound, 1500);
                } else {
                    gameOver = true;
                    await i.update({
                        content: `❌ Wrong! That was **${correct.name}**.\n🎯 Final Score: **${score}**`,
                        components: []
                    });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0 && !gameOver) {
                    interaction.followUp({
                        content: `⏰ Time’s up! The correct color was **${correct.name}**.\n🎯 Final Score: **${score}**`
                    });
                }
            });
        };

        startRound();
    }
};
