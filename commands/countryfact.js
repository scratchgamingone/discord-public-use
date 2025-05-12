const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomcountry')
    .setDescription('Show a random country with interactive details'),

  async execute(interaction) {
    await interaction.deferReply();
    let country = await fetchRandomCountry();

    const mainEmbed = buildCountryEmbed(country);
    const row = buildMainButtons();

    const message = await interaction.editReply({ embeds: [mainEmbed], components: [row] });

    const collector = message.createMessageComponentCollector({ time: 60000 });

    collector.on('collect', async i => {
      if (i.user.id !== interaction.user.id) {
        return i.reply({ content: 'These buttons are not for you!', ephemeral: true });
      }

      if (i.customId === 'population') {
        const popEmbed = buildPopulationEmbed(country);
        const backRow = buildBackButtons();
        await i.update({ embeds: [popEmbed], components: [backRow] });
      } else if (i.customId === 'currencies') {
        const currEmbed = buildCurrenciesEmbed(country);
        const backRow = buildBackButtons();
        await i.update({ embeds: [currEmbed], components: [backRow] });
      } else if (i.customId === 'languages') {
        const langEmbed = buildLanguagesEmbed(country);
        const backRow = buildBackButtons();
        await i.update({ embeds: [langEmbed], components: [backRow] });
      } else if (i.customId === 'reroll') {
        country = await fetchRandomCountry();
        const newMainEmbed = buildCountryEmbed(country);
        await i.update({ embeds: [newMainEmbed], components: [row] });
      } else if (i.customId === 'back') {
        const backEmbed = buildCountryEmbed(country);
        const mainRow = buildMainButtons();
        await i.update({ embeds: [backEmbed], components: [mainRow] });
      }
    });

    collector.on('end', () => {
      const disabledRow = buildMainButtons(true);
      message.edit({ components: [disabledRow] });
    });
  },
};

async function fetchRandomCountry() {
  const response = await axios.get('https://restcountries.com/v3.1/all');
  const countries = response.data;
  const randomIndex = Math.floor(Math.random() * countries.length);
  return countries[randomIndex];
}

function buildCountryEmbed(country) {
  const name = country.name?.common || 'Unknown';
  const capital = country.capital?.[0] || 'N/A';
  const region = country.region || 'N/A';
  const flag = country.flags?.png || '';

  return new EmbedBuilder()
    .setTitle(name)
    .setDescription(`**Capital:** ${capital}\n**Region:** ${region}`)
    .setThumbnail(flag)
    .setColor(0x1D82B6);
}

function buildPopulationEmbed(country) {
  return new EmbedBuilder()
    .setTitle('Population')
    .setDescription(`**${country.name?.common || 'Unknown'}**\nPopulation: ${country.population.toLocaleString()}`)
    .setColor(0x3498DB);
}

function buildCurrenciesEmbed(country) {
  const currencies = country.currencies
    ? Object.values(country.currencies).map(c => `${c.name} (${c.symbol || ''})`).join(', ')
    : 'N/A';
  return new EmbedBuilder()
    .setTitle('Currencies')
    .setDescription(`**${country.name?.common || 'Unknown'}**\nCurrencies: ${currencies}`)
    .setColor(0x2ECC71);
}

function buildLanguagesEmbed(country) {
  const languages = country.languages
    ? Object.values(country.languages).join(', ')
    : 'N/A';
  return new EmbedBuilder()
    .setTitle('Languages')
    .setDescription(`**${country.name?.common || 'Unknown'}**\nLanguages: ${languages}`)
    .setColor(0xE67E22);
}

function buildMainButtons(disabled = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('population')
      .setLabel('Population')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId('currencies')
      .setLabel('Currencies')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId('languages')
      .setLabel('Languages')
      .setStyle(ButtonStyle.Secondary)
      .setDisabled(disabled),
    new ButtonBuilder()
      .setCustomId('reroll')
      .setLabel('Reroll')
      .setStyle(ButtonStyle.Success)
      .setDisabled(disabled)
  );
}

function buildBackButtons(disabled = false) {
  return new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId('back')
      .setLabel('⬅️ Back')
      .setStyle(ButtonStyle.Primary)
      .setDisabled(disabled)
  );
}
