const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('nickname')
    .setDescription('Change a user\'s nickname (Admin only)')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user whose nickname to change')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('word')
        .setDescription('The nickname to assign (leave blank to pick from words.txt)'))
    .addIntegerOption(option =>
      option.setName('min_length')
        .setDescription('Minimum length of the word (if no word provided)'))
    .addIntegerOption(option =>
      option.setName('max_length')
        .setDescription('Maximum length of the word (if no word provided)')),

  async execute(interaction) {
    const targetUser = interaction.options.getUser('user');
    const nickname = interaction.options.getString('word');
    const minLength = interaction.options.getInteger('min_length');
    const maxLength = interaction.options.getInteger('max_length');
    const guildMember = await interaction.guild.members.fetch(targetUser.id);

    let newNick = nickname;

    if (!newNick) {
      const wordFilePath = path.join(__dirname, '..', 'words.txt');
      try {
        const words = fs.readFileSync(wordFilePath, 'utf-8').split(/\r?\n/).filter(Boolean);
        let filteredWords = words;

        if (minLength || maxLength) {
          const min = minLength || 1;
          const max = maxLength || 100;

          filteredWords = words.filter(word => word.length >= min && word.length <= max);

          if (filteredWords.length === 0) {
            return interaction.reply({
              content: `❌ No words found between lengths ${min} and ${max}.`,
              ephemeral: true
            });
          }
        }

        newNick = filteredWords[Math.floor(Math.random() * filteredWords.length)];
      } catch (err) {
        console.error('❌ Failed to read words.txt:', err);
        return interaction.reply({ content: '❌ Could not read from words.txt or it is empty.', ephemeral: true });
      }
    }

    try {
      await guildMember.setNickname(newNick);
      await interaction.reply(`✅ Nickname for ${targetUser.tag} has been set to **${newNick}**`);
    } catch (error) {
      console.error(`❌ Error changing nickname:`, error);
      await interaction.reply({ content: '❌ Failed to change the nickname. Check my permissions.', ephemeral: true });
    }
  }
};
