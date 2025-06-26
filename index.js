require("dotenv").config();
const express = require("express");
const { create } = require("venom-bot");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

let client;
let latestQrCode = null; // ✅ variável para armazenar o último QR gerado

create({
  session: "bot-session",
  multidevice: true,
  headless: "new",
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
      console.log("📲 QR Code gerado");
      latestQrCode = `data:image/png;base64,${qrCode}`; // ✅ armazena o QR como base64
      io.emit("qr", { qr: latestQrCode }); // também emite para quem usa websocket
    });

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

// ✅ NOVO ENDPOINT: retorna o QR Code atual
app.get("/qr", (req, res) => {
  if (latestQrCode) {
    res.json({ qrCode: latestQrCode });
  } else {
    res.status(404).json({ error: "QR Code ainda não disponível" });
  }
});

// Endpoint de status
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

// Rota raiz
app.get("/", (req, res) => {
  res.send("🤖 Bot Venom está rodando com sucesso!");
});

// Inicia servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
