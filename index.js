const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const { Connection, Keypair, Transaction, SystemProgram, TransactionInstruction, PublicKey } = require('@solana/web3.js');
const bs58 = require('bs58');

const app = express();
app.use(express.json());

const bot = new TelegramBot(process.env.BOT_TOKEN, { polling: true });
const connection = new Connection(process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com", 'confirmed');
const masterAccount = Keypair.fromSecretKey(bs58.decode(process.env.MASTER_PRIVATE_KEY));

let soldierWallets = [];

// Webhook per Helius
app.post('/webhook', async (req, res) => {
    const events = req.body;
    if (Array.isArray(events)) {
        events.forEach(async (event) => {
            if (event.feePayer) {
                try {
                    const tx = new Transaction().add(
                        SystemProgram.transfer({ fromPubkey: masterAccount.publicKey, toPubkey: new PublicKey(event.feePayer), lamports: 1000 }),
                        new TransactionInstruction({
                            keys: [],
                            programId: new PublicKey("MemoSNDZ77edY6f9o6cY4k74ZicV8yvUTo1PjJ2p"),
                            data: Buffer.from("20min FREE TRIAL: @MioProfittoBot", "utf-8")
                        })
                    );
                    await connection.sendTransaction(tx, [masterAccount]);
                    console.log("Ghost Invite Sent to: " + event.feePayer);
                } catch (e) { console.log("Invite failed"); }
            }
        });
    }
    res.status(200).send('OK');
});

bot.onText(/\/setup/, (msg) => {
    soldierWallets = Array(10).fill("active");
    bot.sendMessage(msg.chat.id, "✅ ARMY READY! Scanner Online.");
});

bot.onText(/\/status/, (msg) => {
    bot.sendMessage(msg.chat.id, "STATUS: " + soldierWallets.length + " Soldiers active.");
});

bot.on('message', (msg) => {
    if (msg.text && msg.text.toUpperCase() === "START") {
        bot.sendMessage(msg.chat.id, "✅ TRIAL ACTIVATED! 20 minutes started.");
    }
});

app.listen(process.env.PORT || 3000, () => console.log("SERVER ONLINE"));
