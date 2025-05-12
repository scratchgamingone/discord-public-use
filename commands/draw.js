const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('draw')
    .setDescription('Draw a random card from a new deck.'),
  async execute(interaction) {
    try {
      const response = await axios.get('https://deckofcardsapi.com/api/deck/new/draw/?count=1');
      const card = response.data.cards[0];
      await interaction.reply(`You drew: **${card.value} of ${card.suit}**\n${card.image}`);
    } catch (error) {
      console.error(error);
      await interaction.reply('An error occurred while drawing a card.');
    }
  },
};
