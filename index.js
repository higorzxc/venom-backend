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
