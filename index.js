require("dotenv").config();
const express = require("express");
const { create } = require("venom-bot");
const http = require("http");
const { Server } = require("socket.io");
const bodyParser = require('body-parser'); // Importando o body-parser

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // permite acesso de qualquer domínio (Vercel incluso)
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

let client;
let lastQrCode = null; // Armazena o último QR code gerado

// Middleware para ler o corpo da requisição
app.use(bodyParser.json()); // Usando body-parser para ler o corpo das requisições JSON

// Rota de login para validação da senha
app.post("/login", (req, res) => {
  const { password } = req.body; // Recebe a senha do corpo da requisição
  const correctPassword = "admin123"; // A senha correta

  if (password !== correctPassword) {
    return res.status(401).send({ message: "Senha incorreta!" }); // Se a senha estiver incorreta, retorna erro
  }

  // Senha correta, continua o processo
  res.status(200).send({ message: "Login bem-sucedido!" });
});

// Inicializa o Venom
create({
  session: "bot-session",
  multidevice: true,
  headless: false, // Alterado para false para abrir o navegador de forma visível
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

    // Responde "oi"
    client.onMessage((message) => {
      if (message.body.toLowerCase() === "oi" && !message.isGroupMsg) {
        client.sendText(message.from, "Olá! Eu sou um bot automatizado.");
      }
    });

    // Recebe o QR code e envia para o painel
    client.on("qr", (qrCode) => {
      console.log("📲 QR Code gerado:", qrCode);
      lastQrCode = qrCode;
      io.emit("qr", { qr: qrCode });
    });

    // Monitoramento de estado
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

// Verifica se o bot está online
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

// Retorna o último QR code gerado
app.get("/qr", (req, res) => {
  if (!lastQrCode) {
    return res.status(404).json({ error: "QR Code ainda não disponível" });
  }
  res.json({ qrCode: lastQrCode });
});

// Página raiz
app.get("/", (req, res) => {
  res.send("🤖 Bot Venom está rodando com sucesso!");
});

// Inicia o servidor
server.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
