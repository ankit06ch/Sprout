// Debug script to test Firestore connection
// Run this in the browser console to debug Firestore issues

console.log('=== Firestore Debug Script ===');

// Check if firestoreDebug is available
if (typeof window.firestoreDebug !== 'undefined') {
  console.log('Firestore Debug Info:');
  console.log('- Initialization Attempts:', window.firestoreDebug.getInitializationAttempts());
  console.log('- Is Firestore Initialized:', window.firestoreDebug.isFirestoreInitialized());
  console.log('- Firestore Instance:', window.firestoreDebug.getFirestoreInstance());
  console.log('- Auth State:', window.firestoreDebug.getAuthState());
  console.log('- Network Enabled:', window.firestoreDebug.isNetworkEnabled());
} else {
  console.log('firestoreDebug not available - check if Firebase config is loaded');
}

// Check Firebase Auth
if (typeof window !== 'undefined' && window.firebase) {
  console.log('Firebase SDK detected');
} else {
  console.log('Firebase SDK not detected in window object');
}

// Test Firestore connection
async function testFirestoreConnection() {
  try {
    console.log('Testing Firestore connection...');
    
    if (typeof window.firestoreDebug !== 'undefined') {
      const db = window.firestoreDebug.getFirestoreInstance();
      if (db) {
        console.log('Firestore instance found:', db);
        
        // Try to enable network
        console.log('Attempting to enable network...');
        // This would need to be called from the actual app context
        console.log('Network status:', window.firestoreDebug.isNetworkEnabled());
      } else {
        console.log('No Firestore instance found');
      }
    } else {
      console.log('firestoreDebug not available');
    }
  } catch (error) {
    console.error('Error testing Firestore connection:', error);
  }
}

// Export for manual testing
window.testFirestoreConnection = testFirestoreConnection;

console.log('Debug script loaded. Call testFirestoreConnection() to test the connection.');