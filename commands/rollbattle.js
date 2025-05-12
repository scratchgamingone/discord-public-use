const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rollbattle')
    .setDescription('Challenge the computer to a dice roll battle!'),
  async execute(interaction) {
    let score = 0;
    let continueGame = true;

    const rollDice = () => Math.floor(Math.random() * 6) + 1;

    const createButtons = () =>
      new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('roll_again')
          .setLabel('Roll Again 🎲')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('stop_game')
          .setLabel('Stop 🛑')
          .setStyle(ButtonStyle.Danger)
      );

    const playRound = async () => {
      const userRoll = rollDice();
      const computerRoll = rollDice();

      let resultMessage;
      if (userRoll > computerRoll) {
        score++;
        resultMessage = `🎉 You win this round! Your current score is ${score}.`;
      } else if (userRoll < computerRoll) {
        resultMessage = `❌ You lost this round. Final score: ${score}.`;
        continueGame = false;
      } else {
        resultMessage = `🤝 It's a tie! Your current score remains at ${score}.`;
      }

      const embed = new EmbedBuilder()
        .setTitle('🎲 Dice Battle')
        .addFields(
          { name: 'Your Roll', value: `${userRoll}`, inline: true },
          { name: 'Computer Roll', value: `${computerRoll}`, inline: true }
        )
        .setDescription(resultMessage)
        .setColor('#0099ff');

      const messageOptions = {
        embeds: [embed],
        components: continueGame ? [createButtons()] : [],
      };

      const reply = await interaction.followUp(messageOptions);

      if (!continueGame) return;

      try {
        const buttonInteraction = await reply.awaitMessageComponent({
          componentType: ComponentType.Button,
          time: 15000,
        });

        if (buttonInteraction.customId === 'roll_again') {
          await buttonInteraction.deferUpdate();
          await playRound();
        } else if (buttonInteraction.customId === 'stop_game') {
          await buttonInteraction.update({
            content: `🛑 Game stopped. Your final score is ${score}.`,
            embeds: [],
            components: [],
          });
          continueGame = false;
        }
      } catch (error) {
        await reply.edit({
          content: '⏰ Time is up! Game over.',
          embeds: [],
          components: [],
        });
        continueGame = false;
      }
    };

    await interaction.reply({ content: '🎮 Starting Dice Battle...', ephemeral: false });
    await playRound();
  },
};
