# FreeFire Team Splitter

A beautiful, fully client-side web application for splitting FreeFire players into balanced teams. Built with HTML, Bootstrap 5, and vanilla JavaScript.

## Features

- 🎮 **Player Management**: Add up to 12 players with profiles, levels, roles, and images
- 🏠 **Room Management**: Create rooms for different match sizes (1v1 to 6v6)
- ⚖️ **Balanced Team Formation**: Automatic team balancing by level and role
- 🔐 **Simple Authentication**: Shared password for players, admin password for management
- 📱 **Responsive Design**: Works beautifully on desktop and mobile devices
- 💾 **Data Export/Import**: Backup and restore your data
- 🎨 **Modern UI**: Beautiful gradient designs and smooth animations

## Quick Start

### Local Development

1. **Open the Application**
   - Open `index.html` in your web browser
   - Or use a local server: `npx serve .`
   - On first launch, you'll be prompted to set up:
     - Admin password (for accessing the admin panel)
     - Shared password (for players to access the app)

### Deploy to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

**Quick Deploy:**
1. Push code to GitHub
2. Import to Vercel
3. Deploy! (No build step needed)

2. **Add Players**
   - Navigate to "Players" in the sidebar
   - Click "Add Player"
   - Fill in player details:
     - Game Name (required)
     - Level (1-100)
     - Role (Rusher, Mid, or Pro)
     - Email and Phone (optional)
     - Profile Image (optional)

3. **Create Rooms**
   - Navigate to "Rooms" in the sidebar
   - Click "Create Room"
   - Set room name and team size (1v1 to 6v6)

4. **Start a Match**
   - Go to "Rooms" section
   - Click "Start Match" on any room
   - Players can now join the match

5. **Player Flow**
   - Players open `index.html`
   - Enter the shared password
   - Select their profile
   - Request and verify OTP (simulated client-side)
   - Mark themselves as available
   - Teams are automatically formed when enough players join

## File Structure

```
game/
├── index.html              # Single-page app (player + admin)
├── css/
│   └── styles.css          # Custom styles
├── js/
│   ├── storage.js          # Storage module (Firebase/localStorage)
│   ├── teamgen.js          # Team formation algorithm
│   ├── app.js              # Core player application logic
│   ├── admin.js            # Admin panel logic
│   ├── router.js           # Client-side routing
│   ├── firebase-config.js  # Firebase configuration
│   └── email-config.js     # EmailJS configuration
├── FIREBASE_SETUP.md       # Firebase setup guide
├── EMAILJS_SETUP.md        # EmailJS setup guide
├── DEPLOYMENT.md           # Vercel deployment guide
└── README.md               # This file
```

## How It Works

### Team Formation Algorithm

The app uses an intelligent algorithm to balance teams:

1. **Level Balancing**: Players are sorted by level and distributed to minimize level difference between teams
2. **Role Distribution**: The algorithm ensures roles (Rusher, Mid, Pro) are evenly distributed
3. **Optimization Pass**: A swap optimization pass further improves balance

### Data Storage

The app supports two storage modes:

**1. Firebase Firestore (Recommended - Shared Across Devices)**
- ✅ Data shared across all devices
- ✅ Real-time updates
- ✅ Free tier available
- 📖 See [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) for setup

**2. localStorage (Default - Per Browser)**
- ✅ No server required
- ✅ Works offline
- ⚠️ Data is per-browser (not shared across devices)
- ⚠️ Data is cleared if browser cache is cleared

**To enable shared storage**, configure Firebase (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md)).

### OTP Verification

The OTP system is **simulated client-side** for this static version:
- A 6-digit code is generated and displayed
- Code expires after 5 minutes
- For production use, integrate with SMS/Email service

## Limitations

**Without Firebase:**
- **No Cross-Device Sync**: Data is stored per-browser
- **No Real-Time Updates**: Players on different browsers won't see live updates

**With Firebase:**
- ✅ Cross-device sync enabled
- ✅ Real-time updates
- ⚠️ Requires Firebase setup (see [FIREBASE_SETUP.md](./FIREBASE_SETUP.md))

**OTP System:**
- OTP is sent via EmailJS (see [EMAILJS_SETUP.md](./EMAILJS_SETUP.md))
- Requires EmailJS configuration for real email sending

**Security Note**: Client-side authentication is not secure for adversarial scenarios. For production use, consider adding a backend server.

## Browser Compatibility

Works on all modern browsers:
- Chrome/Edge (recommended)
- Firefox
- Safari
- Opera

## Tips

- **Export Data Regularly**: Use the Export feature to backup your data
- **Image Optimization**: Large images increase storage size. Consider resizing before uploading
- **Single Browser**: For best experience, have all players use the same browser/device or have admin share screen

## Troubleshooting

**Problem**: Can't see players/rooms after adding them
- **Solution**: Refresh the page or check browser console for errors

**Problem**: OTP not working
- **Solution**: Make sure JavaScript is enabled in your browser

**Problem**: Data lost after closing browser
- **Solution**: Make sure you're not using private/incognito mode, and export your data regularly

## License

Free to use and modify for personal projects.

## Support

For issues or questions, check the browser console for error messages.

---

**Enjoy organizing your FreeFire matches! 🎮**

