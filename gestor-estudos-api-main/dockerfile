# syntax=docker/dockerfile:1   # garante sintaxe moderna do Dockerfile

#########################
# Etapa 1 – dependências
#########################
FROM node:20-alpine AS deps
WORKDIR /app

# Toolchain mínimo para compilar addons nativos (bcrypt, node-gyp, etc.)
RUN apk add --no-cache python3 make g++

# Copia apenas os manifests para aproveitar cache
COPY package*.json ./

# Instala somente dependências de produção
# (compila o bcrypt para musl/libc do Alpine)
RUN npm ci --omit=dev

#########################
# Etapa 2 – aplicação
#########################
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Copia o node_modules já pronto
COPY --from=deps /app/node_modules ./node_modules

# Copia o restante do código-fonte
COPY . .

# Ajuste a porta conforme sua aplicação
EXPOSE 3000

# Entry-point — altere se o seu arquivo inicial for diferente
CMD ["node", "src/server.js"]
