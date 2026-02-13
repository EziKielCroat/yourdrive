#!/bin/bash
# NEXA Core / YourDrive - quick setup for self-hosting with Docker

set -e

echo "🚀 NEXA Core - Docker setup"
echo ""

if ! command -v docker &> /dev/null; then
  echo "❌ Docker not found. Please install Docker first."
  exit 1
fi

if ! command -v docker compose &> /dev/null && ! command -v docker-compose &> /dev/null; then
  echo "❌ Docker Compose not found. Please install Docker Compose first."
  exit 1
fi

if [ -f .env ]; then
  echo "⚠️  .env already exists. Skipping generation."
else
  JWT_ACCESS_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change-me-in-production")
  JWT_REFRESH_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "change-me-in-production")
  DB_PASSWORD=$(openssl rand -base64 24 2>/dev/null || echo "changeme")

  cat > .env << EOF
DB_PASSWORD=$DB_PASSWORD
JWT_ACCESS_SECRET=$JWT_ACCESS_SECRET
JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:3001
B2_ENDPOINT=
B2_REGION=
B2_BUCKET_NAME=
B2_KEY_ID=
B2_APPLICATION_KEY=
EOF
  echo "✅ Generated .env file"
fi

echo ""
echo "⚠️  Edit .env and set your S3/Backblaze B2 credentials (B2_* variables)."
echo ""
echo "To start NEXA Core:"
echo "  1. Edit .env with your B2/S3 and secrets"
echo "  2. Run: docker compose up -d"
echo "  3. Run migrations (first time): docker compose exec backend npx prisma migrate deploy"
echo "  4. Visit: http://localhost:3000"
echo ""
