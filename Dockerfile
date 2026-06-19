FROM node:20-alpine

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias (sin solo=production para tener devDependencies si es necesario)
RUN npm install

# Copiar el resto del código del backend
COPY . .

# Hugging Face Spaces requiere exponer el puerto 7860 obligatoriamente
EXPOSE 7860

# Establecer variables de entorno
ENV PORT=7860
ENV NODE_ENV=production

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD node -e "require('http').get('http://localhost:7860', (r) => {if (r.statusCode !== 200) throw new Error(r.statusCode)})" || exit 1

# Comando para iniciar tu servidor
CMD ["node", "index.js"]
