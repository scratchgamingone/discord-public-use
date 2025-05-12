const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const he = require('he');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('trivia')
    .setDescription('Start a trivia game with buttons!'),
  async execute(interaction) {
    let score = 0;
    let isGameOver = false;

    await interaction.reply({ content: '🎮 Starting Trivia Game...', ephemeral: false });

    while (!isGameOver) {
      try {
        const response = await axios.get('https://opentdb.com/api.php?amount=1&type=multiple');
        const data = response.data.results[0];

        const question = he.decode(data.question);
        const correctAnswer = he.decode(data.correct_answer);
        const incorrectAnswers = data.incorrect_answers.map(ans => he.decode(ans));

        const allAnswers = [...incorrectAnswers, correctAnswer];
        const shuffledAnswers = allAnswers.sort(() => Math.random() - 0.5);

        const buttons = new ActionRowBuilder();
        shuffledAnswers.forEach((answer, index) => {
          buttons.addComponents(
            new ButtonBuilder()
              .setCustomId(`answer_${index}`)
              .setLabel(answer)
              .setStyle(ButtonStyle.Primary)
          );
        });

        const embed = new EmbedBuilder()
          .setTitle('🧠 Trivia Question')
          .setDescription(question)
          .setColor('#0099ff')
          .setFooter({ text: `Score: ${score}` });

        const message = await interaction.followUp({ embeds: [embed], components: [buttons], ephemeral: false });

        const filter = i => i.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter, time: 15000, max: 1 });

        const collected = await new Promise((resolve) => {
          collector.on('collect', resolve);
          collector.on('end', collected => {
            if (collected.size === 0) resolve(null);
          });
        });

        if (!collected) {
          await interaction.followUp({ content: '⏰ Time is up! Game over.', ephemeral: true });
          isGameOver = true;
          break;
        }

        const selectedAnswer = collected.component.label;

        if (selectedAnswer === correctAnswer) {
          score++;
          await collected.update({ content: `✅ Correct! Your score is now ${score}.`, components: [], embeds: [] });
        } else {
          await collected.update({ content: `❌ Incorrect! The correct answer was: ${correctAnswer}. Final score: ${score}.`, components: [], embeds: [] });
          isGameOver = true;
        }
      } catch (error) {
        console.error('Error fetching trivia question:', error);
        await interaction.followUp({ content: '❌ Could not fetch a trivia question at the moment. Try again later!', ephemeral: false });
        isGameOver = true;
      }
    }
  },
};
