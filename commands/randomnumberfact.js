const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomnumberfact')
        .setDescription('🔢 Get a totally random fact about a number'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            // Random number between 1 and 9999
            const randomNum = Math.floor(Math.random() * 9999) + 1;

            const res = await axios.get(`http://numbersapi.com/${randomNum}`);
            const fact = res.data;

            const embed = new EmbedBuilder()
                .setTitle(`🧠 Number Fact: ${randomNum}`)
                .setDescription(fact)
                .setColor('Random')
                .setFooter({ text: 'Facts provided by numbersapi.com' });

            await interaction.editReply({ embeds: [embed] });
        } catch (err) {
            console.error("❌ Failed to fetch number fact:", err);
            await interaction.editReply({
                content: '❌ Failed to fetch a number fact. Please try again later.'
            });
        }
    }
};
