#!/bin/bash

# MSF Bennett Project Tree Snapshot
# Usage: msf bennett tree [-L <depth>] [make file]

DEPTH=5  # Default depth
MAKE_FILE=false

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
        make)
            if [ "$2" = "file" ]; then
                MAKE_FILE=true
                shift 2
            else
                shift 1
            fi
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
    echo "Current: $CURRENT_DIR"
    echo "Available: oshocks, bennett-065"
    exit 1
fi

# Count files and directories (excluding ignored paths)
TOTAL_FILES=$(find "$PROJECT_DIR" -type f \
    -not -path '*/node_modules/*' \
    -not -path '*/dist/*' \
    -not -path '*/build/*' \
    -not -path '*/vendor/*' \
    -not -path '*/.git/*' \
    -not -path '*/storage/*' \
    -not -name '*.sqlite' \
    -not -name '.cache' \
    -not -name '.vite' | wc -l)

TOTAL_DIRS=$(find "$PROJECT_DIR" -type d \
    -not -path '*/node_modules/*' \
    -not -path '*/dist/*' \
    -not -path '*/build/*' \
    -not -path '*/vendor/*' \
    -not -path '*/.git/*' \
    -not -path '*/storage/*' | wc -l)

if [ "$MAKE_FILE" = true ]; then
    # Save to file (no colors, plain text)
    OUTPUT_FILE="$PROJECT_DIR/PROJECT-TREE-SNAPSHOT.md"
    {
        echo "# 📁 $PROJECT Project Tree Snapshot"
        echo ""
        echo "**Generated:** $(date)"
        echo "**Depth:** $DEPTH levels"
        echo "**Project:** $PROJECT"
        echo ""
        echo "---"
        echo ""
        echo '```'
        cd "$PROJECT_DIR" && eza --tree -L "$DEPTH" \
            -I 'node_modules|dist|build|vendor|.git|storage|*.sqlite|.cache|.vite' \
            --total-size -h --color=never
        echo '```'
        echo ""
        echo "---"
        echo ""
        echo "## 📊 Summary"
        echo ""
        echo "- **Total Files:** $TOTAL_FILES"
        echo "- **Total Directories:** $TOTAL_DIRS"
        echo "- **Depth:** $DEPTH levels"
    } > "$OUTPUT_FILE"
    
    echo "✅ Tree snapshot saved to: $OUTPUT_FILE"
    echo "   Files: $TOTAL_FILES"
    echo "   Directories: $TOTAL_DIRS"
else
    # Print to terminal WITH COLORS
    echo "📁 $PROJECT Project Tree (Depth: $DEPTH)"
    echo "=================================================="
    echo ""
    cd "$PROJECT_DIR" && eza --tree -L "$DEPTH" \
        -I 'node_modules|dist|build|vendor|.git|storage|*.sqlite|.cache|.vite' \
        --total-size -h --color=always
    echo ""
    echo "=================================================="
    echo "📊 Summary: $TOTAL_FILES files, $TOTAL_DIRS directories"
    echo "✅ Tree complete - $PROJECT"
fi