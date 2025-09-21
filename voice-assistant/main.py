import os
import json
import uvicorn
import google.generativeai as genai
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import Response
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- Configuration ---
PORT = int(os.getenv("PORT", "8080"))
DOMAIN = os.getenv("NGROK_URL") 
if not DOMAIN:
    raise ValueError("NGROK_URL environment variable not set.")
WS_URL = f"wss://{DOMAIN}/ws"

# Updated greeting to reflect the new model
WELCOME_GREETING = "Hi! I am Sprout's AI voice assistant powered by Google Gemini. I can help you with grocery forecasting, inventory management, and store analytics. Ask me anything!"

# System prompt for Gemini - specialized for grocery forecasting
SYSTEM_PROMPT = """You are Sprout's AI voice assistant, specialized in grocery forecasting and inventory management. This conversation is happening over a phone call or voice interface, so your responses will be spoken aloud. 

You help users with:
- Grocery demand forecasting
- Inventory management advice
- Product expiration tracking
- Sales analytics insights
- Supply chain optimization
- Seasonal demand patterns
- Promotional impact analysis

Please adhere to the following rules:
1. Provide clear, concise, and direct answers focused on grocery retail operations.
2. Spell out all numbers (e.g., say 'one thousand two hundred' instead of 1200).
3. Do not use any special characters like asterisks, bullet points, or emojis.
4. Keep the conversation natural and engaging.
5. Focus on practical advice for grocery store operations.
6. When discussing data, explain it in business terms that store managers can understand."""

# --- Gemini API Initialization ---
# Get your Google API key from https://aistudio.google.com/app/apikey
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if not GOOGLE_API_KEY:
    raise ValueError("GOOGLE_API_KEY environment variable not set.")

genai.configure(api_key=GOOGLE_API_KEY)

# Configure the Gemini model. We pass the system prompt during initialization.
# gemini-2.5-flash is a fast and capable model suitable for this use case.
model = genai.GenerativeModel(
    model_name='gemini-2.5-flash',
    system_instruction=SYSTEM_PROMPT
)

# Store active chat sessions
# We will now store Gemini's chat session objects
sessions = {}

# Create FastAPI app
app = FastAPI()

async def gemini_response(chat_session, user_prompt):
    """Get a response from the Gemini API and stream it."""
    response = await chat_session.send_message_async(user_prompt)
    return response.text

@app.post("/twiml")
async def twiml_endpoint():
    """Endpoint that returns TwiML for Twilio to connect to the WebSocket"""
    # Note: Twilio ConversationRelay has built-in TTS. We specify a provider and voice.
    # You can change 'ElevenLabs' to 'Amazon' or 'Google' if you prefer their TTS.
    xml_response = f"""<?xml version="1.0" encoding="UTF-8"?>
    <Response>
    <Connect>
    <ConversationRelay url="{WS_URL}" welcomeGreeting="{WELCOME_GREETING}" ttsProvider="ElevenLabs" voice="FGY2WhTYpPnrIDTdsKH5" />
    </Connect>
    </Response>"""
    
    return Response(content=xml_response, media_type="text/xml")

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """WebSocket endpoint for real-time communication"""
    await websocket.accept()
    call_sid = None
    
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            if message["type"] == "setup":
                call_sid = message["callSid"]
                print(f"Setup for call: {call_sid}")
                # Start a new chat session for this call
                sessions[call_sid] = model.start_chat(history=[])
                
            elif message["type"] == "prompt":
                if not call_sid or call_sid not in sessions:
                    print(f"Error: Received prompt for unknown call_sid {call_sid}")
                    continue

                user_prompt = message["voicePrompt"]
                print(f"Processing prompt: {user_prompt}")
                
                chat_session = sessions[call_sid]
                response_text = await gemini_response(chat_session, user_prompt)
                
                # The chat_session object automatically maintains history.
                
                # Send the complete response back to Twilio.
                # Twilio's ConversationRelay will handle the text-to-speech conversion.
                await websocket.send_text(
                    json.dumps({
                        "type": "text",
                        "token": response_text,
                        "last": True  # Indicate this is the full and final message
                    })
                )
                print(f"Sent response: {response_text}")
                
            elif message["type"] == "interrupt":
                print(f"Handling interruption for call {call_sid}.")
                
            else:
                print(f"Unknown message type received: {message['type']}")
                
    except WebSocketDisconnect:
        print(f"WebSocket connection closed for call {call_sid}")
        if call_sid in sessions:
            sessions.pop(call_sid)
            print(f"Cleared session for call {call_sid}")

@app.get("/")
async def root():
    """Health check endpoint"""
    return {"message": "Sprout Voice Assistant API is running", "status": "healthy"}

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "service": "Sprout Voice Assistant",
        "version": "1.0.0",
        "websocket_url": WS_URL,
        "active_sessions": len(sessions)
    }

if __name__ == "__main__":
    print(f"Starting Sprout Voice Assistant server on port {PORT}")
    print(f"WebSocket URL for Twilio: {WS_URL}")
    print("Make sure to set up your .env file with GOOGLE_API_KEY and NGROK_URL")
    uvicorn.run(app, host="0.0.0.0", port=PORT)
