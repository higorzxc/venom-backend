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
  headless: 'new', // modo atualizado
  executablePath: '/usr/bin/google-chrome', // usar o Chrome que instalamos no Render
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

    // Resposta de exemplo
    client.onMessage((message) => {
      if (message.body.toLowerCase() === "oi" && !message.isGroupMsg) {
        client.sendText(message.from, "Olá! Eu sou um bot automatizado.");
      }
    });
  })
  .catch((err) => {
    console.error("❌ Erro ao iniciar o Venom:", err);
  });

// Verifica status
app.get("/status", async (req, res) => {
  if (!client) return res.json({ status: "offline" });

  try {
    const state = await client.getState();
    const isOnline = ["CONNECTED", "OPENING"].includes(state);
    res.json({ status: isOnline ? "online" : state.toLowerCase() });
  } catch (err) {
    res.json({ status: "offline", error: err.message });
  }
});

// Envia mensagem
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
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get("/", (req, res) => {
  res.send("🤖 Bot Venom está rodando com sucesso!");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
