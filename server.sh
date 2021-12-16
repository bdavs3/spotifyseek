#!/bin/bash 

# Delete all the mp3 artifacts.
find ./* -name "*.mp3" -type f -delete

export USERNAME="$1"
export PW="$2"

cd server
node index.js
