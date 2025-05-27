# Etapa 1: build dos arquivos
FROM node:20-alpine as builder

WORKDIR /app

# Copia apenas arquivos necessários
COPY package*.json ./
RUN npm install

COPY . .

# Gera arquivos estáticos otimizados em /app/dist
RUN npm run build

# Etapa 2: imagem leve para servir os arquivos
FROM node:20-alpine

# Instala http-server globalmente
RUN npm install -g http-server

WORKDIR /app

# Copia apenas o resultado da build
COPY --from=builder /app/dist .

# Exponha a porta
EXPOSE 3000

# Roda o servidor estático
CMD ["http-server", ".", "-p", "3000"]
