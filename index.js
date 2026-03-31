const TelegramBot = require('node-telegram-bot-api');

// Recupera i dati da Railway
const token = process.env.BOT_TOKEN;
const chatId = process.env.CHAT_ID;

const bot = new TelegramBot(token, { polling: true });

async function main() {
    console.log("Tentativo di invio messaggio...");
    try {
        await bot.sendMessage(chatId, "🚀 [MASTER CODE] Sistema Attivo! I 10 portafogli soldati sono pronti.");
        console.log("Messaggio inviato con successo!");
    } catch (err) {
        console.log("Errore: " + err.message);
    }
}

// Mantieni il bot sveglio
bot.on('message', (msg) => {
    console.log("Ricevuto: " + msg.text);
});

main();
