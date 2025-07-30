FROM node:20-alpine3.19

# Instala utilitarios básicos (opcional)
RUN apk update && apk add --no-cache nano

# Establece el directorio de trabajo
WORKDIR /app

# Copia solo archivos necesarios para instalar dependencias
COPY package.json yarn.lock* ./

# Instala dependencias con Yarn
RUN yarn install --frozen-lockfile

# NO copies el código fuente aquí - el volumen lo monta
# COPY . .

# Expone el puerto usado por vue-cli-service
EXPOSE 8080

# Comando por defecto al iniciar el contenedor
CMD ["yarn", "serve"]
