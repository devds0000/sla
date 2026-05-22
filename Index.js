const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const config = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent
    ]
});

client.once('ready', () => {
    console.log(`[READY] Bot logado como ${client.user.tag}`);
    console.log(`[INFO] Monitorando links do TikTok (Apenas Vídeo)...`);
});

client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

    const tiktokRegex = /https?:\/\/(www\.|vm\.|vt\.)?tiktok\.com\/[^\s]+/;
    const match = message.content.match(tiktokRegex);

    if (match) {
        const url = match[0];
        
        try {
            // Avisa que está processando (opcional, mas ajuda o usuário a saber que o bot viu o link)
            const processingMsg = await message.reply("🎬 **Baixando vídeo...**");

            const res = await axios.get(`https://tikwm.com/api/?url=${encodeURIComponent(url)}`);
            const data = res.data.data;

            if (!data) {
                return await processingMsg.edit("❌ Não foi possível encontrar o vídeo.");
            }

            // Envia APENAS o vídeo
            await message.channel.send({
                files: [{ attachment: data.play, name: `tiktok_${data.id}.mp4` }]
            });

            // Remove a mensagem de "baixando"
            await processingMsg.delete().catch(() => {});

        } catch (error) {
            console.error("Erro:", error);
            message.channel.send("❌ Erro ao baixar vídeo.");
        }
    }
});

client.login(config.token);
                         
