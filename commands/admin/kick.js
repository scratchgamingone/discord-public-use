const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('🚪 Kick a member from the server.')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('The member to kick')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for kicking')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),

  async execute(interaction) {
    const target = interaction.options.getMember('target');
    const reason = interaction.options.getString('reason') || 'No reason provided';

    // Checks
    if (!target) {
      return interaction.reply({ content: '❌ Could not find that user.', ephemeral: true });
    }
    if (!target.kickable) {
      return interaction.reply({ content: '❌ I cannot kick this user.', ephemeral: true });
    }
    if (interaction.user.id === target.id) {
      return interaction.reply({ content: '❌ You cannot kick yourself.', ephemeral: true });
    }

    // Kick
    try {
      await target.kick(reason);
      await interaction.reply(`✅ **${target.user.tag}** was kicked.\n📄 Reason: ${reason}`);
    } catch (error) {
      console.error(error);
      await interaction.reply({ content: '❌ Failed to kick the user.', ephemeral: true });
    }
  }
};
