const TelegramBot = require('node-telegram-bot-api');

// Carica le variabili che hai impostato su Railway
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

async function main() {
    console.log("Bot in fase di avvio...");
    
    // Invia il messaggio di conferma su Telegram
    bot.sendMessage(process.env.CHAT_ID, "🚀 [MASTER CODE] Sistema Attivo!\n\nI 10 portafogli soldati sono pronti. Inizio scansione Dev per profitto da 1.5 SOL.");
}

main();
