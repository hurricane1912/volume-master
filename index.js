
// Cambia la riga della creazione del bot nel tuo index.js con questa:
const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });

// Assicurati che alla fine del file ci sia questo per rispondere a Helius:
app.post('/webhook', async (req, res) => {
    res.status(200).send('OK'); // Questo dice a Helius che il segnale è ricevuto
    const events = req.body;
    if (Array.isArray(events)) {
        events.forEach(event => {
            if (event.feePayer) sendOnChainInvite(event.feePayer);
        });
    }
});
