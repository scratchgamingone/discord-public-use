const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('createprivateforall')
    .setDescription('Creates private categories with text and voice channels for all existing members.')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    await interaction.reply({ content: '🔄 Creating private categories for all members...', ephemeral: true });

    const guild = interaction.guild;
    const members = await guild.members.fetch();

    for (const [memberId, member] of members) {
      // Skip bots
      if (member.user.bot) continue;

      // Check if the private category already exists
      const existingCategory = guild.channels.cache.find(
        (channel) =>
          channel.type === ChannelType.GuildCategory &&
          channel.name === `${member.user.username}'s Room`
      );

      if (existingCategory) {
        console.log(`⚠️ Private category already exists for ${member.user.tag}`);
        continue;
      }

      try {
        // Create the private category
        const category = await guild.channels.create({
          name: `${member.user.username}'s Room`,
          type: ChannelType.GuildCategory,
          permissionOverwrites: [
            {
              id: guild.id, // @everyone
              deny: [PermissionFlagsBits.ViewChannel],
            },
            {
              id: member.id, // Member
              allow: [PermissionFlagsBits.ViewChannel],
            },
            {
              id: interaction.client.user.id, // Bot
              allow: [PermissionFlagsBits.ViewChannel, PermissionFlagsBits.ManageChannels],
            },
          ],
        });

        // Create the text channel
        await guild.channels.create({
          name: 'text-chat',
          type: ChannelType.GuildText,
          parent: category.id,
          permissionOverwrites: category.permissionOverwrites.cache.map((overwrite) => overwrite),
        });

        // Create the voice channel
        await guild.channels.create({
          name: 'voice-chat',
          type: ChannelType.GuildVoice,
          parent: category.id,
          permissionOverwrites: category.permissionOverwrites.cache.map((overwrite) => overwrite),
        });

        console.log(`✅ Created private category for ${member.user.tag}`);
      } catch (error) {
        console.error(`❌ Error creating private category for ${member.user.tag}:`, error);
      }
    }

    await interaction.editReply({ content: '✅ Finished creating private categories for all members.' });
  },
};
