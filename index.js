require("dotenv").config();
const express = require("express");
const { create } = require("venom-bot");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let client;

create({
  session: "bot-session",
  multidevice: true,
  headless: 'new',
  executablePath: "/usr/bin/google-chrome", // usa o Chrome instalado via install_chrome.sh
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

app.get("/", (req, res) => {
  res.send("🤖 Bot Venom está rodando com sucesso!");
});

app.get("/status", (req, res) => {
  if (!client) {
    return res.json({ status: "offline" });
  }

  client.getState().then((state) => {
    const isOnline = ["CONNECTED", "OPENING"].includes(state);
    res.json({ status: isOnline ? "online" : state.toLowerCase() });
  }).catch((err) => {
    res.json({ status: "offline", error: err.message });
  });
});

app.post("/send-message", async (req, res) => {
  const { number, message } = req.body;

  if (!number || !message) {
    return res.status(400).json({ error: "Número e mensagem são obrigatórios." });
  }

  if (!client) {
    return res.status(503).json({ error: "Cliente WhatsApp não está inicializado ainda." });
  }

  try {
    await client.sendText(`${number}@c.us`, message);
    res.json({ success: true, message: "Mensagem enviada com sucesso!" });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
