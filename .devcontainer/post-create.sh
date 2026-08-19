#!/usr/bin/env bash
#
# Runs once, as the remote user, after the container is created and Features are
# applied. Anything here either needs Node — which arrives with the node Feature,
# after the image is built — or writes into the user's home, which is what the
# dev container guide reserves postCreateCommand for.
set -euo pipefail

echo "Installing project dependencies..."
# pnpm is installed by the node Feature (pnpmVersion) and pinned through the
# "packageManager" field in package.json; --frozen-lockfile keeps the install honest.
pnpm install --frozen-lockfile

echo "Installing Claude Code..."
# No official Anthropic Feature exists, and the community one is third-party, so
# this stays an explicit npm install. The node Feature installs Node under
# /usr/local/share/nvm owned by the remote user, so no sudo is needed.
npm install -g @anthropic-ai/claude-code
claude --version

echo "Installing the ctxline statusline..."
# ctxline-claude's installer bails out unless ~/.claude already exists — and it
# exits 0 when it bails. Without the mkdir it would quietly do nothing while
# still reporting success; the grep is what turns that no-op into a failure.
mkdir -p "$HOME/.claude"
npx -y ctxline-claude@latest
grep -q '"statusLine"' "$HOME/.claude/settings.json"

echo "Configuring git..."
# The workspace is a bind mount owned by the host user, which git otherwise
# refuses to operate on as "dubious ownership".
sudo git config --system --add safe.directory "$PWD"

echo "post-create complete."
