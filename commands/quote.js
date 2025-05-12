const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quote')
    .setDescription('Fetches a random inspirational quote.'),
  async execute(interaction) {
    try {
      const response = await axios.get('https://zenquotes.io/api/random');
      const [quoteData] = response.data;
      const quote = quoteData.q;
      const author = quoteData.a;

      await interaction.reply(`> "${quote}"\n— **${author}**`);
    } catch (error) {
      console.error('Error fetching quote:', error);
      await interaction.reply('❌ Sorry, I couldn\'t fetch a quote at this time.');
    }
  },
};
