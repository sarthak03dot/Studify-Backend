#!/bin/bash
EMAIL="testuser_res_$(date +%s)@example.com"
PASSWORD="password123"

# 1. Register
echo "Registering user $EMAIL..."
# Capture both stdout and stderr (verbose) but we need the body for parsing.
# We'll rely on the previous logic but maybe the server error didn't output JSON.
REGISTER_RES=$(curl -s -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Test User\",\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")

echo "Register Response: $REGISTER_RES"

TOKEN=$(echo $REGISTER_RES | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "Auth failed. Trying login..."
   REGISTER_RES=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL\",\"password\":\"$PASSWORD\"}")
  TOKEN=$(echo $REGISTER_RES | jq -r '.token')
fi

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo "Still failed."
    exit 1
fi

echo "Auth successful. Token: ${TOKEN:0:10}..."

# 2. Upload Resource
echo "Uploading resource..."
curl -v -X POST http://localhost:5000/api/resources \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Resource",
    "description": "Resource description",
    "type": "note",
    "branch": "CSE",
    "subject": "Math",
    "year": 1,
    "fileUrl": "https://example.com/file.pdf"
  }'

# 3. Get Resources
echo -e "\nGetting resources..."
curl -v http://localhost:5000/api/resources
