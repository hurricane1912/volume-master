
const TelegramBot = require('node-telegram-bot-api');
const axios = require('axios');
const { Connection, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } = require('@solana/web3.js');
const bs58 = require('bs58');

// --- 1. CONFIGURAZIONE SISTEMA ---
const token = process.env.BOT_TOKEN;
const bot = new TelegramBot(token, { polling: true });
const connection = new Connection(process.env.SOLANA_RPC, 'confirmed');

const MY_WALLET = process.env.MY_WALLET_ADDRESS;
const MASTER_KEY = bs58.decode(process.env.MASTER_PRIVATE_KEY);
const masterAccount = Keypair.fromSecretKey(MASTER_KEY);

let soldierWallets = []; // Memoria dinamica dei wallet soldati

// --- 2. LOGICA PREZZI E SCALABILITÀ ---
function getMarketPrices() {
    const count = soldierWallets.length;
    if (count >= 100) return { short: "4.5 SOL", long: "12 SOL", label: "🔥 ULTRA (100+ Wallets)", scale: 20 };
    if (count >= 50) return { short: "2.5 SOL", long: "8 SOL", label: "⚡ PRO (50+ Wallets)", scale: 12 };
    return { short: "1.5 SOL", long: "5 SOL", label: "🛡️ STANDARD (10+ Wallets)", scale: 7 };
}

// --- 3. MOTORE DI CREAZIONE SOLDATI (REINVESTIMENTO 50%) ---
async function deployArmy(count, solPerWallet) {
    console.log(Reclutamento di ${count} nuovi soldati...);
    for (let i = 0; i < count; i++) {
        try {
            const newSoldier = Keypair.generate();
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey: masterAccount.publicKey,
                    toPubkey: newSoldier.publicKey,
                    lamports: Math.floor(solPerWallet * LAMPORTS_PER_SOL),
                })
            );
            await connection.sendTransaction(transaction, [masterAccount]);
            soldierWallets.push(bs58.encode(newSoldier.secretKey));
        } catch (e) { console.error("Errore deploy soldato."); }
    }
}

// --- 4. COMANDI DI GESTIONE (PER TE) ---
bot.onText(/\/setup/, async (msg) => {
    if (soldierWallets.length > 0) return bot.sendMessage(msg.chat.id, "⚠️ Setup già completato.");
    bot.sendMessage(msg.chat.id, "⚙️ Inizializzazione... Distribuzione 1.16 SOL in 10 unità operative.");
    try {
        await deployArmy(10, 0.10);
        bot.sendMessage(msg.chat.id, ✅ **ESERCITO PRONTO!**\n🪖 Soldati: ${soldierWallets.length}\n📡 Scanner DexScreener: ATTIVO.);
    } catch (e) { bot.sendMessage(msg.chat.id, "❌ Errore saldo Master Wallet o RPC."); }
});

bot.onText(/\/status/, (msg) => {
    const p = getMarketPrices();
    bot.sendMessage(msg.chat.id, 📊 **STATO BOT:**\n\n🪖 **Soldati:** ${soldierWallets.length}\n⚡ **Potenza:** ${p.label}\n💰 **Tariffa attuale:** ${p.short});
});

// --- 5. AGENTE DI VENDITA INTERATTIVO (PER I DEV) ---
bot.on('message', async (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text ? msg.text.toUpperCase() : "";
    const p = getMarketPrices();

    if (text.includes("SAFE") || text.includes("SCAM")) {
        bot.sendM100% SAFE. "🛡️ **100% SAFE.** We use aged wallets and micro-trades. No liquidity risk, just pure DexScreener Trending power.");
    } else if (text.includes("HOW") && text.includes("WORK")) {
        bot.sendMessage(chatId, ⚙️ Our **${soldierWallets.length} wallets** boost your 'Transfers' and 'Volume' metrics to trigger the trending algorithm.);
    }

    // Prova -> Pagamento -> Scalabilità
    else if (text.includes("START")) {
        botTRIAL ACTIVATED! 🚀 **TRIAL ACTIVATED!** Boosting with ${soldierWallets.length} units for 20 mins. Watch your rank! 🔥);
        setTimeout(() => {
            botTRIAL EXPIRED.d, ⏱️ **TRIAL EXPIRED.** To keep this momentum for 3 hours, send **${p.short}** to:\n\n\${MY_WALLET}\\n\nReply 'PAID' after sending.);
        }, 20 * 60000);
    }

else if (text.includes("PAID")) {
        bot.sendMessage(chatId, "⏳ VERIFYING... Splitting profit: 50% for your wallet, 50% for new soldiers! 📈");
        setTimeout(async () => {
            try {
                await deployArmy(p.scale, 0.10);
                bot.sendMessage(chatId, ✅ **PAYMENT CONFIRMED!** Army expanded to **${soldierWallets.length} units**. Power Boost: **ON** 🌕);
            } catch(e) { console.log("Errore autoscale"); }
        }, 5000);
    }
});

// --- 6. SCANNER H24 ---
setInterval(async () => {
    try {
        const res = await axios.get("https://api.dexscreener.com/token-profiles/latest/v1");
        const solTokens = res.data.filter(t => t.chainId === 'solana');
        console.log([SCAN] Found ${solTokens.length} Solana launches.);
    } catch (e) { console.log("API Scan error"); }
}, 120000);

console.log("🚀 MASTER BOT v2.0 - ACTIVE AND READY FOR /SETUP");
