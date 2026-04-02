bot.onText(/\/status/, (msg) => {
  bot.sendMessage(msg.chat.id, "Il bot è ONLINE e funzionante su Railway!");
});
