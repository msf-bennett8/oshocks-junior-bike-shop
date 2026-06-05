# 🚀 MSF Bennett Development Commands Reference

## Quick Start
msf bennett start oshocks dev      # Start all servers in tmux
msf bennett stop oshocks dev       # Stop all servers
msf bennett restart oshocks dev    # Stop → Clear → Start
msf bennett status oshocks dev     # Check server status
msf bennett logs oshocks dev       # Tail all logs
msf bennett clear oshocks dev      # Clear all caches
msf bennett attach oshocks dev     # Attach to tmux session

## Tree Commands
msf bennett tree                   # Default depth 5, terminal output
msf bennett tree -L 3              # Depth 3, terminal 
msf bennett tree -L 5 make file    # Save tree to 

# PROJECT-TREE-SNAPSHOT.md
msf bennett tree -L 5 --preview    # Interactive collapsible preview

# Interactive Preview Controls
↑ / ↓ — Navigate tree
Enter — Preview directory contents
/ — Search/filter
q / Esc — Quit preview

## TMUX Session Management
tmux ls                            # List tmux sessions
tmux attach -t oshocks-dev         # Attach to oshocks session
tmux kill-session -t oshocks-dev   # Kill oshocks session
tmux kill-server                   # Kill all tmux sessions

# Inside tmux:
Ctrl + B, then D — Detach (keep session running)
Ctrl + B, then [ — Enter scroll mode (use arrows/PgUp/PgDn)
q — Exit scroll mode
Ctrl + C — Stop servers and exit tmux

## Individual Server Controls
# MariaDB
mariadb control.sh start           # Start MariaDB
mariadb control.sh stop            # Stop MariaDB
mariadb control.sh status          # Check MariaDB status
mariadb control.sh restart         # Restart MariaDB
mariadb control.sh clear           # Clear MariaDB caches

# PHP Artisan Serve
php artisan serve start            # Start PHP server
php artisan serve stop             # Stop PHP server
php artisan serve status           # Check PHP status
php artisan serve clear            # Clear PHP caches

# npm run dev
npm run dev start                  # Start npm dev server
npm run dev stop                   # Stop npm dev server
npm run dev status                 # Check npm status
npm run dev clear                  # Clear npm cache
npm run dev logs                   # Tail npm logs

## Project Structure
~/studio.dev/
├── oshocks/                       # Main project (PHP + React)
│   ├── backend/                   # Laravel PHP backend
│   │   └── scripts/
│   │       ├── mariadb-control    # MariaDB control
│   │       └── php-artisan-serve  # PHP server control
│   ├── frontend/                  # React/Vite frontend
│   │   └── scripts/
│   │       └── npm-run-dev.sh     # npm dev control
│   └── scripts/
│       ├── oshocks-control.sh     # Main controller
│       ├── tmux-oshocks-start.sh  # Tmux starter
│       ├── project-tree.sh        # Tree snapshot generator
│       ├── project-tree-preview.sh # Interactive tree preview
│       └── tree-with-paths.sh     # Tree path helper
│
├── bennett 065/                   # Frontend only project
│   └── frontend/                  # Vite React app
│
└── silicon swimming ducks/        # Multiple projects


## Important Files

~/.bashrc                          # Shell config (PATH, aliases, functions)
~/.tmux.conf                       # Tmux config (mouse, scroll, keys)
/etc/sudoers                       # Sudo permissions (no password for MariaDB)
~/studio.dev/oshocks/scripts/oshocks-control.sh    # Main msf controller

## Windows Terminal Settings
Ctrl + , — Open settings
Ctrl + Shift + , — Open settings.json
Confirm before closing tabs enabled
Default profile: Arch WSL
Starting directory: ~/studio.dev/oshocks

# Session Restore
Terminal restores last directory on reopen
.lastdir file saves current directory
Tmux sessions survive terminal closes

## Tips
1. Always use `msf bennett` commands — they handle everything
2. Servers run in tmux by default — safe to close terminal
3. Use `msf bennett attach` to view running servers
4. Port 3000 is forced for npm (auto-fallback to 3001 if busy)
5. MariaDB runs without sudo password (configured in sudoers)
6. Use `msf bennett tree --preview` for interactive file exploration
7. `make file` saves tree output to markdown for documentation



