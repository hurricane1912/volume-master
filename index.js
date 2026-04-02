const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

const token = process.env.BOT_TOKEN;
const port = process.env.PORT || 8080;

const bot = new TelegramBot(token, { polling: true });
const app = express();

// Messaggio di test per capire se riceve
bot.on('message', (msg) => {
  console.log("Messaggio ricevuto:", msg.text);
  bot.sendMessage(msg.chat.id, "Bot attivo e funzionante!");
});

app.get('/', (req, res) => res.send('Server Online'));

app.listen(port, () => {
  console.log("Server OK sulla porta " + port);
  console.log("Il bot sta ascoltando...");
});
