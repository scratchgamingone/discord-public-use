// utils/personalSpace.js
const { ChannelType, PermissionsBitField } = require('discord.js');

async function createPersonalSpace(member) {
  const guild = member.guild;
  const userId = member.id;
  const userName = member.user.username;

  // Check if a category already exists for the user
  const existingCategory = guild.channels.cache.find(
    (channel) =>
      channel.type === ChannelType.GuildCategory &&
      channel.name === `${userName}'s Space`
  );

  if (existingCategory) {
    return;
  }

  try {
    // Create the category
    const category = await guild.channels.create({
      name: `${userName}'s Space`,
      type: ChannelType.GuildCategory,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: userId,
          allow: [PermissionsBitField.Flags.ViewChannel],
        },
      ],
    });

    // Create the text channel
    await guild.channels.create({
      name: 'uploads',
      type: ChannelType.GuildText,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: userId,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.SendMessages,
            PermissionsBitField.Flags.AttachFiles,
          ],
        },
      ],
    });

    // Create the voice channel
    await guild.channels.create({
      name: 'voice-chat',
      type: ChannelType.GuildVoice,
      parent: category.id,
      permissionOverwrites: [
        {
          id: guild.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: userId,
          allow: [
            PermissionsBitField.Flags.ViewChannel,
            PermissionsBitField.Flags.Connect,
          ],
        },
      ],
    });
  } catch (error) {
    console.error(`Error creating personal space for ${userName}:`, error);
  }
}

module.exports = { createPersonalSpace };
