# Usa a imagem base do Node.js
FROM node:20

# Instala as dependências necessárias do sistema
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
  libdrm2 \
  libgbm1 \
  --no-install-recommends && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

# Define diretório de trabalho
WORKDIR /app

# Copia os arquivos do projeto
COPY . .

# Instala dependências Node
RUN npm install

# Expõe a porta usada pela aplicação
EXPOSE 3000

# Inicia a aplicação
CMD ["npm", "start"]
