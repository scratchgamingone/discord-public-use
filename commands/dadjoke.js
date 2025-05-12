const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dadjoke')
    .setDescription('Get a random dad joke!'),
  async execute(interaction) {
    try {
      const response = await axios.get('https://icanhazdadjoke.com/', {
        headers: { Accept: 'application/json' },
      });
      const joke = response.data.joke;
      await interaction.reply(`😂 **Dad Joke:** ${joke}`);
    } catch (error) {
      console.error('Error fetching dad joke:', error);
      await interaction.reply('😞 Could not fetch a dad joke at the moment. Try again later!');
    }
  },
};
