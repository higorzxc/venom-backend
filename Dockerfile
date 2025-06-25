FROM node:18

# Instala dependências necessárias para o Chrome
RUN apt-get update && apt-get install -y wget gnupg curl ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 libxdamage1 libxrandr2 xdg-utils --no-install-recommends

# Baixa e instala o Chrome
RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb &&     dpkg -i google-chrome-stable_current_amd64.deb; apt-get -fy install

WORKDIR /app
COPY . .

RUN npm install

EXPOSE 3000

CMD ["npm", "start"]