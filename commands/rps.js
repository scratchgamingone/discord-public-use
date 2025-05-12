const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rps')
    .setDescription('Play Rock, Paper, Scissors with the bot!')
    .addStringOption(option =>
      option.setName('choice')
        .setDescription('Your choice: rock, paper, or scissors')
        .setRequired(true)
        .addChoices(
          { name: 'Rock', value: 'rock' },
          { name: 'Paper', value: 'paper' },
          { name: 'Scissors', value: 'scissors' },
        )),
  async execute(interaction) {
    const userChoice = interaction.options.getString('choice');
    const choices = ['rock', 'paper', 'scissors'];
    const botChoice = choices[Math.floor(Math.random() * choices.length)];

    let result;
    if (userChoice === botChoice) {
      result = "It's a tie!";
    } else if (
      (userChoice === 'rock' && botChoice === 'scissors') ||
      (userChoice === 'paper' && botChoice === 'rock') ||
      (userChoice === 'scissors' && botChoice === 'paper')
    ) {
      result = 'You win!';
    } else {
      result = 'I win!';
    }

    await interaction.reply(`You chose **${userChoice}**.\nI chose **${botChoice}**.\n${result}`);
  },
};
