const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

const REACTION_EMOJI = '🙏';

// A list of safe, valid verse references
const safeVerses = [
    'John 3:16',
    'Romans 8:28',
    'Proverbs 3:5',
    'Genesis 1:1',
    'Philippians 4:13',
    'Psalm 23:1',
    'Isaiah 41:10',
    'Matthew 6:33',
    '1 Corinthians 13:4',
    'Hebrews 11:1',
    'Joshua 1:9',
    '2 Timothy 1:7'
];

function getRandomVerseReference() {
    return safeVerses[Math.floor(Math.random() * safeVerses.length)];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('verse4')
        .setDescription('📖 Get a random Bible verse using bible-api.com'),

    async execute(interaction) {
        await interaction.deferReply();

        try {
            const reference = getRandomVerseReference();
            const url = `https://bible-api.com/${encodeURIComponent(reference)}`;

            const res = await axios.get(url);
            const data = res.data;

            if (!data.text || !data.reference) {
                return await interaction.editReply('❌ Could not get a verse. Try again!');
            }

            const embed = new EmbedBuilder()
                .setTitle('📖 Random Bible Verse')
                .setDescription(`*"${data.text.trim()}"*`)
                .setFooter({ text: data.reference })
                .setColor(0xA3D2CA);

            await interaction.editReply({ embeds: [embed] });

            const message = await interaction.fetchReply();
            await message.react(REACTION_EMOJI);

        } catch (err) {
            console.error('Bible API fetch failed:', err.message);
            await interaction.editReply('❌ Failed to fetch a verse. Please try again later.');
        }
    }
};
