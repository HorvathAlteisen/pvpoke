# syntax=docker/dockerfile:1

# Node 22 comes from the official image rather than apt: Debian bookworm ships
# only Node 18, and Claude Code declares engines >= 22. The -bookworm-slim tag is
# explicit (not plain -slim, which will move to trixie) so these binaries match
# this image's glibc 2.36 exactly.
FROM node:22-bookworm-slim AS node

# Dev container image for PvPoke: Apache + mod_php plus the tooling VS Code
# expects. The application is deliberately not copied in — the dev container
# bind-mounts the repository over /var/www/html/pvpoke, so edits are live and
# there is nothing to rebuild.
#
# Base image: debian:bookworm-slim, not Alpine — the VS Code server ships
# glibc-only binaries. What images like php:8.2-apache configure for free —
# AllowOverride, log redirection, foreground exec — is done explicitly below,
# because getting any of it wrong fails in confusing ways.
#
# The build context is this docker/ directory, so src/ (~137 MB) and .git (~1 GB)
# are never uploaded to the daemon.
FROM debian:bookworm-slim

# src/modules/config.php sets $WEB_ROOT = '/pvpoke/src/', so the repository mounts
# one directory below Apache's document root and the site is served from
# http://localhost/pvpoke/src/.
ENV APP_ROOT=/var/www/html/pvpoke

# Silences npm's "new version available" banner in build output and in every
# interactive session.
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# Node 22 writes a V8 compile cache on every npm/npx invocation, defaulting to
# /tmp. Pointing it at a path of our own keeps it out of /tmp and makes it
# something the build steps below can clean up by name.
ENV NODE_COMPILE_CACHE=/var/cache/node

