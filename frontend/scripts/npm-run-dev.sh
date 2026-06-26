#!/bin/bash

PIDFILE="/tmp/npm-run-dev.pid"
LOGFILE="/tmp/npm-run-dev.log"
FRONTEND_DIR="/home/msf_bennett/studio.dev/oshocks/frontend"

C_RESET='\033[0m'
C_RED='\033[0;31m'
C_GREEN='\033[0;32m'
C_YELLOW='\033[0;33m'
C_CYAN='\033[0;36m'

case "$1" in
  start)
    if [ -f "$PIDFILE" ] && kill -0 $(cat "$PIDFILE") 2>/dev/null; then
      echo -e "[${C_YELLOW}NPM${C_RESET}] ${C_GREEN}Already running (PID: $(cat $PIDFILE))${C_RESET}"
      exit 0
    fi
    echo -e "[${C_YELLOW}NPM${C_RESET}] Starting on ${C_CYAN}http://localhost:3000${C_RESET}..."
    cd "$FRONTEND_DIR" || exit 1
    # Use --no-open to prevent Vite from opening a new tab automatically
    # We'll handle opening/reloading from the control script
    nohup npm run dev -- --port 3000 > "$LOGFILE" 2>&1 &
    echo $! > "$PIDFILE"
    sleep 3
    echo -e "[${C_GREEN}OK${C_RESET}] ${C_GREEN}Started (PID: $(cat $PIDFILE))${C_RESET}"
    ;;
  stop)
    if [ -f "$PIDFILE" ] && kill -0 $(cat "$PIDFILE") 2>/dev/null; then
      echo -e "[${C_YELLOW}NPM${C_RESET}] Stopping (PID: $(cat $PIDFILE))..."
      kill $(cat "$PIDFILE") 2>/dev/null
      rm -f "$PIDFILE"
      echo -e "[${C_GREEN}OK${C_RESET}] ${C_GREEN}Stopped${C_RESET}"
    else
      echo -e "[${C_YELLOW}NPM${C_RESET}] ${C_RED}Not running${C_RESET}"
      rm -f "$PIDFILE"
    fi
    ;;
  status)
    if [ -f "$PIDFILE" ] && kill -0 $(cat "$PIDFILE") 2>/dev/null; then
      echo -e "[${C_YELLOW}NPM${C_RESET}]  ${C_GREEN}RUNNING${C_RESET} (PID: $(cat $PIDFILE)) -- ${C_CYAN}http://localhost:3000${C_RESET}"
    else
      echo -e "[${C_YELLOW}NPM${C_RESET}]  ${C_RED}STOPPED${C_RESET}"
      rm -f "$PIDFILE" 2>/dev/null
    fi
    ;;
  restart)
    $0 stop
    sleep 1
    $0 start
    ;;
  logs)
    if [ -f "$LOGFILE" ]; then
      tail -f "$LOGFILE"
    else
      echo -e "[${C_YELLOW}NPM${C_RESET}] ${C_RED}No log file found${C_RESET}"
    fi
    ;;
  clear)
    echo -e "[${C_CYAN}CLEAR${C_RESET}] Clearing npm cache and logs..."
    rm -f "$PIDFILE"
    rm -f "$LOGFILE"
    cd "$FRONTEND_DIR" || exit 1
    rm -rf node_modules/.vite
    rm -rf node_modules/.cache
    echo -e "[${C_GREEN}OK${C_RESET}] ${C_GREEN}Cache cleared${C_RESET}"
    ;;
  *)
    echo -e "${C_RED}Usage: $0 {start|stop|status|restart|logs|clear}${C_RESET}"
    exit 1
    ;;
esac
