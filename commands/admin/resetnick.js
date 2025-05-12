const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('resetnick')
    .setDescription('Reset a user\'s nickname back to their original username')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user whose nickname you want to reset')
        .setRequired(true)),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const guildMember = await interaction.guild.members.fetch(targetUser.id);

    try {
      await guildMember.setNickname(null); // null resets to original
      await interaction.reply(`✅ Nickname for ${targetUser.tag} has been reset to their original username.`);
    } catch (error) {
      console.error(`❌ Error resetting nickname:`, error);
      await interaction.reply({
        content: '❌ Failed to reset the nickname. Check my permissions.',
        ephemeral: true
      });
    }
  }
};
