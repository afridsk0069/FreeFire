# How to Get Firebase Web App Configuration

You have a **service account** JSON file, but we need the **Web App** configuration for client-side Firebase.

## Quick Steps to Get Web App Config

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select your project: **freefire-fd9f2**

2. **Get Web App Configuration**
   - Click the **gear icon** (⚙️) → **Project Settings**
   - Scroll down to **"Your apps"** section
   - Look for a **Web app** (</> icon)
   
3. **If No Web App Exists:**
   - Click **"Add app"** → Select **Web** icon (</>)
   - App nickname: `FreeFire Team Splitter` (or any name)
   - **Don't check** "Also set up Firebase Hosting"
   - Click **"Register app"**

4. **Copy the Configuration**
   - You'll see a `firebaseConfig` object like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIza...",
     authDomain: "freefire-fd9f2.firebaseapp.com",
     projectId: "freefire-fd9f2",
     storageBucket: "freefire-fd9f2.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abc123"
   };
   ```

5. **Update `js/firebase-config.js`**
   - Copy the `apiKey` value
   - Copy the `messagingSenderId` value
   - Copy the `appId` value
   - Paste them into `js/firebase-config.js`
   - Set `enabled: true`

## What I've Already Updated

✅ **projectId**: `freefire-fd9f2`  
✅ **authDomain**: `freefire-fd9f2.firebaseapp.com`  
✅ **storageBucket**: `freefire-fd9f2.appspot.com`

## What You Need to Add

❌ **apiKey**: Get from Firebase Console  
❌ **messagingSenderId**: Get from Firebase Console  
❌ **appId**: Get from Firebase Console

## After Updating

1. Fill in the 3 missing values in `js/firebase-config.js`
2. Set `enabled: true`
3. Refresh your browser
4. Check console for: "✅ Firebase Firestore initialized"

---

**Note**: The service account JSON file you have is for **server-side** operations (like admin SDK). For client-side web apps, we need the **Web App** configuration from Firebase Console.

