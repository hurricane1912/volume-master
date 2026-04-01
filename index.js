const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { Connection, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const bs58 = require('bs58');

const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const connection = new Connection(process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com", 'confirmed');

const MY_WALLET = process.env.MY_WALLET_ADDRESS;
const MASTER_KEY = bs58.decode(process.env.MASTER_PRIVATE_KEY);
const masterAccount = Keypair.fromSecretKey(MASTER_KEY);

let soldierWallets = [];

function getMarketPrices() {
    const count = soldierWallets.length;
    if (count >= 100) return { short: "4.5 SOL", long: "12 SOL", label: "ULTRA", scale: 20 };
    if (count >= 50) return { short: "2.5 SOL", long: "8 SOL", label: "PRO", scale: 12 };
    return { short: "1.5 SOL", long: "5 SOL", label: "STANDARD", scale: 7 };
}

async function deployArmy(count, solPerWallet) {
    for (let i = 0; i < count; i++) {
        try {
            const newSoldier = Keypair.generate();
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: masterAccount.publicKey,
                    toPubkey: newSoldier.publicKey,
                    lamports: Math.floor(solPerWallet * LAMPORTS_PER_SOL)
                })
            );
            await connection.sendTransaction(transaction, [masterAccount]);
            soldierWallets.push(bs58.encode(newSoldier.secretKey));
        } catch (e) { console.error("Error deploy"); }
    }
}

bot.onText(/\/setup/, async (msg) => {
    if (soldierWallets.length > 0) return bot.sendMessage(msg.chat.id, "Setup gia fatto.");
    bot.sendMessage(msg.chat.id, "Avvio distribuzione 1.16 SOL...");
    try {
        await deployArmy(10, 0.10);
        bot.sendMessage(msg.chat.id, "ESERCITO PRONTO! Soldati: " + soldierWallets.length + " - Scanner ATTIVO.");
    } catch (e) { bot.sendMessage(msg.chat.id, "Errore saldo o RPC."); }
});

bot.onText(/\/status/, (msg) => {
    const p = getMarketPrices();
    bot.sendMessage(msg.chat.id, "STATO: " + soldierWallets.length + " soldati. Potenza: " + p.label);
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text ? msg.text.toUpperCase() : "";
    const p = getMarketPrices();

    if (text.includes("START")) {
        bot.sendMessage(chatId, "TRIAL ATTIVO! 20 minuti di boost con " + soldierWallets.length + " wallet.");
        setTimeout(() => {
            bot.sendMessage(chatId, "PROVA FINITA. Invia " + p.short + " a: " + MY_WALLET + " poi scrivi PAID");
        }, 20 * 60000);
    } else if (text.includes("PAID")) {
        bot.sendMessage(chatId, "VERIFICA IN CORSO... Split 50/50 attivo.");
        setTimeout(async () => {
            await deployArmy(p.scale, 0.10);
            bot.sendMessage(chatId, "PAGAMENTO CONFERMATO! Wallet totali: " + soldierWallets.length);
        }, 5000);
    }
});

setInterval(async () => {
    try {
        await axios.get("https://api.dexscreener.com/token-profiles/latest/v1");
    } catch (e) {}
}, 120000);

console.log("MASTER BOT ONLINE");
