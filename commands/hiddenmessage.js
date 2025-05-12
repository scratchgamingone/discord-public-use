const { SlashCommandBuilder } = require('discord.js');

function embedHiddenMessage(secret) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
  let result = '';

  for (const letter of secret.toUpperCase()) {
    // Add random junk characters before each letter
    const junkBefore = Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
    result += junkBefore + letter;
  }

  // Add some random junk after the message
  const junkAfter = Array.from({ length: Math.floor(Math.random() * 5) + 3 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  result += junkAfter;

  return result;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('hiddenmessage')
    .setDescription('🕵️ Hide your message inside random junk characters.')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The secret message to hide')
        .setRequired(true)),
  async execute(interaction) {
    const secretMessage = interaction.options.getString('message');
    const hidden = embedHiddenMessage(secretMessage);

    await interaction.reply({
      embeds: [{
        title: '🕵️ Hidden Message',
        description: `\`${hidden}\``,
        color: 0x95a5a6,
        footer: { text: 'Only the sharpest eyes will spot it...' }
      }]
    });
  }
};
