import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { auth, controlFirestoreNetwork, getDb } from '../firebase/config';

// Debug logging function for AuthContext
const authDebugLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[AUTH DEBUG ${timestamp}] ${message}`, data || '');
};

// Helper function to get user-friendly error messages
const getAuthErrorMessage = (errorCode: string): string => {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please try logging in instead.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/operation-not-allowed':
      return 'Email/password accounts are not enabled. Please contact support.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/user-disabled':
      return 'This account has been disabled. Please contact support.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your internet connection.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please try again.';
    default:
      return 'An error occurred. Please try again.';
  }
};

interface AuthContextType {
  currentUser: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const signup = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('Signup error:', error);
      throw new Error(getAuthErrorMessage(error.code));
    }
  };

  const logout = async () => {
    await signOut(auth);
  };

  useEffect(() => {
    authDebugLog('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      authDebugLog('Auth state changed:', {
        userId: user?.uid || 'null',
        email: user?.email || 'null',
        isAuthenticated: !!user
      });
      
      setCurrentUser(user);
      setLoading(false);
      
      // Control Firestore network based on authentication status
      if (user) {
        // User is authenticated, initialize Firestore and enable network
        authDebugLog('User authenticated, initializing Firestore...');
        try {
          const db = getDb(); // This will initialize Firestore
          if (db) {
            authDebugLog('Firestore instance obtained, enabling network...');
            // Add a small delay to ensure proper initialization
            setTimeout(async () => {
              await controlFirestoreNetwork(true);
            }, 100);
          } else {
            authDebugLog('Failed to get Firestore instance');
          }
        } catch (error) {
          authDebugLog('Error initializing Firestore:', error);
        }
      } else {
        // User is not authenticated, disable Firestore network to prevent 400 errors
        authDebugLog('User not authenticated, disabling Firestore...');
        try {
          // Only try to disable network if Firestore has been initialized
          const db = getDb();
          if (db) {
            await controlFirestoreNetwork(false);
          } else {
            authDebugLog('Firestore not initialized yet, skipping network disable');
          }
        } catch (error) {
          authDebugLog('Error disabling Firestore network:', error);
        }
      }
    });

    return () => {
      authDebugLog('Cleaning up auth state listener');
      unsubscribe();
    };
  }, []);

  const value = {
    currentUser,
    login,
    signup,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};