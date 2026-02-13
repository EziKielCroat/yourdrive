#!/bin/sh
# DuckDNS updater – run every 5 min via cron: */5 * * * * /path/to/duckdns-update.sh
# 1. Copy to /opt/duckdns/duck.sh (or keep in repo and symlink)
# 2. Set SUBDOMAIN and TOKEN below (or use env vars)
# 3. chmod 700 this file

SUBDOMAIN="${DUCKDNS_SUBDOMAIN:-yourapp}"
TOKEN="${DUCKDNS_TOKEN:-your-token-here}"

echo "url=\"https://www.duckdns.org/update?domains=${SUBDOMAIN}&token=${TOKEN}&ip=\"" | curl -k -o /tmp/duck.log -K -
