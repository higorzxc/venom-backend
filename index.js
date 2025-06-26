require("dotenv").config();
const express = require("express");
const { create } = require("venom-bot");
const puppeteer = require("puppeteer");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let client;

// Inicia o Venom
(async () => {
  try {
    const browserFetcher = puppeteer.createBrowserFetcher();
    const revisionInfo = await browserFetcher.download('1276747');

    create({
      session: "bot-session",
      multidevice: true,
      headless: 'new',
      executablePath: revisionInfo.executablePath,
      browserArgs: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    })
      .then((venomClient) => {
        client = venomClient;
        console.log("✅ Bot iniciado com sucesso");

        client.onMessage((message) => {
          if (message.body.toLowerCase() === "oi" && !message.isGroupMsg) {
            client.sendText(message.from, "Olá! Eu sou um bot automatizado.");
          }
        });
      })
      .catch((err) => {
        console.error("❌ Erro ao iniciar o Venom:", err);
      });

  } catch (error) {
    console.error("❌ Erro ao configurar Puppeteer/Chromium:", error);
  }
})();

// Nova rota para verificar o status do bot
app.get("/status", async (req, res) => {
  if (!client) {
    return res.json({ status: "offline" });
  }

  try {
    const state = await client.getState();
    const isOnline = ["CONNECTED", "OPENING"].includes(state);
    res.json({ status: isOnline ? "online" : state.toLowerCase() });
  } catch (err) {
    res.json({ status: "offline", error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("🤖 Bot Venom está rodando com sucesso!");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
