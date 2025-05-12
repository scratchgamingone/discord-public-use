const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('nasaapod')
        .setDescription('🔭 Get today’s NASA Astronomy Picture of the Day!'),
    async execute(interaction) {
        try {
            const apiKey = process.env.NASA_API_KEY;
            const response = await axios.get(`https://api.nasa.gov/planetary/apod?api_key=${apiKey}`);

            const { title, explanation, url, media_type } = response.data;

            if (media_type !== 'image') {
                return interaction.reply('❌ Today’s APOD is not an image. Please check NASA’s website for the video.');
            }

            const embed = new EmbedBuilder()
                .setTitle(`🌌 NASA Astronomy Picture of the Day`)
                .setDescription(`**${title}**\n\n${explanation}`)
                .setImage(url)
                .setFooter({ text: 'Source: NASA APOD', iconURL: 'https://apod.nasa.gov/apod/image/1901/IC405_Abolfath_3952.jpg' })
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        } catch (error) {
            console.error('❌ Error fetching NASA APOD:', error);
            await interaction.reply('❌ Failed to fetch the NASA Astronomy Picture of the Day. Please try again later.');
        }
    },
};
