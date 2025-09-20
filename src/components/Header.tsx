import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, User } from 'react-feather';
import logoImage from '../assets/logo/sprout.png';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard';

  const handleSignUp = () => {
    navigate('/signup');
  };

  const handleLogIn = () => {
    navigate('/login');
  };
  return (
    <header className="bg-transparent fixed top-0 left-0 right-0" style={{ zIndex: 20 }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-center items-center py-4">
          {/* Navigation bar - glass pill shaped rectangle */}
          <div className="bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-8 py-2 flex items-center justify-between shadow-lg w-11/12">
            {/* Logo on the left */}
            <div className="flex items-center">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center hover:opacity-80 transition-opacity duration-200"
              >
                <img 
                  src={logoImage} 
                  alt="Sprout.AI" 
                  className="h-8 w-auto"
                />
              </button>
            </div>

            {/* All other elements on the right */}
            <div className="flex items-center space-x-8">
              {isDashboard ? (
                // Dashboard view - Profile and Notifications
                <div className="flex items-center space-x-4">
                  {/* Notifications */}
                  <button className="relative p-2 text-gray-800 hover:text-gray-600 hover:bg-white/20 rounded-full transition-all duration-200">
                    <Bell className="w-5 h-5" />
                    {/* Notification badge */}
                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-xs text-white font-bold">3</span>
                    </span>
                  </button>
                  
                  {/* Profile Circle */}
                  <button className="relative p-2 text-gray-800 hover:text-gray-600 hover:bg-white/20 rounded-full transition-all duration-200">
                    <User className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                // Non-dashboard view - Original content
                <>
                  {/* Navigation links */}
                  <nav className="flex items-center space-x-6">
                    <a href="#" className="text-gray-800 hover:text-gray-600 text-sm font-medium transition-colors">
                      Help
                    </a>
                  </nav>

                  {/* Language selector */}
                  <div className="flex items-center space-x-1 text-gray-800 hover:text-gray-600 cursor-pointer transition-colors">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9" />
                    </svg>
                    <span className="text-sm font-medium">EN</span>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center space-x-3">
                    {/* Sign Up button with gradient */}
                    <button 
                      onClick={handleSignUp}
                      className="group bg-gradient-to-r from-green-600 to-green-700 text-white px-5 py-1.5 rounded-xl text-sm font-bold hover:from-green-700 hover:to-green-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] flex items-center space-x-1"
                    >
                      <span>Sign up</span>
                      <svg 
                        className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-0.5" 
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
                    
                    {/* Log In button with outline */}
                    <button 
                      onClick={handleLogIn}
                      className="bg-transparent text-gray-800 px-5 py-1.5 rounded-xl text-sm font-medium border border-gray-400 hover:border-gray-600 hover:bg-gray-50 transition-all duration-200"
                    >
                      Log In
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;