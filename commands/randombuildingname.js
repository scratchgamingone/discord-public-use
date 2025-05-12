const { SlashCommandBuilder } = require('discord.js');

const adjectives = [
  'Crystal', 'Shadow', 'Iron', 'Golden', 'Emerald', 'Quantum', 'Neon', 'Silent', 'Frozen', 'Thunder'
];

const nouns = [
  'Tower', 'Citadel', 'Dome', 'Spire', 'Bunker', 'Fortress', 'Sanctum', 'Complex', 'Labyrinth', 'Vault'
];

const suffixes = [
  '', ' Alpha', ' Prime', ' 3000', ' X', ' Nova', ' Horizon', ' Eclipse', ' Nexus', ' Core'
];

function getRandom(array) {
  return array[Math.floor(Math.random() * array.length)];
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randombuildingname')
    .setDescription('🏗️ Generate a random futuristic or fantasy building name.'),
  async execute(interaction) {
    const name = `${getRandom(adjectives)} ${getRandom(nouns)}${getRandom(suffixes)}`;

    await interaction.reply({
      embeds: [{
        title: '🏗️ Your Random Building Name:',
        description: `**${name}**`,
        color: 0x3498db
      }]
    });
  }
};
