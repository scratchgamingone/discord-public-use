const { SlashCommandBuilder } = require('discord.js');

function isPrime(num) {
  if (num < 2) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;
  const sqrt = Math.sqrt(num);
  for (let i = 3; i <= sqrt; i += 2) {
    if (num % i === 0) return false;
  }
  return true;
}

function findNextPrime(start) {
  let num = start;
  while (true) {
    if (isPrime(num)) return num;
    num++;
  }
}

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randomprime')
    .setDescription('🧬 Generate a random large number and find the next prime.'),
  async execute(interaction) {
    const randomStart = Math.floor(Math.random() * 100000) + 10000; // Start between 10,000–110,000
    const nextPrime = findNextPrime(randomStart);

    await interaction.reply({
      embeds: [{
        title: '🧬 Random Prime Number Finder',
        description: `🔢 Starting from **${randomStart}**, the next prime number is **${nextPrime}**.`,
        color: 0x9b59b6
      }]
    });
  }
};
