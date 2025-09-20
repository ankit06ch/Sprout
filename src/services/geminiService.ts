import { GoogleGenerativeAI } from '@google/generative-ai';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  getDocs, 
  where,
  Timestamp 
} from 'firebase/firestore';
import { getDb, auth, controlFirestoreNetwork } from '../firebase/config';

const API_KEY = 'AIzaSyD-kmxqB-GuYjYNI5hOnrY_bR_w6QXXcvU';

// Debug logging function for GeminiService
const geminiDebugLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[GEMINI DEBUG ${timestamp}] ${message}`, data || '');
};

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  id?: string;
  userId?: string;
}

export class GeminiChatService {
  private conversationHistory: ChatMessage[] = [];
  private currentUserId: string | null = null;

  setUserId(userId: string | null) {
    geminiDebugLog('setUserId called:', {
      newUserId: userId,
      previousUserId: this.currentUserId,
      authUser: auth.currentUser?.uid || 'null'
    });
    this.currentUserId = userId;
  }

  private isAuthenticated(): boolean {
    return auth.currentUser !== null && this.currentUserId !== null;
  }

  private async ensureFirestoreEnabled(): Promise<boolean> {
    geminiDebugLog('ensureFirestoreEnabled called');
    try {
      const authCheck = this.isAuthenticated();
      geminiDebugLog('Authentication check:', {
        isAuthenticated: authCheck,
        authUser: auth.currentUser?.uid || 'null',
        currentUserId: this.currentUserId
      });
      
      if (!authCheck) {
        geminiDebugLog('Not authenticated, skipping Firestore operations');
        return false;
      }
      
      // Get Firestore instance (lazy initialization)
      geminiDebugLog('Getting Firestore instance...');
      const db = getDb();
      if (!db) {
        geminiDebugLog('Firestore not available');
        return false;
      }
      
      geminiDebugLog('Enabling Firestore network...');
      await controlFirestoreNetwork(true);
      geminiDebugLog('Firestore enabled successfully');
      return true;
    } catch (error) {
      geminiDebugLog('Failed to enable Firestore:', error);
      return false;
    }
  }

  async sendMessage(userMessage: string): Promise<string> {
    try {
      console.log('Sending message to Gemini:', userMessage);
      
      // Add user message to history
      const userMessageObj: ChatMessage = {
        role: 'user',
        content: userMessage,
        timestamp: new Date(),
        userId: this.currentUserId || undefined
      };
      this.conversationHistory.push(userMessageObj);

      // Save user message to Firebase
      if (this.currentUserId) {
        await this.saveMessageToFirebase(userMessageObj);
      }

      // Create context for grocery forecasting
      const systemPrompt = `You are an AI assistant specialized in grocery forecasting and inventory management. You help users with:
- Grocery demand forecasting
- Inventory management advice
- Product expiration tracking
- Sales analytics insights
- Supply chain optimization
- Seasonal demand patterns
- Promotional impact analysis

Be helpful, concise, and focus on practical advice for grocery store operations.`;

      // Prepare the conversation context
      const conversationContext = this.conversationHistory
        .slice(-10) // Keep last 10 messages for context
        .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
        .join('\n');

      const fullPrompt = `${systemPrompt}\n\nConversation:\n${conversationContext}`;

      console.log('Calling Gemini API with prompt:', fullPrompt.substring(0, 200) + '...');
      
      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const aiMessage = response.text();
      
      console.log('Received response from Gemini:', aiMessage.substring(0, 100) + '...');

      // Add AI response to history
      const aiMessageObj: ChatMessage = {
        role: 'assistant',
        content: aiMessage,
        timestamp: new Date(),
        userId: this.currentUserId || undefined
      };
      this.conversationHistory.push(aiMessageObj);

      // Save AI response to Firebase
      if (this.currentUserId) {
        await this.saveMessageToFirebase(aiMessageObj);
      }

      return aiMessage;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return 'Sorry, I encountered an error while processing your request. Please try again.';
    }
  }

  async saveMessageToFirebase(message: ChatMessage): Promise<void> {
    try {
      geminiDebugLog('saveMessageToFirebase called');
      
      // Check authentication first
      if (!this.isAuthenticated()) {
        geminiDebugLog('User not authenticated, skipping save');
        return;
      }

      // Ensure Firestore is enabled and user is authenticated
      const firestoreReady = await this.ensureFirestoreEnabled();
      if (!firestoreReady) {
        geminiDebugLog('Firestore not ready or user not authenticated, skipping save');
        return;
      }
      
      const db = getDb();
      if (!db) {
        geminiDebugLog('Firestore instance not available');
        return;
      }
      
      const messageData = {
        ...message,
        userId: this.currentUserId,
        timestamp: Timestamp.fromDate(message.timestamp)
      };
      
      geminiDebugLog('Saving message to Firestore...');
      await addDoc(collection(db, 'chatMessages'), messageData);
      geminiDebugLog('Message saved successfully to Firestore');
    } catch (error) {
      geminiDebugLog('Error saving message to Firebase:', error);
      // Check if it's a network/permission error
      if (error instanceof Error) {
        if (error.message.includes('400') || error.message.includes('permission') || error.message.includes('network')) {
          geminiDebugLog('Network or permission error detected, skipping save');
          return;
        }
      }
      console.error('Error saving message to Firebase:', error);
      // Don't throw error to prevent app crashes
    }
  }

  async loadMessagesFromFirebase(): Promise<ChatMessage[]> {
    try {
      geminiDebugLog('loadMessagesFromFirebase called');
      
      // Check authentication first
      if (!this.isAuthenticated()) {
        geminiDebugLog('User not authenticated, skipping load');
        return [];
      }

      // Ensure Firestore is enabled and user is authenticated
      const firestoreReady = await this.ensureFirestoreEnabled();
      if (!firestoreReady) {
        geminiDebugLog('Firestore not ready or user not authenticated, skipping load');
        return [];
      }

      const db = getDb();
      if (!db) {
        geminiDebugLog('Firestore instance not available');
        return [];
      }

      geminiDebugLog('Executing Firestore query for messages...');
      const messagesQuery = query(
        collection(db, 'chatMessages'),
        where('userId', '==', this.currentUserId),
        orderBy('timestamp', 'asc'),
        limit(50) // Load last 50 messages
      );

      const querySnapshot = await getDocs(messagesQuery);
      const messages: ChatMessage[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        messages.push({
          id: doc.id,
          role: data.role,
          content: data.content,
          timestamp: data.timestamp.toDate(),
          userId: data.userId
        });
      });

      geminiDebugLog(`Loaded ${messages.length} messages from Firestore`);
      this.conversationHistory = messages;
      return messages;
    } catch (error) {
      geminiDebugLog('Error loading messages from Firebase:', error);
      // Check if it's a network/permission error
      if (error instanceof Error) {
        if (error.message.includes('400') || error.message.includes('permission') || error.message.includes('network')) {
          geminiDebugLog('Network or permission error detected, returning empty array');
          return [];
        }
      }
      console.error('Error loading messages from Firebase:', error);
      return [];
    }
  }

  clearHistory(): void {
    this.conversationHistory = [];
  }

  getHistory(): ChatMessage[] {
    return [...this.conversationHistory];
  }
}

export const geminiChatService = new GeminiChatService();