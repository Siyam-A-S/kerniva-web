#!/bin/sh
# nginx is the reason this container exists: the marketing site must stay up
# even when the forms API cannot. So the API is supervised and restarted, but
# only nginx exiting brings the container down. A missing mail credential
# degrades the forms; it must never 404 the site.
set -u

api() {
  while true; do
    node /srv/api/dist/api/src/index.js || true
    echo "kerniva: forms api exited; restarting in 5s" >&2
    sleep 5
  done
}

api &
api_pid=$!

nginx -g 'daemon off;' &
nginx_pid=$!

stop() {
  kill -TERM "$nginx_pid" 2>/dev/null || true
  kill -TERM "$api_pid" 2>/dev/null || true
}
trap stop TERM INT

wait "$nginx_pid"
status=$?
echo "kerniva: nginx exited ($status); shutting the container down" >&2
kill -TERM "$api_pid" 2>/dev/null || true
exit "$status"
