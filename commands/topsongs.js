// commands/topsongs.js
const {
  SlashCommandBuilder,
  ActionRowBuilder,
  StringSelectMenuBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('topsongs')
    .setDescription('View the top 10 songs for a selected year.')
    .addBooleanOption(option =>
      option.setName('private')
        .setDescription('Set to true for a private (ephemeral) response.')
    ),

  async execute(interaction) {
    const isPrivate = interaction.options.getBoolean('private') ?? false;

    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 25 }, (_, i) => currentYear - i);

    const yearOptions = years.map((year) => ({
      label: year.toString(),
      value: year.toString(),
    }));

    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('select_year')
      .setPlaceholder('Select a year')
      .addOptions(yearOptions);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      content: '🎵 Please select a year to view the top songs:',
      components: [row],
      ephemeral: isPrivate,
    });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 15000,
    });

    collector.on('collect', async (selectInteraction) => {
      if (selectInteraction.customId !== 'select_year') return;

      const selectedYear = selectInteraction.values[0];
      await selectInteraction.deferUpdate();

      try {
        const apiKey = process.env.LASTFM_API_KEY; // Your Last.fm API key in .env
        const { data } = await axios.get(`http://ws.audioscrobbler.com/2.0/`, {
          params: {
            method: 'tag.gettoptracks',
            tag: selectedYear,
            api_key: apiKey,
            format: 'json',
            limit: 10,
          }
        });

        const tracks = data.tracks?.track || [];

        if (tracks.length === 0) {
          return await selectInteraction.editReply({
            content: `❌ No songs found for ${selectedYear}.`,
            components: [],
          });
        }

        let currentIndex = 0;

        const generateEmbed = (index) => {
          const track = tracks[index];
          return new EmbedBuilder()
            .setTitle(`🎵 Top Songs of ${selectedYear}`)
            .addFields(
              { name: 'Song', value: track.name, inline: true },
              { name: 'Artist', value: track.artist.name, inline: true },
              { name: 'Rank', value: `#${index + 1}`, inline: true }
            )
            .setURL(track.url)
            .setColor('Blue')
            .setThumbnail(track.image?.[2]?.['#text'] || null);
        };

        const buttons = new ActionRowBuilder().addComponents(
          new ButtonBuilder()
            .setCustomId('prev_song')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Primary),
          new ButtonBuilder()
            .setCustomId('next_song')
            .setLabel('Next')
            .setStyle(ButtonStyle.Primary)
        );

        const message = await selectInteraction.editReply({
          content: ' ',
          embeds: [generateEmbed(currentIndex)],
          components: [buttons],
        });

        const buttonCollector = message.createMessageComponentCollector({
          componentType: ComponentType.Button,
          time: 60000,
        });

        buttonCollector.on('collect', async (buttonInteraction) => {
          if (buttonInteraction.customId === 'next_song') {
            currentIndex = (currentIndex + 1) % tracks.length;
          } else if (buttonInteraction.customId === 'prev_song') {
            currentIndex = (currentIndex - 1 + tracks.length) % tracks.length;
          }
          await buttonInteraction.update({
            embeds: [generateEmbed(currentIndex)],
            components: [buttons],
          });
        });

        buttonCollector.on('end', async () => {
          await message.edit({ components: [] }).catch(() => {});
        });

      } catch (error) {
        console.error(error);
        await selectInteraction.editReply({
          content: '❌ Failed to fetch top songs. Please try again later.',
          components: [],
        });
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        await interaction.editReply({
          content: '❌ No year selected.',
          components: [],
        });
      }
    });
  },
};
