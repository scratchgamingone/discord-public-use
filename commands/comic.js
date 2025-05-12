const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');

async function fetchRandomComic() {
    try {
        // Get the latest comic number
        const latest = await axios.get('https://xkcd.com/info.0.json');
        const maxNum = latest.data.num;

        // Pick a random comic between 1 and max
        const randomNum = Math.floor(Math.random() * maxNum) + 1;

        // Get the random comic
        const res = await axios.get(`https://xkcd.com/${randomNum}/info.0.json`);
        const comic = res.data;

        return {
            title: comic.safe_title,
            img: comic.img,
            alt: comic.alt,
            num: comic.num
        };
    } catch (err) {
        console.error('❌ Error fetching comic:', err);
        return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('comic')
        .setDescription('📚 Sends a random XKCD comic'),

    async execute(interaction) {
        await interaction.deferReply();

        const comic = await fetchRandomComic();
        if (!comic) {
            return interaction.editReply({
                content: '❌ Failed to fetch a comic. Please try again later.'
            });
        }

        const embed = new EmbedBuilder()
            .setTitle(`XKCD #${comic.num}: ${comic.title}`)
            .setImage(comic.img)
            .setDescription(comic.alt)
            .setColor('Random')
            .setURL(`https://xkcd.com/${comic.num}`);

        await interaction.editReply({ embeds: [embed] });
    }
};
