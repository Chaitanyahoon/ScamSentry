#!/bin/bash
# ScamSentry Backend Keep-Alive Script
# This script pings the /health endpoint of the backend to prevent the Render Free tier from spinning down.
# Recommended cron setup: Run every 12 minutes.
# Example cron entry: */12 * * * * /path/to/keep_alive.sh >> /var/log/scamsentry_keepalive.log 2>&1

URL="https://scamsentry-backend-j7a8.onrender.com/health"
TIMESTAMP=$(date +"%Y-%m-%d %H:%M:%S")

response=$(curl -s -w "%{http_code}" -o /dev/null "$URL")

if [ "$response" -eq 200 ]; then
  echo "[$TIMESTAMP] Keep-alive ping successful: HTTP 200"
else
  echo "[$TIMESTAMP] Keep-alive ping failed: HTTP $response"
  exit 1
fi
