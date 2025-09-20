import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyD-kmxqB-GuYjYNI5hOnrY_bR_w6QXXcvU';

const genAI = new GoogleGenerativeAI(API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export class GeminiChatService {
  private conversationHistory: ChatMessage[] = [];

  async sendMessage(userMessage: string): Promise<string> {
    try {
      console.log('Sending message to Gemini:', userMessage);
      
      // Add user message to history
      this.conversationHistory.push({
        role: 'user',
        content: userMessage,
        timestamp: new Date()
      });

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
      this.conversationHistory.push({
        role: 'assistant',
        content: aiMessage,
        timestamp: new Date()
      });

      return aiMessage;
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return 'Sorry, I encountered an error while processing your request. Please try again.';
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