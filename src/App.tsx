import React, { useEffect, useState, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { BarChart, AlertTriangle, Package, ChevronDown, Paperclip, Mic, ArrowRight, Menu, X, Home, Settings, HelpCircle, LogOut, Zap, MessageCircle, Calendar } from 'react-feather';
import Header from './components/Header';
import ScrollIcons from './components/ScrollIcons';
import PipelineLines from './components/PipelineLines';
import authImage from './assets/logo/authImage.jpg';
import { GroceryForecastingApp, EvaluationScreen, OrdersScreen } from './EnhancedUI';
import MapboxMap from './components/MapboxMap';
import MappedInGroceryStore from './components/MappedInGroceryStore';
import { geminiChatService } from './services/geminiService';
import SproutVoiceAgent from './components/SproutVoiceAgent';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Protected Route Component
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    }
  }, [currentUser, navigate]);

  return currentUser ? <>{children}</> : null;
}

function App() {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calculate scroll progress (0 to 1)
      const progress = Math.min(scrollTop / (documentHeight - windowHeight), 1);
      setScrollProgress(progress);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage scrollProgress={scrollProgress} />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/forecasting" element={<ProtectedRoute><GroceryForecastingApp /></ProtectedRoute>} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

// Typing Animation Component
function TypingAnimation() {
  const words = ['Sales', 'Inventory', 'Forecasting', 'Analytics', 'Planning'];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [typingSpeed, setTypingSpeed] = useState(150);

  useEffect(() => {
    const currentWord = words[currentWordIndex];
    
    const timeout = setTimeout(() => {
      if (!isDeleting) {
        // Typing
        if (currentText.length < currentWord.length) {
          setCurrentText(currentWord.slice(0, currentText.length + 1));
          setTypingSpeed(150);
        } else {
          // Finished typing, wait then start deleting
          setTimeout(() => setIsDeleting(true), 2000);
        }
      } else {
        // Deleting
        if (currentText.length > 0) {
          setCurrentText(currentText.slice(0, -1));
          setTypingSpeed(100);
        } else {
          // Finished deleting, move to next word
          setIsDeleting(false);
          setCurrentWordIndex((prev) => (prev + 1) % words.length);
        }
      }
    }, typingSpeed);

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, currentWordIndex, typingSpeed, words]);

  return (
    <span className="relative">
      <span className="bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent font-bold">
        {currentText}
      </span>
      <span className="animate-pulse text-green-600">|</span>
    </span>
  );
}

function HomePage({ scrollProgress }: { scrollProgress: number }) {
  const [isVoiceAgentOpen, setIsVoiceAgentOpen] = useState(false);

  return (
    <div className="bg-gradient-to-b from-[#DEE2ED] to-white relative overflow-hidden">
      {/* Hero Section - Full Screen */}
      <div className="h-screen relative">
            {/* White fade overlay for scroll effect */}
            <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-10"></div>
        
        {/* Animated abstract green glow - Filling entire background */}
        {/* Top Right */}
        <div className="absolute top-0 right-0 w-80 h-80 blur-3xl animate-float rounded-full" style={{
          background: 'radial-gradient(ellipse 60% 40% at 70% 30%, rgba(74, 222, 128, 0.22) 0%, rgba(74, 222, 128, 0.12) 40%, rgba(255, 255, 255, 0.04) 70%, transparent 100%)',
          clipPath: 'ellipse(60% 40% at 70% 30%)'
        }}></div>
        
        {/* Top Left */}
        <div className="absolute top-0 left-0 w-96 h-96 blur-3xl animate-float-reverse rounded-full" style={{
          background: 'radial-gradient(ellipse 50% 35% at 30% 25%, rgba(74, 222, 128, 0.18) 0%, rgba(74, 222, 128, 0.10) 45%, rgba(255, 255, 255, 0.03) 75%, transparent 100%)',
          clipPath: 'ellipse(50% 35% at 30% 25%)'
        }}></div>
        
        {/* Bottom Right */}
        <div className="absolute bottom-0 right-0 w-72 h-72 blur-3xl animate-float-slow rounded-full" style={{
          background: 'radial-gradient(ellipse 45% 50% at 75% 70%, rgba(74, 222, 128, 0.20) 0%, rgba(74, 222, 128, 0.08) 50%, rgba(255, 255, 255, 0.02) 80%, transparent 100%)',
          clipPath: 'ellipse(45% 50% at 75% 70%)'
        }}></div>
        
        {/* Bottom Left */}
        <div className="absolute bottom-0 left-0 w-88 h-88 blur-3xl animate-float rounded-full" style={{
          background: 'radial-gradient(ellipse 55% 45% at 25% 75%, rgba(74, 222, 128, 0.16) 0%, rgba(74, 222, 128, 0.06) 55%, rgba(255, 255, 255, 0.01) 85%, transparent 100%)',
          clipPath: 'ellipse(55% 45% at 25% 75%)'
        }}></div>

        <Header />
        
        {/* Center tagline */}
        <div className="flex items-start justify-center pt-32 h-full relative" style={{ zIndex: 10 }}>
          <div className="text-center max-w-4xl px-8 animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-[#2A2829] to-[#3A3C35] bg-clip-text text-transparent">
              Smarter <TypingAnimation />,<br />
              Less Waste.
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              AI demand forecasting for<br />
              every product, every store, every day.
            </p>
            <button 
              onClick={() => window.location.href = '/forecasting'}
              className="group bg-gradient-to-r from-green-600 to-green-700 text-white px-10 py-3 rounded-2xl text-lg font-bold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center space-x-2 mx-auto"
            >
              <span>Get Started</span>
              <svg 
                className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M13 7l5 5m0 0l-5 5m5-5H6" 
                />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Video Container - Transitions from hero to bottom section */}
        <div 
          className="absolute transition-all duration-100 ease-out" 
          style={{ 
            zIndex: 50, // Higher z-index to be above everything
            width: `${50 + (scrollProgress * 10)}%`, // Grows from 50% to 60% width (3/5 of site)
            left: `calc(50% - ${scrollProgress * 200}px)`, // Translates left by up to 200px
            top: `${55 + (scrollProgress * 55)}vh`, // Moves from 55vh to 110vh (goes beyond bottom of screen)
            transform: 'translateX(-50%)', // Center horizontally
          }}
        >
          <div className="w-full">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-3xl shadow-2xl">
              <div 
                className="bg-gray-100 rounded-3xl flex items-center justify-center transition-all duration-300 ease-out"
                style={{
                  height: `${500 + (scrollProgress * 200)}px`, // Grows from 500px to 700px height
                }}
              >
                <div className="text-center text-gray-500">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h1m4 0h1m-6-8h8a2 2 0 012 2v8a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" />
                  </svg>
                  <p className="text-lg font-medium">Video will be placed here</p>
                  <p className="text-sm text-gray-400 mt-2">16:9 aspect ratio container</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Icons Animation */}
      <ScrollIcons />
      
      {/* Pipeline Lines */}
      <PipelineLines />

      {/* Additional content to enable scrolling */}
      <div className="relative z-10 bg-white h-screen overflow-hidden">
        {/* Radial green glow effect for bottom section - top right */}
        <div className="absolute top-0 right-0 w-96 h-96 blur-3xl animate-float-slow rounded-full" style={{
          background: 'radial-gradient(circle at 80% 20%, rgba(74, 222, 128, 0.20) 0%, rgba(52, 211, 153, 0.15) 30%, rgba(34, 197, 94, 0.10) 60%, rgba(16, 185, 129, 0.05) 80%, transparent 100%)',
          animationDelay: '2s',
          zIndex: 1
        }}></div>
        
        {/* This section provides scroll space for the video container animation */}
      </div>

      {/* Modal that flies in from right when full scroll is activated */}
      <div 
        className="absolute w-96 bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl shadow-2xl transition-all duration-500 ease-out"
        style={{
          zIndex: 60,
          top: `${55 + (scrollProgress * 55)}vh`, // Same vertical position as video container
          height: `${500 + (scrollProgress * 200)}px`, // Same height as video container
          left: `calc(50% - ${scrollProgress * 200}px + 32.5%)`, // Position with 32.5% offset from video container
          transform: scrollProgress > 0.8 ? 'translateX(0)' : 'translateX(100%)',
        }}
      >
        <div className="p-6 h-full flex flex-col justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              AI Insights
            </h2>
            <p className="text-base text-gray-600 mb-6">
              Discover how our AI processes your data to create accurate demand forecasts.
            </p>
            <div className="space-y-3">
              <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3">
                <h3 className="font-semibold text-gray-800 mb-1 text-sm">Real-time Analysis</h3>
                <p className="text-xs text-gray-600">Processing live data from multiple sources</p>
              </div>
              <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3">
                <h3 className="font-semibold text-gray-800 mb-1 text-sm">Predictive Modeling</h3>
                <p className="text-xs text-gray-600">Advanced algorithms forecast future demand</p>
              </div>
              <div className="bg-white/30 backdrop-blur-sm rounded-xl p-3">
                <h3 className="font-semibold text-gray-800 mb-1 text-sm">Smart Recommendations</h3>
                <p className="text-xs text-gray-600">Actionable insights to optimize inventory</p>
              </div>
            </div>
            <button 
              onClick={() => setIsVoiceAgentOpen(true)}
              className="mt-6 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm flex items-center space-x-2 mx-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>Learn More with Voice</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Voice Agent Modal */}
      <SproutVoiceAgent 
        isOpen={isVoiceAgentOpen} 
        onClose={() => setIsVoiceAgentOpen(false)} 
      />
    </div>
  );
}

function SignUpPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password);
      navigate('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Failed to create an account');
    }
    setLoading(false);
  };


  return (
    <div className="min-h-screen bg-gradient-to-b from-[#DEE2ED] to-white">
      <Header />
      <div className="flex min-h-screen">
        {/* Left side - Login/Signup form */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-16">
          <div className="w-full max-w-md animate-slide-in-left">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Sign Up</h1>
            <p className="text-gray-600 mb-8">Create your account to get started</p>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Create a password"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </button>
              <p className="text-center text-gray-600">
                Already have an account?{' '}
                <a href="/login" className="text-green-600 hover:text-green-700 font-medium">
                  Log In
                </a>
              </p>
            </form>
          </div>
        </div>
        
        {/* Right side - Image with curved edges, positioned lower */}
        <div className="hidden lg:flex lg:w-1/2 items-end justify-end pr-8 pb-8 mt-32 animate-slide-in-right">
          <div className="relative w-[120%] h-5/6 rounded-3xl overflow-hidden -mr-20">
            <img 
              src={authImage} 
              alt="Authentication" 
              className="w-full h-full object-cover rounded-3xl"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/10 rounded-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      setError('Failed to log in');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#DEE2ED] to-white">
      <Header />
      <div className="flex min-h-screen">
        {/* Left side - Login/Signup form */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-16">
          <div className="w-full max-w-md animate-slide-in-left">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Welcome Back</h1>
            <p className="text-gray-600 mb-8">Sign in to your account</p>
            <form className="space-y-6" onSubmit={handleSignIn}>
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
                  required
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center">
                  <input type="checkbox" className="rounded border-gray-300 text-green-600 focus:ring-green-500" />
                  <span className="ml-2 text-sm text-gray-600">Remember me</span>
                </label>
                <a href="#" className="text-sm text-green-600 hover:text-green-700 font-medium">
                  Forgot password?
                </a>
              </div>
              <button 
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
              <p className="text-center text-gray-600">
                Don't have an account?{' '}
                <a href="/signup" className="text-green-600 hover:text-green-700 font-medium">
                  Sign Up
                </a>
              </p>
            </form>
          </div>
        </div>
        
        {/* Right side - Image with curved edges, positioned lower */}
        <div className="hidden lg:flex lg:w-1/2 items-end justify-end pr-8 pb-8 mt-32 animate-slide-in-right">
          <div className="relative w-[120%] h-5/6 rounded-3xl overflow-hidden -mr-20">
            <img 
              src={authImage} 
              alt="Authentication" 
              className="w-full h-full object-cover rounded-3xl"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-white/10 rounded-3xl"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardPage() {
  const { currentUser, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string, timestamp: Date}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Load messages from Firebase when user logs in
  useEffect(() => {
    if (currentUser) {
      geminiChatService.setUserId(currentUser.uid);
      loadMessagesFromFirebase();
    } else {
      geminiChatService.setUserId(null);
      setChatMessages([]);
    }
  }, [currentUser]);

  const loadMessagesFromFirebase = async () => {
    try {
      const messages = await geminiChatService.loadMessagesFromFirebase();
      setChatMessages(messages);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!searchQuery.trim() || isLoading) return;

    const userMessage = searchQuery.trim();
    setSearchQuery('');
    setIsLoading(true);

    // Add user message to chat
    setChatMessages(prev => [...prev, {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }]);

    try {
      const response = await geminiChatService.sendMessage(userMessage);
      
      // Add AI response to chat
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      }]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${errorMessage}. Please try again.`,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#DEE2ED] to-white font-inter relative">
      <Header />
      
      {/* Moving Green Radial Glows - Full Viewport Coverage */}
      {activeSection === 'dashboard' && (
        <div className="fixed inset-0 pointer-events-none z-10">
          {/* Large moving glows with custom animations - full viewport coverage */}
          <div className="absolute top-1/4 left-1/6 w-96 h-96 bg-green-400/20 rounded-full blur-3xl animate-float-1"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-green-300/15 rounded-full blur-3xl animate-float-2" style={{ animationDelay: '1s' }}></div>
          <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-green-500/10 rounded-full blur-3xl animate-float-3" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/3 right-1/3 w-72 h-72 bg-green-400/25 rounded-full blur-3xl animate-float-4" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute bottom-1/4 left-1/3 w-88 h-88 bg-green-300/20 rounded-full blur-3xl animate-float-1" style={{ animationDelay: '1.5s' }}></div>
          
          {/* Additional smaller glows with different movements */}
          <div className="absolute top-1/6 right-1/6 w-48 h-48 bg-green-400/15 rounded-full blur-2xl animate-fast-drift" style={{ animationDelay: '0.3s' }}></div>
          <div className="absolute bottom-1/3 right-1/2 w-56 h-56 bg-green-500/20 rounded-full blur-3xl animate-slow-drift" style={{ animationDelay: '2.5s' }}></div>
          <div className="absolute top-2/3 left-1/6 w-40 h-40 bg-green-300/25 rounded-full blur-2xl animate-float-2" style={{ animationDelay: '1.8s' }}></div>
          <div className="absolute top-1/5 left-2/3 w-60 h-60 bg-green-400/18 rounded-full blur-3xl animate-float-3" style={{ animationDelay: '3s' }}></div>
          
          {/* Fast moving smaller glows */}
          <div className="absolute top-1/8 right-1/8 w-32 h-32 bg-green-300/30 rounded-full blur-xl animate-fast-drift" style={{ animationDelay: '0.8s' }}></div>
          <div className="absolute bottom-1/5 left-1/5 w-36 h-36 bg-green-500/22 rounded-full blur-xl animate-float-4" style={{ animationDelay: '1.2s' }}></div>
          <div className="absolute top-4/5 right-2/3 w-28 h-28 bg-green-400/28 rounded-full blur-xl animate-fast-drift" style={{ animationDelay: '2.2s' }}></div>
          <div className="absolute top-1/2 right-1/8 w-44 h-44 bg-green-300/20 rounded-full blur-2xl animate-slow-drift" style={{ animationDelay: '0.6s' }}></div>
          
          {/* Extra large background glows with slow movement */}
          <div className="absolute top-0 left-0 w-120 h-120 bg-green-200/8 rounded-full blur-3xl animate-slow-drift" style={{ animationDelay: '4s' }}></div>
          <div className="absolute bottom-0 right-0 w-112 h-112 bg-green-300/12 rounded-full blur-3xl animate-slow-drift" style={{ animationDelay: '3.5s' }}></div>
          
          {/* Additional medium glows for more coverage */}
          <div className="absolute top-1/12 left-1/2 w-52 h-52 bg-green-400/16 rounded-full blur-2xl animate-float-1" style={{ animationDelay: '1.3s' }}></div>
          <div className="absolute bottom-1/6 right-1/6 w-46 h-46 bg-green-500/14 rounded-full blur-2xl animate-float-3" style={{ animationDelay: '2.8s' }}></div>
          <div className="absolute top-3/4 left-1/8 w-38 h-38 bg-green-300/22 rounded-full blur-xl animate-fast-drift" style={{ animationDelay: '0.9s' }}></div>
          <div className="absolute top-1/4 right-1/12 w-42 h-42 bg-green-400/24 rounded-full blur-xl animate-float-2" style={{ animationDelay: '3.2s' }}></div>
          
          {/* Additional left-side glows to fill the sidebar area */}
          <div className="absolute top-1/6 left-0 w-64 h-64 bg-green-300/12 rounded-full blur-3xl animate-slow-drift" style={{ animationDelay: '2.1s' }}></div>
          <div className="absolute top-2/5 left-1/12 w-48 h-48 bg-green-400/18 rounded-full blur-2xl animate-float-2" style={{ animationDelay: '1.7s' }}></div>
          <div className="absolute bottom-1/4 left-1/16 w-56 h-56 bg-green-500/15 rounded-full blur-3xl animate-fast-drift" style={{ animationDelay: '0.4s' }}></div>
        </div>
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-4 top-1/2 transform -translate-y-1/2 z-30 transition-all duration-500 ease-in-out ${sidebarOpen ? 'w-64' : 'w-16'}`}>
        <div className="relative bg-white/20 backdrop-blur-md border border-white/30 h-4/5 rounded-2xl flex flex-col shadow-2xl">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-white/20">
            <div className="flex items-center justify-between">
              {sidebarOpen && (
                <h2 className="text-lg font-bold text-gray-800 font-inter">Menu</h2>
              )}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-white/20 transition-colors"
              >
                {sidebarOpen ? <X className="w-5 h-5 text-gray-700" /> : <Menu className="w-5 h-5 text-gray-700" />}
              </button>
            </div>
          </div>
          
          {/* Navigation Items */}
           <nav className="flex-1 p-4 space-y-2">
             <NavItem icon={Home} label="Dashboard" active={activeSection === 'dashboard'} expanded={sidebarOpen} onClick={() => setActiveSection('dashboard')} />
             <NavItem icon={BarChart} label="Analytics" active={activeSection === 'analytics'} expanded={sidebarOpen} onClick={() => setActiveSection('analytics')} />
             <NavItem icon={Calendar} label="Events" active={activeSection === 'events'} expanded={sidebarOpen} onClick={() => setActiveSection('events')} />
             <NavItem icon={Package} label="Inventory" active={activeSection === 'inventory'} expanded={sidebarOpen} onClick={() => setActiveSection('inventory')} />
             <NavItem icon={AlertTriangle} label="Alerts" active={activeSection === 'alerts'} expanded={sidebarOpen} onClick={() => setActiveSection('alerts')} />
             <NavItem icon={Settings} label="Settings" active={activeSection === 'settings'} expanded={sidebarOpen} onClick={() => setActiveSection('settings')} />
             <NavItem icon={HelpCircle} label="Help" active={activeSection === 'help'} expanded={sidebarOpen} onClick={() => setActiveSection('help')} />
           </nav>
          
          {/* Logout */}
          <div className="p-4 border-t border-white/20">
            <button 
              onClick={logout}
              className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 font-inter transform hover:scale-105 text-gray-700 hover:bg-white/20"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
            </button>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`transition-all duration-500 ease-in-out ${sidebarOpen ? 'ml-80' : 'ml-32'}`}>
        {activeSection === 'dashboard' && (
          <div className="min-h-screen pt-12 relative">
            
            {chatMessages.length === 0 ? (
              /* Initial Dashboard - Before First Message */
              <div className="flex items-center justify-center min-h-screen relative z-50">
                <div className="text-center max-w-4xl mx-auto px-8" style={{ transform: 'translateX(-5%)' }}>
                  {/* Welcome Message */}
                  <h1 className="text-7xl font-bold text-gray-800 mb-6 animate-fade-in-up font-inter">
                    Hello!
                  </h1>
                  <p className="text-xl text-gray-600 mb-8 animate-fade-in-up font-inter" style={{ animationDelay: '0.2s' }}>
                    Tell us what you need, and we'll handle the rest.
                  </p>
                  
                  {/* Three Column Suggestions */}
                  <div className="grid md:grid-cols-3 gap-6 mb-8 animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
                    {/* Analytics Column */}
                    <div 
                      onClick={() => setActiveSection('analytics')}
                      className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer hover:bg-white/30"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <BarChart className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-base font-bold text-gray-800 font-inter">Analytics</h3>
                      </div>
                    </div>

                    {/* What's Going Bad Column */}
                    <div 
                      onClick={() => setActiveSection('alerts')}
                      className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer hover:bg-white/30"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <h3 className="text-base font-bold text-gray-800 font-inter">What's Going Bad</h3>
                      </div>
                    </div>

                    {/* Inventory Management Column */}
                    <div 
                      onClick={() => setActiveSection('inventory')}
                      className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-500 transform hover:scale-105 cursor-pointer hover:bg-white/30"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-base font-bold text-gray-800 font-inter">Inventory</h3>
                      </div>
                    </div>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="max-w-4xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
                    <div className="relative">
                      <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl shadow-2xl p-6">
                        {/* Input Field */}
                        <div className="flex items-center space-x-3 mb-4">
                          <Zap className="w-5 h-5 text-gray-400 flex-shrink-0" />
                          <input 
                            type="text" 
                            placeholder="Ask me about inventory management, demand forecasting, or grocery analytics..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleSendMessage();
                              }
                            }}
                            className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 text-lg font-inter focus:outline-none"
                          />
                        </div>
                        
                        {/* Button Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <button className="flex items-center space-x-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors font-inter">
                              <span className="text-sm">Select Source</span>
                              <ChevronDown className="w-4 h-4" />
                            </button>
                            
                            <button className="flex items-center space-x-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors font-inter">
                              <Paperclip className="w-4 h-4" />
                              <span className="text-sm">Attach</span>
                            </button>
                            
                            <button className="flex items-center space-x-2 bg-white border border-gray-200 rounded-full px-4 py-2 text-gray-700 hover:bg-gray-50 transition-colors font-inter">
                              <Mic className="w-4 h-4" />
                              <span className="text-sm">Voice</span>
                            </button>
                          </div>
                          
                          <button 
                            onClick={handleSendMessage}
                            disabled={!searchQuery.trim() || isLoading}
                            className="flex items-center space-x-2 bg-gray-800 text-white rounded-full px-6 py-2 hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-inter"
                          >
                            <ArrowRight className="w-4 h-4" />
                            <span className="text-sm font-medium">Send</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Chat Interface - After First Message */
              <div className="w-full max-w-7xl mx-auto px-4 pr-8 pt-16 relative z-50">
                <div className="grid grid-cols-2 gap-6 h-[600px]">
                  {/* Left Section - Chat Messages + Search */}
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6 flex flex-col">
                    {/* Chat Messages */}
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                          <MessageCircle className="w-5 h-5 mr-2 text-blue-600" />
                          Sprout x AI
                        </h3>
                        <button
                          onClick={() => setChatMessages([])}
                          className="text-xs text-gray-500 hover:text-gray-700 px-3 py-1 rounded-full hover:bg-gray-100 transition-colors"
                        >
                          Clear Chat
                        </button>
                      </div>
                      <div className="space-y-4 overflow-y-auto h-80 pb-6">
                        {chatMessages.map((message, index) => (
                          <div
                            key={index}
                            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                          >
                            <div
                              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                                message.role === 'user'
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              <div className="flex-1">
                                <div 
                                  className="text-sm"
                                  dangerouslySetInnerHTML={{ __html: message.content.replace(/\n/g, '<br>') }}
                                />
                                <p className="text-xs opacity-70 mt-1">
                                  {message.timestamp.toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit' 
                                  })}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        {isLoading && (
                          <div className="flex justify-start">
                          <div className="bg-gray-100 rounded-2xl px-4 py-3 max-w-[85%]">
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                              </div>
                            </div>
                          </div>
                          </div>
                        )}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
                    
                    {/* Search Bar - Moved to Left Section */}
                    <div className="border-t border-gray-200 pt-4">
                      <div className="bg-white/90 backdrop-blur-md border border-gray-200 rounded-2xl p-4">
                        {/* Input Field */}
                        <div className="flex items-center space-x-3 mb-3">
                          <Zap className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <input 
                            type="text" 
                            placeholder="Ask me anything..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                handleSendMessage();
                              }
                            }}
                            className="flex-1 bg-transparent text-gray-800 placeholder-gray-400 text-sm font-inter focus:outline-none"
                          />
                        </div>
                        
                        {/* Button Row */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <button className="flex items-center space-x-1 bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-700 hover:bg-gray-50 transition-colors font-inter text-xs">
                              <span>Select Source</span>
                              <ChevronDown className="w-3 h-3" />
                            </button>
                            
                            <button className="flex items-center space-x-1 bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-700 hover:bg-gray-50 transition-colors font-inter text-xs">
                              <Paperclip className="w-3 h-3" />
                              <span>Attach</span>
                            </button>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <button className="flex items-center space-x-1 bg-white border border-gray-200 rounded-full px-3 py-1 text-gray-700 hover:bg-gray-50 transition-colors font-inter text-xs">
                              <Mic className="w-3 h-3" />
                              <span>Dictation</span>
                            </button>
                            
                            <button 
                              onClick={handleSendMessage}
                              disabled={!searchQuery.trim() || isLoading}
                              className="w-8 h-8 bg-gray-800 text-white rounded-full hover:bg-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-inter flex items-center justify-center"
                            >
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Section - Analysis Container */}
                  <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 flex items-center">
                        <BarChart className="w-5 h-5 mr-2 text-green-600" />
                        Analysis & Insights
                      </h3>
                      <div className="text-xs text-gray-500">
                        Interactive Store Map & Product Search
                      </div>
                    </div>
         <div className="flex-1 flex flex-col">
           <MappedInGroceryStore 
             className="w-full flex-1 min-h-[400px]" 
             onSendChatMessage={(message) => {
               setChatMessages(prev => [...prev, {
                 role: 'assistant',
                 content: message,
                 timestamp: new Date()
               }]);
             }}
           />
         </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {activeSection === 'analytics' && (
          <div className="pt-28 pl-2 pr-8 pb-8 animate-fade-in-up">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl">
              <EvaluationScreen />
            </div>
          </div>
        )}

        {activeSection === 'events' && (
          <div className="pt-28 pl-2 pr-8 pb-8 animate-fade-in-up">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl">
              {/* Two column layout - Map and Events */}
              <div className="p-5">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[600px]">
                  {/* Left Column - Interactive Mapbox Map */}
                  <div className="overflow-hidden rounded-lg">
                    <MapboxMap 
                      apiToken="pk.eyJ1IjoiYWNoYW5kcmEzMDAiLCJhIjoiY202MnptdnNwMHV5ajJxb2NwemFrdjQzOCJ9.4MD5Ach6BHt98ooeBDoZ9A"
                      className="h-full w-full"
                    />
                  </div>

                  {/* Right Column - Real-time Events */}
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20 flex flex-col overflow-hidden">
                    <h3 className="text-base font-semibold text-gray-800 mb-3 flex items-center">
                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                      Real-time Philadelphia Events
                    </h3>
                    
                    <div className="flex-1 overflow-y-auto space-y-3">
                      {/* Live Events Feed */}
                      <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-lg p-3 border border-red-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800 text-sm">Philadelphia Food & Wine Festival</h4>
                          <span className="bg-red-500 text-white px-2 py-0.5 rounded-full text-xs font-medium animate-pulse">LIVE</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">Reading Terminal Market • Today 10AM-6PM</p>
                        <p className="text-xs text-gray-700">Local food vendors, wine tastings, live cooking demos. Expected 40% increase in foot traffic.</p>
                        <div className="flex items-center mt-2">
                          <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse mr-2"></div>
                          <span className="text-xs text-gray-500">Updated 2 minutes ago</span>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800 text-sm">Pennsylvania Farm Show</h4>
                          <span className="bg-blue-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">TODAY</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">Pennsylvania Convention Center • 9AM-9PM</p>
                        <p className="text-xs text-gray-700">Agricultural showcase with local produce vendors. Impact on wholesale prices expected.</p>
                        <div className="flex items-center mt-2">
                          <div className="w-1 h-1 bg-blue-500 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-500">Updated 15 minutes ago</span>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-3 border border-green-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800 text-sm">Italian Market Festival</h4>
                          <span className="bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">THIS WEEKEND</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">9th Street Italian Market • Sat-Sun 10AM-5PM</p>
                        <p className="text-xs text-gray-700">Street festival with Italian food vendors, live music. High demand for specialty ingredients.</p>
                        <div className="flex items-center mt-2">
                          <div className="w-1 h-1 bg-green-500 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-500">Updated 1 hour ago</span>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-3 border border-purple-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800 text-sm">Philadelphia Marathon</h4>
                          <span className="bg-purple-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">NEXT WEEK</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">Benjamin Franklin Parkway • Nov 19, 7AM</p>
                        <p className="text-xs text-gray-700">30,000+ runners expected. Increased demand for healthy snacks and energy drinks.</p>
                        <div className="flex items-center mt-2">
                          <div className="w-1 h-1 bg-purple-500 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-500">Updated 3 hours ago</span>
                        </div>
                      </div>
                      
                      <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-lg p-3 border border-yellow-200">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold text-gray-800 text-sm">Thanksgiving Week Preparation</h4>
                          <span className="bg-yellow-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">SEASONAL</span>
                        </div>
                        <p className="text-xs text-gray-600 mb-1">Citywide • Nov 20-26</p>
                        <p className="text-xs text-gray-700">Peak shopping period for holiday ingredients. 60% increase in grocery demand expected.</p>
                        <div className="flex items-center mt-2">
                          <div className="w-1 h-1 bg-yellow-500 rounded-full mr-2"></div>
                          <span className="text-xs text-gray-500">Updated 6 hours ago</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Event Impact Summary */}
                    <div className="mt-4 bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                      <h4 className="text-sm font-semibold text-gray-800 mb-2">Impact Summary</h4>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex justify-between">
                          <span>Active Events:</span>
                          <span className="font-semibold text-blue-600">3</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Expected Demand:</span>
                          <span className="font-semibold text-green-600">+35%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'inventory' && (
          <div className="pt-28 pl-2 pr-8 pb-8 animate-fade-in-up">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl">
              <OrdersScreen />
            </div>
          </div>
        )}

        {activeSection === 'alerts' && (
          <div className="pt-28 pl-2 pr-8 pb-8 animate-fade-in-up">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Alerts & What's Going Bad</h1>
              <p className="text-gray-600 mb-6">Monitor products that are expiring soon or have low stock levels.</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <h3 className="font-semibold text-red-800">Expiring Soon</h3>
                  </div>
                  <p className="text-sm text-red-700">12 items expiring in the next 3 days</p>
                </div>
                
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="w-5 h-5 text-yellow-600" />
                    <h3 className="font-semibold text-yellow-800">Low Stock</h3>
                  </div>
                  <p className="text-sm text-yellow-700">8 items below minimum stock level</p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <BarChart className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-800">Performance</h3>
                  </div>
                  <p className="text-sm text-blue-700">3 items with declining sales</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'settings' && (
          <div className="pt-28 pl-2 pr-8 pb-8 animate-fade-in-up">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Settings</h1>
              <p className="text-gray-600 mb-6">Configure your forecasting preferences and system settings.</p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Notification Preferences</h3>
                  <p className="text-sm text-gray-600">Configure alerts and notifications for low stock and expiring items.</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">API Integrations</h3>
                  <p className="text-sm text-gray-600">Connect external data sources like weather, promotions, and events.</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Forecasting Models</h3>
                  <p className="text-sm text-gray-600">Adjust forecasting algorithms and parameters.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSection === 'help' && (
          <div className="pt-28 pl-2 pr-8 pb-8 animate-fade-in-up">
            <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl shadow-2xl p-6">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Help & Support</h1>
              <p className="text-gray-600 mb-6">Get help with using the forecasting platform and managing your inventory.</p>
              
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Getting Started</h3>
                  <p className="text-sm text-gray-600">Learn how to set up your first forecasts and manage your inventory.</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Analytics Guide</h3>
                  <p className="text-sm text-gray-600">Understand how to interpret forecasting results and KPI metrics.</p>
                </div>
                
                <div className="bg-gray-50 rounded-xl p-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Contact Support</h3>
                  <p className="text-sm text-gray-600">Get in touch with our support team for technical assistance.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
}

// NavItem Component
function NavItem({ icon: Icon, label, active = false, expanded, onClick }: { icon: React.ComponentType<{ className?: string }>, label: string, active?: boolean, expanded: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 font-inter transform hover:scale-105 ${
        active 
          ? 'bg-white/30 text-gray-800 shadow-lg' 
          : 'text-gray-700 hover:bg-white/20'
      }`}
    >
      <Icon className="w-5 h-5 flex-shrink-0" />
      {expanded && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
}

export default App;