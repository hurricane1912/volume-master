const TelegramBot = require('node-telegram-bot-api');
const express = require('express');

// Caricamento variabili d'ambiente
const token = process.env.BOT_TOKEN;
const port = process.env.PORT || 8080;

// Inizializzazione corretta del bot (Risolve ReferenceError)
const bot = new TelegramBot(token, { polling: true });
const app = express();

// Gestore messaggi (Risolve il silenzio del bot)
bot.on('message', (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  console.log("Messaggio ricevuto: " + text);

  if (text === '/start' || text === '/status') {
    bot.sendMessage(chatId, "✅ Il bot è ONLINE su Railway sulla porta " + port);
  } else {
    bot.sendMessage(chatId, "Ricevuto: " + text);
  }
});

// Rotta per il controllo di Railway (Risolve errori di deploy)
app.get('/', (req, res) => {
  res.send('Bot Telegram in esecuzione...');
});

app.listen(port, () => {
  console.log("SERVER ONLINE PORT " + port);
  console.log("Il bot sta ascoltando i messaggi...");
});
