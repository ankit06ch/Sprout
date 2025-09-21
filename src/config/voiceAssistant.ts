// Voice Assistant Configuration
// This file contains configuration for the voice assistant service

export const VOICE_ASSISTANT_CONFIG = {
  // WebSocket URL for the voice assistant backend
  // Update this URL if your voice assistant server runs on a different port or host
  WEBSOCKET_URL: 'ws://localhost:8081/ws',
  
  // Health check endpoint
  HEALTH_CHECK_URL: 'http://localhost:8081/health',
  
  // Connection timeout in milliseconds
  CONNECTION_TIMEOUT: 10000,
  
  // Reconnection attempts
  MAX_RECONNECT_ATTEMPTS: 3,
  
  // Reconnection delay in milliseconds
  RECONNECT_DELAY: 2000,
};

// Helper function to get the WebSocket URL
export const getVoiceAssistantUrl = (): string => {
  // Check for Vite environment variable first
  try {
    if (import.meta && import.meta.env && import.meta.env.VITE_VOICE_ASSISTANT_URL) {
      return import.meta.env.VITE_VOICE_ASSISTANT_URL;
    }
  } catch (error) {
    // Ignore error if import.meta is not available
  }
  
  // Fallback to process.env (for Create React App)
  try {
    if (process && process.env && process.env.REACT_APP_VOICE_ASSISTANT_URL) {
      return process.env.REACT_APP_VOICE_ASSISTANT_URL;
    }
  } catch (error) {
    // Ignore error if process is not available
  }
  
  // Default configuration
  return VOICE_ASSISTANT_CONFIG.WEBSOCKET_URL;
};

// Helper function to get the health check URL
export const getHealthCheckUrl = (): string => {
  const wsUrl = getVoiceAssistantUrl();
  return wsUrl.replace('ws://', 'http://').replace('/ws', '/health');
};
