#!/bin/bash
echo "Stopping Node.js app..."

PIDS=$(pgrep -f "node src/app.js")

if [ -n "$PIDS" ]; then
  echo "Killing process(es): $PIDS"
  for PID in $PIDS; do
    /bin/kill "$PID"
    echo "Killed PID $PID"
  done
else
  echo "No Node.js process found. Nothing to stop."
fi

exit 0