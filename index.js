require("dotenv").config();
const express = require("express");
const { create } = require("venom-bot");
const puppeteer = require("puppeteer"); // importante: precisa estar nas dependências

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let client;

(async () => {
  // Instala o Chrome no primeiro carregamento
  const browserFetcher = puppeteer.createBrowserFetcher();
  const revisionInfo = await browserFetcher.download('1276747'); // versão compatível com venom

  create({
    session: "bot-session",
    multidevice: true,
    headless: 'new', // recomendado pela própria lib
    executablePath: revisionInfo.executablePath, // caminho do chrome baixado
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
})();

app.get("/", (req, res) => {
  res.send("🤖 Bot Venom está rodando com sucesso!");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
