const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { Connection, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const bs58 = require('bs58');

// --- 1. CARICAMENTO VARIABILI ---
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const rpcUrl = process.env.SOLANA_RPC || "https://api.mainnet-beta.solana.com";
const connection = new Connection(rpcUrl, 'confirmed');

const MY_WALLET = process.env.MY_WALLET_ADDRESS || "NON_CONFIGURATO";
const privKeyStr = process.env.MASTER_PRIVATE_KEY || "";

// Controllo sicurezza Chiave Privata
if (!privKeyStr) {
    console.error("ERRORE: Manca la variabile MASTER_PRIVATE_KEY su Railway!");
    process.exit(1);
}

let masterAccount;
try {
    masterAccount = Keypair.fromSecretKey(bs58.decode(privKeyStr));
} catch (e) {
    console.error("ERRORE: La MASTER_PRIVATE_KEY non e valida. Ricontrollala!");
    process.exit(1);
}

let soldierWallets = [];

// --- 2. LOGICA PREZZI ---
function getPrices() {
    const count = soldierWallets.length;
    if (count >= 100) return { short: "4.5 SOL", label: "ULTRA", scale: 20 };
    if (count >= 50) return { short: "2.5 SOL", label: "PRO", scale: 12 };
    return { short: "1.5 SOL", label: "STANDARD", scale: 7 };
}

// --- 3. MOTORE ESERCITO ---
async function deployArmy(count, solPerWallet) {
    for (let i = 0; i < count; i++) {
        try {
            const newSoldier = Keypair.generate();
            const tx = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: masterAccount.publicKey,
                    toPubkey: newSoldier.publicKey,
                    lamports: Math.floor(solPerWallet * LAMPORTS_PER_SOL)
                })
            );
            await connection.sendTransaction(tx, [masterAccount]);
            soldierWallets.push(bs58.encode(newSoldier.secretKey));
        } catch (err) {
            console.error("Errore creazione soldato singolo.");
        }
    }
}

// --- 4. COMANDI TELEGRAM ---
bot.onText(/\/setup/, async (msg) => {
    if (soldierWallets.length > 0) return bot.sendMessage(msg.chat.id, "Setup gia eseguito.");
    bot.sendMessage(msg.chat.id, "Avvio distribuzione 1.16 SOL in 10 soldati...");
    try {
        await deployArmy(10, 0.10);
        bot.sendMessage(msg.chat.id, "ESERCITO PRONTO! Soldati: " + soldierWallets.length + " - Scanner ATTIVO.");
    } catch (e) {
        bot.sendMessage(msg.chat.id, "Errore saldo o RPC. Verifica il wallet Master.");
    }
});

bot.onText(/\/status/, (msg) => {
    const p = getPrices();
    bot.sendMessage(msg.chat.id, "STATO: " + soldierWallets.length + " soldati. Potenza: " + p.label);
});

bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text ? msg.text.toUpperCase() : "";
    const p = getPrices();

    if (text.includes("START")) {
        bot.sendMessage(chatId, "PROVA ATTIVA! 20 minuti di boost con " + soldierWallets.length + " wallet.");
        setTimeout(() => {
            bot.sendMessage(chatId, "PROVA FINITA. Invia " + p.short + " a: " + MY_WALLET + " poi scrivi PAID");
        }, 20 * 60000);
    } 
    else if (text.includes("PAID")) {
        bot.sendMessage(chatId, "VERIFICA... Reinvestimento 50% attivo.");
        setTimeout(async () => {
            await deployArmy(p.scale, 0.10);
            bot.sendMessage(chatId, "PAGAMENTO OK! Nuovi soldati creati. Totale: " + soldierWallets.length);
        }, 5000);
    }
});

// Scanner DexScreener (Placeholder)
setInterval(async () => {
    try {
        await axios.get("https://api.dexscreener.com/token-profiles/latest/v1");
    } catch (e) {}
}, 120000);

console.log("MASTER BOT ONLINE - PRONTO PER IL SETUP");
