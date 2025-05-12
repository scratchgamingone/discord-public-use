const { SlashCommandBuilder } = require('discord.js');

const templates = [
  {
    title: 'A Day at the Zoo',
    story: 'Today I went to the zoo. I saw a(n) {adjective1} {noun1} jumping up and down in its tree. He {verb1} {adverb1} through the large tunnel that led to its {adjective2} {noun2}.',
    prompts: ['adjective1', 'noun1', 'verb1', 'adverb1', 'adjective2', 'noun2']
  },
  {
    title: 'My Favorite Recipe',
    story: 'To make my favorite dish, start with {number1} cups of {noun1}. Then, add a pinch of {noun2} and stir {adverb1}. Bake it until it\'s {adjective1} and enjoy!',
    prompts: ['number1', 'noun1', 'noun2', 'adverb1', 'adjective1']
  }
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName('madlib')
    .setDescription('🧠 Generate a fun Mad Libs story!'),
  async execute(interaction) {
    const template = templates[Math.floor(Math.random() * templates.length)];
    const filter = response => response.author.id === interaction.user.id;

    const responses = {};

    for (const prompt of template.prompts) {
      await interaction.channel.send(`Please provide a ${prompt.replace(/\d+$/, '')}:`);
      const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
      responses[prompt] = collected.first().content;
    }

    let story = template.story;
    for (const [key, value] of Object.entries(responses)) {
      story = story.replace(`{${key}}`, value);
    }

    await interaction.channel.send(`**${template.title}**\n\n${story}`);
  }
};
