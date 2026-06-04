#!/bin/bash

# Keep tmux pane alive while monitoring servers
# Redirect stdin to prevent arrow key input

exec < /dev/null

~/studio.dev/oshocks/backend/scripts/mariadb-control start
sleep 2
~/studio.dev/oshocks/backend/scripts/php-artisan-serve start
sleep 1
~/studio.dev/oshocks/frontend/scripts/npm-run-dev.sh start

echo "All servers started. Monitoring..."
echo "Press Ctrl+C to stop all servers and exit tmux"

# Monitor loop - keep pane alive
while true; do
    if ! pgrep -x "mariadbd" > /dev/null && ! [ -f /tmp/php-artisan-serve.pid ] && ! [ -f /tmp/npm-run-dev.pid ]; then
        echo "All servers stopped. Exiting..."
        break
    fi
    sleep 5
done
