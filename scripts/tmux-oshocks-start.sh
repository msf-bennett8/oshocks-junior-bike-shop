#!/bin/bash

# Keep tmux pane alive while monitoring servers
# Redirect stdin to prevent arrow key input

exec < /dev/null

C_RESET='\033[0m'
C_GREEN='\033[0;32m'
C_BLUE='\033[0;34m'
C_MAGENTA='\033[0;35m'
C_CYAN='\033[0;36m'
C_YELLOW='\033[0;33m'
C_BOLD='\033[1m'

echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
echo -e "${C_BOLD}|  ${C_GREEN}OSHOCKS Server Startup${C_RESET}${C_BOLD}                                       |${C_RESET}"
echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
echo ""

echo -e "[${C_BLUE}MARIADB${C_RESET}] Starting MariaDB..."
~/studio.dev/oshocks/backend/scripts/mariadb-control start
sleep 2

echo -e "[${C_GREEN}PHP${C_RESET}] Starting PHP Artisan Serve..."
~/studio.dev/oshocks/backend/scripts/php-artisan-serve start
sleep 1

echo -e "[${C_MAGENTA}REVERB${C_RESET}] Starting Reverb..."
~/studio.dev/oshocks/backend/scripts/reverb-control start
sleep 1

echo -e "[${C_YELLOW}NPM${C_RESET}] Starting npm run dev..."
~/studio.dev/oshocks/frontend/scripts/npm-run-dev.sh start

echo ""
echo -e "[${C_GREEN}OK${C_RESET}] ${C_GREEN}All servers started. Monitoring...${C_RESET}"
echo -e "   ${C_CYAN}Press Ctrl+C to stop all servers and exit tmux${C_RESET}"
echo ""

# Monitor loop - keep pane alive
while true; do
    if ! pgrep -x "mariadbd" > /dev/null && ! [ -f /tmp/php-artisan-serve.pid ] && ! [ -f /tmp/reverb-oshocks.pid ] && ! [ -f /tmp/npm-run-dev.pid ]; then
        echo -e "[${C_RED}STOP${C_RESET}] All servers stopped. Exiting..."
        break
    fi
    sleep 5
done
