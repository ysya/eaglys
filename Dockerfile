FROM node:20 as builder

RUN npm install -g pnpm

WORKDIR /build-tmp

COPY . .

RUN pnpm install
RUN pnpm run server:build
# RUN pnpm --filter @app/server deploy dist --prod

# ---

# FROM oven/bun:alpine
FROM node:20-alpine

COPY --from=builder /build-tmp/apps/server/dist /app

CMD ["node", "/app/index.js"]

EXPOSE 3000
