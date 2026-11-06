FROM node:22-alpine

WORKDIR /app

# Копируем файлы зависимостей
COPY package.json ./

# Устанавливаем зависимости
RUN npm install --legacy-peer-deps

# Копируем весь проект
COPY . .

# Открываем порт
EXPOSE 3000

# Запускаем сервер
CMD ["npm", "run", "dev"]