# Two package groups, one layer:
#   apache2 / libapache2-mod-php8.2 / php8.2-mysqli — the site itself. mysqli is
#     the only extension it uses (src/data/training/*.php).
#   the rest — dev container needs. ca-certificates, libstdc++6 and libatomic1
#     are what the VS Code server's bundled Node links against; git and less back
#     the Source Control view; procps backs the process explorer; curl is needed
#     below to fetch the GitHub CLI signing key.
# update, install and cache cleanup stay in one RUN so the package lists never
# land in the image and a cached `apt-get update` can't go stale.
RUN apt-get update \
	&& apt-get install -y --no-install-recommends \
		apache2 \
		libapache2-mod-php8.2 \
		php8.2-mysqli \
		ca-certificates \
		curl \
		git \
		less \
		libatomic1 \
		libstdc++6 \
		procps \
		sudo \
	&& rm -rf /var/lib/apt/lists/*

# Node 22 + npm, copied from the official image. Only the two paths that matter,
# so none of that image's other contents ride along.
COPY --from=node /usr/local/bin/node /usr/local/bin/node
COPY --from=node /usr/local/lib/node_modules/npm /usr/local/lib/node_modules/npm
#
# The compile cache is cleared in each layer that runs node, not once at the end
# — a file deleted in a later layer still ships inside the earlier one.
RUN ln -sf ../lib/node_modules/npm/bin/npm-cli.js /usr/local/bin/npm \
	&& ln -sf ../lib/node_modules/npm/bin/npx-cli.js /usr/local/bin/npx \
	&& node --version && npm --version \
	&& rm -rf /var/cache/node

# GitHub CLI, from GitHub's own apt repository so `apt-get upgrade` keeps it
# current. The keyring is fetched with curl rather than piped into gpg, which
# avoids pulling gpg in just for this. Its own apt-get update/cleanup pair stays
# inside this layer.
RUN curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg \
		-o /usr/share/keyrings/githubcli-archive-keyring.gpg \
	&& chmod go+r /usr/share/keyrings/githubcli-archive-keyring.gpg \
	&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" \
		> /etc/apt/sources.list.d/github-cli.list \
	&& apt-get update \
	&& apt-get install -y --no-install-recommends gh \
	&& rm -rf /var/lib/apt/lists/* \
	&& gh --version

# Claude Code. Its postinstall downloads a ~310 MB native binary, which is the
# single largest thing in this image. The npm cache is dropped in the same layer
# so the download isn't paid for twice, and `claude --version` fails the build
# rather than shipping a broken install.
RUN npm install -g @anthropic-ai/claude-code \
	&& npm cache clean --force \
	&& claude --version \
	&& rm -rf /var/cache/node

COPY apache.conf /etc/apache2/conf-available/pvpoke.conf

# mod_rewrite is what .htaccess needs; the conf above is what makes .htaccess be
# read at all (Debian defaults to AllowOverride None, which ignores it silently).
# Apache's file logs are redirected to the container's stdout/stderr so
# `docker logs` works and nothing accumulates inside the container.
RUN a2enmod rewrite \
	&& a2enconf pvpoke \
	&& ln -sfT /dev/stderr /var/log/apache2/error.log \
	&& ln -sfT /dev/stdout /var/log/apache2/access.log \
	&& ln -sfT /dev/stdout /var/log/apache2/other_vhosts_access.log

ARG USERNAME=vscode
ARG USER_UID=1000
ARG USER_GID=${USER_UID}

# The dev user joins www-data so it and Apache can both write the files
# ranker.php generates under src/data/rankings/. safe.directory stops git from
# rejecting the bind-mounted repository as dubiously owned.
RUN groupadd --gid ${USER_GID} ${USERNAME} \
	&& useradd --uid ${USER_UID} --gid ${USER_GID} --create-home --shell /bin/bash ${USERNAME} \
	&& echo "${USERNAME} ALL=(root) NOPASSWD:ALL" > /etc/sudoers.d/${USERNAME} \
	&& chmod 0440 /etc/sudoers.d/${USERNAME} \
	&& adduser ${USERNAME} www-data \
	&& git config --system --add safe.directory ${APP_ROOT}

# ctxline-claude, a statusline for Claude Code. Installed as ${USERNAME} because
# it writes to $HOME/.claude, and that is the user VS Code attaches as.
#
# Two things here are load-bearing. Its installer bails out unless ~/.claude
# already exists — and it exits 0 when it bails — so without the mkdir it would
# quietly do nothing and the build would still pass. The grep afterwards is what
# turns that silent no-op into a failed build.
#
# `su` and not `su -`: a login shell resets the environment, which would drop
# NODE_COMPILE_CACHE and put Node's cache back in /tmp, inside this layer. Plain
# su still sets HOME to the target user, which is all this needs.
# NODE_COMPILE_CACHE is also created here owned by ${USERNAME}: Node falls back
# to /tmp without a word if it cannot write to that path, which is how the cache
# ended up baked into this layer the first time. It is left in place but emptied,
# so the same holds for npm/npx run inside the container later.
RUN install -d -o ${USERNAME} -g ${USERNAME} /home/${USERNAME}/.claude /var/cache/node \
	&& su ${USERNAME} -c "npx -y ctxline-claude@latest" \
	&& grep -q '"statusLine"' /home/${USERNAME}/.claude/settings.json \
	&& su ${USERNAME} -c "npm cache clean --force" \
	&& find /var/cache/node -mindepth 1 -delete

# No `USER ${USERNAME}`: Apache's master process must start as root to bind port
# 80 (it drops to www-data for workers). VS Code attaches as ${USERNAME} via
# "remoteUser" in .devcontainer/devcontainer.json.

WORKDIR ${APP_ROOT}
EXPOSE 80

# Not `apache2ctl -D FOREGROUND`: Debian's apache2ctl is a shell wrapper that
# runs apache2 as a child instead of exec'ing it, so the wrapper stays PID 1 and
# swallows SIGTERM — `docker stop` then blocks for the full 10s timeout and
# SIGKILLs Apache. Sourcing envvars (APACHE_RUN_DIR, APACHE_RUN_USER,
# APACHE_PID_FILE, ...) and exec'ing makes apache2 itself PID 1. The pidfile
# removal covers restarting a killed container, where a stale pidfile would
# otherwise abort startup.
CMD ["/bin/sh", "-c", ". /etc/apache2/envvars && rm -f \"$APACHE_PID_FILE\" && exec apache2 -D FOREGROUND"]
