# Usa imagem oficial Node.js
FROM node:20

# Instala dependências do sistema necessárias para o Chrome rodar em headless
RUN apt-get update && apt-get install -y \
  wget \
  gnupg \
  curl \
  ca-certificates \
  fonts-liberation \
  libappindicator3-1 \
  libasound2 \
  libatk-bridge2.0-0 \
  libatk1.0-0 \
  libcups2 \
  libdbus-1-3 \
  libgdk-pixbuf2.0-0 \
  libnspr4 \
  libnss3 \
  libx11-xcb1 \
  libxcomposite1 \
  libxdamage1 \
  libxrandr2 \
  xdg-utils \
  dbus-x11 \
  --no-install-recommends && \
  rm -rf /var/lib/apt/lists/*

# Instala Google Chrome
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
  dpkg -i google-chrome-stable_current_amd64.deb || apt-get -fy install && \
  rm google-chrome-stable_current_amd64.deb

# Cria diretório de trabalho
WORKDIR /app

# Copia o conteúdo do projeto para o container
COPY . .

# Instala dependências do projeto
RUN npm install

# Adicionalmente força o Puppeteer a usar Chrome global (opcional, pode evitar conflitos)
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

# Instala sharp se for necessário (você só precisa se realmente usa imagens no backend)
RUN npm install sharp --platform=linux --arch=x64 || true

# Expõe porta padrão
EXPOSE 3000

# Inicia a aplicação
CMD ["npm", "start"]
