const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('quickmath')
        .setDescription('🧠 Keep solving math problems until you make a mistake'),

    async execute(interaction) {
        await interaction.reply({ content: '🧠 Starting Quick Math Challenge...', ephemeral: true });

        let score = 0;
        let isCorrect = true;

        const askQuestion = async () => {
            const operations = ['+', '-', '*'];
            const num1 = Math.floor(Math.random() * 20) + 1;
            const num2 = Math.floor(Math.random() * 20) + 1;
            const op = operations[Math.floor(Math.random() * operations.length)];

            let correctAnswer;
            switch (op) {
                case '+': correctAnswer = num1 + num2; break;
                case '-': correctAnswer = num1 - num2; break;
                case '*': correctAnswer = num1 * num2; break;
            }

            const allAnswers = new Set([correctAnswer]);
            while (allAnswers.size < 4) {
                const fake = correctAnswer + Math.floor(Math.random() * 11) - 5;
                allAnswers.add(fake);
            }

            const options = Array.from(allAnswers).sort(() => Math.random() - 0.5);
            const row = new ActionRowBuilder().addComponents(
                options.map(ans =>
                    new ButtonBuilder()
                        .setCustomId(`answer_${ans}`)
                        .setLabel(ans.toString())
                        .setStyle(ButtonStyle.Primary)
                )
            );

            const questionText = `🔢 What is \`${num1} ${op} ${num2}\`?\n**Current Streak: ${score}**`;
            const msg = await interaction.followUp({ content: questionText, components: [row], fetchReply: true });

            const collector = msg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 15000,
                max: 1
            });

            collector.on('collect', async i => {
                if (i.user.id !== interaction.user.id) {
                    return i.reply({ content: "❌ This isn't your question!", ephemeral: true });
                }

                const selected = parseInt(i.customId.split('_')[1]);
                if (selected === correctAnswer) {
                    score++;
                    await i.update({ content: `✅ Correct! Score: **${score}**`, components: [] });
                    setTimeout(askQuestion, 1000);
                } else {
                    isCorrect = false;
                    await i.update({
                        content: `❌ Wrong! The correct answer was **${correctAnswer}**.\n🎯 Final Score: **${score}**`,
                        components: []
                    });
                }
            });

            collector.on('end', collected => {
                if (collected.size === 0 && isCorrect) {
                    interaction.followUp({
                        content: `⏰ Time's up! Final Score: **${score}**`,
                        ephemeral: true
                    });
                    isCorrect = false;
                }
            });
        };

        askQuestion();
    }
};
