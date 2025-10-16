#!/bin/bash
cd /home/ubuntu/campplanner-backend

# Export NODE_ENV so your app knows it’s production
export NODE_ENV=production

# Run the app with nohup and log output
nohup node src/app.js > app.log 2>&1 &
echo "App started in background. Logs: /home/ubuntu/campplanner-backend/app.log"