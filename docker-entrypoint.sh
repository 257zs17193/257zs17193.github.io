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

# If .env is expected by the start command, create it from runtime env vars when missing
ENV_FILE=/app/.env
if [ ! -f "${ENV_FILE}" ]; then
  echo "[entrypoint] .env not found, creating from available environment variables"
  touch "${ENV_FILE}"
  # List of environment vars to export into .env if present
  for key in DATABASE_URL NODE_ENV PORT GITHUB_CLIENT_ID GITHUB_CLIENT_SECRET SESSION_PASSWORD BASIC_AUTH_USERS; do
    val=$(printenv "$key")
    if [ -n "$val" ]; then
      # Escape any literal $ in values
      safe=$(printf '%s' "$val" | sed 's/\$/\\$/g')
      echo "$key=$safe" >> "${ENV_FILE}"
    fi
  done
  chmod 600 "${ENV_FILE}"
  echo "[entrypoint] .env created (/app/.env)"
else
  echo "[entrypoint] .env already exists; leaving it intact"
fi

exec "$@"
