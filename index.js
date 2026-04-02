const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const token = process.env.BOT_TOKEN;
const port = process.env.PORT || 3000;

if (!token) {
  console.error("ERRORE: BOT_TOKEN mancante!");
  process.exit(1);
}

const bot = new TelegramBot(token, { polling: true });
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is running');
});

app.listen(port, () => {
  console.log("SERVER ONLINE PORT " + port);
});

console.log("Il bot sta ascoltando...");

// Gestione errori per evitare crash
bot.on('polling_error', (error) => {
  console.log("Errore Polling:", error.code);
});
