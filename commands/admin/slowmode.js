const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set combined slowmode for the channel (admins only)')
        .addIntegerOption(option =>
            option.setName('hours')
                .setDescription('Hours (optional)')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('minutes')
                .setDescription('Minutes (optional)')
                .setRequired(false))
        .addIntegerOption(option =>
            option.setName('seconds')
                .setDescription('Seconds (optional)')
                .setRequired(false))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels),
    async execute(interaction) {
        const hours = interaction.options.getInteger('hours') || 0;
        const minutes = interaction.options.getInteger('minutes') || 0;
        const seconds = interaction.options.getInteger('seconds') || 0;

        let totalSeconds = (hours * 3600) + (minutes * 60) + seconds;

        if (totalSeconds === 0) {
            return interaction.reply({ content: '❌ Please provide at least one nonzero value for hours, minutes, or seconds.', ephemeral: true });
        }

        if (totalSeconds > 21600) { // 6 hours max
            totalSeconds = 21600;
            await interaction.reply({
                content: `⚠️ Slowmode capped at **6 hours (21,600 seconds)** due to Discord limits.`,
                ephemeral: true,
            });
        }

        try {
            await interaction.channel.setRateLimitPerUser(totalSeconds);
            await interaction.followUp(`✅ Slowmode set to **${hours}h ${minutes}m ${seconds}s** → applied as ${totalSeconds} seconds in this channel.`);
        } catch (error) {
            console.error(error);
            await interaction.followUp({ content: '❌ Failed to set slowmode. Do I have the right permissions?', ephemeral: true });
        }
    },
};
