const { Events } = require('discord.js');

module.exports = {
  name: Events.GuildMemberRemove,

  async execute(member) {
    try {
      const categoryName = `${member.user.username}'s Room`;

      // Find the category by name
      const category = member.guild.channels.cache.find(
        channel => channel.type === 4 && channel.name === categoryName
      );

      if (category) {
        await category.children.cache.forEach(async (channel) => {
          await channel.delete().catch(console.error);
        });

        await category.delete();
        console.log(`✅ Deleted private room for ${member.user.tag}`);
      } else {
        console.log(`⚠️ No private category found for ${member.user.tag}`);
      }
    } catch (error) {
      console.error('❌ Error deleting private channels:', error);
    }
  },
};
