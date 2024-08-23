FROM php:apache-buster
RUN apt-get update && apt-get install git -y \
    && rm -rf /var/lib/apt/lists/* \
    && apt-get clean \
    && a2enmod rewrite