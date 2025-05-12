const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('yesno')
        .setDescription('🎱 Ask the magic bot and get a yes, no, or maybe (with a GIF)!'),

    async execute(interaction) {
        try {
            const response = await axios.get('https://yesno.wtf/api');

            if (!response.data || !response.data.answer || !response.data.image) {
                console.warn('⚠️ YesNo API returned incomplete data.');
                return interaction.reply('❌ Could not fetch an answer. Please try again later.');
            }

            await interaction.reply(`🎱 **Answer:** ${response.data.answer.toUpperCase()}\n${response.data.image}`);
        } catch (error) {
            console.error('❌ Error fetching yes/no answer:', error.code || error.message);
            await interaction.reply('❌ Could not fetch an answer. Please try again later.');
        }
    },
};
