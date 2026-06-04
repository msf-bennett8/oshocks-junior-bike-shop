#!/bin/bash

PIDFILE="/tmp/npm-run-dev.pid"
LOGFILE="/tmp/npm-run-dev.log"
FRONTEND_DIR="/home/msf_bennett/studio.dev/oshocks/frontend"

case "$1" in
  start)
    if [ -f "$PIDFILE" ] && kill -0 $(cat "$PIDFILE") 2>/dev/null; then
      echo "npm run dev is already running (PID: $(cat $PIDFILE))"
      exit 0
    fi
    echo "Starting npm run dev on http://localhost:3000..."
    cd "$FRONTEND_DIR" || exit 1
    nohup npm run dev -- --port 3000 > "$LOGFILE" 2>&1 &
    echo $! > "$PIDFILE"
    sleep 3
    echo "Started (PID: $(cat $PIDFILE))"
    ;;
  stop)
    if [ -f "$PIDFILE" ] && kill -0 $(cat "$PIDFILE") 2>/dev/null; then
      echo "Stopping npm run dev (PID: $(cat $PIDFILE))..."
      kill $(cat "$PIDFILE") 2>/dev/null
      rm -f "$PIDFILE"
      echo "Stopped"
    else
      echo "npm run dev is not running"
      rm -f "$PIDFILE"
    fi
    ;;
  status)
    if [ -f "$PIDFILE" ] && kill -0 $(cat "$PIDFILE") 2>/dev/null; then
      echo "Running (PID: $(cat $PIDFILE)) — http://localhost:3000"
    else
      echo "Not running"
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
      echo "No log file found"
    fi
    ;;
  clear)
    echo "Clearing npm run dev cache and logs..."
    rm -f "$PIDFILE"
    rm -f "$LOGFILE"
    cd "$FRONTEND_DIR" || exit 1
    rm -rf node_modules/.vite
    rm -rf node_modules/.cache
    echo "Cache cleared"
    ;;
  *)
    echo "Usage: npm run dev {start|stop|status|restart|logs|clear}"
    exit 1
    ;;
esac
