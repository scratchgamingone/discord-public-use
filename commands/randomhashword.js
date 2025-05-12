const { SlashCommandBuilder } = require('discord.js');
const crypto = require('crypto');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomhashword')
    .setDescription('🌀 Generate a random futuristic hash-like word or code.'),
  async execute(interaction) {
    const randomBytes = crypto.randomBytes(4); // 4 bytes = 8 hex chars
    const hash = randomBytes.toString('hex').toUpperCase();

    const randomNumber = Math.floor(Math.random() * 1000);
    const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

    const finalCode = `${hash}-${randomNumber}${randomSuffix}`;

    await interaction.reply({
      embeds: [{
        title: '🌀 Your Random Hash Word',
        description: `\`${finalCode}\``,
        color: 0x2ecc71
      }]
    });
  }
};
