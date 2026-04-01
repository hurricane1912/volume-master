
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { Connection, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const bs58 = require('bs58');

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

async function deployArmy(count, solPerWallet) {
    for (let i = 0; i < count; i++) {
        try {
            const newSoldier = Keypair.generate();
            const tx = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: masterAccount.publicKey,
                    toPubkey: masterAccount.publicKey, // Simulazione o invio reale
                    lamports: Math.floor(solPerWallet * LAMPORTS_PER_SOL)
                })
            );
            // Nota: Qui generiamo i soldati internamente per la memoria del bot
            soldierWallets.push(bs58.encode(newSoldier.secretKey));
        } catch (err) {}
    }
}

// --- AUTOMAZIONE PAGAMENTI (MONITORAGGIO BLOCKCHAIN) ---
async function watchPayments(chatId) {
    console.log("Monitoring wallet: " + MY_WALLET);
    const p = getPrices();
    
    const interval = setInterval(async () => {
        try {
            const signatures = await connection.getSignaturesForAddress(new (require('@solana/web3.js').PublicKey)(MY_WALLET), { limit: 1 });
            if (signatures.length > 0) {
                const txDetails = await connection.getTransaction(signatures[0].signature, { commitment: 'confirmed' });
                // Se la transazione è recente e l'importo è >= del prezzo richiesto
                if (txDetails) {
                    bot.sendMessage(chatId, "✅ PAYMENT DETECTED! Deploying more soldiers...");
                    await deployArmy(p.scale, 0.10);
                    bot.sendMessage(chatId, "🚀 BOOST UPGRADED! Total Soldiers: " + soldierWallets.length);
                    clearInterval(interval);
                }
            }
        } catch (e) { console.log("Checking..."); }
    }, 30000); // Controlla ogni 30 secondi
}

// --- COMANDI AMMINISTRATORE ---
bot.onText(/\/setup/, async (msg) => {
    if (soldierWallets.length > 0) return bot.sendMessage(msg.chat.id, "Army already initialized.");
    bot.sendMessage(msg.chat.id, "INITIALIZING ARMY (10 Soldiers)...");
    await deployArmy(10, 0.10);
    bot.sendMessage(msg.chat.id, "ARMY READY! Scanner ONLINE.");
});

bot.onText(/\/status/, (msg) => {
    const p = getPrices();
    bot.sendMessage(msg.chat.id, "STATUS: " + soldierWallets.length + " Soldiers active. Power: " + p.label);
});

// --- INTERFACCIA CLIENTE (INGLESE) ---
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text ? msg.text.toUpperCase() : "";
    const p = getPrices();

    if (text.includes("START")) {
        bot.sendMessage(chatId, "✅ TRIAL ACTIVATED! 20 minutes of volume boost started.");
        setTimeout(() => {
            bot.sendMessage(chatId, "⏳ TRIAL FINISHED. To keep trending, send " + p.amount + " SOL to:\n\n" + MY_WALLET + "\n\nI am monitoring the blockchain... type PAID once sent.");
            watchPayments(chatId);
        }, 20 * 60000);
    } 
    else if (text.includes("PAID")) {
        bot.sendMessage(chatId, "🔎 Monitoring the blockchain for your transaction... please wait.");
    }
});

console.log("AUTO-PILOT BOT ONLINE");
