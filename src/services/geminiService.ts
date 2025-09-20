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
import { db } from '../firebase/config';

const API_KEY = 'AIzaSyD-kmxqB-GuYjYNI5hOnrY_bR_w6QXXcvU';

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
    this.currentUserId = userId;
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
      if (!this.currentUserId) return;
      
      const messageData = {
        ...message,
        timestamp: Timestamp.fromDate(message.timestamp)
      };
      
      await addDoc(collection(db, 'chatMessages'), messageData);
    } catch (error) {
      console.error('Error saving message to Firebase:', error);
    }
  }

  async loadMessagesFromFirebase(): Promise<ChatMessage[]> {
    try {
      if (!this.currentUserId) return [];

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

      this.conversationHistory = messages;
      return messages;
    } catch (error) {
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