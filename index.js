const puppeteer = require('puppeteer');
const venom = require('venom-bot');

(async () => {
  try {
    const chromiumPath = puppeteer.executablePath();
    process.env.CHROME_BIN = chromiumPath;

    console.log('✅ Chromium localizado em:', chromiumPath);

    const client = await venom.create({
      browserArgs: ['--no-sandbox'],
      executablePath: chromiumPath
    });

    console.log('🤖 Bot iniciado com sucesso');

    client.onMessage((message) => {
      if (message.body === 'Oi' && !message.isGroupMsg) {
        client.sendText(message.from, 'Oi! Tudo bem?');
      }
    });

  } catch (error) {
    console.error('❌ Erro ao iniciar o bot:', error);
  }
})();
