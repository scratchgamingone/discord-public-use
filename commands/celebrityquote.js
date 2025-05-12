const { SlashCommandBuilder } = require('discord.js');

const quotes = [
  {
    quote: "Life is what happens when you're busy making other plans.",
    author: "John Lennon"
  },
  {
    quote: "The way to get started is to quit talking and begin doing.",
    author: "Walt Disney"
  },
  {
    quote: "Your time is limited, so don't waste it living someone else's life.",
    author: "Steve Jobs"
  },
  {
    quote: "If life were predictable it would cease to be life, and be without flavor.",
    author: "Eleanor Roosevelt"
  },
  {
    quote: "If you look at what you have in life, you'll always have more.",
    author: "Oprah Winfrey"
  }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('celebrityquote')
    .setDescription('🎭 Get a random celebrity quote'),
  async execute(interaction) {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const selectedQuote = quotes[randomIndex];

    await interaction.reply({
      embeds: [{
        title: `🎭 Quote by ${selectedQuote.author}`,
        description: `*"${selectedQuote.quote}"*`,
        color: 0x1abc9c
      }]
    });
  }
};
