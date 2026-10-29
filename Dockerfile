# Imagen de la aplicación (Versión local 0.1). Node 22 sobre Debian.
FROM node:22-bookworm-slim

# postgresql-client: espera y revisa la base desde la entrada del contenedor. openssl: lo pide Prisma.
RUN apt-get update \
 && apt-get install -y --no-install-recommends postgresql-client openssl ca-certificates \
 && rm -rf /var/lib/apt/lists/*

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
