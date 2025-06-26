import dotenv from 'dotenv';
import express from 'express';
import { create } from 'venom-bot';
import http from 'http';
import { Server } from 'socket.io';
import bodyParser from 'body-parser';

dotenv.config(); // Carrega as variáveis de ambiente

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
let lastQrCode = null;

app.use(bodyParser.json());

app.post("/login", (req, res) => {
  const { password } = req.body;
  const correctPassword = "admin123"; 

  if (password !== correctPassword) {
    return res.status(401).send({ message: "Senha incorreta!" });
  }

  res.status(200).send({ message: "Login bem-sucedido!" });
});

create({
  session: "bot-session",
  multidevice: true,
  headless: false,
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

    client.on("qr", (qrCode) => {
      console.log("📲 QR Code gerado:", qrCode);
      lastQrCode = qrCode;
      io.emit("qr", { qr: qrCode });
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

app.get("/qr", (req, res) => {
  if (!lastQrCode) {
    return res.status(404).json({ error: "QR Code ainda não disponível" });
  }
  res.json({ qrCode: lastQrCode });
});

app.get("/", (req, res) => {
  res.send("🤖 Bot Venom está rodando com sucesso!");
});

server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
