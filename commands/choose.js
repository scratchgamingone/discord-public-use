const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, ComponentType } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('choose')
    .setDescription('Select your favorite programming language from a dropdown menu.'),
  async execute(interaction) {
    const selectMenu = new StringSelectMenuBuilder()
      .setCustomId('language_select')
      .setPlaceholder('Choose your favorite language')
      .addOptions([
        {
          label: 'JavaScript',
          description: 'Select JavaScript as your favorite language.',
          value: 'javascript',
        },
        {
          label: 'Python',
          description: 'Select Python as your favorite language.',
          value: 'python',
        },
        {
          label: 'Java',
          description: 'Select Java as your favorite language.',
          value: 'java',
        },
        {
          label: 'C#',
          description: 'Select C# as your favorite language.',
          value: 'csharp',
        },
        {
          label: 'Go',
          description: 'Select Go as your favorite language.',
          value: 'go',
        },
      ]);

    const row = new ActionRowBuilder().addComponents(selectMenu);

    await interaction.reply({
      content: 'Please select your favorite programming language:',
      components: [row],
      ephemeral: false,
    });

    const collector = interaction.channel.createMessageComponentCollector({
      componentType: ComponentType.StringSelect,
      time: 15000,
    });

    collector.on('collect', async (i) => {
      if (i.customId === 'language_select' && i.user.id === interaction.user.id) {
        await i.update({
          content: `You selected **${i.values[0]}** as your favorite programming language!`,
          components: [],
        });
      } else {
        await i.reply({
          content: 'This select menu is not for you.',
          ephemeral: true,
        });
      }
    });

    collector.on('end', async (collected) => {
      if (collected.size === 0) {
        await interaction.editReply({
          content: 'You did not select any option in time.',
          components: [],
        });
      }
    });
  },
};
