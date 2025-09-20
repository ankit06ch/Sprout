import { Room, RoomEvent, RemoteParticipant, RemoteTrack, RemoteTrackPublication, Track } from 'livekit-client';
import { AccessToken } from 'livekit-server-sdk';

export interface VoiceAgentConfig {
  url: string;
  token: string;
  roomName: string;
}

export interface VoiceMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isAudio?: boolean;
}

class LiveKitVoiceService {
  private room: Room | null = null;
  private isConnected = false;
  private isListening = false;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private onMessageCallback?: (message: VoiceMessage) => void;
  private onStatusCallback?: (status: { isConnected: boolean; isListening: boolean; isSpeaking: boolean }) => void;

  constructor() {
    this.room = new Room();
    this.setupRoomEventHandlers();
  }

  private setupRoomEventHandlers() {
    if (!this.room) return;

    this.room.on(RoomEvent.Connected, () => {
      console.log('Connected to LiveKit room');
      this.isConnected = true;
      this.updateStatus();
    });

    this.room.on(RoomEvent.Disconnected, () => {
      console.log('Disconnected from LiveKit room');
      this.isConnected = false;
      this.isListening = false;
      this.updateStatus();
    });

    this.room.on(RoomEvent.TrackSubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      if (track.kind === Track.Kind.Audio) {
        console.log('Received audio track from participant:', participant.identity);
        this.handleIncomingAudio(track);
      }
    });

    this.room.on(RoomEvent.TrackUnsubscribed, (track: RemoteTrack, publication: RemoteTrackPublication, participant: RemoteParticipant) => {
      console.log('Track unsubscribed:', track.kind, participant.identity);
    });

    this.room.on(RoomEvent.ParticipantConnected, (participant: RemoteParticipant) => {
      console.log('Participant connected:', participant.identity);
    });

    this.room.on(RoomEvent.ParticipantDisconnected, (participant: RemoteParticipant) => {
      console.log('Participant disconnected:', participant.identity);
    });
  }

  private handleIncomingAudio(track: RemoteTrack) {
    // Handle incoming audio from the voice agent
    const audioElement = track.attach();
    audioElement.play();
    
    // Simulate receiving a message from the agent
    if (this.onMessageCallback) {
      this.onMessageCallback({
        id: Date.now().toString(),
        role: 'assistant',
        content: 'I heard your message and I\'m responding with voice.',
        timestamp: new Date(),
        isAudio: true
      });
    }
  }

  private updateStatus() {
    if (this.onStatusCallback) {
      this.onStatusCallback({
        isConnected: this.isConnected,
        isListening: this.isListening,
        isSpeaking: false // This would be updated based on actual audio playback
      });
    }
  }

  async connect(config: VoiceAgentConfig): Promise<boolean> {
    try {
      if (!this.room) {
        this.room = new Room();
        this.setupRoomEventHandlers();
      }

      await this.room.connect(config.url, config.token);
      return true;
    } catch (error) {
      console.error('Failed to connect to LiveKit room:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    if (this.room) {
      await this.room.disconnect();
      this.room = null;
    }
    this.isConnected = false;
    this.isListening = false;
    this.updateStatus();
  }

  async startListening(): Promise<boolean> {
    try {
      if (!this.room || !this.isConnected) {
        console.error('Not connected to room');
        return false;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioTrack = stream.getAudioTracks()[0];
      
      await this.room.localParticipant.publishTrack(audioTrack, {
        name: 'microphone',
        source: Track.Source.Microphone,
      });

      this.isListening = true;
      this.updateStatus();
      return true;
    } catch (error) {
      console.error('Failed to start listening:', error);
      return false;
    }
  }

  async stopListening(): Promise<void> {
    if (this.room && this.isConnected) {
      const audioTrack = this.room.localParticipant.audioTracks.values().next().value;
      if (audioTrack) {
        await this.room.localParticipant.unpublishTrack(audioTrack.track);
      }
    }
    this.isListening = false;
    this.updateStatus();
  }

  async sendTextMessage(message: string): Promise<void> {
    if (!this.room || !this.isConnected) {
      console.error('Not connected to room');
      return;
    }

    // Send text message as data
    const data = new TextEncoder().encode(JSON.stringify({
      type: 'text',
      content: message,
      timestamp: new Date().toISOString()
    }));

    await this.room.localParticipant.publishData(data, {
      reliable: true,
      topic: 'chat'
    });
  }

  setOnMessageCallback(callback: (message: VoiceMessage) => void) {
    this.onMessageCallback = callback;
  }

  setOnStatusCallback(callback: (status: { isConnected: boolean; isListening: boolean; isSpeaking: boolean }) => void) {
    this.onStatusCallback = callback;
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      isListening: this.isListening,
      isSpeaking: false
    };
  }
}

// Function to generate access token
export const generateAccessToken = (roomName: string, participantName: string = 'user'): string => {
  const token = new AccessToken(sandboxCredentials.apiKey, sandboxCredentials.apiSecret, {
    identity: participantName,
    ttl: '1h',
  });
  
  token.addGrant({
    room: roomName,
    roomJoin: true,
    canPublish: true,
    canSubscribe: true,
    canPublishData: true,
  });
  
  return token.toJwt();
};

// Create a singleton instance
export const liveKitVoiceService = new LiveKitVoiceService();

// Sandbox configuration from LiveKit
export const defaultVoiceConfig: VoiceAgentConfig = {
  url: 'wss://lanamesayer-o0bcnn9r.livekit.cloud',
  token: 'your-livekit-token-here', // This will be generated dynamically
  roomName: 'voice-agent-room'
};

// Sandbox credentials
export const sandboxCredentials = {
  apiKey: 'APIBBJ7ZmkdVBdn',
  apiSecret: 'thdpA0arDbXyeenT9fmGNFpEAsMZRZa22oo0YvkLheeG',
  url: 'wss://lanamesayer-o0bcnn9r.livekit.cloud'
};
