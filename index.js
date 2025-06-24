import venom from 'venom-bot';
import express from 'express';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

let client;

venom
  .create({
    session: "bot-session",
    multidevice: true,
    browserArgs: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
      '--disable-gpu',
      '--headless=new'
    ],
    // Não especifique executablePath aqui no Render, deixe o padrão
  })
  .then((venomClient) => {
    client = venomClient;
    console.log("✅ Bot iniciado com sucesso");

    client.onMessage((message) => {
      if (message.body.toLowerCase() === "oi" && message.isGroupMsg === false) {
        client.sendText(message.from, "Olá! Eu sou um bot automatizado.");
      }
    });
  })
  .catch((err) => {
    console.error("Erro ao iniciar o Venom:", err);
  });

app.get("/", (req, res) => {
  res.send("Bot Venom está rodando!");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
