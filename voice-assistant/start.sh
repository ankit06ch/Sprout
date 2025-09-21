#!/bin/bash
# Sprout Voice Assistant Startup Script

echo "🚀 Starting Sprout Voice Assistant..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "   Please run configure.py first to create the environment file"
    exit 1
fi

# Load environment variables
source .env

# Check if required variables are set
if [ -z "$GOOGLE_API_KEY" ] || [ "$GOOGLE_API_KEY" = "YOUR_GOOGLE_API_KEY_HERE" ]; then
    echo "❌ Error: GOOGLE_API_KEY not configured in .env file"
    echo "   Please get your API key from: https://aistudio.google.com/app/apikey"
    exit 1
fi

if [ -z "$NGROK_URL" ] || [ "$NGROK_URL" = "xxxxxxxx.ngrok-free.app" ]; then
    echo "⚠️  Warning: NGROK_URL not configured"
    echo "   Voice assistant will work locally but Twilio integration won't work"
    echo "   To enable Twilio: run 'ngrok http 8080' and update NGROK_URL in .env"
fi

echo "✅ Environment configured"
echo "🌐 Starting server on port ${PORT:-8080}"
echo "🔗 WebSocket URL: ws://localhost:${PORT:-8080}/ws"
echo "📊 Health check: http://localhost:${PORT:-8080}/health"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Activate virtual environment and start the server
source venv/bin/activate
python main.py
