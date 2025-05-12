const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hand')
    .setDescription('Draw a 5-card hand from a new deck.'),
  async execute(interaction) {
    try {
      const response = await axios.get('https://deckofcardsapi.com/api/deck/new/draw/?count=5');
      const cards = response.data.cards;
      const cardDescriptions = cards.map(card => `${card.value} of ${card.suit}`).join(', ');
      const cardImages = cards.map(card => card.image).join('\n');
      await interaction.reply(`Your hand: **${cardDescriptions}**\n${cardImages}`);
    } catch (error) {
      console.error(error);
      await interaction.reply('An error occurred while drawing your hand.');
    }
  },
};
