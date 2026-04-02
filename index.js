const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const token = process.env.BOT_TOKEN;
const port = process.env.PORT || 3000;

const bot = new TelegramBot(token, { polling: true });
const app = express();

// Risposta di test
bot.on('message', (msg) => {
  bot.sendMessage(msg.chat.id, "Ti sento! Il bot è attivo.");
});

app.get('/', (req, res) => res.send('Bot Online'));
app.listen(port, () => console.log("Server OK sulla porta " + port));
