FROM node:20-alpine3.19

# Instala dependencias necesarias
RUN apk update && apk add --no-cache nano

# Crea carpeta de trabajo
WORKDIR /app

# Copia package.json y lock primero para aprovechar el cache
COPY package.json yarn.lock* package-lock.json* ./

# Instala dependencias
RUN yarn install --frozen-lockfile || npm install

# Copia el resto del código
COPY . .

# Expone el puerto 8080
EXPOSE 8080

# Comando para iniciar la app
CMD ["yarn", "serve"]

