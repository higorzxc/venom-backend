console.log('✅ Chromium fixo usado em produção:', chromiumPath);

// Inicializa o bot com o Chrome instalado no Render
const client = await venom.create({
  browserArgs: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
    '--headless=new'
  ],
  executablePath: chromiumPath,
});

console.log('🤖 Bot iniciado com sucesso');

// Responde automaticamente a mensagens
client.onMessage(async (message) => {
  if (message.body.toLowerCase() === 'oi' && !message.isGroupMsg) {
    await client.sendText(message.from, 'Oi! Tudo bem?');
  }
});
