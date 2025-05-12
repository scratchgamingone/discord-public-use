// commands/commands.js
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('commands')
    .setDescription('List all available commands'),
  async execute(interaction) {
    const commandNames = interaction.client.commands.map(cmd => `\`/${cmd.data.name}\``);
    const totalCommands = commandNames.length;

    const embed = new EmbedBuilder()
      .setTitle('📜 Available Commands')
      .setDescription(commandNames.join(', '))
      .setFooter({ text: `Total Commands: ${totalCommands}` })
      .setColor(0x00AE86);

    await interaction.reply({ embeds: [embed], ephemeral: true });
  },
};
