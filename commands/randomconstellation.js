const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType
} = require('discord.js');
const axios = require('axios');

async function fetchRandomConstellation() {
  const categoryURL = 'https://en.wikipedia.org/w/api.php?action=query&list=categorymembers&cmtitle=Category:Constellations&cmlimit=500&format=json';
  const categoryResponse = await axios.get(categoryURL);
  const pages = categoryResponse.data.query.categorymembers;

  if (!pages || pages.length === 0) return null;

  const randomPage = pages[Math.floor(Math.random() * pages.length)];
  const summaryURL = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(randomPage.title)}`;
  const summaryRes = await axios.get(summaryURL);
  const info = summaryRes.data;

  return {
    title: info.title,
    description: info.extract,
    url: info.content_urls?.desktop?.page || `https://en.wikipedia.org/wiki/${encodeURIComponent(info.title)}`,
    image: info.thumbnail?.source || null
  };
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomconstellation')
    .setDescription('✨ Get a random constellation with image and description'),

  async execute(interaction) {
    await interaction.deferReply();

    const createEmbed = async () => {
      const constellation = await fetchRandomConstellation();
      if (!constellation) return null;

      const embed = new EmbedBuilder()
        .setTitle(`🌌 ${constellation.title}`)
        .setDescription(`${constellation.description}\n\n[📖 Learn more](${constellation.url})`)
        .setColor(0x6a5acd)
        .setFooter({ text: 'Source: Wikipedia - Category: Constellations' });

      // 🧠 Show both thumbnail and full-width image
      if (constellation.image) {
        embed.setThumbnail(constellation.image); // 📎 thumbnail
        embed.setImage(constellation.image);     // 🖼 full-width image
      }

      return embed;
    };

    const embed = await createEmbed();
    if (!embed) return interaction.editReply('❌ Could not fetch constellation info.');

    const rerollBtn = new ButtonBuilder()
      .setCustomId('reroll_constellation')
      .setLabel('🔁 Another Constellation')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(rerollBtn);

    const message = await interaction.editReply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });

    const collector = message.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: '❌ Only you can use this button.', ephemeral: true });
      }

      const newEmbed = await createEmbed();
      if (!newEmbed) return i.update({ content: '❌ Could not fetch another constellation.', components: [] });

      await i.update({ embeds: [newEmbed], components: [row] });
    });

    collector.on('end', async () => {
      try {
        await message.edit({ components: [] });
      } catch {}
    });
  }
};
