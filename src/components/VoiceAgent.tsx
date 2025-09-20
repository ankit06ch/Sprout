import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Phone, PhoneOff, Volume2, VolumeX, X, MessageCircle, User, Send } from 'react-feather';
import { liveKitVoiceService, VoiceMessage, defaultVoiceConfig, generateAccessToken } from '../services/livekitService';

interface VoiceAgentProps {
  isOpen: boolean;
  onClose: () => void;
}

// Use VoiceMessage from the service

const VoiceAgent: React.FC<VoiceAgentProps> = ({ isOpen, onClose }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen) {
      // Initialize voice agent when opened
      initializeVoiceAgent();
    } else {
      // Clean up when closed
      disconnectVoiceAgent();
    }
  }, [isOpen]);

  useEffect(() => {
    // Set up LiveKit callbacks
    liveKitVoiceService.setOnMessageCallback((message: VoiceMessage) => {
      setMessages(prev => [...prev, message]);
    });

    liveKitVoiceService.setOnStatusCallback((status) => {
      setIsConnected(status.isConnected);
      setIsListening(status.isListening);
      setIsSpeaking(status.isSpeaking);
    });

    return () => {
      // Clean up callbacks
      liveKitVoiceService.setOnMessageCallback(undefined);
      liveKitVoiceService.setOnStatusCallback(undefined);
    };
  }, []);

  const initializeVoiceAgent = async () => {
    try {
      // Request microphone permission first
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(track => track.stop()); // Stop the stream immediately
      
      // Generate a fresh token and try to connect to LiveKit
      const token = generateAccessToken('voice-agent-room', 'user');
      const config = { ...defaultVoiceConfig, token };
      const connected = await liveKitVoiceService.connect(config);
      
      if (connected) {
        setMessages([{
          id: '1',
          role: 'assistant',
          content: 'Hello! I\'m your voice assistant. Click the microphone to start speaking, or type a message below.',
          timestamp: new Date()
        }]);
      } else {
        // Fallback to demo mode if LiveKit connection fails
        setMessages([{
          id: '1',
          role: 'assistant',
          content: 'Hello! I\'m your voice assistant in demo mode. Click the microphone to start speaking, or type a message below. (Note: This is a demo - LiveKit integration requires proper credentials)',
          timestamp: new Date()
        }]);
        setIsConnected(true); // Set to true for demo mode
      }
    } catch (error) {
      console.error('Error initializing voice agent:', error);
      setMessages([{
        id: '1',
        role: 'assistant',
        content: 'Unable to access microphone. You can still type messages below.',
        timestamp: new Date()
      }]);
    }
  };

  const disconnectVoiceAgent = async () => {
    await liveKitVoiceService.disconnect();
    setIsConnected(false);
    setIsListening(false);
    setIsSpeaking(false);
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const startListening = async () => {
    try {
      // Try to use LiveKit first
      const liveKitSuccess = await liveKitVoiceService.startListening();
      
      if (liveKitSuccess) {
        setIsListening(true);
        return;
      }

      // Fallback to local recording if LiveKit fails
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        await processAudioInput(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };

  const stopListening = async () => {
    // Try LiveKit first
    await liveKitVoiceService.stopListening();
    
    // Fallback to local recording
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    setIsListening(false);
  };

  const processAudioInput = async (audioBlob: Blob) => {
    // Simulate processing audio input
    const userMessage: VoiceMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: '[Voice message]',
      timestamp: new Date(),
      isAudio: true
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'I heard your voice message! This is a simulated response. In a real implementation, this would process your audio and provide a voice response.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      setIsSpeaking(true);
      
      // Simulate speaking
      setTimeout(() => {
        setIsSpeaking(false);
      }, 2000);
    }, 1500);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: VoiceMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    // Try to send via LiveKit first
    try {
      await liveKitVoiceService.sendTextMessage(userMessage.content);
    } catch (error) {
      console.log('LiveKit send failed, using fallback');
    }

    // Simulate AI response
    setTimeout(() => {
      const assistantMessage: VoiceMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I received your message: "${userMessage.content}". This is a simulated response. In a real implementation, this would connect to LiveKit for voice processing.`,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      setIsLoading(false);
      setIsSpeaking(true);
      
      // Simulate speaking
      setTimeout(() => {
        setIsSpeaking(false);
      }, 2000);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearMessages = () => {
    setMessages([]);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-end p-4">
      <div className="bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-200/50 w-full max-w-md h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200/50">
          <div className="flex items-center space-x-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isConnected ? 'bg-green-100' : 'bg-gray-100'
            }`}>
              <MessageCircle className={`w-4 h-4 ${
                isConnected ? 'text-green-600' : 'text-gray-400'
              }`} />
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Voice Assistant</h3>
              <p className="text-xs text-gray-500">
                {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={clearMessages}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              title="Clear messages"
            >
              <X className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Voice Controls */}
        <div className="p-4 border-b border-gray-200/50">
          <div className="flex items-center justify-center space-x-4">
            {/* Microphone Button */}
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={!isConnected}
              className={`w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : isConnected
                  ? 'bg-blue-500 text-white hover:bg-blue-600'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isListening ? (
                <MicOff className="w-6 h-6" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>

            {/* Mute/Unmute Button */}
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isMuted
                  ? 'bg-red-100 text-red-600'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>

            {/* Speaking Indicator */}
            {isSpeaking && (
              <div className="flex items-center space-x-1 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                <span className="text-xs ml-2">Speaking...</span>
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-gray-500 py-8">
              <Mic className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-sm">Start a conversation with your voice assistant!</p>
              <p className="text-xs text-gray-400 mt-1">
                Click the microphone to speak or type a message below.
              </p>
            </div>
          )}
          
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                <div className="flex items-start space-x-2">
                  {message.role === 'assistant' && (
                    <MessageCircle className="w-3 h-3 mt-1 flex-shrink-0 text-blue-500" />
                  )}
                  {message.role === 'user' && (
                    <User className="w-3 h-3 mt-1 flex-shrink-0 text-blue-200" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-2xl px-3 py-2 max-w-[85%]">
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-3 h-3 text-blue-500" />
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Text Input */}
        <div className="p-4 border-t border-gray-200/50">
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              className="flex-1 bg-gray-100 rounded-full px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceAgent;
