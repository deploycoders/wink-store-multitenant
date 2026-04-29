# 1. Dependencias
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm install

# 2. Builder
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Variables necesarias para que Next.js pueda hacer el build (Prerendering)
# Estas deben pasarse como --build-arg durante el comando docker build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_CLOUDINARY_NAME
ARG NEXT_PUBLIC_PLATFORM_BRAND_NAME

# Convertimos los ARGs en ENVs para el proceso de compilación
ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_CLOUDINARY_NAME=$NEXT_PUBLIC_CLOUDINARY_NAME
ENV NEXT_PUBLIC_PLATFORM_BRAND_NAME=$NEXT_PUBLIC_PLATFORM_BRAND_NAME
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# 3. Runner
FROM node:20-alpine AS runner
WORKDIR /app

# Formato corregido (key=value) para evitar warnings de LegacyKeyValueFormat
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Copiamos lo esencial para ejecutar
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Forzamos a Next.js a escuchar en el puerto 3000 y en todas las interfaces
CMD ["npx", "next", "start", "-p", "3000", "-H", "0.0.0.0"]