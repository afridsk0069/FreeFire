// Storage helper module for FreeFire Team Splitter
// Supports Firebase Firestore (shared across devices) and localStorage (fallback)
const Storage = {
  KEY: 'ff_team_splitter_state',
  db: null,
  firebaseEnabled: false,
  listeners: [],
  
  // Initialize storage (Firebase or localStorage)
  async init() {
    const config = window.FirebaseConfig || {};
    
    // Try to initialize Firebase if enabled
    if (config.enabled && config.apiKey && config.apiKey !== 'YOUR_API_KEY' && typeof firebase !== 'undefined') {
      try {
        // Initialize Firebase
        if (!firebase.apps.length) {
          firebase.initializeApp(config);
        }
        
        // Initialize Firestore
        this.db = firebase.firestore();
        this.firebaseEnabled = true;
        
        // Set up real-time listener
        this.setupRealtimeListener();
        
        console.log('✅ Firebase Firestore initialized - data will be shared across devices');
        
        // Load initial state from Firestore
        await this.loadFromFirestore();
        
        return;
      } catch (error) {
        console.error('❌ Firebase initialization failed:', error);
        if (config.fallbackToLocalStorage !== false) {
          console.log('⚠️ Falling back to localStorage');
          this.firebaseEnabled = false;
        } else {
          throw error;
        }
      }
    }
    
    // Use localStorage (fallback or default)
    this.firebaseEnabled = false;
    console.log('📦 Using localStorage (per-browser storage)');
    
    if (!this.getStateFromLocalStorage()) {
      const defaultState = {
        site: {
          sharedPasswordHash: null,
          adminPasswordHash: null,
          nextMatchId: 1
        },
        players: [],
        rooms: [],
        matches: [],
        onlinePlayers: []
      };
      this.setStateToLocalStorage(defaultState);
    }
  },
  
  // Setup real-time listener for Firestore
  setupRealtimeListener() {
    if (!this.firebaseEnabled || !this.db) return;
    
    // Listen for changes in Firestore
    this.db.collection('appState').doc('main').onSnapshot((doc) => {
      if (doc.exists()) {
        const data = doc.data();
        // Update local state
        this.setStateToLocalStorage(data);
        // Trigger update event
        window.dispatchEvent(new CustomEvent('storageUpdated', { detail: data }));
        console.log('🔄 Data updated from Firestore (real-time sync)');
      }
    }, (error) => {
      console.error('❌ Firestore listener error:', error);
    });
  },
  
  // Load state from Firestore
  async loadFromFirestore() {
    if (!this.firebaseEnabled || !this.db) return;
    
    try {
      const doc = await this.db.collection('appState').doc('main').get();
      if (doc.exists()) {
        const data = doc.data();
        this.setStateToLocalStorage(data);
        console.log('✅ Loaded state from Firestore');
      } else {
        // Create initial state in Firestore
        const defaultState = {
          site: {
            sharedPasswordHash: null,
            adminPasswordHash: null,
            nextMatchId: 1
          },
          players: [],
          rooms: [],
          matches: [],
          onlinePlayers: []
        };
        await this.saveToFirestore(defaultState);
        this.setStateToLocalStorage(defaultState);
        console.log('✅ Created initial state in Firestore');
      }
    } catch (error) {
      console.error('❌ Error loading from Firestore:', error);
      throw error;
    }
  },
  
  // Save state to Firestore
  async saveToFirestore(state) {
    if (!this.firebaseEnabled || !this.db) return;
    
    try {
      await this.db.collection('appState').doc('main').set(state, { merge: false });
      console.log('💾 Saved to Firestore');
    } catch (error) {
      console.error('❌ Error saving to Firestore:', error);
      throw error;
    }
  },
  
  // Get state from localStorage
  getStateFromLocalStorage() {
    const data = localStorage.getItem(this.KEY);
    return data ? JSON.parse(data) : null;
  },
  
  // Set state to localStorage
  setStateToLocalStorage(state) {
    localStorage.setItem(this.KEY, JSON.stringify(state));
  },
  
  // Get full state (from Firebase or localStorage)
  getState() {
    return this.getStateFromLocalStorage();
  },
  
  // Set full state (to Firebase and localStorage)
  async setState(state) {
    // Always update localStorage first (for immediate access)
    this.setStateToLocalStorage(state);
    
    // Also save to Firestore if enabled
    if (this.firebaseEnabled) {
      try {
        await this.saveToFirestore(state);
      } catch (error) {
        console.error('Failed to save to Firestore, using localStorage only:', error);
      }
    }
  },
  
  // Hash password using Web Crypto API
  async hashPassword(password) {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  },
  
  // Verify password
  async verifyPassword(password, hash) {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  },
  
  // Get players
  getPlayers() {
    const state = this.getState();
    return state ? state.players : [];
  },
  
  // Get online players
  getOnlinePlayers() {
    const state = this.getState();
    if (!state.onlinePlayers) {
      state.onlinePlayers = [];
      this.setState(state);
    }
    return state.onlinePlayers || [];
  },
  
  // Mark player online
  async setPlayerOnline(playerId) {
    const state = this.getState();
    if (!state.onlinePlayers) {
      state.onlinePlayers = [];
    }
    if (!state.onlinePlayers.includes(playerId)) {
      state.onlinePlayers.push(playerId);
      await this.setState(state);
    }
  },
  
  // Mark player offline
  async setPlayerOffline(playerId) {
    const state = this.getState();
    if (state.onlinePlayers) {
      state.onlinePlayers = state.onlinePlayers.filter(id => id !== playerId);
      await this.setState(state);
    }
  },
  
  // Check if player is online
  isPlayerOnline(playerId) {
    const state = this.getState();
    return state.onlinePlayers && state.onlinePlayers.includes(playerId);
  },
  
  // Add player
  async addPlayer(player) {
    const state = this.getState();
    if (state.players.length >= 12) {
      throw new Error('Maximum 12 players allowed');
    }
    const newPlayer = {
      id: `p${Date.now()}`,
      ...player
    };
    state.players.push(newPlayer);
    await this.setState(state);
    return newPlayer;
  },
  
  // Update player
  async updatePlayer(playerId, updates) {
    const state = this.getState();
    const index = state.players.findIndex(p => p.id === playerId);
    if (index !== -1) {
      state.players[index] = { ...state.players[index], ...updates };
      await this.setState(state);
      return state.players[index];
    }
    return null;
  },
  
  // Delete player
  async deletePlayer(playerId) {
    const state = this.getState();
    state.players = state.players.filter(p => p.id !== playerId);
    await this.setState(state);
  },
  
  // Get rooms
  getRooms() {
    const state = this.getState();
    return state ? state.rooms : [];
  },
  
  // Add room
  async addRoom(room) {
    const state = this.getState();
    const newRoom = {
      id: `r${Date.now()}`,
      ...room
    };
    state.rooms.push(newRoom);
    await this.setState(state);
    return newRoom;
  },
  
  // Delete room
  async deleteRoom(roomId) {
    const state = this.getState();
    state.rooms = state.rooms.filter(r => r.id !== roomId);
    state.matches = state.matches.filter(m => m.roomId !== roomId);
    await this.setState(state);
  },
  
  // Get matches
  getMatches() {
    const state = this.getState();
    return state ? state.matches : [];
  },
  
  // Get active match for a room
  getActiveMatch(roomId) {
    const state = this.getState();
    return state.matches.find(m => m.roomId === roomId && m.status === 'waiting');
  },
  
  // Create match
  async createMatch(roomId) {
    const state = this.getState();
    const room = state.rooms.find(r => r.id === roomId);
    if (!room) return null;
    
    const match = {
      id: state.site.nextMatchId++,
      roomId: roomId,
      requiredPlayers: room.sizePerTeam * 2,
      playersJoined: [],
      assignments: {},
      status: 'waiting'
    };
    state.matches.push(match);
    await this.setState(state);
    return match;
  },
  
  // Join match
  async joinMatch(matchId, playerId) {
    const state = this.getState();
    const match = state.matches.find(m => m.id === matchId);
    if (match && !match.playersJoined.includes(playerId)) {
      match.playersJoined.push(playerId);
      await this.setState(state);
      return match;
    }
    return null;
  },
  
  // Assign teams
  async assignTeams(matchId, assignments) {
    const state = this.getState();
    const match = state.matches.find(m => m.id === matchId);
    if (match) {
      match.assignments = assignments;
      match.status = 'assigned';
      await this.setState(state);
      return match;
    }
    return null;
  },
  
  // Set shared password
  async setSharedPassword(password) {
    const state = this.getState();
    state.site.sharedPasswordHash = await this.hashPassword(password);
    this.setState(state);
  },
  
  // Set admin password
  async setAdminPassword(password) {
    const state = this.getState();
    state.site.adminPasswordHash = await this.hashPassword(password);
    this.setState(state);
  },
  
  // Export state as JSON
  exportState() {
    return JSON.stringify(this.getState(), null, 2);
  },
  
  // Import state from JSON
  async importState(jsonString) {
    try {
      const state = JSON.parse(jsonString);
      await this.setState(state);
      return true;
    } catch (e) {
      return false;
    }
  }
};

// Initialize on load (async)
Storage.init().catch(error => {
  console.error('Storage initialization error:', error);
  // Continue with localStorage fallback
});

