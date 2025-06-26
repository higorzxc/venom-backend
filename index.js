require("dotenv").config();
const express = require("express");
const { create } = require("venom-bot");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",  // Permite todas as origens (necessário para Vercel)
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

let client;
let lastQrCode = null; // Variável para armazenar o último QR Code gerado

create({
  session: "bot-session",
  multidevice: true,
  headless: "new", // recomendado pela Venom
  browserArgs: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--no-first-run",
    "--no-zygote",
    "--single-process",
    "--disable-gpu"
  ]
})
  .then((venomClient) => {
    client = venomClient;
    console.log("✅ Bot iniciado com sucesso");

    // Evento de nova mensagem
    client.onMessage((message) => {
      if (message.body.toLowerCase() === "oi" && !message.isGroupMsg) {
        client.sendText(message.from, "Olá! Eu sou um bot automatizado.");
      }
    });

    // Evento de QR Code
    client.on("qr", (qrCode) => {
      console.log("📲 QR Code gerado:", qrCode);
      lastQrCode = qrCode; // Guarda o QR Code para a rota /qr
      io.emit("qr", { qr: qrCode }); // Emite para o painel em tempo real
    });

    // Eventos de estado (opcionais)
    client.onStreamChange((state) => {
      console.log("📡 Estado do stream:", state);
    });

    client.onStateChange((state) => {
      console.log("🧭 Estado do cliente:", state);
    });
  })
  .catch((err) => {
    console.error("❌ Erro ao iniciar o Venom:", err);
  });

// Endpoint de status para o painel saber se o bot está online
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

// Rota para retornar o último QR Code gerado
app.get("/qr", (req, res) => {
  if (!lastQrCode) {
    return res.status(404).json({ error: "QR Code ainda não disponível" });
  }
  res.json({ qrCode: lastQrCode });
});

// Rota raiz apenas para teste simples
app.get("/", (req, res) => {
  res.send("🤖 Bot Venom está rodando com sucesso!");
});

// Inicia o servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
