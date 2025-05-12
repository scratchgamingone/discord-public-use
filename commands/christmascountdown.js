const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('christmascountdown')
    .setDescription('🎄 Shows how much time is left until Christmas!'),

  async execute(interaction) {
    const now = new Date();
    const currentYear = now.getFullYear();

    // Set the target Christmas date
    let christmas = new Date(currentYear, 11, 25, 0, 0, 0); // December = 11

    // If today is after 12/25, use next year's Christmas
    if (now > christmas) {
      christmas.setFullYear(currentYear + 1);
    }

    // Time difference in ms
    const diff = christmas - now;

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    const seconds = Math.floor((diff / 1000) % 60);

    // Determine color
    let color = 0xFF0000; // Red by default

    if (days < 100 && days > 0) {
      color = 0x006400; // Dark green
    } else if (
      now.getMonth() === 11 &&
      now.getDate() === 25
    ) {
      color = 0x90EE90; // Light green (Christmas Day)
    }

    const embed = new EmbedBuilder()
      .setTitle('🎄 Christmas Countdown 🎁')
      .setDescription(
        now.getMonth() === 11 && now.getDate() === 25
          ? `🎉 Merry Christmas! 🎉`
          : `Only **${days} days, ${hours} hours, ${minutes} minutes, and ${seconds} seconds** left until **Christmas ${christmas.getFullYear()}**!`
      )
      .setColor(color)
      .setFooter({ text: 'Ho Ho Ho! 🎅' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
};
