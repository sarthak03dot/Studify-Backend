#!/bin/bash
EMAIL="testuser_$(date +%s)@example.com"
PASSWORD="password123"

# 1. Register
echo "Registering user $EMAIL..."
REGISTER_RES=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

# Extract token or login if register returns token
TOKEN=$(echo $REGISTER_RES | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo "Register didn't return token, trying login..."
    TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$EMAIL\", \"password\":\"$PASSWORD\"}" | jq -r '.token')
fi

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "Authentication failed."
  exit 1
fi

echo "Auth successful. Token: ${TOKEN:0:10}..."

# 2. Post Question
echo "Posting question..."
curl -v -X POST http://localhost:5000/api/questions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Question Automated", "description":"Testing fix via script", "difficulty":"Easy", "tags":["test"]}'
