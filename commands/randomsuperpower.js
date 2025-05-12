const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randomsuperpower')
        .setDescription('🦸 Get a random superpower'),

    async execute(interaction) {
        const powers = [
            "Invisibility",
            "Time Travel",
            "Super Speed",
            "Mind Reading",
            "Telekinesis",
            "Immortality",
            "Flight",
            "Teleportation",
            "Super Strength",
            "Shape Shifting",
            "Elemental Control (Fire, Ice, etc.)",
            "Animal Communication",
            "Reality Manipulation",
            "Energy Blasts",
            "Technomancy (Control over tech)",
            "Summon Clones",
            "Control Over Shadows",
            "Water Breathing",
            "Healing Touch",
            "X-Ray Vision"
        ];

        const power = powers[Math.floor(Math.random() * powers.length)];
        await interaction.reply(`🦸 Your random superpower is: **${power}**!`);
    }
};
