// Firebase Configuration
// Get these values from https://console.firebase.google.com/
// 
// Setup Instructions:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (or use existing)
// 3. Enable Firestore Database
// 4. Go to Project Settings → General → Your apps
// 5. Add a Web app (</> icon)
// 6. Copy the config values below
// 7. Replace the values in this file

const FirebaseConfig = {
  // Your Firebase configuration
  // ✅ All values configured from Firebase Console
  apiKey: "AIzaSyCtAd6ERLPStAfnrqzDksxIMAh7BfP5U0c",
  authDomain: "freefire-fd9f2.firebaseapp.com",
  projectId: "freefire-fd9f2",
  storageBucket: "freefire-fd9f2.firebasestorage.app",
  messagingSenderId: "672900671608",
  appId: "1:672900671608:web:ce9abe6144e357ba0fa58d",
  measurementId: "G-64QEF30Z1B", // Optional: for Analytics
  
  // Enable/disable Firebase (set to false to use localStorage fallback)
  enabled: true, // ✅ Firebase enabled - data will be shared across devices
  
  // Use localStorage as fallback if Firebase fails
  fallbackToLocalStorage: true
};

// Make it globally available
window.FirebaseConfig = FirebaseConfig;

