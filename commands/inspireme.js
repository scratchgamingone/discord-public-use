const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('inspireme')
    .setDescription('💡 Get a random motivational quote!'),
  async execute(interaction) {
    try {
      const response = await axios.get('https://zenquotes.io/api/random');
      const quote = response.data[0];

      await interaction.reply({
        embeds: [
          {
            title: '💬 Inspirational Quote',
            description: `*"${quote.q}"*\n\n— **${quote.a}**`,
            color: 0x00bfff,
            footer: { text: 'Powered by zenquotes.io' },
          }
        ]
      });
    } catch (error) {
      console.error('❌ Failed to fetch quote:', error);
      await interaction.reply('❌ Sorry, I couldn’t fetch a quote right now. Try again later.');
    }
  }
};
