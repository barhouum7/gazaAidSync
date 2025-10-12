#!/bin/bash
LOG_FILE="$HOME/pm2-startup.log"
PROJECT_DIR="$HOME/htdocs/www.gaza.family"

{
  echo "[$(date)] Running PM2 startup check..."

  # Load NVM and Node environment
  export NVM_DIR="$HOME/.nvm"
  [ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
  [ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

  # Ensure Node is in PATH
  export PATH="$HOME/.nvm/versions/node/v22.20.0/bin:$PATH"

  cd "$PROJECT_DIR"

  # Start PM2 daemon if not running
  if ! pm2 ping >/dev/null 2>&1; then
    echo "[$(date)] PM2 daemon not running. Starting PM2 and restoring processes..."
    pm2 resurrect --update-env
  else
    echo "[$(date)] PM2 already running."
  fi

  # Ensure process list is saved (optional safeguard)
  pm2 save
} >> "$LOG_FILE" 2>&1
