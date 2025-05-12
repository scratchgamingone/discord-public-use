require('dotenv').config(); // Add this at the top if not already in your main.js

const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('promote')
        .setDescription('Promote a member to a new role and log it (admins only)')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('The member to promote')
                .setRequired(true))
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to assign')
                .setRequired(true))
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),
    async execute(interaction) {
        const member = interaction.options.getMember('member');
        const role = interaction.options.getRole('role');
        const logChannelId = process.env.PROMOTION_LOG_CHANNEL_ID; // ✅ pulls from .env

        if (!interaction.guild.members.me.permissions.has(PermissionFlagsBits.ManageRoles)) {
            return interaction.reply({ content: '❌ I do not have permission to manage roles.', ephemeral: true });
        }

        if (member.roles.cache.has(role.id)) {
            return interaction.reply({ content: `❌ ${member.user.tag} already has the ${role.name} role.`, ephemeral: true });
        }

        try {
            await member.roles.add(role);

            const embed = new EmbedBuilder()
                .setTitle('🎉 Member Promoted')
                .addFields(
                    { name: 'Member', value: `${member.user.tag} (${member.id})`, inline: false },
                    { name: 'Promoted To', value: `${role.name}`, inline: false },
                    { name: 'Promoted By', value: `${interaction.user.tag}`, inline: false },
                )
                .setColor('Green')
                .setTimestamp();

            const logChannel = interaction.guild.channels.cache.get(logChannelId);
            if (logChannel) {
                logChannel.send({ embeds: [embed] });
            }

            await interaction.reply(`✅ Successfully promoted **${member.user.tag}** to **${role.name}**.`);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: '❌ Failed to promote member. Do I have the right permissions?', ephemeral: true });
        }
    },
};
