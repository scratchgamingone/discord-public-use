const { SlashCommandBuilder } = require('discord.js');

function getRandomColor() {
  return [Math.floor(Math.random() * 256), Math.floor(Math.random() * 256), Math.floor(Math.random() * 256)];
}

function mixColors(color1, color2) {
  return color1.map((c, i) => Math.floor((c + color2[i]) / 2));
}

function rgbToHex(rgb) {
  return '#' + rgb.map(c => c.toString(16).padStart(2, '0')).join('');
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('colormix')
    .setDescription('🎨 Generate and mix two random colors.'),
  async execute(interaction) {
    const color1 = getRandomColor();
    const color2 = getRandomColor();
    const mixed = mixColors(color1, color2);

    const color1Hex = rgbToHex(color1);
    const color2Hex = rgbToHex(color2);
    const mixedHex = rgbToHex(mixed);

    await interaction.reply({
      embeds: [{
        title: '🎨 Random Color Mixer',
        description: `First Color: ${color1Hex}\nSecond Color: ${color2Hex}\nMixed Color: ${mixedHex}`,
        color: parseInt(mixedHex.replace('#', ''), 16),
        image: { url: `https://singlecolorimage.com/get/${mixedHex.slice(1)}/600x100` }
      }]
    });
  }
};
