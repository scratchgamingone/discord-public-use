const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
require('dotenv').config();

const resolutions = ['1920x1080', '2560x1440', '3840x2160'];
const fallbackKeywords = ['nature', 'space', 'city', 'mountains', 'ocean'];

module.exports = {
    data: new SlashCommandBuilder()
        .setName('wallpaper')
        .setDescription('🖼️ Download a wallpaper based on keyword and resolution')
        .addStringOption(option =>
            option.setName('keyword')
                .setDescription('Theme or keyword (optional)')
                .setRequired(false)
        )
        .addStringOption(option =>
            option.setName('resolution')
                .setDescription('Resolution (optional)')
                .addChoices(...resolutions.map(r => ({ name: r, value: r })))
                .setRequired(false)
        ),

    async execute(interaction) {
        await interaction.deferReply();

        const format = 'jpg';
        const keyword = interaction.options.getString('keyword') || fallbackKeywords[Math.floor(Math.random() * fallbackKeywords.length)];
        const resolution = interaction.options.getString('resolution') || resolutions[Math.floor(Math.random() * resolutions.length)];
        const [width, height] = resolution.split('x');

        try {
            const res = await axios.get('https://api.unsplash.com/photos/random', {
                params: {
                    query: keyword,
                    orientation: 'landscape',
                    client_id: process.env.UNSPLASH_API_KEY
                }
            });

            const imageRaw = res.data.urls.raw;
            const downloadUrl = `${imageRaw}&w=${width}&h=${height}&fm=${format}`;
            const fileName = `wallpaper_${keyword}_${resolution}.${format}`;

            // Download the image buffer
            const imageRes = await axios.get(downloadUrl, { responseType: 'arraybuffer' });
            const attachment = new AttachmentBuilder(Buffer.from(imageRes.data), { name: fileName });

            const embed = new EmbedBuilder()
                .setTitle(`🖼️ Wallpaper: ${keyword} (${resolution})`)
                .setDescription(`Click the file below to download as **.${format}**`)
                .setColor(0x1abc9c)
                .setFooter({ text: `Photo by ${res.data.user.name} on Unsplash` })
                .setTimestamp();

            await interaction.editReply({
                embeds: [embed],
                files: [attachment]
            });

        } catch (error) {
            console.error('❌ Error fetching or downloading wallpaper:', error);
            await interaction.editReply('❌ Failed to fetch a wallpaper. Try again later!');
        }
    }
};
