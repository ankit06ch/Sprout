// Import the functions you need from the SDKs you need
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth";
import { getFirestore, Firestore, enableNetwork, disableNetwork, connectFirestoreEmulator } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCDPhq7LE3IiQTYVxlKBgxS4lJQLUSl-kM",
  authDomain: "sprout-2b8b6.firebaseapp.com",
  projectId: "sprout-2b8b6",
  storageBucket: "sprout-2b8b6.firebasestorage.app",
  messagingSenderId: "56991574661",
  appId: "1:56991574661:web:dc322e37fa7e2c9e6957ec"
};

// Debug logging function
const debugLog = (message: string, data?: any) => {
  const timestamp = new Date().toISOString();
  console.log(`[FIRESTORE DEBUG ${timestamp}] ${message}`, data || '');
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
debugLog('Firebase app initialized:', {
  name: app.name,
  projectId: app.options.projectId,
  apiKey: app.options.apiKey?.substring(0, 10) + '...'
});

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);
debugLog('Firebase Auth initialized');

// Lazy Firestore initialization to prevent automatic connections
let _db: Firestore | null = null;
let _firestoreInitialized = false;
let _initializationAttempts = 0;
let _isNetworkEnabled = false;

// Global debug function to track Firestore usage
(window as any).firestoreDebug = {
  getInitializationAttempts: () => _initializationAttempts,
  isFirestoreInitialized: () => _firestoreInitialized,
  getFirestoreInstance: () => _db,
  getAuthState: () => ({
    currentUser: auth.currentUser?.uid || 'null',
    email: auth.currentUser?.email || 'null',
    isAuthenticated: !!auth.currentUser
  }),
  isNetworkEnabled: () => _isNetworkEnabled,
  forceInitialize: () => {
    debugLog('FORCE INITIALIZATION CALLED');
    _db = getFirestore(app);
    _firestoreInitialized = true;
    return _db;
  },
  reset: () => {
    debugLog('RESET CALLED');
    _db = null;
    _firestoreInitialized = false;
    _initializationAttempts = 0;
    _isNetworkEnabled = false;
  }
};

// Log when this module is loaded
debugLog('Firebase config module loaded');

// Function to get Firestore instance (lazy initialization)
export const getDb = (): Firestore | null => {
  _initializationAttempts++;
  debugLog(`getDb() called - Attempt #${_initializationAttempts}`);
  debugLog(`Auth state:`, {
    currentUser: auth.currentUser?.uid || 'null',
    email: auth.currentUser?.email || 'null',
    isAuthenticated: !!auth.currentUser
  });
  
  // Only initialize Firestore if user is authenticated
  if (!auth.currentUser && !_firestoreInitialized) {
    debugLog('Firestore not initialized - user not authenticated');
    return null;
  }
  
  if (!_db) {
    try {
      debugLog('Initializing Firestore for the first time...');
      _db = getFirestore(app);
      _firestoreInitialized = true;
      debugLog('Firestore initialized successfully', {
        app: app.name,
        projectId: app.options.projectId
      });
      
    } catch (error) {
      debugLog('Failed to initialize Firestore:', error);
      return null;
    }
  }
  
  debugLog('Returning Firestore instance:', !!_db);
  return _db;
};

// Function to control Firestore network connectivity
export const controlFirestoreNetwork = async (enable: boolean) => {
  debugLog(`controlFirestoreNetwork called: enable=${enable}, current state: ${_isNetworkEnabled}`);
  
  // If already in the desired state, return early
  if (_isNetworkEnabled === enable) {
    debugLog('Firestore network already in desired state:', enable ? 'enabled' : 'disabled');
    return;
  }
  
  const db = getDb();
  if (!db) {
    debugLog('Firestore not available for network control');
    return;
  }
  
  try {
    if (enable) {
      debugLog('Enabling Firestore network...');
      await enableNetwork(db);
      _isNetworkEnabled = true;
    } else {
      debugLog('Disabling Firestore network...');
      await disableNetwork(db);
      _isNetworkEnabled = false;
    }
    debugLog('Firestore network control successful:', enable ? 'enabled' : 'disabled');
  } catch (error) {
    debugLog('Firestore network control error:', error);
    // Don't update _isNetworkEnabled on error
  }
};

// Export db for backward compatibility (but it will be null initially)
// Don't call getDb() here as it defeats lazy initialization
export const db = null;

export default app;