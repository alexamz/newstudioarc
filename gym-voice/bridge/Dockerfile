# docker build -f gym-voice/bridge/Dockerfile -t gym-voice:dev .
FROM node:22-alpine
WORKDIR /app
COPY gym-voice/bridge/core.mjs gym-voice/bridge/server.mjs ./
COPY gym-voice/index.html gym-voice/manifest.webmanifest gym-voice/sw.js gym-voice/icon.svg ./
ENV PORT=8080
ENV NODE_ENV=production
EXPOSE 8080
USER node
CMD ["node","server.mjs"]
