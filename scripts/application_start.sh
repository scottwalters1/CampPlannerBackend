cd /home/ubuntu/campplanner-backend
pkill -f "node src/app.js" || true

export NODE_ENV=production

nohup node src/app.js > app.log 2>&1 &
echo "App started with NODE_ENV=$NODE_ENV"