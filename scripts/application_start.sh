#!/bin/bash
cd /home/ubuntu/campplanner-backend
nohup node src/app.js > /dev/null 2>&1 &
