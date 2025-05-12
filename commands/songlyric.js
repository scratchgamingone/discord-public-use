const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('songlyric')
        .setDescription('🎶 Get a random lyric from a popular song'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const response = await axios.get('https://api.lyrics.ovh/v1/Eminem/Lose Yourself'); // Example: Eminem
            const lyrics = response.data?.lyrics;

            if (!lyrics) {
                return interaction.editReply('❌ No lyrics found.');
            }

            const lines = lyrics.split('\n').filter(line => line.trim().length > 0);
            const randomLine = lines[Math.floor(Math.random() * lines.length)];

            await interaction.editReply(`🎤 **Random Lyric:**\n"${randomLine}"`);
        } catch (error) {
            console.error('❌ Lyrics API error:', error.message);
            await interaction.editReply({
                content: '❌ Failed to fetch a lyric. Try again later.',
                ephemeral: true
            });
        }
    }
};
