#!/bin/bash
FILE_PATH=`dirname "$0"`
LOG_PATH=$FILE_PATH/..
timestamp=`date +%Y/%m/%d-%H:%M`
echo "[$timestamp]: [APIS]: npm start..." >> "$LOG_PATH/systemlog"
cd $LOG_PATH
npm start &