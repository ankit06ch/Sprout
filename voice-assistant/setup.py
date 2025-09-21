#!/usr/bin/env python3
"""
Setup script for Sprout Voice Assistant
This script helps set up the voice assistant environment and dependencies.
"""

import os
import sys
import subprocess
import shutil
from pathlib import Path

def check_python_version():
    """Check if Python version is compatible"""
    if sys.version_info < (3, 8):
        print("❌ Error: Python 3.8 or higher is required")
        print(f"   Current version: {sys.version}")
        return False
    print(f"✅ Python version: {sys.version.split()[0]}")
    return True

def check_pip():
    """Check if pip is available"""
    try:
        import pip
        print("✅ pip is available")
        return True
    except ImportError:
        print("❌ Error: pip is not available")
        return False

def install_dependencies():
    """Install required dependencies"""
    print("\n📦 Installing dependencies...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
        print("✅ Dependencies installed successfully")
        return True
    except subprocess.CalledProcessError as e:
        print(f"❌ Error installing dependencies: {e}")
        return False

def setup_environment():
    """Set up environment file"""
    env_file = Path(".env")
    env_example = Path("env.example")
    
    if env_file.exists():
        print("✅ .env file already exists")
        return True
    
    if not env_example.exists():
        print("❌ Error: env.example file not found")
        return False
    
    print("\n🔧 Setting up environment file...")
    shutil.copy(env_example, env_file)
    print("✅ Created .env file from template")
    
    print("\n⚠️  IMPORTANT: Please edit the .env file with your credentials:")
    print("   1. Get your Google API key from: https://aistudio.google.com/app/apikey")
    print("   2. Set up ngrok and update NGROK_URL")
    print("   3. Configure other optional settings")
    
    return True

def check_ngrok():
    """Check if ngrok is available"""
    if shutil.which("ngrok"):
        print("✅ ngrok is installed")
        return True
    else:
        print("⚠️  ngrok is not installed")
        print("   Download from: https://ngrok.com/download")
        print("   Required for Twilio integration")
        return False

def create_startup_script():
    """Create a startup script for easy server launch"""
    startup_script = """#!/bin/bash
# Sprout Voice Assistant Startup Script

echo "🚀 Starting Sprout Voice Assistant..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found"
    echo "   Please run setup.py first to create the environment file"
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

# Start the server
python main.py
"""
    
    script_path = Path("start.sh")
    script_path.write_text(startup_script)
    script_path.chmod(0o755)
    print("✅ Created startup script: start.sh")

def main():
    """Main setup function"""
    print("🌱 Sprout Voice Assistant Setup")
    print("=" * 40)
    
    # Check prerequisites
    if not check_python_version():
        return False
    
    if not check_pip():
        return False
    
    # Install dependencies
    if not install_dependencies():
        return False
    
    # Set up environment
    if not setup_environment():
        return False
    
    # Check ngrok (optional)
    check_ngrok()
    
    # Create startup script
    create_startup_script()
    
    print("\n🎉 Setup completed successfully!")
    print("\n📋 Next steps:")
    print("   1. Edit .env file with your credentials")
    print("   2. Run './start.sh' or 'python main.py' to start the server")
    print("   3. Set up ngrok if you want Twilio integration")
    print("\n📚 For detailed instructions, see README.md")
    
    return True

if __name__ == "__main__":
    try:
        success = main()
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\n❌ Setup cancelled by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Setup failed: {e}")
        sys.exit(1)
