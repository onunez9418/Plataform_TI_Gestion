# Imagen de la aplicación (Versión local 0.1). Node 22 sobre Debian.
FROM node:22-bookworm

# Se usa la imagen completa (no "slim") a propósito: ya trae openssl y certificados, que Prisma necesita,
# y así la construcción no depende de descargar paquetes del sistema (menos puntos de falla en la computadora del CEO).
ENV NEXT_TELEMETRY_DISABLED=1 NPM_CONFIG_UPDATE_NOTIFIER=false
# La aplicación corre con el usuario "node" (sin privilegios). Se copia ya con su dueño (--chown) para no
# duplicar cientos de MB en una capa extra de "chown -R".
RUN mkdir -p /app && chown node:node /app
WORKDIR /app
USER node

# Primero lo que cambia poco (dependencias), para aprovechar la memoria de Docker.
COPY --chown=node:node package.json package-lock.json ./
COPY --chown=node:node scripts ./scripts
COPY --chown=node:node prisma ./prisma
RUN npm ci --no-audit --no-fund

COPY --chown=node:node . .
RUN npm run build

EXPOSE 3000
ENTRYPOINT ["sh", "/app/scripts/entrada-contenedor.sh"]
