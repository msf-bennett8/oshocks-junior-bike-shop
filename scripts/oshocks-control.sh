#!/bin/bash

# MSF Bennett Command Controller
# Usage: msf bennett <action> <project> <environment>

USER_NAME="bennett"
ACTION="$2"
PROJECT="$3"
ENV="$4"

# Color definitions (fallback if not sourced from .bashrc)
C_RESET='\033[0m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_YELLOW='\033[0;33m'
C_BLUE='\033[0;34m'
C_MAGENTA='\033[0;35m'
C_CYAN='\033[0;36m'
C_WHITE='\033[1;37m'
C_BOLD='\033[1m'
C_DIM='\033[2m'

# ============================================================================
# Help message function
# ============================================================================
show_help() {
    echo ""
    echo -e "${C_BOLD}+----------------------------------------------------------------------+${C_RESET}"
    echo -e "${C_BOLD}|  ${C_GREEN}MSF OSHOCKS Development Commands${C_RESET}${C_BOLD}                                   |${C_RESET}"
    echo -e "${C_BOLD}+----------------------------------------------------------------------+${C_RESET}"
    echo ""
    echo -e "${C_DIM}Usage:${C_RESET} ${C_WHITE}msf bennett <action> oshocks <env> [options]${C_RESET}"
    echo -e "${C_DIM}       ${C_WHITE}bennett <action> oshocks <env> [options]${C_RESET}"
    echo ""
    echo "Environments:"
    echo -e "  ${C_YELLOW}dev${C_RESET}               Development mode"
    echo -e "  ${C_DIM}prod${C_RESET}              Production mode (not yet implemented)"
    echo ""
    echo -e "${C_BOLD}Actions:${C_RESET}"
    echo ""
    echo -e "${C_BOLD}  +--------------------------------------------------------------+${C_RESET}"
    echo -e "${C_BOLD}  | ${C_CYAN}START / STOP${C_RESET}${C_BOLD}                                                 |${C_RESET}"
    echo -e "${C_BOLD}  +--------------------------------------------------------------+${C_RESET}"
    echo -e "  | ${C_GREEN}start${C_RESET}                    Fast start (~5-10s)                   |"
    echo -e "  |                          MariaDB + PHP + Reverb + npm        |"
    echo -e "  |                                                              |"
    echo -e "  | ${C_GREEN}restart${C_RESET}                  Stop + clear + start                |"
    echo -e "  |                                                              |"
    echo -e "  | ${C_RED}stop${C_RESET}                     Stop all servers                   |"
    echo -e "${C_BOLD}  +--------------------------------------------------------------+${C_RESET}"
    echo ""
    echo -e "${C_BOLD}  +--------------------------------------------------------------+${C_RESET}"
    echo -e "${C_BOLD}  | ${C_CYAN}CLEAR / CLEAN${C_RESET}${C_BOLD}                                                |${C_RESET}"
    echo -e "${C_BOLD}  +--------------------------------------------------------------+${C_RESET}"
    echo -e "  | ${C_GREEN}clear${C_RESET}                    Clear logs and caches                |"
    echo -e "  |                          Next start is fast                  |"
    echo -e "  |                                                              |"
    echo -e "  | ${C_RED}clear-all${C_RESET}                Clear logs + node_modules rebuild  |"
    echo -e "  |                          ${C_RED}DESTRUCTIVE -- forces npm reinstall${C_RESET}  |"
    echo -e "${C_BOLD}  +--------------------------------------------------------------+${C_RESET}"
    echo ""
    echo -e "${C_BOLD}  +--------------------------------------------------------------+${C_RESET}"
    echo -e "${C_BOLD}  | ${C_CYAN}MONITOR / DEBUG${C_RESET}${C_BOLD}                                              |${C_RESET}"
    echo -e "${C_BOLD}  +--------------------------------------------------------------+${C_RESET}"
    echo -e "  | ${C_BLUE}status${C_RESET}                   Show running status of all services  |"
    echo -e "  |                                                              |"
    echo -e "  | ${C_BLUE}logs [service]${C_RESET}           Tail logs (default: all)           |"
    echo -e "  |                          Services: ${C_CYAN}mariadb${C_RESET}, ${C_CYAN}php${C_RESET}, ${C_CYAN}reverb${C_RESET}, ${C_CYAN}npm${C_RESET}|"
    echo -e "  |                                                              |"
    echo -e "  | ${C_MAGENTA}attach${C_RESET}                   Attach to tmux session             |"
    echo -e "  |                          Ctrl+B then D to detach             |"
    echo -e "  |                                                              |"
    echo -e "  | ${C_MAGENTA}tree${C_RESET}                     Show project file tree             |"
    echo -e "${C_BOLD}  +--------------------------------------------------------------+${C_RESET}"
    echo ""
    echo -e "${C_BOLD}Examples:${C_RESET}"
    echo -e "  ${C_WHITE}msf bennett start oshocks dev${C_RESET}"
    echo -e "  ${C_WHITE}msf bennett restart oshocks dev${C_RESET}"
    echo -e "  ${C_WHITE}msf bennett stop oshocks dev${C_RESET}"
    echo -e "  ${C_WHITE}msf bennett clear oshocks dev${C_RESET}"
    echo -e "  ${C_WHITE}msf bennett status oshocks dev${C_RESET}"
    echo -e "  ${C_WHITE}msf bennett logs oshocks dev reverb${C_RESET}"
    echo -e "  ${C_WHITE}msf bennett attach oshocks dev${C_RESET}"
    echo ""
    echo -e "  ${C_WHITE}bennett start oshocks dev${C_RESET}"
    echo -e "  ${C_WHITE}bennett restart oshocks dev${C_RESET}"
    echo -e "  ${C_WHITE}bennett stop oshocks dev${C_RESET}"
    echo ""
    echo -e "${C_BOLD}Tips:${C_RESET}"
    echo -e "  ${C_DIM}* First start: ~5-10 seconds${C_RESET}"
    echo -e "  ${C_DIM}* Daily restart: ~3-5 seconds${C_RESET}"
    echo -e "  ${C_DIM}* Use Ctrl+C to exit logs, Ctrl+B then D to detach from tmux${C_RESET}"
    echo ""
}

if [ "$1" != "$USER_NAME" ]; then
    show_help
    exit 1
fi

# Handle --help explicitly
if [ "$ACTION" = "--help" ] || [ "$ACTION" = "-h" ]; then
    show_help
    exit 0
fi

if [ -z "$ACTION" ] || [ -z "$PROJECT" ] || [ -z "$ENV" ]; then
    show_help
    exit 1
fi

PROJECT_DIR="$HOME/studio.dev/oshocks"

# ============================================================================
# Main Actions
# ============================================================================

case "$PROJECT" in
  oshocks)
    case "$ENV" in
      dev)
        case "$ACTION" in
          # ------------------------------------------------------------------
          # START
          # ------------------------------------------------------------------
          start)
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo -e "${C_BOLD}|  ${C_GREEN}STARTING OSHOCKS Development Servers${C_RESET}${C_BOLD}                         |${C_RESET}"
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo ""

            # Check if tmux session exists
            if tmux has-session -t oshocks-dev 2>/dev/null; then
              echo -e "[${C_YELLOW}WARN${C_RESET}] ${C_YELLOW}tmux session 'oshocks-dev' already exists!${C_RESET}"
              echo "   Reattach with: tmux attach -t oshocks-dev"
              echo "   Or kill with: tmux kill-session -t oshocks-dev"
              exit 1
            fi

            echo -e "[${C_MAGENTA}TMUX${C_RESET}] Creating session 'oshocks-dev'..."
            tmux new-session -d -s oshocks-dev -n servers "$PROJECT_DIR/scripts/tmux-oshocks-start.sh"

            echo ""
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo -e "${C_BOLD}|  ${C_GREEN}ALL SERVERS STARTED IN TMUX${C_RESET}${C_BOLD}                                  |${C_RESET}"
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo ""
            echo -e "  ${C_CYAN}Attach:${C_RESET} tmux attach -t oshocks-dev"
            echo -e "  ${C_CYAN}Detach:${C_RESET} Ctrl+B, then D"
            echo -e "  ${C_CYAN}Kill:${C_RESET}   tmux kill-session -t oshocks-dev"
            echo ""
            echo "  Services:"
            echo -e "    [${C_BLUE}MARIADB${C_RESET}]  ${C_CYAN}localhost:3306${C_RESET}"
            echo -e "    [${C_GREEN}PHP${C_RESET}]      ${C_CYAN}http://localhost:8000${C_RESET}"
            echo -e "    [${C_MAGENTA}REVERB${C_RESET}]   ${C_CYAN}ws://localhost:8080${C_RESET}"
            echo -e "    [${C_YELLOW}NPM${C_RESET}]      ${C_CYAN}http://localhost:3000${C_RESET}"
            echo ""
            echo "  Servers survive terminal closes!"
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo ""

            # Ask if user wants to attach now
            while true; do
                echo -ne "${C_CYAN}Attach to tmux session now? [Y/n]: ${C_RESET}"
                read attach_answer
                case "$attach_answer" in
                    [Yy]*|"")
                        echo -e "[${C_MAGENTA}TMUX${C_RESET}] Attaching to oshocks-dev..."
                        tmux attach -t oshocks-dev
                        break
                        ;;
                    [Nn]*)
                        echo -e "[${C_MAGENTA}TMUX${C_RESET}] Session running in background."
                        echo "   Attach later: tmux attach -t oshocks-dev"
                        break
                        ;;
                    *)
                        echo -e "${C_YELLOW}Please answer y or n${C_RESET}"
                        ;;
                esac
            done
            ;;

          # ------------------------------------------------------------------
          # STOP
          # ------------------------------------------------------------------
          stop)
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo -e "${C_BOLD}|  ${C_RED}STOPPING OSHOCKS Development Servers${C_RESET}${C_BOLD}                         |${C_RESET}"
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo ""

            # Kill tmux session if it exists
            if tmux has-session -t oshocks-dev 2>/dev/null; then
              echo -e "[${C_MAGENTA}TMUX${C_RESET}] Killing session..."
              tmux kill-session -t oshocks-dev
            fi

            # Stop all servers
            echo -e "[${C_MAGENTA}REVERB${C_RESET}] Stopping Reverb..."
            "$PROJECT_DIR/backend/scripts/reverb-control" stop 2>/dev/null || true
            echo ""
            echo -e "[${C_YELLOW}NPM${C_RESET}] Stopping npm run dev..."
            "$PROJECT_DIR/frontend/scripts/npm-run-dev.sh" stop 2>/dev/null || true
            echo ""
            echo -e "[${C_GREEN}PHP${C_RESET}] Stopping PHP Artisan Serve..."
            "$PROJECT_DIR/backend/scripts/php-artisan-serve" stop 2>/dev/null || true
            echo ""
            echo -e "[${C_BLUE}MARIADB${C_RESET}] Stopping MariaDB..."
            "$PROJECT_DIR/backend/scripts/mariadb-control" stop 2>/dev/null || true
            echo ""
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo -e "${C_BOLD}|  ${C_GREEN}ALL SERVERS STOPPED${C_RESET}${C_BOLD}                                          |${C_RESET}"
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            ;;

          # ------------------------------------------------------------------
          # CLEAR
          # ------------------------------------------------------------------
          clear)
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo -e "${C_BOLD}|  ${C_CYAN}CLEARING OSHOCKS Development Caches${C_RESET}${C_BOLD}                          |${C_RESET}"
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo ""
            echo -e "[${C_CYAN}CLEAR${C_RESET}] Clearing Reverb logs..."
            "$PROJECT_DIR/backend/scripts/reverb-control" clear 2>/dev/null || echo "Reverb clear not available"
            echo ""
            echo -e "[${C_CYAN}CLEAR${C_RESET}] Clearing MariaDB..."
            "$PROJECT_DIR/backend/scripts/mariadb-control" clear 2>/dev/null || echo "MariaDB clear not available"
            echo ""
            echo -e "[${C_CYAN}CLEAR${C_RESET}] Clearing PHP caches..."
            "$PROJECT_DIR/backend/scripts/php-artisan-serve" clear
            echo ""
            echo -e "[${C_CYAN}CLEAR${C_RESET}] Clearing npm cache..."
            "$PROJECT_DIR/frontend/scripts/npm-run-dev.sh" clear
            echo ""
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo -e "${C_BOLD}|  ${C_GREEN}ALL CACHES CLEARED${C_RESET}${C_BOLD}                                           |${C_RESET}"
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo ""
            echo -e "   To also clear node_modules (forces npm install):"
            echo -e "   ${C_WHITE}msf bennett clear-all oshocks dev${C_RESET}"
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            ;;

          # ------------------------------------------------------------------
          # CLEAR-ALL
          # ------------------------------------------------------------------
          clear-all)
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo -e "${C_BOLD}|  ${C_RED}CLEARING ALL -- Caches + node_modules${C_RESET}${C_BOLD}                        |${C_RESET}"
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo ""
            echo -e "[${C_YELLOW}WARN${C_RESET}] ${C_RED}This will delete node_modules!${C_RESET}"
            echo -e "   ${C_DIM}Next start will require npm install (~1-2 minutes).${C_RESET}"
            echo ""

            echo -e "[${C_CYAN}CLEAR${C_RESET}] Clearing Reverb logs..."
            "$PROJECT_DIR/backend/scripts/reverb-control" clear 2>/dev/null || true
            echo ""
            echo -e "[${C_CYAN}CLEAR${C_RESET}] Clearing MariaDB..."
            "$PROJECT_DIR/backend/scripts/mariadb-control" clear 2>/dev/null || true
            echo ""
            echo -e "[${C_CYAN}CLEAR${C_RESET}] Clearing PHP caches..."
            "$PROJECT_DIR/backend/scripts/php-artisan-serve" clear
            echo ""
            echo -e "[${C_CYAN}CLEAR${C_RESET}] Clearing npm cache..."
            "$PROJECT_DIR/frontend/scripts/npm-run-dev.sh" clear
            echo ""
            echo -e "[${C_YELLOW}CLEAN${C_RESET}] Removing node_modules..."
            rm -rf "$PROJECT_DIR/frontend/node_modules"
            rm -rf "$PROJECT_DIR/backend/vendor"
            echo -e "[${C_GREEN}OK${C_RESET}] ${C_GREEN}node_modules and vendor removed${C_RESET}"
            echo ""

            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo -e "${C_BOLD}|  ${C_GREEN}ALL CACHES AND DEPENDENCIES CLEARED${C_RESET}${C_BOLD}                          |${C_RESET}"
            echo -e "   ${C_DIM}Next start will require npm install + composer install${C_RESET}"
            echo -e "   ${C_DIM}(~2-5 minutes)${C_RESET}"
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo ""
            echo -e "   To rebuild and start:"
            echo -e "   ${C_WHITE}msf bennett restart oshocks dev${C_RESET}"
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            ;;

          # ------------------------------------------------------------------
          # RESTART
          # ------------------------------------------------------------------
          restart)
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo -e "${C_BOLD}|  ${C_CYAN}RESTARTING OSHOCKS Development Servers${C_RESET}${C_BOLD}                       |${C_RESET}"
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo ""
            "$0" bennett stop oshocks dev
            sleep 1
            "$0" bennett clear oshocks dev
            sleep 1
            "$0" bennett start oshocks dev
            ;;

          # ------------------------------------------------------------------
          # STATUS
          # ------------------------------------------------------------------
          status)
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo -e "${C_BOLD}|  ${C_BLUE}OSHOCKS Development Status${C_RESET}${C_BOLD}                                   |${C_RESET}"
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo ""
            "$PROJECT_DIR/backend/scripts/mariadb-control" status
            "$PROJECT_DIR/backend/scripts/php-artisan-serve" status
            "$PROJECT_DIR/backend/scripts/reverb-control" status
            "$PROJECT_DIR/frontend/scripts/npm-run-dev.sh" status
            echo ""
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            ;;

          # ------------------------------------------------------------------
          # LOGS
          # ------------------------------------------------------------------
          logs)
            LOG_SERVICE="${5:-all}"

            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo -e "${C_BOLD}|  ${C_BLUE}TAILING OSHOCKS Development Logs${C_RESET}${C_BOLD}                             |${C_RESET}"
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo ""

            case "$LOG_SERVICE" in
              mariadb|db|m)
                echo -e "[${C_BLUE}MARIADB${C_RESET}] Tailing MariaDB log..."
                echo -e "   ${C_DIM}Press Ctrl+C to stop${C_RESET}"
                echo ""
                tail -f /var/lib/mysql/accellalegacy.err 2>/dev/null || echo -e "[${C_RED}ERROR${C_RESET}] MariaDB log not found"
                ;;
              php|p)
                echo -e "[${C_GREEN}PHP${C_RESET}] Tailing PHP log..."
                echo -e "   ${C_DIM}Press Ctrl+C to stop${C_RESET}"
                echo ""
                tail -f /tmp/php-artisan-serve.log 2>/dev/null || echo -e "[${C_RED}ERROR${C_RESET}] PHP log not found"
                ;;
              reverb|r)
                echo -e "[${C_MAGENTA}REVERB${C_RESET}] Tailing Reverb log..."
                echo -e "   ${C_DIM}Press Ctrl+C to stop${C_RESET}"
                echo ""
                tail -f /tmp/reverb-oshocks.log 2>/dev/null || echo -e "[${C_RED}ERROR${C_RESET}] Reverb log not found"
                ;;
              npm|n)
                echo -e "[${C_YELLOW}NPM${C_RESET}] Tailing npm log..."
                echo -e "   ${C_DIM}Press Ctrl+C to stop${C_RESET}"
                echo ""
                tail -f /tmp/npm-run-dev.log 2>/dev/null || echo -e "[${C_RED}ERROR${C_RESET}] npm log not found"
                ;;
              all|a|*)
                echo -e "[${C_WHITE}ALL${C_RESET}] Tailing ALL logs..."
                echo -e "   ${C_DIM}Press Ctrl+C to stop${C_RESET}"
                echo ""
                tail -f /var/lib/mysql/accellalegacy.err /tmp/php-artisan-serve.log /tmp/reverb-oshocks.log /tmp/npm-run-dev.log 2>/dev/null || echo "Some log files not found. Servers may not be running."
                ;;
            esac
            ;;

          # ------------------------------------------------------------------
          # ATTACH
          # ------------------------------------------------------------------
          attach)
            if tmux has-session -t oshocks-dev 2>/dev/null; then
              echo -e "[${C_MAGENTA}TMUX${C_RESET}] Attaching to oshocks-dev session..."
              tmux attach -t oshocks-dev
            else
              echo -e "[${C_RED}ERROR${C_RESET}] No tmux session 'oshocks-dev' found."
              echo "   Start servers first: msf bennett start oshocks dev"
              exit 1
            fi
            ;;

          # ------------------------------------------------------------------
          # TREE
          # ------------------------------------------------------------------
          tree)
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo -e "${C_BOLD}|  ${C_MAGENTA}OSHOCKS Project Tree${C_RESET}${C_BOLD}                                         |${C_RESET}"
            echo -e "${C_BOLD}+--------------------------------------------------------------+${C_RESET}"
            echo ""
            echo "Use: msf bennett tree -L <depth> for terminal output"
            echo "Use: msf bennett tree -L <depth> make file for file output"
            echo "Use: msf bennett tree -L <depth> --preview for interactive preview"
            echo ""
            ;;

          --help|-h)
            show_help
            exit 0
            ;;

          *)
            echo ""
            echo -e "[${C_RED}ERROR${C_RESET}] ${C_RED}Unknown action: '$ACTION'${C_RESET}"
            echo ""
            show_help
            exit 1
            ;;
        esac
        ;;
      *)
        echo -e "${C_RED}Environment '$ENV' not found for oshocks. Use 'dev'.${C_RESET}"
        exit 1
        ;;
    esac
    ;;
  *)
    echo -e "${C_RED}Project '$PROJECT' not found. Available: oshocks, bennett-studio${C_RESET}"
    exit 1
    ;;
esac
