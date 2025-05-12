const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('changenick')
    .setDescription('Change your own nickname public use (or pick from words.txt)')
    .addStringOption(option =>
      option.setName('nickname')
        .setDescription('Your new nickname (leave blank to pick randomly from words.txt)'))
    .addIntegerOption(option =>
      option.setName('min_length')
        .setDescription('Minimum length for a random word'))
    .addIntegerOption(option =>
      option.setName('max_length')
        .setDescription('Maximum length for a random word')),

  async execute(interaction) {
    const nickname = interaction.options.getString('nickname');
    const minLength = interaction.options.getInteger('min_length');
    const maxLength = interaction.options.getInteger('max_length');
    const member = await interaction.guild.members.fetch(interaction.user.id);

    let newNick = nickname;

    if (!newNick) {
      const wordFilePath = path.join(__dirname, 'words.txt');
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
      await member.setNickname(newNick);
      await interaction.reply(`✅ Your nickname has been changed to **${newNick}**`);
    } catch (error) {
      console.error(`❌ Error changing nickname:`, error);
      await interaction.reply({
        content: '❌ Failed to change your nickname. Do I have permission and role priority?',
        ephemeral: true
      });
    }
  }
};
