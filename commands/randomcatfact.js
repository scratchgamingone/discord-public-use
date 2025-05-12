const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomcatfact')
    .setDescription('🐱 Get a random cat fact!'),
  async execute(interaction) {
    try {
      const response = await axios.get('https://catfact.ninja/fact');
      const fact = response.data.fact;

      await interaction.reply({
        embeds: [{
          title: '🐾 Did You Know?',
          description: `😺 ${fact}`,
          color: 0xf4a261,
          footer: { text: 'Source: catfact.ninja' }
        }]
      });
    } catch (error) {
      console.error('❌ Failed to fetch cat fact:', error);
      await interaction.reply('❌ Could not fetch a cat fact at the moment. Try again later!');
    }
  }
};
