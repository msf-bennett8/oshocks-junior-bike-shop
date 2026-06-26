#!/bin/bash

# Keep tmux pane alive while monitoring servers
# Redirect stdin to prevent arrow key input

exec < /dev/null

C_RESET='\033[0m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_BLUE='\033[0;34m'
C_MAGENTA='\033[0;35m'
C_CYAN='\033[0;36m'
C_YELLOW='\033[0;33m'
C_BOLD='\033[1m'
C_DIM='\033[2m'

# ============================================================================
# Browser helper: reload existing tab or open new one
# ============================================================================
reload_or_open_tab() {
    local url="$1"
    local title_pattern="$2"
    
    # Check if running in WSL
    if grep -qEi "(Microsoft|WSL)" /proc/version 2>/dev/null; then
        # WSL: Use Windows browser via cmd.exe
        # Try to find existing tab by checking if URL is already open
        # Use PowerShell to check and reload
        local ps_cmd='
            $url = "'$url'"
            $shell = New-Object -ComObject Shell.Application
            $found = $false
            foreach ($window in $shell.Windows()) {
                if ($window.LocationURL -eq $url) {
                    $window.Refresh()
                    $found = $true
                    break
                }
            }
            if (-not $found) {
                Start-Process $url
            }
        '
        if command -v powershell.exe >/dev/null 2>&1; then
            powershell.exe -Command "$ps_cmd" >/dev/null 2>&1 &
            echo -e "[${C_GREEN}BROWSER${C_RESET}] ${C_GREEN}Reloaded or opened:${C_RESET} ${C_CYAN}$url${C_RESET}"
            return 0
        fi
    fi
    
    # Linux native: try xdotool first
    if command -v xdotool >/dev/null 2>&1; then
        # Search for window with URL in title
        local win_id=$(xdotool search --name "$title_pattern" 2>/dev/null | head -1)
        if [ -n "$win_id" ]; then
            xdotool windowactivate "$win_id" 2>/dev/null
            xdotool key --window "$win_id" F5 2>/dev/null
            echo -e "[${C_GREEN}BROWSER${C_RESET}] ${C_GREEN}Reloaded existing tab:${C_RESET} ${C_CYAN}$url${C_RESET}"
            return 0
        fi
    fi
    
    # Fallback: just open the URL
    if command -v xdg-open >/dev/null 2>&1; then
        xdg-open "$url" >/dev/null 2>&1 &
    elif command -v cmd.exe >/dev/null 2>&1; then
        cmd.exe /c start "$url" >/dev/null 2>&1 &
    fi
    echo -e "[${C_GREEN}BROWSER${C_RESET}] ${C_GREEN}Opened new tab:${C_RESET} ${C_CYAN}$url${C_RESET}"
}

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
echo -e "[${C_GREEN}OK${C_RESET}] ${C_GREEN}All servers started.${C_RESET}"

# Wait a moment for npm to be ready, then open/reload browser
sleep 3
reload_or_open_tab "http://localhost:3000" "localhost:3000"

echo ""
echo -e "[${C_CYAN}INFO${C_RESET}] ${C_DIM}Monitoring... Press Ctrl+C to stop all servers and exit tmux${C_RESET}"
echo ""

# Monitor loop - keep pane alive
while true; do
    if ! pgrep -x "mariadbd" > /dev/null && ! [ -f /tmp/php-artisan-serve.pid ] && ! [ -f /tmp/reverb-oshocks.pid ] && ! [ -f /tmp/npm-run-dev.pid ]; then
        echo -e "[${C_RED}STOP${C_RESET}] All servers stopped. Exiting..."
        break
    fi
    sleep 5
done
