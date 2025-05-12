const { Events } = require('discord.js');

module.exports = {
  name: Events.GuildMemberAdd,

  async execute(member) {
    try {
      // Create private category
      const category = await member.guild.channels.create({
        name: `${member.user.username}'s Room`,
        type: 4, // 4 = Category
        permissionOverwrites: [
          {
            id: member.guild.id, // @everyone
            deny: ['ViewChannel'],
          },
          {
            id: member.id, // The new user
            allow: ['ViewChannel'],
          },
          {
            id: member.client.user.id, // Your bot
            allow: ['ViewChannel', 'ManageChannels', 'ManageRoles'],
          }
        ],
      });

      // Create private text channel inside the category
      await member.guild.channels.create({
        name: 'text-chat',
        type: 0, // 0 = Text
        parent: category.id,
        permissionOverwrites: category.permissionOverwrites.cache.map(overwrite => overwrite),
      });

      // Create private voice channel inside the category
      await member.guild.channels.create({
        name: 'voice-chat',
        type: 2, // 2 = Voice
        parent: category.id,
        permissionOverwrites: category.permissionOverwrites.cache.map(overwrite => overwrite),
      });

      console.log(`✅ Created private room for ${member.user.tag}`);
    } catch (error) {
      console.error('❌ Error creating private channels:', error);
    }
  },
};
