#!/usr/bin/env python3
"""
Configuration script for Sprout Voice Assistant
This script sets up the environment file with your API keys.
"""

import os

def create_env_file():
    """Create .env file with the provided API keys"""
    env_content = '''# AI Voice Assistant Configuration

# Get your Google API Key from Google AI Studio: https://aistudio.google.com/app/apikey
GOOGLE_API_KEY="AIzaSyCarZ-m6iq4zoP76rbxY7cMo2dcgceIH2s"

# Your ngrok public URL (without https://) - Get this by running: ngrok http 8080
NGROK_URL="xxxxxxxx.ngrok-free.app"

# Server Configuration
PORT="8080"

# Twilio Configuration (optional - for phone calls)
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_PHONE_NUMBER="your_twilio_phone_number"

# Firebase Configuration (already exists in your project)
FIREBASE_API_KEY="AIzaSyCDPhq7LE3IiQTYVxlKBgxS4lJQLUSl-kM"
FIREBASE_AUTH_DOMAIN="sprout-2b8b6.firebaseapp.com"
FIREBASE_PROJECT_ID="sprout-2b8b6"
FIREBASE_STORAGE_BUCKET="sprout-2b8b6.firebasestorage.app"
FIREBASE_MESSAGING_SENDER_ID="56991574661"
FIREBASE_APP_ID="1:56991574661:web:dc322e37fa7e2c9e6957ec"
'''
    
    with open('.env', 'w') as f:
        f.write(env_content)
    
    print("✅ Created .env file with your Google API key")
    print("⚠️  You still need to:")
    print("   1. Run 'ngrok http 8080' to get your public URL")
    print("   2. Update NGROK_URL in the .env file with your ngrok subdomain")

def main():
    print("🔧 Configuring Sprout Voice Assistant...")
    create_env_file()
    print("\n🎉 Configuration complete!")
    print("\n📋 Next steps:")
    print("   1. Install dependencies: pip install -r requirements.txt")
    print("   2. Set up ngrok: ngrok http 8080")
    print("   3. Update NGROK_URL in .env file")
    print("   4. Run: python main.py")

if __name__ == "__main__":
    main()
