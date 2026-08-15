# syntax=docker/dockerfile:1

# Dev container image for PvPoke: Apache + mod_php plus the tooling VS Code
# expects. The application is deliberately not copied in — the dev container
# bind-mounts the repository over /var/www/html/pvpoke, so edits are live and
# there is nothing to rebuild.
#
# Base image: debian:bookworm-slim, not Alpine — the VS Code server ships
# glibc-only binaries. Not mcr.microsoft.com/devcontainers/php (1.19 GB) or
# php:8.2-apache either; slim + apt lands around 440 MB. What those images
# configure for free — AllowOverride, log redirection, foreground exec — is done
# explicitly below, because getting any of it wrong fails in confusing ways.
#
# The build context is this docker/ directory, so src/ (~137 MB) and .git (~1 GB)
# are never uploaded to the daemon.
FROM debian:bookworm-slim

# src/modules/config.php sets $WEB_ROOT = '/pvpoke/src/', so the repository mounts
# one directory below Apache's document root and the site is served from
# http://localhost/pvpoke/src/.
ENV APP_ROOT=/var/www/html/pvpoke

# Two package groups, one layer:
#   apache2 / libapache2-mod-php8.2 / php8.2-mysqli — the site itself. mysqli is
#     the only extension it uses (src/data/training/*.php).
#   the rest — dev container needs. ca-certificates, libstdc++6 and libatomic1
#     are what the VS Code server's bundled Node links against; git and less back
#     the Source Control view; procps backs the process explorer; nodejs runs the
#     repo's "Format JSON" task (src/.vscode/tasks.json).
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
		nodejs \
		procps \
		sudo \
	&& rm -rf /var/lib/apt/lists/*

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
