const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomspaceimage')
    .setDescription('🌌 Get a random NASA space image!'),
  async execute(interaction) {
    try {
      const response = await axios.get('https://api.nasa.gov/planetary/apod', {
        params: {
          api_key: process.env.NASA_API_KEY,
          count: 1 // Request 1 random image
        }
      });

      const image = response.data[0];

      await interaction.reply({
        embeds: [
          {
            title: `🌠 ${image.title}`,
            description: image.explanation.length > 1024 ? image.explanation.slice(0, 1021) + "..." : image.explanation,
            image: { url: image.url },
            color: 0x1d2951,
            footer: { text: `Date: ${image.date} • Source: NASA` }
          }
        ]
      });
    } catch (error) {
      console.error('❌ Failed to fetch NASA image:', error);
      await interaction.reply('❌ Could not fetch a space image right now. Try again later!');
    }
  }
};
