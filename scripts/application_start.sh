cd /home/ubuntu/campplanner-backend
# Kill old app if still running
pkill -f "node src/app.js" || true

# Set environment variable
export NODE_ENV=production

# Start the app
nohup node src/app.js > app.log 2>&1 &
echo "App started with NODE_ENV=$NODE_ENV"