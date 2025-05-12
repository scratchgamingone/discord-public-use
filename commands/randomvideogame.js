const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

// Genre list supported by RAWG
const genreList = [
  { name: 'Action', value: 'action' },
  { name: 'Adventure', value: 'adventure' },
  { name: 'Shooter', value: 'shooter' },
  { name: 'Racing', value: 'racing' },
  { name: 'RPG', value: 'role-playing-games-rpg' },
  { name: 'Sports', value: 'sports' },
  { name: 'Strategy', value: 'strategy' },
  { name: 'Puzzle', value: 'puzzle' },
  { name: 'Simulation', value: 'simulation' }
];

// RAWG platform list
const platforms = [
  { name: 'Xbox One', id: 14 },
  { name: 'Xbox Series X/S', id: 186 },
  { name: 'PC', id: 4 },
  { name: 'PlayStation 4', id: 18 },
  { name: 'PlayStation 5', id: 187 },
  { name: 'Nintendo Switch', id: 7 },
  { name: 'iOS', id: 3 },
  { name: 'Android', id: 21 }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomvideogame')
    .setDescription('🎮 Get random video games with filters')
    .addStringOption(option =>
      option.setName('genre')
        .setDescription('Choose a genre')
        .addChoices(...genreList)
        .setRequired(false)
    )
    .addStringOption(option =>
      option.setName('platform')
        .setDescription('Choose a platform')
        .addChoices(...platforms.map(p => ({ name: p.name, value: p.id.toString() })))
        .setRequired(false)
    )
    .addIntegerOption(option =>
      option.setName('count')
        .setDescription('How many games?')
        .addChoices(
          { name: '1', value: 1 },
          { name: '2', value: 2 },
          { name: '3', value: 3 },
          { name: '4', value: 4 },
          { name: '5', value: 5 }
        )
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    const selectedGenre = interaction.options.getString('genre');
    const selectedPlatform = interaction.options.getString('platform');
    const selectedCount = interaction.options.getInteger('count');

    const genre = selectedGenre || genreList[Math.floor(Math.random() * genreList.length)].value;
    const platformObj = selectedPlatform
      ? platforms.find(p => p.id.toString() === selectedPlatform)
      : platforms[Math.floor(Math.random() * platforms.length)];

    const count = selectedCount || Math.floor(Math.random() * 5) + 1;

    try {
      const res = await axios.get(`https://api.rawg.io/api/games`, {
        params: {
          key: process.env.RAWG_API_KEY,
          genres: genre,
          platforms: platformObj.id,
          page_size: 20,
          ordering: '-rating'
        }
      });

      const games = res.data.results;
      if (!games || games.length === 0) {
        return await interaction.editReply(`❌ No games found for genre: ${genre}, platform: ${platformObj.name}`);
      }

      const selectedGames = [];
      const usedIndexes = new Set();

      while (selectedGames.length < count && usedIndexes.size < games.length) {
        const index = Math.floor(Math.random() * games.length);
        if (!usedIndexes.has(index)) {
          usedIndexes.add(index);
          selectedGames.push(games[index]);
        }
      }

      const embeds = selectedGames.map(game => {
        return new EmbedBuilder()
          .setTitle(game.name)
          .setURL(`https://rawg.io/games/${game.slug}`)
          .setDescription(game.released ? `🗓️ Released: ${game.released}` : '📅 Release date unknown.')
          .setImage(game.background_image || null)
          .setColor(0x00AE86)
          .setFooter({ text: `Genre: ${genre} • Platform: ${platformObj.name} • Powered by RAWG.io` });
      });

      await interaction.editReply({ embeds });

    } catch (error) {
      console.error('RAWG API error:', error.response?.data || error.message || error);
      await interaction.editReply('❌ Failed to fetch games. Try again later!');
    }
  }
};
