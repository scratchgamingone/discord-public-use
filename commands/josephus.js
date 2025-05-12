const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('josephus')
    .setDescription('🧠 Solve the Josephus problem for a given number of people and step count.')
    .addIntegerOption(option =>
      option.setName('people')
        .setDescription('Total number of people in the circle')
        .setRequired(true))
    .addIntegerOption(option =>
      option.setName('step')
        .setDescription('Count for each elimination (e.g., 2 means every second person is eliminated)')
        .setRequired(true)),
  async execute(interaction) {
    const n = interaction.options.getInteger('people');
    const k = interaction.options.getInteger('step');

    if (n <= 0 || k <= 0) {
      await interaction.reply('Please provide positive integers for both people and step count.');
      return;
    }

    // Josephus problem solution
    let result = 0;
    for (let i = 2; i <= n; i++) {
      result = (result + k) % i;
    }

    // Adjusting for 1-based indexing
    const safePosition = result + 1;

    await interaction.reply(`In a circle of ${n} people, eliminating every ${k}th person, the safe position is **${safePosition}**.`);
  }
};
