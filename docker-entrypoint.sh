#!/bin/sh
set -e

echo "[entrypoint] Starting container entrypoint"

# If BASIC_AUTH_USERS is provided as comma-separated list of 'user:pass', write to .htpasswd
if [ -n "${BASIC_AUTH_USERS}" ]; then
  echo "[entrypoint] Writing .htpasswd from BASIC_AUTH_USERS"
  # convert commas to newlines
  echo "${BASIC_AUTH_USERS}" | awk -v RS=',' '{print $0}' > /app/.htpasswd
  chmod 600 /app/.htpasswd
  echo "[entrypoint] .htpasswd created (/app/.htpasswd)"
elif [ -n "${HTPASSWD_BASE64}" ]; then
  echo "[entrypoint] Decoding HTPASSWD_BASE64 into .htpasswd"
  echo "${HTPASSWD_BASE64}" | base64 -d > /app/.htpasswd
  chmod 600 /app/.htpasswd
  echo "[entrypoint] .htpasswd created from base64"
else
  echo "[entrypoint] No BASIC_AUTH_USERS or HTPASSWD_BASE64 provided; skipping .htpasswd creation"
fi

exec "$@"
