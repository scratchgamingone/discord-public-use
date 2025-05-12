const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guessemojihard')
        .setDescription('🎯 Hard mode: guess the correct emoji from buttons!'),
    async execute(interaction) {
        const emojiPool = [
            { name: 'heart', symbol: '❤️' },
            { name: 'fire', symbol: '🔥' },
            { name: 'star', symbol: '⭐' },
            { name: 'thumbs up', symbol: '👍' },
            { name: 'laugh', symbol: '😂' },
            { name: 'clap', symbol: '👏' },
            { name: 'rocket', symbol: '🚀' },
            { name: 'alien', symbol: '👽' },
            { name: 'ghost', symbol: '👻' },
            { name: 'skull', symbol: '💀' },
            { name: 'lightning', symbol: '⚡' },
            { name: 'ice', symbol: '❄️' }
        ];

        // Shuffle and pick 4 random emojis
        const shuffled = emojiPool.sort(() => 0.5 - Math.random()).slice(0, 4);
        const correctEmoji = shuffled[Math.floor(Math.random() * shuffled.length)];

        const embed = new EmbedBuilder()
            .setTitle('🎯 Guess the Emoji (HARD MODE)')
            .setDescription('Can you pick the correct emoji? You have **one click**! Good luck!')
            .setFooter({ text: `Hint: The correct one is: ${correctEmoji.name}` }) // you can REMOVE this line if you don’t want a hint
            .setTimestamp();

        const row = new ActionRowBuilder();
        shuffled.forEach(e => {
            row.addComponents(
                new ButtonBuilder()
                    .setCustomId(`emoji_${e.name}`)
                    .setLabel(e.symbol)
                    .setStyle(ButtonStyle.Primary)
            );
        });

        const message = await interaction.reply({ embeds: [embed], components: [row], fetchReply: true });

        const collector = message.createMessageComponentCollector({ time: 10000, max: 1 });

        collector.on('collect', async i => {
            if (i.user.id !== interaction.user.id) {
                return i.reply({ content: '❌ Only the original player can click!', ephemeral: true });
            }

            if (i.customId === `emoji_${correctEmoji.name}`) {
                await i.update({ content: `✅ Correct! You picked ${correctEmoji.symbol} (${correctEmoji.name}).`, embeds: [], components: [] });
            } else {
                await i.update({ content: `❌ Wrong! The correct emoji was ${correctEmoji.symbol} (${correctEmoji.name}).`, embeds: [], components: [] });
            }
        });

        collector.on('end', async collected => {
            if (collected.size === 0) {
                await interaction.editReply({ content: `⏰ Time’s up! The correct emoji was ${correctEmoji.symbol} (${correctEmoji.name}).`, embeds: [], components: [] });
            }
        });
    },
};
