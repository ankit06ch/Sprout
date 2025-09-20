// Advanced Firestore Debug Script
// Run this in the browser console to get comprehensive debugging information

(function() {
  console.log('=== ADVANCED FIRESTORE DEBUG SCRIPT ===');
  
  // Check if Firebase is loaded
  if (typeof window.firestoreDebug === 'undefined') {
    console.error('❌ window.firestoreDebug is not available. Make sure src/firebase/config.ts is loaded.');
    return;
  }

  const debug = window.firestoreDebug;
  
  console.log('\n📊 FIRESTORE STATE ANALYSIS:');
  console.log('============================');
  
  // Basic state
  console.log('Initialization Attempts:', debug.getInitializationAttempts());
  console.log('Firestore Initialized:', debug.isFirestoreInitialized());
  console.log('Network Enabled:', debug.isNetworkEnabled());
  console.log('Firestore Instance:', debug.getFirestoreInstance() ? '✅ Available' : '❌ Not Available');
  
  // Auth state
  const authState = debug.getAuthState();
  console.log('\n🔐 AUTHENTICATION STATE:');
  console.log('========================');
  console.log('User ID:', authState.currentUser);
  console.log('Email:', authState.email);
  console.log('Is Authenticated:', authState.isAuthenticated);
  
  // Check for Firebase app instance
  console.log('\n🔥 FIREBASE APP CHECK:');
  console.log('=====================');
  if (typeof firebase !== 'undefined') {
    console.log('Firebase global available:', !!firebase);
    if (firebase.apps && firebase.apps.length > 0) {
      console.log('Firebase apps:', firebase.apps.map(app => ({
        name: app.name,
        projectId: app.options.projectId,
        apiKey: app.options.apiKey?.substring(0, 10) + '...'
      })));
    }
  } else {
    console.log('Firebase global not available');
  }
  
  // Check for Firestore instance details
  console.log('\n📚 FIRESTORE INSTANCE DETAILS:');
  console.log('==============================');
  const db = debug.getFirestoreInstance();
  if (db) {
    console.log('Database ID:', db._databaseId?.databaseId);
    console.log('Project ID:', db._databaseId?.projectId);
    console.log('App Name:', db._app?.name);
    console.log('Settings:', db._settings);
  } else {
    console.log('No Firestore instance available');
  }
  
  // Network connectivity test
  console.log('\n🌐 NETWORK CONNECTIVITY TEST:');
  console.log('=============================');
  
  // Test basic connectivity to Firestore
  fetch('https://firestore.googleapis.com/v1/projects/sprout-2b8b6/databases/(default)/documents')
    .then(response => {
      console.log('Firestore API Response Status:', response.status);
      console.log('Response Headers:', Object.fromEntries(response.headers.entries()));
      return response.text();
    })
    .then(text => {
      console.log('Response Body:', text.substring(0, 500) + (text.length > 500 ? '...' : ''));
    })
    .catch(error => {
      console.log('Network Error:', error.message);
    });
  
  // Check for common issues
  console.log('\n🔍 COMMON ISSUES CHECK:');
  console.log('=======================');
  
  // Check if we're in development mode
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  console.log('Development Mode:', isDev);
  
  // Check for CORS issues
  console.log('Origin:', window.location.origin);
  
  // Check for console errors
  console.log('\n⚠️  CONSOLE ERROR ANALYSIS:');
  console.log('===========================');
  console.log('Look for the following patterns in console errors:');
  console.log('1. "400 Bad Request" - Usually security rules or missing database');
  console.log('2. "CORS" errors - Cross-origin issues');
  console.log('3. "Network Error" - Connectivity issues');
  console.log('4. "Permission denied" - Security rules blocking access');
  
  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:');
  console.log('===================');
  
  if (!authState.isAuthenticated) {
    console.log('1. 🔐 User not authenticated - this is expected if not logged in');
    console.log('2. 📝 Firestore should not be making requests when user is not authenticated');
  } else {
    console.log('1. ✅ User is authenticated');
    console.log('2. 🔍 Check Firestore security rules in Firebase Console');
    console.log('3. 📊 Verify the (default) database exists');
  }
  
  console.log('4. 🌐 Check Firebase Status Dashboard: https://status.firebase.google.com/');
  console.log('5. 📋 Verify API key and project configuration');
  
  // Test functions
  console.log('\n🧪 TEST FUNCTIONS:');
  console.log('==================');
  console.log('To test Firestore initialization: window.firestoreDebug.forceInitialize()');
  console.log('To reset state: window.firestoreDebug.reset()');
  
  console.log('\n=== DEBUG SCRIPT COMPLETE ===');
})();
