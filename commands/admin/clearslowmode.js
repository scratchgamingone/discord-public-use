const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('clearslowmode')
        .setDescription('Remove slowmode from the channel (admins only)')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        try {
            await interaction.channel.setRateLimitPerUser(0);
            await interaction.reply('✅ Slowmode has been **removed** from this channel.');
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Failed to remove slowmode. Do I have the right permissions?', ephemeral: true });
        }
    },
};
