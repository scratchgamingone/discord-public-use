const { SlashCommandBuilder } = require('discord.js');

// Random Unicode emoji from selected emoji Unicode ranges
function getRandomEmoji() {
    const emojiRanges = [
        [0x1F600, 0x1F64F], // Emoticons
        [0x1F300, 0x1F5FF], // Misc Symbols & Pictographs
        [0x1F680, 0x1F6FF], // Transport & Map
        [0x1F700, 0x1F77F], // Alchemical Symbols
        [0x1F900, 0x1F9FF], // Supplemental Symbols and Pictographs
        [0x1FA70, 0x1FAFF]  // Symbols and Pictographs Extended-A
    ];

    const [start, end] = emojiRanges[Math.floor(Math.random() * emojiRanges.length)];
    const codePoint = Math.floor(Math.random() * (end - start + 1)) + start;

    return String.fromCodePoint(codePoint);
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomemoji')
        .setDescription('🎲 Sends a truly random emoji'),

    async execute(interaction) {
        const emoji = getRandomEmoji();
        await interaction.reply(`Your random emoji is: ${emoji}`);
    }
};
