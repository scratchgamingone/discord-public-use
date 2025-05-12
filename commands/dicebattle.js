const { SlashCommandBuilder } = require('discord.js');

function rollDice(sides = 6) {
  return Math.floor(Math.random() * sides) + 1;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dicebattle')
    .setDescription('🎲 Roll a die and battle the bot!'),
  async execute(interaction) {
    const userRoll = rollDice();
    const botRoll = rollDice();

    let resultMessage;
    if (userRoll > botRoll) {
      resultMessage = '🎉 You win!';
    } else if (userRoll < botRoll) {
      resultMessage = '😢 You lose!';
    } else {
      resultMessage = '🤝 It’s a tie!';
    }

    await interaction.reply({
      embeds: [{
        title: '🎲 Dice Battle!',
        description: `You rolled: **${userRoll}**\nBot rolled: **${botRoll}**\n\n${resultMessage}`,
        color: 0xffd700
      }]
    });
  }
};
