const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ComponentType } = require('discord.js');
const axios = require('axios');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('randommeal')
    .setDescription('Get a random meal suggestion!'),
  
  async execute(interaction) {
    try {
      const response = await axios.get('https://www.themealdb.com/api/json/v1/1/random.php');
      const meal = response.data.meals[0];

      const embed = new EmbedBuilder()
        .setTitle(`🍽️ Random Meal: ${meal.strMeal}`)
        .setImage(meal.strMealThumb)
        .setDescription('Click the button below to see the full recipe!')
        .setColor('#FFA500');

      const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('show_recipe')
          .setLabel('Show Recipe 📜')
          .setStyle(ButtonStyle.Primary)
      );

      await interaction.reply({ embeds: [embed], components: [button] });

      const collector = interaction.channel.createMessageComponentCollector({ componentType: ComponentType.Button, time: 30000 });

      collector.on('collect', async i => {
        if (i.customId === 'show_recipe' && i.user.id === interaction.user.id) {
          await i.update({
            embeds: [
              new EmbedBuilder()
                .setTitle(`📜 Recipe for ${meal.strMeal}`)
                .setDescription(meal.strInstructions)
                .setColor('#00C851')
            ],
            components: []
          });
          collector.stop();
        }
      });

      collector.on('end', collected => {
        if (collected.size === 0) {
          interaction.editReply({ content: '⏰ Time is up! You didn\'t check the recipe.', components: [] });
        }
      });

    } catch (error) {
      console.error(error);
      await interaction.reply('❌ Could not fetch a meal right now. Try again later!');
    }
  }
};
