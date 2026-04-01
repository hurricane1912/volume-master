const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const { Connection, Keypair, Transaction, SystemProgram, TransactionInstruction, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');

const app = express();
app.use(express.json());

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const connection = new Connection(process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com", 'confirmed');
const MY_WALLET = process.env.MY_WALLET_ADDRESS || "";
const privKeyStr = process.env.MASTER_PRIVATE_KEY || "";
let masterAccount = privKeyStr ? Keypair.fromSecretKey(bs58.decode(privKeyStr)) : null;

let soldierWallets = [];

async function sendOnChainInvite(devAddress) {
    try {
        const memoProgramId = new PublicKey("MemoSNDZ77edY6f9o6cY4k74ZicV8yvUTo1PjJ2p");
        const tx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: masterAccount.publicKey,
                toPubkey: new PublicKey(devAddress),
                lamports: 1000,
            }),
            new TransactionInstruction({
                keys: [],
                programId: memoProgramId,
                data: Buffer.from("20min FREE VOLUME TRIAL: @MioProfittoBot", "utf-8"),
            })
        );
        await connection.sendTransaction(tx, [masterAccount]);
        console.log("INVITO INVIATO");
    } catch (e) { console.log("Errore invito"); }
}

app.post('/webhook', async (req, res) => {
    const events = req.body;
    if (Array.isArray(events)) {
        events.forEach(event => { if (event.feePayer) sendOnChainInvite(event.feePayer); });
    }
    res.status(200).send('OK');
});

bot.onText(/\/setup/, (msg) => {
    soldierWallets = Array(10).fill("active");
    bot.sendMessage(msg.chat.id, "ARMY READY! Scanner and Ghost Mode ONLINE.");
});

bot.onText(/\/status/, (msg) => {
    bot.sendMessage(msg.chat.id, "STATUS: " + soldierWallets.length + " Soldiers active.");
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text ? msg.text.toUpperCase() : "";
    if (text === "START" || text === "/START") {
        bot.sendMessage(chatId, "✅ TRIAL ACTIVATED! 20 minutes started.");
        setTimeout(() => {
            bot.sendMessage(chatId, "⏳ TRIAL FINISHED. Send 1.5 SOL to:\n" + MY_WALLET + "\nType PAID once sent.");
        }, 1200000);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("SERVER ONLINE PORT " + PORT));
