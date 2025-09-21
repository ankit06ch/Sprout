# 🎤 Sprout Voice Assistant Setup Guide

Your voice assistant integration is now ready! Here's how to get everything running:

## ✅ What's Already Configured

- ✅ **Google Gemini API Key**: Configured with your API key
- ✅ **Python Dependencies**: Installed in virtual environment
- ✅ **FastAPI Server**: Ready to run on port 8080
- ✅ **React Integration**: Voice assistant components updated
- ✅ **WebSocket Service**: Frontend service ready to connect

## 🚀 Quick Start

### 1. Start the Voice Assistant Backend

```bash
# Navigate to voice assistant directory
cd voice-assistant

# Start the server (this will run in the background)
./start.sh
```

**Expected Output:**
```
🚀 Starting Sprout Voice Assistant...
✅ Environment configured
🌐 Starting server on port 8080
🔗 WebSocket URL: ws://localhost:8080/ws
📊 Health check: http://localhost:8080/health
```

### 2. Start the Frontend Application

```bash
# In a new terminal, navigate to project root
cd /Users/siddharthdhanasekar/Desktop/Sprout

# Start the React development server
npm run dev
```

### 3. Test the Voice Assistant

1. **Open your browser** to `http://localhost:3001` (or whatever port Vite shows)
2. **Navigate to the dashboard** and click on any voice assistant button
3. **Click "Start Voice Call"** to connect to the voice assistant
4. **Try the sample questions** or use the voice controls

## 🔧 Configuration Options

### Voice Assistant URL Configuration

If you need to change the voice assistant URL, edit:
```
src/config/voiceAssistant.ts
```

Update the `WEBSOCKET_URL`:
```typescript
export const VOICE_ASSISTANT_CONFIG = {
  WEBSOCKET_URL: 'ws://localhost:8080/ws', // Change this if needed
  // ... other config
};
```

### Environment Variables (Optional)

Create a `.env.local` file in the project root for custom configuration:
```env
VITE_VOICE_ASSISTANT_URL=ws://localhost:8080/ws
```

## 📱 Features Available

### Voice Assistant Capabilities
- **Grocery Forecasting Questions**: Ask about demand prediction
- **Inventory Management**: Get advice on stock optimization  
- **Waste Reduction**: Learn about minimizing food waste
- **Analytics Insights**: Understand sales data and trends
- **Seasonal Patterns**: Learn about seasonal demand fluctuations

### Sample Questions You Can Ask
- "What is Sprout and how does it help grocery stores?"
- "How does demand forecasting work in Sprout?"
- "What waste reduction features does Sprout offer?"
- "Tell me about Sprout's analytics dashboard capabilities"

## 🌐 Twilio Integration (Optional)

To enable phone call functionality:

### 1. Set up ngrok
```bash
# Install ngrok if not already installed
brew install ngrok

# Start ngrok tunnel
ngrok http 8080
```

### 2. Update Environment
Copy the ngrok HTTPS URL and update `voice-assistant/.env`:
```env
NGROK_URL=your-ngrok-subdomain.ngrok-free.app
```

### 3. Configure Twilio Webhook
In your Twilio console, set the webhook URL to:
```
https://your-ngrok-subdomain.ngrok-free.app/twiml
```

## 🐛 Troubleshooting

### Voice Assistant Not Connecting
1. **Check if backend is running**: Visit `http://localhost:8080/health`
2. **Check browser console** for WebSocket connection errors
3. **Verify URL configuration** in `src/config/voiceAssistant.ts`

### Backend Server Issues
1. **Check Python virtual environment**: Make sure you're in the `venv`
2. **Verify API key**: Check `.env` file has correct Google API key
3. **Check port availability**: Make sure port 8080 is not in use

### Frontend Build Errors
1. **Clear cache**: `npm run dev -- --force`
2. **Check imports**: Verify all voice assistant imports are correct
3. **Restart dev server**: Stop and restart `npm run dev`

## 📊 Testing the Integration

### Health Check
```bash
curl http://localhost:8080/health
```

### WebSocket Test
```javascript
// Test in browser console
const ws = new WebSocket('ws://localhost:8080/ws');
ws.onopen = () => console.log('Connected!');
ws.onmessage = (event) => console.log('Message:', event.data);
```

## 🎯 Next Steps

1. **Test the voice assistant** with sample questions
2. **Customize responses** by modifying the system prompt in `main.py`
3. **Add more features** by extending the FastAPI endpoints
4. **Deploy to production** when ready

## 📚 Documentation

- **Backend API**: See `voice-assistant/README.md`
- **Frontend Service**: See `src/services/voiceAssistantService.ts`
- **Configuration**: See `src/config/voiceAssistant.ts`

---

🎉 **Your Sprout Voice Assistant is ready to use!** 

Try asking it about grocery forecasting, inventory management, or any other Sprout features!
