const puppeteer = require('puppeteer');
const venom = require('venom-bot');

(async () => {
  try {
    // Obtém o caminho do Chromium instalado pelo Puppeteer
    const chromiumPath = puppeteer.executablePath();
    process.env.CHROME_BIN = chromiumPath;

    console.log('✅ Chromium localizado em:', chromiumPath);

    // Inicializa o bot com o Chromium baixado
    const client = await venom.create({
      browserArgs: ['--no-sandbox', '--disable-setuid-sandbox'],
      executablePath: chromiumPath,
    });

    console.log('🤖 Bot iniciado com sucesso');

    // Responde automaticamente a mensagens
    client.onMessage(async (message) => {
      if (message.body === 'Oi' && !message.isGroupMsg) {
        await client.sendText(message.from, 'Oi! Tudo bem?');
      }
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar o bot:', error);
  }
})();
