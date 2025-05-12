const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const DeezerPublicApi = require('deezer-public-api');
const deezer = new DeezerPublicApi();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('deezer')
    .setDescription('Search for a track on Deezer')
    .addStringOption(option =>
      option.setName('query')
        .setDescription('The name of the track to search for')
        .setRequired(true)
    ),

  async execute(interaction) {
    const query = interaction.options.getString('query');

    try {
      const results = await deezer.search.track(query);

      if (!results || results.length === 0) {
        return interaction.reply({ content: '❌ No results found on Deezer.', ephemeral: true });
      }

      const track = results[0];
      const embed = new EmbedBuilder()
        .setTitle(track.title)
        .setURL(track.link)
        .setAuthor({ name: track.artist.name, iconURL: track.artist.picture_medium, url: track.artist.link })
        .setThumbnail(track.album.cover_medium)
        .addFields(
          { name: 'Album', value: track.album.title, inline: true },
          { name: 'Duration', value: `${Math.floor(track.duration / 60)}:${String(track.duration % 60).padStart(2, '0')} minutes`, inline: true }
        )
        .setFooter({ text: 'Powered by Deezer API' })
        .setColor(0xFF0000);

      await interaction.reply({ embeds: [embed] });
    } catch (error) {
      console.error('Error fetching data from Deezer API:', error);
      await interaction.reply({ content: '⚠️ An error occurred while fetching data from Deezer.', ephemeral: true });
    }
  },
};
