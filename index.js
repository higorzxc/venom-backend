const puppeteer = require('puppeteer');
(async () => {
try {
const browserFetcher = puppeteer.createBrowserFetcher();
const revisionInfo = await browserFetcher.download('1221211');
console.log('Chromium baixado com sucesso:', revisionInfo.executablePath);
} catch (error) {
console.error('Erro ao baixar o Chromium:', error);
}
})();

const venom = require('venom-bot');
const puppeteer = require('puppeteer');

// força o Venom a usar o Chromium instalado pelo Puppeteer
process.env.CHROME_BIN = puppeteer.executablePath();

venom
  .create({
    browserArgs: ['--no-sandbox'],
    executablePath: process.env.CHROME_BIN
  })
  .then((client) => {
    // seu código continua aqui
    client.onMessage((message) => {
      if (message.body === 'Oi' && message.isGroupMsg === false) {
        client.sendText(message.from, 'Oi! Tudo bem?');
      }
    });
  });
