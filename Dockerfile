FROM node:20-alpine as builder

RUN npm install -g pnpm

WORKDIR /build-tmp

COPY . .

RUN pnpm install
RUN pnpm run server:build
RUN pnpm --filter @app/server deploy dist

# ---

FROM oven/bun:alpine

COPY --from=builder /build-tmp/dist /app
# COPY --from=builder /build-tmp/apps/server /app
# COPY --from=builder /build-tmp/packages/sql-parser /app/node_modules/@package/sql-parser


CMD ["bun", "/app/dist/src/main.js"]

EXPOSE 3000
