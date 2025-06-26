require("dotenv").config();
const express = require("express");
const { create } = require("venom-bot");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // ou restrinja para sua Vercel se quiser
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

let client;

create({
  session: "bot-session",
  multidevice: true,
  headless: true,
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

    client.onMessage((message) => {
      if (message.body.toLowerCase() === "oi" && !message.isGroupMsg) {
        client.sendText(message.from, "Olá! Eu sou um bot automatizado.");
      }
    });

    // Evento de QR Code
    client.onStreamChange((state) => {
      console.log("📡 Estado do stream:", state);
    });

    client.onStateChange((state) => {
      console.log("🧭 Estado do cliente:", state);
    });

    client.on("qr", (qrCode) => {
      console.log("📲 QR Code gerado:", qrCode);
      io.emit("qr", { qr: qrCode });
    });

  })
  .catch((err) => {
    console.error("❌ Erro ao iniciar o Venom:", err);
  });

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

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
