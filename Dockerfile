# qq-farm-bot（Maksim-venus/qq-farm-bot-fnos 分支）的通用 Docker 版
# 与飞牛原生包的区别：不监听 Unix Socket，改为普通 TCP 3007；不依赖飞牛网关。
# 构建：docker build -t qq-farm-bot:fnos-fork .（在本仓库根目录执行）

ARG NODE_IMAGE=node:22-alpine
ARG PNPM_VERSION=10.30.2
ARG NPM_REGISTRY=https://registry.npmmirror.com/

# ---------- 1. 编译前端与后端 ----------
FROM ${NODE_IMAGE} AS builder
ARG PNPM_VERSION
ARG NPM_REGISTRY
WORKDIR /app
RUN npm config set registry "${NPM_REGISTRY}" \
    && npm install --global "pnpm@${PNPM_VERSION}" \
    && pnpm --version
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY core/package.json ./core/
COPY web/package.json ./web/
RUN pnpm config set registry "${NPM_REGISTRY}" \
    && pnpm install --frozen-lockfile
COPY core ./core
COPY web ./web
RUN pnpm build:web \
    && pnpm -C core build:ts

# ---------- 2. 只装生产依赖 ----------
FROM ${NODE_IMAGE} AS prod-deps
ARG PNPM_VERSION
ARG NPM_REGISTRY
WORKDIR /app
RUN npm config set registry "${NPM_REGISTRY}" \
    && npm install --global "pnpm@${PNPM_VERSION}" \
    && pnpm --version
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY core/package.json ./core/
COPY web/package.json ./web/
RUN pnpm config set registry "${NPM_REGISTRY}" \
    && pnpm -C core install --prod --frozen-lockfile

# ---------- 3. 运行镜像 ----------
FROM ${NODE_IMAGE} AS runner
WORKDIR /app/core
ENV NODE_ENV=production \
    TZ=Asia/Shanghai \
    ADMIN_HOST=0.0.0.0 \
    ADMIN_PORT=3007 \
    QQ_FARM_DATA_DIR=/app/core/data \
    QQ_FARM_ADMIN_ONLY=0

RUN apk add --no-cache tzdata \
    && cp /usr/share/zoneinfo/Asia/Shanghai /etc/localtime \
    && echo "Asia/Shanghai" > /etc/timezone \
    && apk del tzdata

COPY --from=prod-deps /app/node_modules ../node_modules/
COPY --from=prod-deps /app/core/node_modules ./node_modules/
COPY --from=prod-deps /app/package.json ../package.json
COPY --from=prod-deps /app/core/package.json ./package.json

COPY --from=builder /app/core/client.js ./client.js
COPY --from=builder /app/core/dist ./dist
COPY --from=builder /app/core/src/gameConfig ./src/gameConfig
COPY --from=builder /app/core/src/proto ./src/proto
COPY --from=builder /app/core/src/activity-data ./src/activity-data
COPY --from=builder /app/core/src/utils/tsdk.wasm ./src/utils/tsdk.wasm
COPY --from=builder /app/core/src/utils/tsdk-wx.wasm ./src/utils/tsdk-wx.wasm
COPY --from=builder /app/web/dist ../web/dist

RUN mkdir -p data/logs

VOLUME ["/app/core/data"]
EXPOSE 3007

HEALTHCHECK --interval=30s --timeout=10s --start-period=20s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:3007/api/game-version || exit 1

CMD ["node", "client.js"]
