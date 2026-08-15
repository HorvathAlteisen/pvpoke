# syntax=docker/dockerfile:1

# Dev container image for PvPoke: Apache + mod_php, and nothing else.
#
# Everything a dev container needs on top of that — the non-root user, Node, the
# GitHub CLI — comes from Dev Container Features declared in
# .devcontainer/devcontainer.json, which is what the VS Code guide recommends
# over installing them by hand here. Claude Code and its statusline are set up in
# .devcontainer/post-create.sh, because they depend on Node (a Feature, applied
# after this image is built) and write into the remote user's home.
#
# The application is deliberately not copied in — the dev container bind-mounts
# the repository over /var/www/html/pvpoke, so edits are live.
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

# npm arrives with the node Feature; this keeps its "new version available"
# banner out of post-create output and interactive sessions.
ENV NPM_CONFIG_UPDATE_NOTIFIER=false

# apache2 / libapache2-mod-php8.2 / php8.2-mysqli are the site itself — mysqli is
# the only extension it uses (src/data/training/*.php). The rest is what the
# Features and the VS Code server expect to find already present: ca-certificates
# and curl for Feature installers, git for the Source Control view, procps for
# the process explorer, sudo for the non-root user, and libstdc++6 / libatomic1
# for the VS Code server's bundled Node.
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

# No `USER`: Apache's master process must start as root to bind port 80 (it drops
# to www-data for workers). The common-utils Feature creates the vscode user and
# devcontainer.json attaches as it via "remoteUser".

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
