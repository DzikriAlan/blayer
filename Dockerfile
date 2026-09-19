# Blayer — image self-hosted.
#
# Dibangun bertahap supaya image akhirnya hanya berisi hasil build dan
# dependensi runtime, bukan seluruh isi node_modules pengembangan.

FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci

FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Nilai ini hanya dipakai saat build; Prisma butuh variabelnya ada, bukan hidup.
ENV DATABASE_URL="postgresql://blayer:blayer@localhost:5432/blayer"
ENV BLAYER_STANDALONE=1
ENV NEXT_TELEMETRY_DISABLED=1
RUN npx prisma generate && npm run build

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

RUN addgroup -g 1001 -S nodejs && adduser -S blayer -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=blayer:nodejs /app/.next/standalone ./
COPY --from=builder --chown=blayer:nodejs /app/.next/static ./.next/static
# Migrasi ikut dibawa supaya `npm run db:deploy` bisa dijalankan dari container.
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

USER blayer
EXPOSE 3000

CMD ["node", "server.js"]
