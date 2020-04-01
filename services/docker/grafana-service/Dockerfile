FROM debian:stretch-slim
LABEL maintainer="The Craic <thecraic@amazon.com>"

ENV DEBIAN_FRONTEND noninteractive
ENV LANG C.UTF-8

# Default versions
ENV GRAFANA_VERSION=6.5.0

# Grafana database type
ENV GF_DATABASE_TYPE=sqlite3

# Fix bad proxy issue
#COPY system/99fixbadproxy /etc/apt/apt.conf.d/99fixbadproxy

WORKDIR /root

# Clear previous sources
RUN rm /var/lib/apt/lists/* -vf \
    # Base dependencies
    && apt-get -y update \
    && apt-get -y dist-upgrade \
    && apt-get -y --force-yes install \
        apt-utils \
        ca-certificates \
        curl \
        git \
        htop \
        libfontconfig \
        nano \
        net-tools \
        supervisor \
        wget \
        gnupg \
        nginx \
    && curl -sL https://deb.nodesource.com/setup_10.x | bash - \
    && apt-get install -y nodejs \
    && mkdir -p /var/log/supervisor \
    && rm -rf .profile \
    # Install Grafana
    && wget https://dl.grafana.com/oss/release/grafana_${GRAFANA_VERSION}_amd64.deb \
    && dpkg -i grafana_${GRAFANA_VERSION}_amd64.deb && rm grafana_${GRAFANA_VERSION}_amd64.deb \
    # Cleanup
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

# Configure Supervisord and base env
COPY conf/supervisord.conf /etc/supervisor/conf.d/supervisord.conf
COPY conf/profile .profile

# nginx
COPY conf/nginx.conf /etc/nginx/nginx.conf 

# Grafana
COPY conf/grafana.ini /etc/grafana/grafana.ini

COPY conf/run.sh /run.sh
RUN ["chmod", "+x", "/run.sh"]
CMD ["/run.sh"]