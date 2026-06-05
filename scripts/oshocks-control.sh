#!/bin/bash

# MSF Bennett Command Controller
# Usage: msf bennett <action> <project> <environment>

USER_NAME="bennett"
ACTION="$2"
PROJECT="$3"
ENV="$4"

if [ "$1" != "$USER_NAME" ]; then
    echo "Usage: msf bennett <start|stop|clear|restart|status|logs|attach|tree> <project> <dev|prod>"
    exit 1
fi

if [ -z "$ACTION" ] || [ -z "$PROJECT" ] || [ -z "$ENV" ]; then
    echo "Usage: msf bennett <start|stop|clear|restart|status|logs|attach|tree> <project> <dev|prod>"
    exit 1
fi

case "$PROJECT" in
  oshocks)
    case "$ENV" in
      dev)
        case "$ACTION" in
          start)
            echo "=========================================="
            echo "  🚀 Starting OSHOCKS Development Servers"
            echo "=========================================="
            echo ""
            
            # Check if tmux session exists
            if tmux has-session -t oshocks-dev 2>/dev/null; then
              echo "⚠️  tmux session 'oshocks-dev' already exists!"
              echo "   Reattach with: tmux attach -t oshocks-dev"
              echo "   Or kill with: tmux kill-session -t oshocks-dev"
              exit 1
            fi
            
            echo "📦 Creating tmux session 'oshocks-dev'..."
            tmux new-session -d -s oshocks-dev -n servers ~/studio.dev/oshocks/scripts/tmux-oshocks-start.sh
            
            echo ""
            echo "=========================================="
            echo "  ✅ All servers started in tmux!"
            echo "=========================================="
            echo ""
            echo "  📎 Attach: tmux attach -t oshocks-dev"
            echo "  📎 Detach: Ctrl+B, then D"
            echo "  📎 Kill: tmux kill-session -t oshocks-dev"
            echo ""
            echo "  Servers survive terminal closes!"
            echo "=========================================="
            ;;
          stop)
            echo "=========================================="
            echo "  🛑 Stopping OSHOCKS Development Servers"
            echo "=========================================="
            echo ""
            
            # Kill tmux session if it exists
            if tmux has-session -t oshocks-dev 2>/dev/null; then
              echo "📦 Killing tmux session..."
              tmux kill-session -t oshocks-dev
            fi
            
            # Stop all servers
            echo "🟠 Stopping Reverb..."
            ~/studio.dev/oshocks/backend/scripts/reverb-control stop 2>/dev/null || true
            echo ""
            echo "🟢 Stopping npm run dev..."
            ~/studio.dev/oshocks/frontend/scripts/npm-run-dev.sh stop 2>/dev/null || true
            echo ""
            echo "🟣 Stopping PHP Artisan Serve..."
            ~/studio.dev/oshocks/backend/scripts/php-artisan-serve stop 2>/dev/null || true
            echo ""
            echo "📦 Stopping MariaDB..."
            ~/studio.dev/oshocks/backend/scripts/mariadb-control stop 2>/dev/null || true
            echo ""
            echo "=========================================="
            echo "  ✅ All servers stopped!"
            echo "=========================================="
            ;;
          clear)
            echo "=========================================="
            echo "  🧹 Clearing OSHOCKS Development Caches"
            echo "=========================================="
            echo ""
            echo "🧹 Clearing Reverb logs..."
            ~/studio.dev/oshocks/backend/scripts/reverb-control clear 2>/dev/null || echo "Reverb clear not available"
            echo ""
            echo "🧹 Clearing MariaDB..."
            ~/studio.dev/oshocks/backend/scripts/mariadb-control clear 2>/dev/null || echo "MariaDB clear not available"
            echo ""
            echo "🧹 Clearing PHP caches..."
            ~/studio.dev/oshocks/backend/scripts/php-artisan-serve clear
            echo ""
            echo "🧹 Clearing npm cache..."
            ~/studio.dev/oshocks/frontend/scripts/npm-run-dev.sh clear
            echo ""
            echo "=========================================="
            echo "  ✅ All caches cleared!"
            echo "=========================================="
            ;;
          restart)
            $0 bennett stop oshocks dev
            sleep 1
            $0 bennett clear oshocks dev
            sleep 1
            $0 bennett start oshocks dev
            ;;
          status)
            echo "=========================================="
            echo "  📊 OSHOCKS Development Status"
            echo "=========================================="
            echo ""
            ~/studio.dev/oshocks/backend/scripts/mariadb-control status
            ~/studio.dev/oshocks/backend/scripts/php-artisan-serve status
            ~/studio.dev/oshocks/backend/scripts/reverb-control status
            ~/studio.dev/oshocks/frontend/scripts/npm-run-dev.sh status
            echo ""
            echo "=========================================="
            ;;
          logs)
            echo "=========================================="
            echo "  📜 Tailing OSHOCKS Development Logs"
            echo "=========================================="
            echo ""
            echo "Press Ctrl+C to stop viewing logs"
            echo ""
            # Tail all three log files with labels
            tail -f /var/lib/mysql/accellalegacy.err /tmp/php-artisan-serve.log /tmp/reverb-oshocks.log /tmp/npm-run-dev.log 2>/dev/null || echo "Some log files not found. Servers may not be running."
            ;;
          tree)
            echo "=========================================="
            echo "  📁 Generating Project Tree"
            echo "=========================================="
            echo ""
            echo "Use: msf bennett tree -L <depth> for terminal output"
            echo "Use: msf bennett tree -L <depth> make file for file output"
            echo "Use: msf bennett tree -L <depth> --preview for interactive preview"
            echo ""
            ;;
          attach)
            if tmux has-session -t oshocks-dev 2>/dev/null; then
              echo "📎 Attaching to oshocks-dev tmux session..."
              tmux attach -t oshocks-dev
            else
              echo "❌ No tmux session 'oshocks-dev' found."
              echo "   Start servers first: msf bennett start oshocks dev"
              exit 1
            fi
            ;;
          *)
            echo "Usage: msf bennett <start|stop|clear|restart|status|logs|attach|tree> oshocks dev"
            exit 1
            ;;
        esac
        ;;
      *)
        echo "Environment '$ENV' not found for oshocks. Use 'dev'."
        exit 1
        ;;
    esac
    ;;
  *)
    echo "Project '$PROJECT' not found. Available: oshocks"
    exit 1
    ;;
esac
