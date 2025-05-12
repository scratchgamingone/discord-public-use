const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ComponentType
} = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const TMDB_BASE = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

module.exports = {
  data: new SlashCommandBuilder()
    .setName('toptenmovies')
    .setDescription('🎬 View top 10 movies of a selected year with navigation')
    .addBooleanOption(option =>
      option.setName('private')
        .setDescription('Show results privately? (default: false)')
    ),

  async execute(interaction) {
    const isPrivate = interaction.options.getBoolean('private') ?? false;
    await interaction.deferReply({ ephemeral: isPrivate });

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 20 }, (_, i) => (currentYear - i).toString());

    const yearMenu = new StringSelectMenuBuilder()
      .setCustomId('select_year')
      .setPlaceholder('📆 Choose a release year')
      .addOptions(years.map(y => ({ label: y, value: y })));

    await interaction.editReply({
      content: '📆 Select a year to get the top 10 movies:',
      components: [new ActionRowBuilder().addComponents(yearMenu)]
    });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 20000,
      max: 1
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id)
        return i.reply({ content: '❌ Only you can use this.', ephemeral: true });

      await i.deferUpdate();
      const year = i.values[0];

      const url = `${TMDB_BASE}/discover/movie?api_key=${API_KEY}&language=en-US&sort_by=vote_average.desc&include_adult=false&include_video=true&vote_count.gte=100&primary_release_year=${year}`;

      try {
        const res = await axios.get(url);
        const movies = res.data.results.slice(0, 10);

        if (movies.length === 0) {
          return interaction.editReply({ content: '❌ No movies found.', components: [] });
        }

        // Fetch detailed info for each movie
        const detailed = await Promise.all(
          movies.map(movie =>
            axios.get(`${TMDB_BASE}/movie/${movie.id}?api_key=${API_KEY}&append_to_response=videos`)
              .then(res => res.data)
          )
        );

        // Create an embed for each movie
        const embeds = detailed.map((movie, index) => {
          const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
          const trailerLink = trailer ? `[▶️ Trailer](https://www.youtube.com/watch?v=${trailer.key})` : 'No trailer';
          const revenue = movie.revenue ? `$${movie.revenue.toLocaleString()}` : 'N/A';

          const embed = new EmbedBuilder()
            .setTitle(`🎬 Top 10 Movies of ${year}`)
            .setDescription(`**${index + 1}. ${movie.title}**\n\n⭐ Rating: ${movie.vote_average}\n💰 Revenue: ${revenue}\n${trailerLink}`)
            .setFooter({ text: `Movie ${index + 1} of 10 • Source: TMDb` })
            .setColor(0xffc107);

          if (movie.poster_path) {
            embed.setThumbnail(`https://image.tmdb.org/t/p/w500${movie.poster_path}`);
          }

          return embed;
        });

        let currentPage = 0;

        const backBtn = new ButtonBuilder()
          .setCustomId('movie_back')
          .setLabel('⏮ Back')
          .setStyle(ButtonStyle.Secondary);

        const nextBtn = new ButtonBuilder()
          .setCustomId('movie_next')
          .setLabel('⏭ Next')
          .setStyle(ButtonStyle.Primary);

        const row = new ActionRowBuilder().addComponents(backBtn, nextBtn);

        const msg = await interaction.editReply({
          content: '',
          embeds: [embeds[currentPage]],
          components: [row]
        });

        const buttonCollector = msg.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 60_000
        });

        buttonCollector.on('collect', async btn => {
          if (btn.user.id !== interaction.user.id) {
            return btn.reply({ content: '❌ Only the original user can use these buttons.', ephemeral: true });
          }

          if (btn.customId === 'movie_next') {
            currentPage = (currentPage + 1) % embeds.length;
          } else if (btn.customId === 'movie_back') {
            currentPage = (currentPage - 1 + embeds.length) % embeds.length;
          }

          await btn.update({
            embeds: [embeds[currentPage]],
            components: [row]
          });
        });

        buttonCollector.on('end', async () => {
          try {
            await msg.edit({ components: [] });
          } catch {}
        });

      } catch (err) {
        console.error('TMDb fetch error:', err.message);
        await interaction.editReply({ content: '❌ Failed to fetch movie data.', components: [] });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({ content: '⌛ No year selected in time.', components: [] });
      }
    });
  }
};
