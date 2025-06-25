require("dotenv").config();
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const { create } = require("venom-bot");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.json());

let client;

io.on("connection", (socket) => {
  console.log("🟢 Painel conectado via WebSocket:", socket.id);
});

create({
  session: "bot-session",
  multidevice: true,
  headless: "new",
  executablePath: "/usr/bin/google-chrome",
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

    // Quando o QR Code for gerado
    client.on("qr", (qr) => {
      console.log("📲 QR Code gerado, enviando para painel...");
      io.emit("qr", { qr });
    });

    // Status da sessão
    client.onStateChange((state) => {
      console.log("📡 Estado da sessão:", state);
      io.emit("status", { state });
    });
  })
  .catch((err) => {
    console.error("❌ Erro ao iniciar o Venom:", err);
  });

app.get("/", (req, res) => {
  res.send("🤖 Bot Venom está rodando com sucesso!");
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
