const { SlashCommandBuilder } = require('discord.js');

function isPalindrome(str) {
  const cleaned = str.replace(/[^A-Za-z0-9]/g, '').toLowerCase();
  return cleaned === cleaned.split('').reverse().join('');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('palindrome')
    .setDescription('🧠 Check if a word or phrase is a palindrome.')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Enter the text to check')
        .setRequired(true)),
  async execute(interaction) {
    const text = interaction.options.getString('text');
    const result = isPalindrome(text);

    await interaction.reply({
      embeds: [{
        title: '🔍 Palindrome Checker',
        description: result
          ? `✅ "${text}" is a palindrome!`
          : `❌ "${text}" is not a palindrome.`,
        color: result ? 0x00ff00 : 0xff0000
      }]
    });
  }
};
