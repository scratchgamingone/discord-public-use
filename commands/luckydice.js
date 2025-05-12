const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('luckydice')
        .setDescription('🎲 Roll a lucky dice!')
        .addIntegerOption(option =>
            option.setName('sides')
                .setDescription('Number of sides (6 or 20)')
                .setRequired(false)
                .addChoices(
                    { name: '6-sided dice', value: 6 },
                    { name: '20-sided dice', value: 20 }
                )
        ),
    async execute(interaction) {
        const sides = interaction.options.getInteger('sides') || 6;
        const roll = Math.floor(Math.random() * sides) + 1;

        let resultMessage;
        if (sides === 6) {
            resultMessage = roll === 6 ? '🍀 Lucky! You rolled the highest!' : `🎲 You rolled a ${roll}.`;
        } else if (sides === 20) {
            resultMessage = roll === 20 ? '🌟 Critical success! Amazing roll!' :
                             roll === 1 ? '💀 Critical fail! Better luck next time.' :
                             `🎲 You rolled a ${roll}.`;
        }

        const embed = new EmbedBuilder()
            .setTitle('🎲 Lucky Dice Roll')
            .setDescription(resultMessage)
            .setFooter({ text: `Rolled a ${sides}-sided dice` })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    },
};
