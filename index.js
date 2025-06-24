const puppeteer = require('puppeteer');

(async () => {
  try {
    const browserFetcher = puppeteer.createBrowserFetcher();
    const revisionInfo = await browserFetcher.download('1221211');
    console.log('Chromium baixado com sucesso:', revisionInfo.executablePath);
    
    // Define a variável para o caminho do Chromium baixado
    process.env.CHROME_BIN = revisionInfo.executablePath;

    const venom = require('venom-bot');

    venom
      .create({
        browserArgs: ['--no-sandbox'],
        executablePath: process.env.CHROME_BIN
      })
      .then((client) => {
        console.log('✅ Bot iniciado com sucesso');

        client.onMessage((message) => {
          if (message.body === 'Oi' && message.isGroupMsg === false) {
            client.sendText(message.from, 'Oi! Tudo bem?');
          }
        });
      })
      .catch((err) => {
        console.error('Erro ao iniciar o Venom:', err);
      });

  } catch (error) {
    console.error('Erro ao baixar o Chromium:', error);
  }
})();
