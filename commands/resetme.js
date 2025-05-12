const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetme')
    .setDescription('Reset your nickname to your original username'),

  async execute(interaction) {
    const member = await interaction.guild.members.fetch(interaction.user.id);

    try {
      await member.setNickname(null); // Resets nickname to original
      await interaction.reply(`✅ Your nickname has been reset to your original username.`);
    } catch (error) {
      console.error(`❌ Error resetting nickname:`, error);
      await interaction.reply({
        content: '❌ I couldn’t reset your nickname. Make sure I have permission and proper role hierarchy.',
        ephemeral: true
      });
    }
  }
};
