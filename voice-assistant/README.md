# Sprout Voice Assistant

AI-powered voice assistant for Sprout's grocery forecasting platform, built with Google Gemini and Twilio integration.

## Features

- **Google Gemini Integration**: Powered by Google's latest Gemini 2.5 Flash model
- **Twilio Voice Support**: Full phone call integration with Twilio
- **WebSocket Communication**: Real-time bidirectional communication
- **Specialized for Grocery Retail**: Tailored responses for inventory management, demand forecasting, and analytics
- **FastAPI Backend**: Modern Python web framework for robust API handling

## Quick Start

### 1. Prerequisites

- Python 3.8 or higher
- Google API Key from [Google AI Studio](https://aistudio.google.com/app/apikey)
- ngrok account for public URL tunneling
- Twilio account (optional, for phone calls)

### 2. Installation

```bash
# Navigate to voice assistant directory
cd voice-assistant

# Install dependencies
pip install -r requirements.txt

# Copy environment file and configure
cp env.example .env
```

### 3. Configuration

Edit the `.env` file with your credentials:

```env
# Required
GOOGLE_API_KEY="your_google_api_key_here"
NGROK_URL="your_ngrok_subdomain.ngrok-free.app"

# Optional
PORT="8080"
TWILIO_ACCOUNT_SID="your_twilio_sid"
TWILIO_AUTH_TOKEN="your_twilio_token"
TWILIO_PHONE_NUMBER="your_twilio_number"
```

### 4. Running the Server

```bash
# Start the voice assistant server
python main.py
```

The server will start on `http://localhost:8080` (or your configured PORT).

### 5. Setting up ngrok (for Twilio integration)

```bash
# Install ngrok (if not already installed)
# Download from https://ngrok.com/download

# Start ngrok tunnel
ngrok http 8080

# Copy the https URL (e.g., https://abc123.ngrok-free.app)
# Update your .env file with just the subdomain: abc123.ngrok-free.app
```

### 6. Twilio Configuration (Optional)

If you want to enable phone call functionality:

1. **Create a Twilio Webhook**: In your Twilio console, set up a webhook pointing to:
   ```
   https://your-ngrok-url.ngrok-free.app/twiml
   ```

2. **Test the Integration**: Call your Twilio number to test the voice assistant.

## API Endpoints

### WebSocket Connection
- **URL**: `ws://localhost:8080/ws`
- **Purpose**: Real-time communication with voice assistant
- **Protocol**: JSON messages

### REST Endpoints

#### Health Check
```http
GET /health
```
Returns server status and active session count.

#### TwiML Endpoint (for Twilio)
```http
POST /twiml
```
Returns TwiML configuration for Twilio voice calls.

## WebSocket Message Format

### Outgoing Messages (Client → Server)

**Setup Message:**
```json
{
  "type": "setup",
  "callSid": "unique_session_id"
}
```

**Voice Prompt:**
```json
{
  "type": "prompt",
  "voicePrompt": "What is demand forecasting?"
}
```

### Incoming Messages (Server → Client)

**Assistant Response:**
```json
{
  "type": "text",
  "token": "Response from Gemini AI",
  "last": true
}
```

## Frontend Integration

The voice assistant integrates with the React frontend through the `VoiceAssistantService`:

```typescript
import { voiceAssistantService } from '../services/voiceAssistantService';

// Initialize session
await voiceAssistantService.initializeSession();

// Send voice prompt
await voiceAssistantService.sendVoicePrompt("How does forecasting work?");

// Handle responses
voiceAssistantService.setCallbacks({
  onMessage: (message) => console.log(message),
  onError: (error) => console.error(error),
  onStatus: (status) => console.log(status)
});
```

## Specialized for Grocery Retail

The voice assistant is specifically trained to help with:

- **Demand Forecasting**: Explain how AI predicts product demand
- **Inventory Management**: Provide advice on stock optimization
- **Waste Reduction**: Suggest strategies to minimize food waste
- **Analytics Insights**: Interpret sales data and trends
- **Seasonal Patterns**: Understand seasonal demand fluctuations
- **Promotional Impact**: Analyze the effects of sales and promotions

## Development

### Project Structure
```
voice-assistant/
├── main.py              # FastAPI server
├── requirements.txt     # Python dependencies
├── .env.example        # Environment template
├── .gitignore          # Git ignore rules
└── README.md           # This file
```

### Adding New Features

1. **Extend System Prompt**: Modify the `SYSTEM_PROMPT` in `main.py` to add new capabilities
2. **Add New Endpoints**: Create new FastAPI routes for additional functionality
3. **Enhance Frontend**: Update the React components to use new features

### Testing

```bash
# Test WebSocket connection
python -c "
import asyncio
import websockets
import json

async def test():
    uri = 'ws://localhost:8080/ws'
    async with websockets.connect(uri) as websocket:
        # Send setup message
        await websocket.send(json.dumps({'type': 'setup', 'callSid': 'test123'}))
        # Send prompt
        await websocket.send(json.dumps({'type': 'prompt', 'voicePrompt': 'Hello'}))
        # Receive response
        response = await websocket.recv()
        print(response)

asyncio.run(test())
"
```

## Troubleshooting

### Common Issues

1. **"NGROK_URL environment variable not set"**
   - Make sure your `.env` file has the correct ngrok URL
   - Ensure ngrok is running and accessible

2. **"GOOGLE_API_KEY environment variable not set"**
   - Get your API key from Google AI Studio
   - Add it to your `.env` file

3. **WebSocket connection failed**
   - Check if the server is running
   - Verify the WebSocket URL is correct
   - Check firewall settings

4. **Twilio integration not working**
   - Verify ngrok URL is accessible from the internet
   - Check Twilio webhook configuration
   - Ensure TwiML endpoint is responding correctly

### Debug Mode

Enable debug logging by setting environment variable:
```bash
export DEBUG=1
python main.py
```

## Security Notes

- Never commit your `.env` file to version control
- Keep your Google API key secure
- Use HTTPS in production environments
- Implement rate limiting for production use
- Consider authentication for WebSocket connections

## Production Deployment

For production deployment:

1. Use a proper web server like Gunicorn with Uvicorn workers
2. Set up proper SSL certificates
3. Configure environment variables securely
4. Implement logging and monitoring
5. Set up health checks and auto-restart
6. Use a reverse proxy like Nginx

Example Gunicorn command:
```bash
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker -b 0.0.0.0:8080
```
