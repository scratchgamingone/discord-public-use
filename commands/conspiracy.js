const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('conspiracy')
    .setDescription('Generates a random, humorous conspiracy theory.'),
  async execute(interaction) {
    const subjects = [
      'The moon landing',
      'Area 51',
      'Bigfoot',
      'The Illuminati',
      'Flat Earth',
      'Aliens',
      'Time travel',
      'Mind control',
      'Reptilian overlords',
      'Chemtrails',
    ];

    const actions = [
      'was staged by',
      'is controlled by',
      'was invented by',
      'is a cover-up for',
      'is being manipulated by',
      'was orchestrated by',
      'is secretly run by',
      'is a distraction from',
      'is a front for',
      'is being used by',
    ];

    const agents = [
      'the government',
      'the CIA',
      'the Freemasons',
      'the New World Order',
      'aliens',
      'time travelers',
      'reptilian overlords',
      'the Illuminati',
      'big tech companies',
      'secret societies',
    ];

    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const agent = agents[Math.floor(Math.random() * agents.length)];

    const theory = `${subject} ${action} ${agent}.`;

    await interaction.reply(`🕵️‍♂️ **Conspiracy Theory:** ${theory}`);
  },
};
