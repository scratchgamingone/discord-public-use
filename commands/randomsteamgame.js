const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

// Clean and format system requirements into multiline bullet points
function cleanSystemReqMultiline(html) {
  return html
    .replace(/&amp;/g, '&')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<li[^>]*>/g, '')
    .replace(/<\/li>/g, '')
    .replace(/<strong>(.*?)<\/strong>/g, '**$1**')
    .replace(/<\/?[^>]+(>|$)/g, '')
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0)
    .map(line => `• ${line}`)
    .join('\n');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomsteamgame')
    .setDescription('🎮 Shows a random Steam game from the store')
    .addIntegerOption(option =>
      option.setName('minprice')
        .setDescription('Minimum price in USD')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('maxprice')
        .setDescription('Maximum price in USD')
        .setRequired(false)),

  async execute(interaction) {
    await interaction.deferReply();

    try {
      // Get games from RAWG
      const response = await axios.get(`https://api.rawg.io/api/games`, {
        params: {
          key: process.env.RAWG_API_KEY,
          platforms: 1, // Steam
          ordering: '-added',
          page_size: 40,
        }
      });

      const games = response.data.results;

      if (!games.length) {
        return interaction.editReply('❌ No games found.');
      }

      // Pick a random game
      const game = games[Math.floor(Math.random() * games.length)];

      const gameDetails = await axios.get(`https://api.rawg.io/api/games/${game.id}`, {
        params: { key: process.env.RAWG_API_KEY }
      });

      const info = gameDetails.data;

      // System requirements
      let requirements = 'Not available';
      const pcReq = info.platforms.find(p => p.platform.name === 'PC');
      if (pcReq?.requirements?.minimum) {
        requirements = cleanSystemReqMultiline(pcReq.requirements.minimum);
      }

      // Final embed
      const embed = new EmbedBuilder()
        .setTitle(info.name)
        .setURL(info.website || info.stores?.[0]?.url || `https://store.steampowered.com/app/${info.id}`)
        .setImage(info.background_image)
        .setDescription(`📅 **Release Date**: ${info.released || 'N/A'}\n⭐ **Rating**: ${info.rating || 'Not available'}`)
        .addFields(
          { name: '🛠️ System Requirements (Minimum)', value: requirements }
        )
        .setColor('Blurple');

      await interaction.editReply({ embeds: [embed] });

    } catch (err) {
      console.error(err);
      await interaction.editReply('❌ Failed to fetch game.');
    }
  }
};
