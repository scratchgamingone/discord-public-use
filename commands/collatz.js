const { SlashCommandBuilder } = require('discord.js');

function collatzSequence(n) {
  const sequence = [n];
  while (n !== 1) {
    n = n % 2 === 0 ? n / 2 : 3 * n + 1;
    sequence.push(n);
  }
  return sequence;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('collatz')
    .setDescription('🧠 Explore the Collatz sequence for a given number.')
    .addIntegerOption(option =>
      option.setName('number')
        .setDescription('Enter a positive integer')
        .setRequired(true)),
  async execute(interaction) {
    const number = interaction.options.getInteger('number');

    if (number <= 0) {
      await interaction.reply('Please enter a positive integer greater than 0.');
      return;
    }

    const sequence = collatzSequence(number);
    const steps = sequence.length - 1;

    await interaction.reply({
      embeds: [{
        title: `Collatz Sequence for ${number}`,
        description: `Sequence: ${sequence.join(' → ')}\nSteps to reach 1: ${steps}`,
        color: 0x1abc9c
      }]
    });
  }
};
