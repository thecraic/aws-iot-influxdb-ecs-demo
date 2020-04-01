#!/bin/bash -e

# We need to ensure this directory is writeable on start of the container
chmod 0777 /var/lib/grafana
/etc/init.d/nginx start &
exec /usr/bin/supervisord
