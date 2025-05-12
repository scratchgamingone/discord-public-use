const {
  SlashCommandBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  ComponentType,
} = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('truthordare')
    .setDescription('Play a continuous game of Truth or Dare!'),
  async execute(interaction) {
    await interaction.deferReply();

    let continueGame = true;
    let truthCount = 0;
    let dareCount = 0;

    while (continueGame) {
      // Create buttons for Truth and Dare
      const choiceRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('truth')
          .setLabel('Truth 🧠')
          .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
          .setCustomId('dare')
          .setLabel('Dare 💪')
          .setStyle(ButtonStyle.Danger)
      );

      // Send the initial prompt
      const promptEmbed = new EmbedBuilder()
        .setTitle('🎯 Truth or Dare')
        .setDescription('Choose your fate by clicking one of the buttons below.')
        .setColor('#5865F2');

      const message = await interaction.followUp({
        embeds: [promptEmbed],
        components: [choiceRow],
      });

      // Create a collector for the user's choice
      const choiceCollector = message.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30000,
      });

      const choiceInteraction = await new Promise((resolve) => {
        choiceCollector.on('collect', (i) => {
          if (i.user.id === interaction.user.id) {
            resolve(i);
            choiceCollector.stop();
          } else {
            i.reply({ content: "This isn't your game!", ephemeral: true });
          }
        });

        choiceCollector.on('end', () => {
          resolve(null);
        });
      });

      if (!choiceInteraction) {
        await message.edit({
          content: '⏰ Time is up! No selection was made.',
          components: [],
        });
        break;
      }

      const selected = choiceInteraction.customId; // 'truth' or 'dare'
      let prompt;

      try {
        const response = await axios.get(`https://api.truthordarebot.xyz/api/${selected}`);
        prompt = response.data.question;
      } catch (error) {
        console.error(error);
        prompt = 'Failed to fetch a prompt. Please try again later.';
      }

      // Increment the appropriate counter
      if (selected === 'truth') {
        truthCount++;
      } else if (selected === 'dare') {
        dareCount++;
      }

      // Display the prompt
      const resultEmbed = new EmbedBuilder()
        .setTitle(`You chose: ${selected.charAt(0).toUpperCase() + selected.slice(1)}`)
        .setDescription(prompt)
        .setColor(selected === 'truth' ? '#57F287' : '#ED4245');

      const continueRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('continue')
          .setLabel('Another Round 🔁')
          .setStyle(ButtonStyle.Success),
        new ButtonBuilder()
          .setCustomId('stop')
          .setLabel('Stop 🛑')
          .setStyle(ButtonStyle.Secondary)
      );

      const promptMessage = await interaction.followUp({
        embeds: [resultEmbed],
        components: [continueRow],
      });

      // Create a collector for the continue/stop choice
      const continueCollector = promptMessage.createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 30000,
      });

      const continueInteraction = await new Promise((resolve) => {
        continueCollector.on('collect', (i) => {
          if (i.user.id === interaction.user.id) {
            resolve(i);
            continueCollector.stop();
          } else {
            i.reply({ content: "This isn't your game!", ephemeral: true });
          }
        });

        continueCollector.on('end', () => {
          resolve(null);
        });
      });

      if (!continueInteraction || continueInteraction.customId === 'stop') {
        await promptMessage.edit({
          content: `🛑 Game ended. Thanks for playing!\n\n**Truths answered**: ${truthCount}\n**Dares completed**: ${dareCount}\n**Total rounds**: ${truthCount + dareCount}`,
          components: [],
        });
        continueGame = false;
      } else {
        await promptMessage.edit({ components: [] });
      }
    }
  },
};
