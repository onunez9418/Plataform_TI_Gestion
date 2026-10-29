# Imagen de la aplicación (Versión local 0.1). Node 22 sobre Debian.
FROM node:22-bookworm

# Se usa la imagen completa (no "slim") a propósito: ya trae openssl y certificados, que Prisma necesita,
# y así la construcción no depende de descargar paquetes del sistema (menos puntos de falla en la computadora del CEO).
ENV NEXT_TELEMETRY_DISABLED=1
WORKDIR /app

# Primero lo que cambia poco (dependencias), para aprovechar la memoria de Docker.
COPY package.json package-lock.json ./
COPY scripts ./scripts
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

COPY . .
RUN npm run build \
 && chown -R node:node /app

USER node
EXPOSE 3000
ENTRYPOINT ["sh", "/app/scripts/entrada-contenedor.sh"]
