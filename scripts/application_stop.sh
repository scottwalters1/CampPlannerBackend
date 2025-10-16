# #!/bin/bash
# pgrep -l -f "node src/app.js" | cut -d ' ' -f 1 | xargs sudo kill

echo "Stopping Node.js app..."

# Find PID(s) of Node app
PIDS=$(pgrep -f "node src/app.js")

if [ -n "$PIDS" ]; then
  echo "Killing process(es): $PIDS"
  echo "$PIDS" | xargs -r sudo kill
  echo "Process(es) stopped."
else
  echo "No Node.js process found. Nothing to stop."
fi

exit 0