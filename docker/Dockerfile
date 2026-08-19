# syntax=docker/dockerfile:1

# Production image for PvPoke: the SvelteKit site built with adapter-node, and nothing else.
#
# Multi-stage so the final image carries neither pnpm nor devDependencies — only the
# compiled `build/` output and the runtime dependencies (mysql2 for the training-battle
# endpoints). The static assets under static/ (css, js, img, data — ~140 MB) are copied
# into build/client by adapter-node and served by the Node server itself.
#
# The build context is the repository root (see docker-compose.yml), so .dockerignore
# keeps node_modules, .git and the local .env out of the upload.
#
# The dev container does NOT use this image; it uses a stock devcontainer base image plus
# Features (see .devcontainer/devcontainer.json) and runs `pnpm dev` against the bind mount.

# ---------------------------------------------------------------------------------------
# Stage 1: install dependencies and build.
FROM node:22-bookworm-slim AS build

# pnpm comes with corepack, pinned to the version in package.json ("packageManager"), so
# the lockfile is installed by the exact pnpm that produced it.
RUN corepack enable

WORKDIR /app

# Dependencies first, so the (slow) install layer is cached until the lockfile changes.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# Runtime-only node_modules for the final stage (drops svelte, vite, typescript, …).
RUN pnpm prune --prod

# ---------------------------------------------------------------------------------------
# Stage 2: the image that actually runs.
FROM node:22-bookworm-slim

ENV NODE_ENV=production
WORKDIR /app

COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json

# adapter-node reads PORT/HOST and needs ORIGIN to know the public URL (used for the `host`
# JS global and absolute links). Override ORIGIN in docker-compose / the environment.
ENV PORT=3000
ENV HOST=0.0.0.0
ENV ORIGIN=http://localhost:3000

# Drop root: node:22 ships a `node` user.
USER node

EXPOSE 3000
CMD ["node", "build"]
