#!/bin/bash

# MSF Bennett Interactive Tree Preview
# Usage: msf bennett tree -L 5 --preview

DEPTH=5
PREVIEW=false

# Parse arguments
while [ $# -gt 0 ]; do
    case "$1" in
        -L)
            if [ -n "$2" ] && [ "$2" -eq "$2" ] 2>/dev/null; then
                DEPTH="$2"
                shift 2
            else
                echo "Error: -L requires a number (e.g., -L 5)"
                exit 1
            fi
            ;;
        --preview)
            PREVIEW=true
            shift 1
            ;;
        *)
            shift 1
            ;;
    esac
done

# Detect project from current directory
CURRENT_DIR=$(pwd)
if [[ "$CURRENT_DIR" == *"oshocks"* ]]; then
    PROJECT="oshocks"
    PROJECT_DIR="$HOME/studio.dev/oshocks"
elif [[ "$CURRENT_DIR" == *"bennett 065"* ]]; then
    PROJECT="bennett-065"
    PROJECT_DIR="$HOME/studio.dev/bennett 065"
else
    echo "Error: Not in a recognized project directory"
    exit 1
fi

if [ "$PREVIEW" = false ]; then
    echo "Usage: msf bennett tree -L <depth> --preview"
    exit 1
fi

echo "📁 $PROJECT Interactive Tree Preview (Depth: $DEPTH)"
echo "=================================================="
echo ""
echo "Controls:"
echo "  Enter     - Expand/collapse directory"
echo "  ↑/↓       - Navigate"
echo "  /         - Search"
echo "  q/Esc     - Quit"
echo ""

# Use fzf to create interactive tree
cd "$PROJECT_DIR" || exit 1

# Generate tree data with markers for directories
eza --tree -L "$DEPTH" \
    -I 'node_modules|dist|build|vendor|.git|storage|*.sqlite|.cache|.vite' \
    --total-size -h --color=always | \
fzf \
    --ansi \
    --header="📁 $PROJECT Tree (Depth: $DEPTH) | Enter: toggle | q: quit" \
    --preview='echo "📂 Directory Preview" && echo "" && ls -la {} 2>/dev/null || echo "File: {}"' \
    --preview-window=right:50% \
    --bind='enter:execute(echo "Toggled: {}" && sleep 0.5)' \
    --bind='q:abort' \
    --no-multi \
    --layout=reverse-list

echo ""
echo "=================================================="
echo "✅ Preview closed"