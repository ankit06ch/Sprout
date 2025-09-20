import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { BarChart, AlertTriangle, Package, ChevronDown, Paperclip, Mic, Send, Menu, X, Home, Settings, HelpCircle, LogOut, Zap, Folder, File } from 'react-feather';
import Header from './components/Header';
import ScrollIcons from './components/ScrollIcons';
import PipelineLines from './components/PipelineLines';
import authImage from './assets/logo/authImage.jpg';

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
    <Router>
      <Routes>
        <Route path="/" element={<HomePage scrollProgress={scrollProgress} />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </Router>
  );
}

function HomePage({ scrollProgress }: { scrollProgress: number }) {
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
              Smarter Sales,<br />
              Less Waste
            </h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8 max-w-3xl mx-auto">
              AI demand forecasting for<br />
              every product, every store, every day.
            </p>
            <button className="group bg-gradient-to-r from-green-600 to-green-700 text-white px-10 py-3 rounded-2xl text-lg font-bold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center space-x-2 mx-auto">
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
            <button className="mt-6 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-2 rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] text-sm">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#DEE2ED] to-white">
      <Header />
      <div className="flex min-h-screen">
        {/* Left side - Login/Signup form */}
        <div className="flex-1 flex items-center justify-center px-8 lg:px-16">
          <div className="w-full max-w-md animate-slide-in-left">
            <h1 className="text-4xl font-bold text-gray-800 mb-2">Sign Up</h1>
            <p className="text-gray-600 mb-8">Create your account to get started</p>
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Create a password"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Confirm your password"
                />
              </div>
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Create Account
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
  const navigate = useNavigate();

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input 
                  type="email" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <input 
                  type="password" 
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  placeholder="Enter your password"
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
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white py-3 rounded-xl font-bold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                Sign In
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#DEE2ED] to-white font-inter">
      <Header />
      
      {/* Sidebar */}
      <div className={`fixed left-4 top-1/2 transform -translate-y-1/2 z-30 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-16'}`}>
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
            <NavItem icon={Home} label="Dashboard" active={true} expanded={sidebarOpen} />
            <NavItem icon={BarChart} label="Analytics" expanded={sidebarOpen} />
            <NavItem icon={Package} label="Inventory" expanded={sidebarOpen} />
            <NavItem icon={AlertTriangle} label="Alerts" expanded={sidebarOpen} />
            <NavItem icon={Settings} label="Settings" expanded={sidebarOpen} />
            <NavItem icon={HelpCircle} label="Help" expanded={sidebarOpen} />
          </nav>
          
          {/* Logout */}
          <div className="p-4 border-t border-white/20">
            <NavItem icon={LogOut} label="Logout" expanded={sidebarOpen} />
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'ml-80' : 'ml-32'}`}>
        <div className="flex items-center justify-center min-h-screen pt-20">
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
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <BarChart className="w-5 h-5 text-blue-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800 font-inter">Analytics</h3>
                </div>
              </div>

              {/* What's Going Bad Column */}
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="text-base font-bold text-gray-800 font-inter">What's Going Bad</h3>
                </div>
              </div>

              {/* Inventory Management Column */}
              <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 cursor-pointer">
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
                      placeholder="Ask me anything..."
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
                    
                    <button className="flex items-center space-x-2 bg-gray-800 text-white rounded-full px-6 py-2 hover:bg-gray-900 transition-colors font-inter">
                      <Send className="w-4 h-4" />
                      <span className="text-sm font-medium">Send</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// NavItem Component
function NavItem({ icon: Icon, label, active = false, expanded }: { icon: React.ComponentType<{ className?: string }>, label: string, active?: boolean, expanded: boolean }) {
  return (
    <button className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-all duration-300 font-inter ${
      active 
        ? 'bg-white/30 text-gray-800' 
        : 'text-gray-700 hover:bg-white/20'
    }`}>
      <Icon className="w-5 h-5 flex-shrink-0" />
      {expanded && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
}

export default App;