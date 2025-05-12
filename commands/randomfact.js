const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType
} = require('discord.js');
const axios = require('axios');

async function fetchRandomFact() {
  const res = await axios.get('https://uselessfacts.jsph.pl/random.json?language=en');
  return res.data.text;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomfact')
    .setDescription('🧠 Get a random interesting fact'),

  async execute(interaction) {
    await interaction.deferReply();

    const createEmbed = async () => {
      const fact = await fetchRandomFact();
      return new EmbedBuilder()
        .setTitle('🧠 Random Fact')
        .setDescription(fact)
        .setColor(0x7289da)
        .setFooter({ text: 'Source: uselessfacts.jsph.pl' });
    };

    const embed = await createEmbed();

    const rerollButton = new ButtonBuilder()
      .setCustomId('reroll_fact')
      .setLabel('🔁 Another Fact')
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(rerollButton);

    const msg = await interaction.editReply({
      embeds: [embed],
      components: [row],
      fetchReply: true
    });

    const collector = msg.createMessageComponentCollector({
      componentType: ComponentType.Button,
      time: 60000
    });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id)
        return i.reply({ content: '❌ Only you can use this button.', ephemeral: true });

      const newEmbed = await createEmbed();
      await i.update({ embeds: [newEmbed], components: [row] });
    });

    collector.on('end', async () => {
      try {
        await msg.edit({ components: [] });
      } catch {}
    });
  }
};
