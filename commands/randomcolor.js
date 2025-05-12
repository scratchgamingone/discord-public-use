const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomcolor')
        .setDescription('🎨 Get a fully random color (HEX + RGB)'),

    async execute(interaction) {
        const randomHex = () => {
            const hex = Math.floor(Math.random() * 0xffffff).toString(16).padStart(6, '0');
            return `#${hex.toUpperCase()}`;
        };

        const hex = randomHex();
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const imageURL = `https://singlecolorimage.com/get/${hex.slice(1)}/400x100`;

        const embed = new EmbedBuilder()
            .setTitle('🎨 Random Color')
            .setColor(hex)
            .setImage(imageURL)
            .addFields(
                { name: 'HEX', value: hex, inline: true },
                { name: 'RGB', value: `rgb(${r}, ${g}, ${b})`, inline: true }
            )
            .setFooter({ text: 'Generated on the fly' })
            .setTimestamp();

        await interaction.reply({ embeds: [embed] });
    }
};
