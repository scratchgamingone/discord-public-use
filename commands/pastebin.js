const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');
const fs = require('fs');
const path = require('path');

// Configuration
const amount_of_words_min = 5;
const amount_of_words_max = 15;
const paragraph_min = 1;
const paragraph_max = 3;

module.exports = {
    data: new SlashCommandBuilder()
        .setName('pastebin')
        .setDescription('📋 Generate a Pastebin post using chat input or file upload.'),

    async execute(interaction) {
        const userId = interaction.user.id;
        const channel = interaction.channel;
        const expiration = '1W';
        const privacyLevel = 1;

        await interaction.deferReply({ ephemeral: true });
        await interaction.deleteReply(); // Hide interaction

        // Load words.txt
        let wordsArray;
        try {
            const filePath = path.join(__dirname, 'words.txt');
            const wordsText = fs.readFileSync(filePath, 'utf8');
            wordsArray = wordsText.split(/\r?\n/).filter(line => line.trim() !== '');
        } catch (err) {
            console.error('❌ Failed to read words.txt:', err);
            return channel.send('❌ Failed to load the word list.');
        }

        // Ask and wait for a response
        const ask = async (question, expectAttachment = false) => {
            await channel.send(`<@${userId}> ${question}`);
            const collected = await channel.awaitMessages({
                filter: m => m.author.id === userId,
                max: 1,
                time: 60000,
                errors: ['time']
            });
            return collected.first();
        };

        try {
            // Ask if user wants to provide content
            const response = await ask('Do you want to enter your own text content? (`yes` or `no`)');

            let content = '';
            let title = '';

            if (response.content.toLowerCase() === 'yes') {
                const contentMsg = await ask('Please enter your full text content, or upload a `.txt` file.');

                // Handle file upload
                const attachment = contentMsg.attachments.find(att => att.name.endsWith('.txt'));
                if (attachment) {
                    const fileUrl = attachment.url;
                    const fetched = await axios.get(fileUrl);
                    content = fetched.data;
                } else {
                    content = contentMsg.content.trim();
                }

                // Ask for title
                const titleInput = await ask('Enter a title for your paste (`0` for random):');
                title = titleInput.content === '0'
                    ? wordsArray[Math.floor(Math.random() * wordsArray.length)]
                    : titleInput.content.trim();

            } else {
                // Random content flow
                const titleInput = await ask('Enter a title (`0` for random):');
                title = titleInput.content === '0'
                    ? wordsArray[Math.floor(Math.random() * wordsArray.length)]
                    : titleInput.content.trim();

                const wordInput = await ask('How many words per paragraph? (`0`, `50`, or `50-100`):');
                let wordCount;
                if (wordInput.content === '0') {
                    wordCount = Math.floor(Math.random() * (amount_of_words_max - amount_of_words_min + 1)) + amount_of_words_min;
                } else if (/^\d+-\d+$/.test(wordInput.content)) {
                    const [min, max] = wordInput.content.split('-').map(Number);
                    if (min > max) throw new Error('Invalid word count range.');
                    wordCount = Math.floor(Math.random() * (max - min + 1)) + min;
                } else {
                    wordCount = parseInt(wordInput.content);
                    if (isNaN(wordCount) || wordCount <= 0) throw new Error('Invalid word count.');
                }

                const paraInput = await ask(`How many paragraphs? (\`0\` = random between ${paragraph_min}-${paragraph_max}):`);
                let paragraphCount = parseInt(paraInput.content);
                if (isNaN(paragraphCount) || paragraphCount <= 0) {
                    paragraphCount = Math.floor(Math.random() * (paragraph_max - paragraph_min + 1)) + paragraph_min;
                }

                const breakInput = await ask('Add line breaks between paragraphs? (`yes`, `no`, or `0` for random):');
                let lineBreaks;
                if (breakInput.content.toLowerCase() === 'yes') lineBreaks = true;
                else if (breakInput.content.toLowerCase() === 'no') lineBreaks = false;
                else lineBreaks = Math.random() < 0.5;

                // Generate random content
                const paragraphs = [];
                for (let i = 0; i < paragraphCount; i++) {
                    const words = [];
                    for (let j = 0; j < wordCount; j++) {
                        const word = wordsArray[Math.floor(Math.random() * wordsArray.length)];
                        words.push(word);
                    }
                    paragraphs.push(words.join(' '));
                }
                content = paragraphs.join(lineBreaks ? '\n\n' : ' ');
            }

            // Pastebin API call
            const pasteData = {
                api_dev_key: process.env.PASTEBIN_API_KEY,
                api_option: 'paste',
                api_paste_code: content,
                api_paste_name: title,
                api_paste_private: privacyLevel,
                api_paste_expire_date: expiration,
                api_user_key: ''
            };

            const pasteResponse = await axios.post('https://pastebin.com/api/api_post.php', new URLSearchParams(pasteData));
            await channel.send(`✅ Paste created: ${pasteResponse.data}`);

        } catch (err) {
            console.error('❌ Error:', err);
            return channel.send(`<@${interaction.user.id}> ❌ Timed out or invalid input. Try again with \`/pastebin\`.`);
        }
    },
};
