// Voice Assistant Service for Twilio + Google Gemini Integration
// This service handles WebSocket connections to the Python FastAPI backend

import { getVoiceAssistantUrl, getHealthCheckUrl } from '../config/voiceAssistant';

interface VoiceMessage {
  type: 'setup' | 'prompt' | 'interrupt' | 'text';
  callSid?: string;
  voicePrompt?: string;
  token?: string;
  last?: boolean;
}

interface VoiceSession {
  websocket: WebSocket | null;
  callSid: string;
  isConnected: boolean;
  isListening: boolean;
}

class VoiceAssistantService {
  private session: VoiceSession | null = null;
  private voiceAssistantUrl: string;
  private healthCheckUrl: string;
  private onMessageCallback?: (message: string) => void;
  private onErrorCallback?: (error: string) => void;
  private onStatusCallback?: (status: string) => void;

  constructor() {
    this.voiceAssistantUrl = getVoiceAssistantUrl();
    this.healthCheckUrl = getHealthCheckUrl();
  }

  // Set callbacks for handling events
  setCallbacks(callbacks: {
    onMessage?: (message: string) => void;
    onError?: (error: string) => void;
    onStatus?: (status: string) => void;
  }) {
    this.onMessageCallback = callbacks.onMessage;
    this.onErrorCallback = callbacks.onError;
    this.onStatusCallback = callbacks.onStatus;
  }

  // Initialize a new voice session
  async initializeSession(callSid?: string): Promise<boolean> {
    try {
      this.onStatusCallback?.('Connecting to voice assistant...');
      
      // Create a unique call SID if not provided
      const sessionCallSid = callSid || `web_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Create WebSocket connection
      const websocket = new WebSocket(this.voiceAssistantUrl);
      
      this.session = {
        websocket,
        callSid: sessionCallSid,
        isConnected: false,
        isListening: false
      };

      // Set up WebSocket event handlers
      websocket.onopen = () => {
        console.log('Voice Assistant WebSocket connected');
        this.session!.isConnected = true;
        this.onStatusCallback?.('Connected to voice assistant');
        
        // Send setup message
        this.sendMessage({
          type: 'setup',
          callSid: sessionCallSid
        });
      };

      websocket.onmessage = (event) => {
        try {
          const message: VoiceMessage = JSON.parse(event.data);
          this.handleIncomingMessage(message);
        } catch (error) {
          console.error('Error parsing voice assistant message:', error);
          this.onErrorCallback?.('Failed to parse voice assistant response');
        }
      };

      websocket.onclose = () => {
        console.log('Voice Assistant WebSocket disconnected');
        this.session!.isConnected = false;
        this.onStatusCallback?.('Disconnected from voice assistant');
      };

      websocket.onerror = (error) => {
        console.error('Voice Assistant WebSocket error:', error);
        this.onErrorCallback?.('Voice assistant connection error');
        this.onStatusCallback?.('Connection error');
      };

      return true;
    } catch (error) {
      console.error('Failed to initialize voice session:', error);
      this.onErrorCallback?.('Failed to initialize voice assistant');
      return false;
    }
  }

  // Send a voice prompt to the assistant
  async sendVoicePrompt(prompt: string): Promise<boolean> {
    if (!this.session || !this.session.isConnected) {
      this.onErrorCallback?.('Voice assistant not connected');
      return false;
    }

    try {
      this.onStatusCallback?.('Processing your request...');
      
      const message: VoiceMessage = {
        type: 'prompt',
        voicePrompt: prompt
      };

      this.sendMessage(message);
      return true;
    } catch (error) {
      console.error('Failed to send voice prompt:', error);
      this.onErrorCallback?.('Failed to send voice prompt');
      return false;
    }
  }

  // Handle incoming messages from the voice assistant
  private handleIncomingMessage(message: VoiceMessage) {
    switch (message.type) {
      case 'text':
        if (message.token) {
          this.onMessageCallback?.(message.token);
        }
        break;
      
      case 'setup':
        this.onStatusCallback?.('Voice assistant ready');
        break;
      
      default:
        console.log('Received unknown message type:', message.type);
    }
  }

  // Send a message through the WebSocket
  private sendMessage(message: VoiceMessage) {
    if (this.session?.websocket && this.session.isConnected) {
      this.session.websocket.send(JSON.stringify(message));
    } else {
      this.onErrorCallback?.('Voice assistant not connected');
    }
  }

  // Start listening for voice input
  startListening(): boolean {
    if (!this.session || !this.session.isConnected) {
      this.onErrorCallback?.('Voice assistant not connected');
      return false;
    }

    this.session.isListening = true;
    this.onStatusCallback?.('Listening...');
    
    // In a real implementation, this would start the browser's speech recognition
    // For now, we'll simulate it
    return true;
  }

  // Stop listening for voice input
  stopListening(): boolean {
    if (!this.session) {
      return false;
    }

    this.session.isListening = false;
    this.onStatusCallback?.('Stopped listening');
    return true;
  }

  // Disconnect from the voice assistant
  disconnect(): void {
    if (this.session?.websocket) {
      this.session.websocket.close();
      this.session = null;
      this.onStatusCallback?.('Disconnected');
    }
  }

  // Get current session status
  getStatus() {
    return {
      isConnected: this.session?.isConnected || false,
      isListening: this.session?.isListening || false,
      callSid: this.session?.callSid || null
    };
  }

  // Check if voice assistant is available
  async checkAvailability(): Promise<boolean> {
    try {
      // Try to connect to the health endpoint
      const response = await fetch(this.healthCheckUrl);
      return response.ok;
    } catch (error) {
      console.error('Voice assistant not available:', error);
      return false;
    }
  }
}

// Export singleton instance
export const voiceAssistantService = new VoiceAssistantService();

// Export the class for testing
export default VoiceAssistantService;
