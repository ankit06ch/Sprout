import React, { useState, useEffect } from 'react';
import { voiceAssistantService } from '../services/voiceAssistantService';

interface SproutVoiceAgentProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SproutVoiceAgent({ isOpen, onClose }: SproutVoiceAgentProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Ready to connect');
  const [messages, setMessages] = useState<Array<{type: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const [currentMessage, setCurrentMessage] = useState<string>('');

  useEffect(() => {
    // Set up voice assistant service callbacks
    voiceAssistantService.setCallbacks({
      onMessage: (message: string) => {
        setMessages(prev => [...prev, { type: 'assistant', content: message, timestamp: new Date() }]);
        setCurrentMessage('');
      },
      onError: (error: string) => {
        setError(error);
        setIsConnecting(false);
      },
      onStatus: (status: string) => {
        setStatus(status);
      }
    });

    // Check if voice assistant is available when component mounts
    if (isOpen) {
      checkAvailability();
    }

    return () => {
      // Clean up on unmount
      voiceAssistantService.disconnect();
    };
  }, [isOpen]);

  const checkAvailability = async () => {
    const available = await voiceAssistantService.checkAvailability();
    if (!available) {
      setError('Voice assistant service is not available. Please ensure the backend server is running.');
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);
    setStatus('Connecting...');
    
    try {
      const success = await voiceAssistantService.initializeSession();
      if (success) {
        setIsConnected(true);
        setIsConnecting(false);
        setStatus('Connected - Ready to help with Sprout features');
      } else {
        setError('Failed to connect to voice assistant');
        setIsConnecting(false);
      }
    } catch (error) {
      setError('Connection failed. Please try again.');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    voiceAssistantService.disconnect();
    setIsConnected(false);
    setIsConnecting(false);
    setIsListening(false);
    setMessages([]);
    setCurrentMessage('');
    setStatus('Disconnected');
  };

  const handleStartListening = () => {
    const success = voiceAssistantService.startListening();
    if (success) {
      setIsListening(true);
      setStatus('Listening... Speak now');
    }
  };

  const handleStopListening = () => {
    const success = voiceAssistantService.stopListening();
    if (success) {
      setIsListening(false);
      setStatus('Processing your request...');
    }
  };

  const handleSampleQuestion = async (question: string) => {
    if (!isConnected) return;
    
    setMessages(prev => [...prev, { type: 'user', content: question, timestamp: new Date() }]);
    setStatus('Processing...');
    
    const success = await voiceAssistantService.sendVoicePrompt(question);
    if (!success) {
      setError('Failed to send question to voice assistant');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[600px] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Sprout Voice Assistant</h2>
            <p className="text-gray-600 mt-1">Ask me about Sprout's features and capabilities</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          {error ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Connection Error</h3>
                <p className="text-gray-600 mb-4">{error}</p>
                <button
                  onClick={handleConnect}
                  className="bg-green-600 text-white px-6 py-2 rounded-xl hover:bg-green-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            </div>
          ) : isConnecting ? (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Connecting to Voice Agent</h3>
                <p className="text-gray-600">Starting your conversation with Sprout...</p>
              </div>
            </div>
          ) : isConnected ? (
            <div className="flex-1 flex flex-col">
              {/* Voice Call Interface */}
              <div className="flex-1 p-6">
                <div className="h-full bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl flex flex-col items-center justify-center">
                  {/* Avatar */}
                  <div className="w-32 h-32 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mb-6 animate-pulse">
                    <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  
                  {/* Status */}
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">Connected to Sprout AI</h3>
                  <p className="text-gray-600 text-center mb-4 max-w-md">
                    {status}
                  </p>
                  
                  {/* Voice Controls */}
                  <div className="flex items-center space-x-4 mb-6">
                    <button
                      onClick={isListening ? handleStopListening : handleStartListening}
                      className={`px-6 py-3 rounded-xl flex items-center space-x-2 transition-colors ${
                        isListening 
                          ? 'bg-red-600 hover:bg-red-700 text-white' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                      </svg>
                      <span>{isListening ? 'Stop Listening' : 'Start Voice'}</span>
                    </button>
                  </div>

                  {/* Messages Display */}
                  {messages.length > 0 && (
                    <div className="w-full max-w-2xl mb-6 max-h-48 overflow-y-auto bg-white/50 backdrop-blur-sm rounded-xl p-4">
                      {messages.map((msg, index) => (
                        <div key={index} className={`mb-3 ${msg.type === 'user' ? 'text-right' : 'text-left'}`}>
                          <div className={`inline-block p-3 rounded-lg max-w-xs ${
                            msg.type === 'user' 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            <p className="text-sm">{msg.content}</p>
                            <p className={`text-xs mt-1 ${
                              msg.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                            }`}>
                              {msg.timestamp.toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {/* Sample Questions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                    <button 
                      onClick={() => handleSampleQuestion("What is Sprout and how does it help grocery stores?")}
                      className="bg-white/70 backdrop-blur-sm rounded-xl p-3 text-left hover:bg-white/90 transition-colors"
                    >
                      <div className="font-medium text-gray-800">What is Sprout?</div>
                      <div className="text-sm text-gray-600">Learn about our AI platform</div>
                    </button>
                    <button 
                      onClick={() => handleSampleQuestion("How does demand forecasting work in Sprout?")}
                      className="bg-white/70 backdrop-blur-sm rounded-xl p-3 text-left hover:bg-white/90 transition-colors"
                    >
                      <div className="font-medium text-gray-800">How does forecasting work?</div>
                      <div className="text-sm text-gray-600">Understand our AI predictions</div>
                    </button>
                    <button 
                      onClick={() => handleSampleQuestion("What waste reduction features does Sprout offer?")}
                      className="bg-white/70 backdrop-blur-sm rounded-xl p-3 text-left hover:bg-white/90 transition-colors"
                    >
                      <div className="font-medium text-gray-800">Waste reduction features</div>
                      <div className="text-sm text-gray-600">Minimize food waste</div>
                    </button>
                    <button 
                      onClick={() => handleSampleQuestion("Tell me about Sprout's analytics dashboard capabilities")}
                      className="bg-white/70 backdrop-blur-sm rounded-xl p-3 text-left hover:bg-white/90 transition-colors"
                    >
                      <div className="font-medium text-gray-800">Analytics dashboard</div>
                      <div className="text-sm text-gray-600">Track performance metrics</div>
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Controls */}
              <div className="border-t border-gray-200 p-4">
                <div className="flex items-center justify-center space-x-4">
                  <button 
                    onClick={isListening ? handleStopListening : handleStartListening}
                    className={`px-6 py-2 rounded-xl transition-colors flex items-center space-x-2 ${
                      isListening 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    <span>{isListening ? 'Stop' : 'Voice'}</span>
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="bg-red-600 text-white px-6 py-2 rounded-xl hover:bg-red-700 transition-colors flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>End Call</span>
                  </button>
                </div>
                <div className="text-center mt-2">
                  <p className="text-sm text-gray-500">{status}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Ready to Start</h3>
                <p className="text-gray-600 mb-4">Connect to our AI voice assistant to learn about Sprout</p>
                <button
                  onClick={handleConnect}
                  className="bg-green-600 text-white px-6 py-3 rounded-xl hover:bg-green-700 transition-colors flex items-center space-x-2 mx-auto"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>Start Voice Call</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}