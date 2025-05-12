const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stock')
    .setDescription('📈 Get real-time stock price info')
    .addStringOption(option =>
      option.setName('symbol')
        .setDescription('Enter the stock ticker symbol (e.g. AAPL)')
        .setRequired(false)
    ),

  async execute(interaction) {
    await interaction.deferReply();

    let symbol = interaction.options.getString('symbol')?.toUpperCase();
    let tickers = [];

    try {
      // If no symbol provided, fetch the active ticker list from Polygon
      if (!symbol) {
        const tickersRes = await axios.get(`https://api.polygon.io/v3/reference/tickers?active=true&limit=1000&apiKey=${process.env.POLYGON_API_KEY}`);
        tickers = tickersRes.data.results;
        if (!tickers || tickers.length === 0) throw new Error('No stock tickers found.');
      }

      let attempts = 0;
      let data;

      while (attempts < 10) {
        const targetSymbol = symbol || tickers[Math.floor(Math.random() * tickers.length)].ticker;

        try {
          const url = `https://api.polygon.io/v2/aggs/ticker/${targetSymbol}/prev?adjusted=true&apiKey=${process.env.POLYGON_API_KEY}`;
          const res = await axios.get(url);
          data = res.data.results?.[0];

          if (data) {
            symbol = targetSymbol;
            break; // ✅ Found valid stock data
          }
        } catch {
          // Try next symbol silently
        }

        attempts++;
      }

      if (!data) {
        throw new Error('Unable to find a valid stock after multiple attempts.');
      }

      const change = data.c - data.o;
      const percentChange = ((change / data.o) * 100).toFixed(2);

      const embed = new EmbedBuilder()
        .setTitle(`📊 Stock Info: ${symbol}`)
        .addFields(
          { name: '🔹 Price', value: `$${data.c.toFixed(2)}`, inline: true },
          { name: '📉 Change', value: `${change >= 0 ? '+' : ''}${change.toFixed(2)} (${percentChange}%)`, inline: true },
          { name: '🕒 Date', value: `<t:${Math.floor(data.t / 1000)}:d>`, inline: true }
        )
        .setColor(change >= 0 ? 0x00C853 : 0xD32F2F)
        .setFooter({ text: 'Powered by Polygon.io' });

      await interaction.editReply({ embeds: [embed] });

    } catch (err) {
      console.error('Polygon error:', err.message || err);
      await interaction.editReply(`❌ Could not retrieve any stock data. Please try again later.`);
    }
  }
};
