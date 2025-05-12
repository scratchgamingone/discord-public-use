const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('blackjack')
    .setDescription('Deal a Blackjack hand (2 cards).'),
  async execute(interaction) {
    try {
      const response = await axios.get('https://deckofcardsapi.com/api/deck/new/draw/?count=2');
      const cards = response.data.cards;
      const cardDescriptions = cards.map(card => `${card.value} of ${card.suit}`).join(' and ');
      const cardImages = cards.map(card => card.image).join('\n');
      await interaction.reply(`Your Blackjack hand: **${cardDescriptions}**\n${cardImages}`);
    } catch (error) {
      console.error(error);
      await interaction.reply('An error occurred while dealing your Blackjack hand.');
    }
  },
};
