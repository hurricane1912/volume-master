const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// Carica il token dalle variabili di Railway
const token = process.env.BOT_TOKEN;

// Se il token manca, ferma tutto subito con un messaggio chiaro
if (!token) {
  console.error("ERRORE: BOT_TOKEN non trovato nelle variabili di Railway!");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => res.send('Bot is running'));

app.listen(port, () => {
  console.log(SERVER ONLINE PORT ${port});
});

// Messaggio di conferma per Telegram
console.log("Il bot sta ascoltando su Telegram...");
