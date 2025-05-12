const {
  SlashCommandBuilder,
  EmbedBuilder,
  ButtonBuilder,
  ButtonStyle,
  ActionRowBuilder,
  ComponentType
} = require('discord.js');
const axios = require('axios');

const instruments = [
  {
    name: 'Violin',
    family: 'String',
    image: 'https://upload.wikimedia.org/wikipedia/commons/1/1b/Violin_VL100.png',
    desc: 'A bowed string instrument used in classical music and many modern genres.'
  },
  {
    name: 'Trumpet',
    family: 'Brass',
    image: 'https://upload.wikimedia.org/wikipedia/commons/3/33/Trumpet_1.jpg',
    desc: 'A brass instrument known for its bright, commanding sound.'
  },
  {
    name: 'Flute',
    family: 'Woodwind',
    image: 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Western_concert_flute_%28Yamaha%29.jpg',
    desc: 'A woodwind instrument that produces sound from the flow of air across an opening.'
  },
  {
    name: 'Drum Kit',
    family: 'Percussion',
    image: 'https://upload.wikimedia.org/wikipedia/commons/4/4d/Drum_kit.jpg',
    desc: 'A set of percussion instruments used in many musical styles, especially rock and jazz.'
  },
  {
    name: 'Piano',
    family: 'Keyboard',
    image: 'https://upload.wikimedia.org/wikipedia/commons/2/21/Grand_piano_-_Yamaha_CFX.jpg',
    desc: 'A versatile keyboard instrument capable of both melody and harmony.'
  }
];

function getRandomInstrument() {
  return instruments[Math.floor(Math.random() * instruments.length)];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randominstrument')
    .setDescription('🎼 Get a random musical instrument with info and picture'),

  async execute(interaction) {
    await interaction.deferReply();

    const buildEmbed = (instrument) => {
      const embed = new EmbedBuilder()
        .setTitle(`🎶 ${instrument.name}`)
        .setDescription(`${instrument.desc}\n\n📚 Family: **${instrument.family}**`)
        .setColor(0xd4af37)
        .setFooter({ text: 'Random Instrument Generator 🎧' });

      if (instrument.image) {
        embed.setThumbnail(instrument.image);
        embed.setImage(instrument.image);
      }

      return embed;
    };

    let current = getRandomInstrument();
    const embed = buildEmbed(current);

    const rerollBtn = new ButtonBuilder()
      .setCustomId('reroll_instrument')
      .setLabel('🔁 Another Instrument')
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

      current = getRandomInstrument();
      await i.update({ embeds: [buildEmbed(current)], components: [row] });
    });

    collector.on('end', async () => {
      try {
        await message.edit({ components: [] });
      } catch {}
    });
  }
};
