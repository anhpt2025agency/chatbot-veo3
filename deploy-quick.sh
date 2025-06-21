#!/bin/bash

# ChatBot VEO3 - Quick Deploy Script
# Sử dụng: ./deploy-quick.sh [development|production]

set -e

MODE=${1:-development}
echo "🚀 Deploying ChatBot VEO3 in $MODE mode..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose not installed. Please install Docker Compose first."
    exit 1
fi

# Generate NEXTAUTH_SECRET if not exists
if [ ! -f .env.local ]; then
    echo "📝 Creating .env.local file..."
    cp env.example .env.local
    
    # Generate random secret
    SECRET=$(openssl rand -base64 32 2>/dev/null || date | md5sum | head -c 32)
    echo "NEXTAUTH_SECRET=$SECRET" >> .env.local
    echo "✅ Generated NEXTAUTH_SECRET"
fi

# Deploy based on mode
if [ "$MODE" = "production" ]; then
    echo "🏭 Starting production deployment with PostgreSQL..."
    docker-compose --profile production up -d --build
elif [ "$MODE" = "development" ]; then
    echo "🔧 Starting development deployment with SQLite..."
    docker-compose up -d --build
else
    echo "❌ Invalid mode. Use 'development' or 'production'"
    exit 1
fi

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ ChatBot VEO3 is running!"
    echo ""
    echo "🌐 Access the application:"
    echo "   → Local: http://localhost:3000"
    echo ""
    echo "📚 Useful commands:"
    echo "   → View logs: docker-compose logs -f"
    echo "   → Stop: docker-compose down"
    echo "   → Restart: docker-compose restart"
    echo ""
    echo "🔑 Don't forget to:"
    echo "   1. Set up your API keys at /auth/signin"
    echo "   2. Configure Gemini, OpenAI, or Claude API keys"
    echo "   3. Test the script writer functionality"
else
    echo "❌ Failed to start services. Check logs with: docker-compose logs"
    exit 1
fi 