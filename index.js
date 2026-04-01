hurricane1912:
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const express = require('express');
const { Connection, Keypair, Transaction, SystemProgram, TransactionInstruction, PublicKey, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const bs58 = require('bs58');

const app = express();
app.use(express.json());

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const rpcUrl = process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com";
const connection = new Connection(rpcUrl, 'confirmed');

const MY_WALLET = process.env.MY_WALLET_ADDRESS || "";
const privKeyStr = process.env.MASTER_PRIVATE_KEY || "";
let masterAccount;

if (privKeyStr) {
    masterAccount = Keypair.fromSecretKey(bs58.decode(privKeyStr));
}

let soldierWallets = [];

function getPrices() {
    const count = soldierWallets.length;
    if (count >= 100) return { amount: 4.5, label: "ULTRA BEYOND", scale: 20 };
    if (count >= 50) return { amount: 2.5, label: "PRO BOOST", scale: 12 };
    return { amount: 1.5, label: "STANDARD POWER", scale: 7 };
}

async function sendOnChainInvite(devAddress) {
    try {
        const memoProgramId = new PublicKey("MemoSNDZ77edY6f9o6cY4k74ZicV8yvUTo1PjJ2p");
        const memoText = "20min FREE VOLUME TRIAL: @MioProfittoBot";
        const tx = new Transaction().add(
            SystemProgram.transfer({
                fromPubkey: masterAccount.publicKey,
                toPubkey: new PublicKey(devAddress),
                lamports: 1000,
            }),
            new TransactionInstruction({
                keys: [],
                programId: memoProgramId,
                data: Buffer.from(memoText, "utf-8"),
            })
        );
        await connection.sendTransaction(tx, [masterAccount]);
        console.log("INVITO GHOST INVIATO A: " + devAddress);
    } catch (e) {
        console.log("Errore invio invito.");
    }
}

app.post('/webhook', async (req, res) => {
    const events = req.body;
    if (Array.isArray(events)) {
        events.forEach(event => {
            if (event.feePayer) sendOnChainInvite(event.feePayer);
        });
    }
    res.status(200).send('OK');
});

async function watchPayments(chatId) {
    const p = getPrices();
    const interval = setInterval(async () => {
        try {
            const signatures = await connection.getSignaturesForAddress(new PublicKey(MY_WALLET), { limit: 1 });
            if (signatures.length > 0) {
                bot.sendMessage(chatId, "✅ PAYMENT DETECTED! Deploying more soldiers...");
                for(let i=0; i<p.scale; i++) { soldierWallets.push("active_soldier"); }
                bot.sendMessage(chatId, "🚀 BOOST UPGRADED! Total Soldiers: " + soldierWallets.length);
                clearInterval(interval);
            }
        } catch (e) { console.log("Checking payment..."); }
    }, 40000);
}

bot.onText(/\/setup/, async (msg) => {
    bot.sendMessage(msg.chat.id, "INITIALIZING ARMY (10 Soldiers)...");
    soldierWallets = Array(10).fill("active");
    bot.sendMessage(msg.chat.id, "ARMY READY! Scanner and Ghost Mode ONLINE.");
});

bot.onText(/\/status/, (msg) => {
    const p = getPrices();
    bot.sendMessage(msg.chat.id, "STATUS: " + soldierWallets.length + " Soldiers. Power: " + p.label);
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text ? msg.text.toUpperCase() : "";
    const p = getPrices();
    if (text === "START" || text === "/START") {
        bot.sendMessage(chatId, "✅ TRIAL ACTIVATED! 20 minutes of volume boost started.");
        setTimeout(() => {
            bot.sendMessage(chatId, "⏳ TRIAL FINISHED. To keep trending, send " + p.amount + " SOL to:\n\n" + MY_WALLET + "\n\nI am monitoring the blockchain... type PAID once sent.");
            watchPayments(chatId);
        }, 20 * 60000);
    } else if (text === "PAID") {
        bot.sendMessage(chatId, "🔎 Monitoring the blockchain for your transaction... please wait.");
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log("SERVER RUNNING ON PORT " + PORT);
});
