const { SlashCommandBuilder } = require('discord.js');

function shuffleString(str) {
  const arr = str.replace(/\s+/g, '').split('');
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join('');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('anagram')
    .setDescription('🔄 Generate an anagram from your input.')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('Enter a word or phrase')
        .setRequired(true)),
  async execute(interaction) {
    const inputText = interaction.options.getString('text');
    const anagram = shuffleString(inputText);
    await interaction.reply(`🔄 Anagram of "${inputText}": ${anagram}`);
  }
};
