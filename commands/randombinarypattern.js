const { SlashCommandBuilder } = require('discord.js');

function generateBinaryPattern(length) {
  let pattern = '';
  for (let i = 0; i < length; i++) {
    pattern += Math.random() < 0.5 ? '0' : '1';
  }
  return pattern;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randombinarypattern')
    .setDescription('⚡ Generate a random binary pattern of random length.'),
  async execute(interaction) {
    const length = Math.floor(Math.random() * 32) + 8; // Random length between 8–40
    const pattern = generateBinaryPattern(length);

    await interaction.reply({
      embeds: [{
        title: '⚡ Random Binary Pattern',
        description: `\`${pattern}\``,
        color: 0x34495e,
        footer: { text: `Length: ${length} bits` }
      }]
    });
  }
};
