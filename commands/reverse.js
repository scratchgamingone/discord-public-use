const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reverse')
    .setDescription('🔄 Reverse the provided text.')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('The text to reverse')
        .setRequired(true)),
  async execute(interaction) {
    const inputText = interaction.options.getString('text');
    const reversedText = inputText.split('').reverse().join('');
    await interaction.reply(`🔁 Reversed Text: ${reversedText}`);
  }
};
