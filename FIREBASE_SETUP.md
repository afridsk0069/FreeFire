# Firebase Setup Guide - Shared Storage Across Devices

To enable shared storage across all devices, you need to set up Firebase Firestore.

## Why Firebase?

- ✅ **Shared Data**: All devices see the same data
- ✅ **Real-time Updates**: Changes appear instantly on all devices
- ✅ **Free Tier**: Generous free quota
- ✅ **No Backend**: Works client-side only

## Setup Steps

### 1. Create Firebase Project

1. **Go to**: https://console.firebase.google.com/
2. **Click**: "Add project" or "Create a project"
3. **Enter project name**: `freefire-team-splitter` (or any name)
4. **Disable Google Analytics** (optional, not needed)
5. **Click**: "Create project"
6. **Wait** for project creation (30 seconds)

### 2. Enable Firestore Database

1. **In Firebase Console**, click "Firestore Database" (left sidebar)
2. **Click**: "Create database"
3. **Choose**: "Start in test mode" (for now)
4. **Select location**: Choose closest to you (e.g., `us-central1`)
5. **Click**: "Enable"

### 3. Get Firebase Configuration

1. **Go to**: Project Settings (gear icon) → "General" tab
2. **Scroll down** to "Your apps"
3. **Click**: Web icon (`</>`)
4. **Register app**:
   - App nickname: `FreeFire Team Splitter`
   - (Don't check "Also set up Firebase Hosting")
5. **Click**: "Register app"
6. **Copy** the `firebaseConfig` object

### 4. Update Configuration File

1. **Open**: `js/firebase-config.js`
2. **Replace** the values with your Firebase config:

```javascript
const FirebaseConfig = {
  apiKey: "AIza...",           // Your API key
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  
  enabled: true,               // Enable Firebase
  fallbackToLocalStorage: true // Fallback if Firebase fails
};
```

### 5. Set Firestore Security Rules

1. **Go to**: Firestore Database → "Rules" tab
2. **Replace** with these rules (for testing):

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /appState/{document} {
      allow read, write: if true;  // Public read/write (for testing)
    }
  }
}
```

3. **Click**: "Publish"

**⚠️ Security Note**: These rules allow anyone to read/write. For production, add authentication.

### 6. Test

1. **Refresh** your browser
2. **Open console** (F12)
3. **Look for**: "✅ Firebase Firestore initialized - data will be shared across devices"
4. **Test**: 
   - Add a player on one device
   - Check another device - it should appear!

## How It Works

- **Without Firebase**: Each browser has its own localStorage
- **With Firebase**: All devices share the same Firestore database
- **Real-time**: Changes sync automatically to all devices

## Troubleshooting

### "Firebase not loaded"
- Check internet connection
- Verify Firebase SDK is loading in console

### "Permission denied"
- Check Firestore security rules
- Make sure rules allow read/write

### Data not syncing
- Check browser console for errors
- Verify Firebase config is correct
- Check Firestore database in Firebase console

## Current Status

- **Firebase**: Disabled by default (uses localStorage)
- **To Enable**: Set `enabled: true` in `js/firebase-config.js` after setup

---

**Once configured, your app will work across all devices! 🌐**

