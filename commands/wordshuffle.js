const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wordshuffle')
        .setDescription('🌀 Unscramble the shuffled word!'),
    async execute(interaction) {
        const wordList = ['apple', 'banana', 'orange', 'grape', 'peach', 'lemon', 'melon', 'berry'];
        const chosenWord = wordList[Math.floor(Math.random() * wordList.length)];
        const shuffledWord = chosenWord.split('').sort(() => 0.5 - Math.random()).join('');

        await interaction.reply(`🔤 Unscramble this word: **${shuffledWord}**\nYou have **3 guesses**!`);

        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 3, time: 20000 });

        collector.on('collect', message => {
            if (message.content.toLowerCase() === chosenWord) {
                message.reply(`✅ Correct! The word was **${chosenWord}**.`);
                collector.stop('guessed');
            } else {
                message.reply('❌ Nope! Try again.');
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason !== 'guessed') {
                interaction.followUp(`⏰ Time's up or max guesses! The word was **${chosenWord}**.`);
            }
        });
    },
};
