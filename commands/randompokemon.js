const {
  SlashCommandBuilder,
  EmbedBuilder,
  StringSelectMenuBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType
} = require('discord.js');
const axios = require('axios');

const generationRanges = {
  gen1: [1, 151],
  gen2: [152, 251],
  gen3: [252, 386],
  gen4: [387, 493],
  gen5: [494, 649],
  gen6: [650, 721],
  gen7: [722, 809],
  gen8: [810, 898],
  gen9: [899, 1017]
};

const types = [
  'normal', 'fire', 'water', 'grass', 'electric', 'ice', 'fighting', 'poison',
  'ground', 'flying', 'psychic', 'bug', 'rock', 'ghost', 'dragon', 'dark',
  'steel', 'fairy'
];

async function getPokemonListByType(type) {
  const res = await axios.get(`https://pokeapi.co/api/v2/type/${type}`);
  return res.data.pokemon.map(p => p.pokemon.url);
}

async function getFilteredPokemonURL(genKey, type) {
  let urls = [];
  if (type) {
    urls = await getPokemonListByType(type);
  } else {
    const max = generationRanges[genKey]?.[1] || 1017;
    const min = generationRanges[genKey]?.[0] || 1;
    for (let i = min; i <= max; i++) {
      urls.push(`https://pokeapi.co/api/v2/pokemon/${i}`);
    }
  }
  return urls[Math.floor(Math.random() * urls.length)];
}

async function fetchPokemon(url) {
  const res = await axios.get(url);
  return res.data;
}

function buildEmbed(pokemon, isShiny = false, showStats = false) {
  const name = pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1);
  const types = pokemon.types.map(t => t.type.name).join(', ');
  const stats = pokemon.stats.map(s => `${s.stat.name}: ${s.base_stat}`).join('\n');
  const abilities = pokemon.abilities.map(a => a.ability.name).join(', ');
  const baseExp = pokemon.base_experience;
  const image = isShiny ? pokemon.sprites.other['official-artwork'].front_shiny : pokemon.sprites.other['official-artwork'].front_default;

  const embed = new EmbedBuilder()
    .setTitle(`🔹 ${name}`)
    .setColor(0xff0000)
    .setFooter({ text: isShiny ? 'Shiny Form 💡' : 'Normal Form' });

  if (showStats) {
    embed.setDescription(`**Type:** ${types}\n\n**Stats:**\n${stats}\n\n**Abilities:** ${abilities}\n**Base XP:** ${baseExp}`);
  } else {
    embed.setImage(image);
  }

  return embed;
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randompokemon')
    .setDescription('🌪 Get a random Pokémon by generation or type'),

  async execute(interaction) {
    const genMenu = new StringSelectMenuBuilder()
      .setCustomId('select_gen')
      .setPlaceholder('Select Generation (or ignore for random)')
      .addOptions(Object.keys(generationRanges).map(k => ({
        label: k.toUpperCase(),
        value: k
      }))).addOptions({ label: 'Random', value: 'any' });

    const typeMenu = new StringSelectMenuBuilder()
      .setCustomId('select_type')
      .setPlaceholder('Select Type (or ignore for random)')
      .addOptions(types.map(t => ({
        label: t.charAt(0).toUpperCase() + t.slice(1),
        value: t
      }))).addOptions({ label: 'Random', value: 'any' });

    const row = new ActionRowBuilder().addComponents(genMenu);
    const row2 = new ActionRowBuilder().addComponents(typeMenu);

    await interaction.reply({ components: [row, row2] });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 15000
    });

    let selectedGen = 'any';
    let selectedType = 'any';

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) return;
      if (i.customId === 'select_gen') selectedGen = i.values[0];
      if (i.customId === 'select_type') selectedType = i.values[0];
      await i.deferUpdate();
    });

    collector.on('end', async () => {
      const url = await getFilteredPokemonURL(selectedGen, selectedType !== 'any' ? selectedType : null);
      let pokemon = await fetchPokemon(url);
      let isShiny = false;
      let showStats = false;

      const embed = buildEmbed(pokemon, isShiny, showStats);

      const shinyBtn = new ButtonBuilder().setCustomId('toggle_shiny').setLabel('🔦 Shiny').setStyle(ButtonStyle.Secondary);
      const statsBtn = new ButtonBuilder().setCustomId('toggle_stats').setLabel('📊 Stats / Image').setStyle(ButtonStyle.Secondary);
      const surpriseBtn = new ButtonBuilder().setCustomId('another_pokemon').setLabel('🎲 Surprise Me').setStyle(ButtonStyle.Primary);

      const buttonRow1 = new ActionRowBuilder().addComponents(shinyBtn, statsBtn);
      const buttonRow2 = new ActionRowBuilder().addComponents(surpriseBtn);

      const msg = await interaction.followUp({ embeds: [embed], components: [buttonRow1, buttonRow2], fetchReply: true });

      const buttonCollector = msg.createMessageComponentCollector({ componentType: ComponentType.Button, time: 60000 });

      buttonCollector.on('collect', async btn => {
        if (btn.user.id !== interaction.user.id) return btn.reply({ content: '❌ Not your command!', ephemeral: true });

        if (btn.customId === 'toggle_shiny') {
          isShiny = !isShiny;
        }

        if (btn.customId === 'toggle_stats') {
          showStats = !showStats;
        }

        if (btn.customId === 'another_pokemon') {
          const newUrl = await getFilteredPokemonURL(selectedGen, selectedType !== 'any' ? selectedType : null);
          pokemon = await fetchPokemon(newUrl);
          isShiny = false;
          showStats = false;
        }

        const updatedEmbed = buildEmbed(pokemon, isShiny, showStats);
        await btn.update({ embeds: [updatedEmbed], components: [buttonRow1, buttonRow2] });
      });

      buttonCollector.on('end', () => {
        msg.edit({ components: [] }).catch(() => {});
      });
    });
  }
};
