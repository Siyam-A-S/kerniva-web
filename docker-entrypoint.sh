#!/bin/sh
# Runs the form API on loopback and nginx in front of it. If either dies the
# container exits, so the platform restarts the pair rather than leaving a
# half-broken site serving pages with a dead /api.
set -eu

api_pid=""
nginx_pid=""

stop() {
  [ -n "$api_pid" ] && kill -TERM "$api_pid" 2>/dev/null || true
  [ -n "$nginx_pid" ] && kill -TERM "$nginx_pid" 2>/dev/null || true
}
trap stop TERM INT

node /srv/api/dist/api/src/index.js &
api_pid=$!

nginx -g 'daemon off;' &
nginx_pid=$!

while kill -0 "$api_pid" 2>/dev/null && kill -0 "$nginx_pid" 2>/dev/null; do
  sleep 1
done

echo "kerniva: a supervised process exited; shutting the container down" >&2
stop
wait 2>/dev/null || true
exit 1
