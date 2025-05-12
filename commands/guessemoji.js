const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('guessemoji')
        .setDescription('🎉 Guess the emoji I’m thinking of!'),
    async execute(interaction) {
        const emojis = [
            { name: 'heart', symbol: '❤️' },
            { name: 'fire', symbol: '🔥' },
            { name: 'star', symbol: '⭐' },
            { name: 'thumbs up', symbol: '👍' },
            { name: 'laugh', symbol: '😂' },
            { name: 'clap', symbol: '👏' }
        ];

        const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];

        await interaction.reply(`🎮 I’m thinking of an emoji! You have **3 chances** to guess its name (like: heart, fire, star). Type your guess:`);

        const filter = m => m.author.id === interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 3, time: 15000 });

        collector.on('collect', message => {
            if (message.content.toLowerCase() === randomEmoji.name) {
                message.reply(`✅ Correct! The emoji was ${randomEmoji.symbol} (${randomEmoji.name}).`);
                collector.stop('guessed');
            } else {
                message.reply('❌ Nope! Try again.');
            }
        });

        collector.on('end', (collected, reason) => {
            if (reason !== 'guessed') {
                interaction.followUp(`😢 You ran out of guesses! The correct emoji was ${randomEmoji.symbol} (${randomEmoji.name}).`);
            }
        });
    },
};
