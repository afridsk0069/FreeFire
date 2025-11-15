// Core application logic for FreeFire Team Splitter
const App = {
  currentPlayer: null,
  otpCode: null,
  otpExpiry: null,
  selectedPlayerId: null,
  roomUpdateInterval: null,
  
  // Initialize app
  init() {
    this.setupEventListeners();
    // checkAuth is handled by router now
  },
  
  // Setup event listeners
  setupEventListeners() {
    // Player login form
    const loginForm = document.getElementById('playerLoginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => this.handlePlayerLogin(e));
    }
    
    // OTP request - use event delegation since button might not exist yet
    document.addEventListener('click', (e) => {
      if (e.target && (e.target.id === 'requestOtpBtn' || e.target.closest('#requestOtpBtn'))) {
        e.preventDefault();
        console.log('🔘 OTP Request button clicked!');
        this.requestOTP();
      }
    });
    
    // Also try direct listener if button exists
    const otpRequestBtn = document.getElementById('requestOtpBtn');
    if (otpRequestBtn) {
      console.log('✅ OTP button found, adding direct listener');
      otpRequestBtn.addEventListener('click', (e) => {
        e.preventDefault();
        console.log('🔘 OTP Request button clicked (direct)!');
        this.requestOTP();
      });
    } else {
      console.log('⚠️ OTP button not found during setup (will use event delegation)');
    }
    
    // OTP verify - use event delegation for modal form
    document.addEventListener('submit', (e) => {
      if (e.target && e.target.id === 'otpVerifyForm') {
        e.preventDefault();
        console.log('🔘 OTP Verify form submitted!');
        this.verifyOTP(e);
      }
    });
    
    // Also try direct listener if form exists
    const otpVerifyForm = document.getElementById('otpVerifyForm');
    if (otpVerifyForm) {
      console.log('✅ OTP verify form found, adding direct listener');
      otpVerifyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        console.log('🔘 OTP Verify form submitted (direct)!');
        this.verifyOTP(e);
      });
    } else {
      console.log('⚠️ OTP verify form not found during setup (will use event delegation)');
    }
  },
  
  // Check authentication
  checkAuth() {
    const state = Storage.getState();
    if (!state || !state.site.sharedPasswordHash) {
      // Show setup message
      const setupMsg = document.getElementById('setupMessage');
      if (setupMsg) {
        setupMsg.style.display = 'block';
      }
    }
  },
  
  // Handle player login
  async handlePlayerLogin(e) {
    e.preventDefault();
    const password = document.getElementById('sharedPassword').value;
    const state = Storage.getState();
    
    if (!state || !state.site.sharedPasswordHash) {
      this.showAlert('Please set up the shared password in the admin panel first.', 'warning');
      return;
    }
    
    const isValid = await Storage.verifyPassword(password, state.site.sharedPasswordHash);
    if (isValid) {
      document.getElementById('loginSection').style.display = 'none';
      document.getElementById('playerSelectionSection').style.display = 'block';
      this.renderPlayerSelection();
      
      // Refresh player selection every 2 seconds to show online status
      setInterval(() => {
        if (document.getElementById('playerSelectionSection').style.display !== 'none') {
          this.renderPlayerSelection();
        }
      }, 2000);
    } else {
      this.showAlert('Invalid password. Please try again.', 'danger');
    }
  },
  
  // Render player selection
  renderPlayerSelection() {
    const container = document.getElementById('playerCardsContainer');
    const players = Storage.getPlayers();
    const onlinePlayers = Storage.getOnlinePlayers();
    const currentSessionPlayer = sessionStorage.getItem('selectedPlayerId');
    
    if (players.length === 0) {
      container.innerHTML = '<div class="alert alert-info">No players added yet. Please contact admin.</div>';
      return;
    }
    
    container.innerHTML = players.map(player => {
      const isOnline = onlinePlayers.includes(player.id);
      const isSelectedByMe = currentSessionPlayer === player.id;
      const isSelectedByOther = isOnline && !isSelectedByMe;
      
      return `
        <div class="col-md-4 col-sm-6 mb-4">
          <div class="card player-card h-100 ${isSelectedByOther ? 'border-danger opacity-50' : ''} ${isSelectedByMe ? 'border-success' : ''}" 
               data-player-id="${player.id}" 
               style="${isSelectedByOther ? 'cursor: not-allowed;' : 'cursor: pointer;'}">
            <div class="card-body text-center">
              <div class="player-avatar mb-3">
                ${player.profileImageBase64 
                  ? `<img src="${player.profileImageBase64}" alt="${player.gameName}" class="rounded-circle" style="width: 80px; height: 80px; object-fit: cover;">`
                  : `<div class="avatar-placeholder rounded-circle mx-auto" style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 2rem; font-weight: bold;">${player.gameName.charAt(0).toUpperCase()}</div>`
                }
              </div>
              <h5 class="card-title">${player.gameName}</h5>
              <div class="mb-2">
                <span class="badge bg-primary">Level ${player.level}</span>
                <span class="badge bg-${this.getRoleColor(player.role)} ms-1">${player.role.toUpperCase()}</span>
              </div>
              ${isSelectedByMe ? '<span class="badge bg-success">You Selected</span>' : ''}
              ${isSelectedByOther ? '<span class="badge bg-danger">Already Selected</span>' : ''}
              ${isOnline && !isSelectedByMe && !isSelectedByOther ? '<span class="badge bg-info">Online</span>' : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // Add click handlers
    container.querySelectorAll('.player-card').forEach(card => {
      const playerId = card.dataset.playerId;
      const isSelectedByOther = Storage.isPlayerOnline(playerId) && sessionStorage.getItem('selectedPlayerId') !== playerId;
      
      if (!isSelectedByOther) {
        card.addEventListener('click', () => {
          this.selectPlayer(playerId);
        });
      }
    });
  },
  
  // Get role color
  getRoleColor(role) {
    const colors = {
      rusher: 'danger',
      mid: 'warning',
      pro: 'success'
    };
    return colors[role] || 'secondary';
  },
  
  // Select player
  async selectPlayer(playerId) {
    // Check if already selected by someone else
    if (Storage.isPlayerOnline(playerId) && sessionStorage.getItem('selectedPlayerId') !== playerId) {
      this.showAlert('This player ID is already selected by someone else. Please choose another.', 'warning');
      return;
    }
    
    // Check if user already selected a different player
    const currentSelection = sessionStorage.getItem('selectedPlayerId');
    if (currentSelection && currentSelection !== playerId) {
      if (!confirm('You have already selected a different player. Do you want to change your selection?')) {
        return;
      }
      // Mark previous player offline
      await Storage.setPlayerOffline(currentSelection);
    }
    
    const players = Storage.getPlayers();
    this.currentPlayer = players.find(p => p.id === playerId);
    this.selectedPlayerId = playerId;
    
    // Store selection in session
    sessionStorage.setItem('selectedPlayerId', playerId);
    
    if (this.currentPlayer) {
      document.getElementById('playerSelectionSection').style.display = 'none';
      document.getElementById('playerProfileSection').style.display = 'block';
      this.renderPlayerProfile();
    }
  },
  
  // Render player profile
  renderPlayerProfile() {
    const player = this.currentPlayer;
    const isOnline = Storage.isPlayerOnline(player.id);
    const profileDiv = document.getElementById('playerProfileDisplay');
    
    profileDiv.innerHTML = `
      <div class="text-center mb-4">
        <div class="player-avatar mb-3">
          ${player.profileImageBase64 
            ? `<img src="${player.profileImageBase64}" alt="${player.gameName}" class="rounded-circle" style="width: 120px; height: 120px; object-fit: cover; border: 4px solid #667eea;">`
            : `<div class="avatar-placeholder rounded-circle mx-auto" style="width: 120px; height: 120px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem; font-weight: bold; border: 4px solid #667eea;">${player.gameName.charAt(0).toUpperCase()}</div>`
          }
        </div>
        <h2>${player.gameName}</h2>
        <div class="mb-3">
          <span class="badge bg-primary fs-6">Level ${player.level}</span>
          <span class="badge bg-${this.getRoleColor(player.role)} fs-6 ms-2">${player.role.toUpperCase()}</span>
          <span class="online-status-badge">${isOnline ? '<span class="badge bg-success fs-6 ms-2"><i class="bi bi-circle-fill"></i> Online</span>' : ''}</span>
        </div>
      </div>
    `;
    
    // Show OTP section if not verified/online
    if (!isOnline) {
      document.getElementById('otpSection').style.display = 'block';
      document.getElementById('otpVerified').style.display = 'none';
      document.getElementById('requestOtpBtn').style.display = 'inline-block';
    } else {
      document.getElementById('otpSection').style.display = 'none';
      document.getElementById('otpVerified').style.display = 'block';
      document.getElementById('requestOtpBtn').style.display = 'none';
      // Start room updates
      this.startRoomUpdates();
      this.renderAvailableRooms();
    }
  },
  
  // Render available rooms
  renderAvailableRooms() {
    console.log('🔄 renderAvailableRooms() called');
    
    if (!this.currentPlayer) {
      console.error('❌ No current player in renderAvailableRooms');
      return;
    }
    
    const container = document.getElementById('matchStatusSection');
    if (!container) {
      console.error('❌ matchStatusSection container not found');
      return;
    }
    
    const rooms = Storage.getRooms();
    const activeMatches = Storage.getMatches().filter(m => m.status === 'waiting');
    
    console.log('📊 Rooms:', rooms.length, 'Active matches:', activeMatches.length);
    
    if (rooms.length === 0) {
      container.innerHTML = `
        <div class="alert alert-info">
          <h5>No rooms available</h5>
          <p>Please wait for admin to create a room.</p>
        </div>
      `;
      return;
    }
    
    let html = '<h4 class="mb-3">Available Rooms</h4><div class="row">';
    
    rooms.forEach(room => {
      const match = activeMatches.find(m => m.roomId === room.id);
      const isJoined = match && this.currentPlayer && match.playersJoined.includes(this.currentPlayer.id);
      const progress = match ? (match.playersJoined.length / match.requiredPlayers) * 100 : 0;
      
      html += `
        <div class="col-md-6 mb-3">
          <div class="card ${match ? 'border-primary' : ''}">
            <div class="card-body">
              <h5 class="card-title">${room.name}</h5>
              <p class="text-muted mb-2">${room.sizePerTeam}v${room.sizePerTeam} Match</p>
              ${room.description ? `<p class="text-muted small">${room.description}</p>` : ''}
              ${match ? `
                <div class="mb-3">
                  <div class="d-flex justify-content-between mb-1">
                    <span>Players Joined</span>
                    <span><strong>${match.playersJoined.length} / ${match.requiredPlayers}</strong></span>
                  </div>
                  <div class="progress" style="height: 20px;">
                    <div class="progress-bar ${progress === 100 ? 'bg-success' : 'progress-bar-striped progress-bar-animated'}" 
                         role="progressbar" style="width: ${progress}%">
                      ${match.playersJoined.length} / ${match.requiredPlayers}
                    </div>
                  </div>
                </div>
                ${isJoined 
                  ? (match.status === 'assigned' 
                      ? '<button class="btn btn-success btn-sm w-100" disabled>Teams Formed - Check Below</button>'
                      : '<button class="btn btn-success btn-sm w-100" disabled>You are in this match</button>'
                    )
                  : '<button class="btn btn-primary btn-sm w-100" onclick="App.joinRoom(\'' + room.id + '\')">Join Match</button>'
                }
              ` : `
                <p class="text-muted small">No active match. Waiting for admin to start.</p>
              `}
            </div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    container.innerHTML = html;
    
    // Show team assignments for matches that are assigned and player is in
    if (this.currentPlayer) {
      activeMatches.forEach(match => {
        if (match.status === 'assigned' && match.assignments && match.playersJoined.includes(this.currentPlayer.id)) {
          const room = rooms.find(r => r.id === match.roomId);
          if (room) {
            // Append team assignments after the room card
            const teamAssignmentsHtml = this.getTeamAssignmentsHTML(match, room);
            container.innerHTML += teamAssignmentsHtml;
          }
        }
      });
    }
    
    console.log('✅ Rooms rendered successfully');
  },
  
  // Get team assignments HTML
  getTeamAssignmentsHTML(match, room) {
    const players = Storage.getPlayers();
    const team1Players = [];
    const team2Players = [];
    
    Object.entries(match.assignments).forEach(([playerId, teamNum]) => {
      const player = players.find(p => p.id === playerId);
      if (player) {
        if (teamNum === 1) team1Players.push(player);
        else team2Players.push(player);
      }
    });
    
    const teamNumber = match.assignments[this.currentPlayer.id];
    
    return `
      <div class="col-12 mb-4">
        <div class="card border-success">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">${room.name} - Team Assignments</h5>
            <p class="mb-0">You are on <strong>Team ${teamNumber}</strong></p>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-6 mb-3">
                <div class="card border-primary">
                  <div class="card-header bg-primary text-white text-center">
                    <h6>Team 1 (Total Level: ${team1Players.reduce((sum, p) => sum + p.level, 0)})</h6>
                  </div>
                  <div class="card-body">
                    ${team1Players.map(p => `
                      <div class="d-flex align-items-center mb-2 p-2 ${p.id === this.currentPlayer.id ? 'bg-light rounded' : ''}">
                        ${p.profileImageBase64 
                          ? `<img src="${p.profileImageBase64}" alt="${p.gameName}" class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;">`
                          : `<div class="avatar-placeholder rounded-circle me-2" style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${p.gameName.charAt(0).toUpperCase()}</div>`
                        }
                        <div class="flex-grow-1">
                          <strong>${p.gameName}</strong>
                          <span class="badge bg-primary ms-2">Lv.${p.level}</span>
                          <span class="badge bg-${this.getRoleColor(p.role)} ms-1">${p.role}</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
              <div class="col-md-6 mb-3">
                <div class="card border-danger">
                  <div class="card-header bg-danger text-white text-center">
                    <h6>Team 2 (Total Level: ${team2Players.reduce((sum, p) => sum + p.level, 0)})</h6>
                  </div>
                  <div class="card-body">
                    ${team2Players.map(p => `
                      <div class="d-flex align-items-center mb-2 p-2 ${p.id === this.currentPlayer.id ? 'bg-light rounded' : ''}">
                        ${p.profileImageBase64 
                          ? `<img src="${p.profileImageBase64}" alt="${p.gameName}" class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;">`
                          : `<div class="avatar-placeholder rounded-circle me-2" style="width: 40px; height: 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${p.gameName.charAt(0).toUpperCase()}</div>`
                        }
                        <div class="flex-grow-1">
                          <strong>${p.gameName}</strong>
                          <span class="badge bg-primary ms-2">Lv.${p.level}</span>
                          <span class="badge bg-${this.getRoleColor(p.role)} ms-1">${p.role}</span>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  },
  
  // Start room updates (polling)
  startRoomUpdates() {
    console.log('🔄 startRoomUpdates() called');
    
    // Clear existing interval
    if (this.roomUpdateInterval) {
      clearInterval(this.roomUpdateInterval);
      this.roomUpdateInterval = null;
    }
    
    if (!this.currentPlayer) {
      console.error('❌ No current player, cannot start room updates');
      return;
    }
    
    // Update every 2 seconds
    this.roomUpdateInterval = setInterval(() => {
      if (this.currentPlayer && Storage.isPlayerOnline(this.currentPlayer.id)) {
        this.renderAvailableRooms();
      } else {
        console.log('⚠️ Player offline or not found, stopping room updates');
        if (this.roomUpdateInterval) {
          clearInterval(this.roomUpdateInterval);
          this.roomUpdateInterval = null;
        }
      }
    }, 2000);
    
    console.log('✅ Room updates started');
  },
  
  // Join room
  async joinRoom(roomId) {
    if (!this.currentPlayer) {
      this.showAlert('Please select your profile first.', 'warning');
      return;
    }
    
    if (!Storage.isPlayerOnline(this.currentPlayer.id)) {
      this.showAlert('Please verify OTP and go online first.', 'warning');
      return;
    }
    
    // Check if room has active match, if not create one
    let match = Storage.getActiveMatch(roomId);
    if (!match) {
      match = await Storage.createMatch(roomId);
    }
    
    if (match.playersJoined.includes(this.currentPlayer.id)) {
      this.showAlert('You are already in this match.', 'info');
      return;
    }
    
    await Storage.joinMatch(match.id, this.currentPlayer.id);
    this.showAlert('You have joined the match!', 'success');
    
    // Reload match to get updated data
    match = Storage.getMatches().find(m => m.id === match.id);
    
    // Check if we can form teams
    if (match && match.playersJoined.length >= match.requiredPlayers) {
      this.formTeams(match);
    }
    
    this.renderAvailableRooms();
  },
  
  // Check match status (legacy, keeping for compatibility)
  checkMatchStatus() {
    this.renderAvailableRooms();
  },
  
  
  // Show match status
  showMatchStatus(match, room) {
    // Check if we need to form teams (enough players joined but not yet assigned)
    if (match.status !== 'assigned' && match.playersJoined.length >= match.requiredPlayers) {
      this.formTeams(match).then(() => {
        // Reload match from storage after teams are formed
        match = Storage.getMatches().find(m => m.id === match.id);
      });
    }
    
    const progress = (match.playersJoined.length / match.requiredPlayers) * 100;
    let content = `
      <div class="card">
        <div class="card-body">
          <h5 class="card-title">${room.name}</h5>
          <p class="text-muted">${room.sizePerTeam}v${room.sizePerTeam} Match</p>
          <div class="mb-3">
            <div class="d-flex justify-content-between mb-1">
              <span>Players Joined</span>
              <span><strong>${match.playersJoined.length} / ${match.requiredPlayers}</strong></span>
            </div>
            <div class="progress" style="height: 25px;">
              <div class="progress-bar ${progress === 100 ? 'bg-success' : 'progress-bar-striped progress-bar-animated'}" 
                   role="progressbar" style="width: ${progress}%">${match.playersJoined.length} / ${match.requiredPlayers}</div>
            </div>
          </div>
    `;
    
    if (match.status === 'assigned' && match.assignments) {
      const teamNumber = match.assignments[this.currentPlayer.id];
      content += `
        <div class="alert alert-success">
          <h5>You are on Team ${teamNumber}!</h5>
          <p>Match is ready. Check the team assignments below.</p>
        </div>
        <div id="teamAssignmentsContainer"></div>
      `;
    } else {
      content += `
        <div class="alert alert-warning">
          <p>Waiting for more players to join...</p>
        </div>
      `;
    }
    
    content += `</div></div>`;
    document.getElementById('matchStatusSection').innerHTML = content;
    
    // Render team assignments if match is assigned
    if (match.status === 'assigned' && match.assignments) {
      this.renderTeamAssignments(match, room);
    }
    
    // Auto-refresh if not assigned
    if (match.status !== 'assigned') {
      setTimeout(() => this.checkMatchStatus(), 2000);
    }
  },
  
  // Render team assignments
  renderTeamAssignments(match, room) {
    const players = Storage.getPlayers();
    const team1Players = [];
    const team2Players = [];
    
    Object.entries(match.assignments).forEach(([playerId, teamNum]) => {
      const player = players.find(p => p.id === playerId);
      if (player) {
        if (teamNum === 1) team1Players.push(player);
        else team2Players.push(player);
      }
    });
    
    const assignmentsDiv = document.createElement('div');
    assignmentsDiv.className = 'mt-4';
    assignmentsDiv.innerHTML = `
      <div class="row">
        <div class="col-md-6 mb-3">
          <div class="card border-primary">
            <div class="card-header bg-primary text-white text-center">
              <h4>Team 1</h4>
              <p class="mb-0">Total Level: ${team1Players.reduce((sum, p) => sum + p.level, 0)}</p>
            </div>
            <div class="card-body">
              ${team1Players.map(p => `
                <div class="d-flex align-items-center mb-2 p-2 ${p.id === this.currentPlayer.id ? 'bg-light rounded' : ''}">
                  ${p.profileImageBase64 
                    ? `<img src="${p.profileImageBase64}" alt="${p.gameName}" class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;">`
                    : `<div class="avatar-placeholder rounded-circle me-2" style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${p.gameName.charAt(0).toUpperCase()}</div>`
                  }
                  <div class="flex-grow-1">
                    <strong>${p.gameName}</strong>
                    <span class="badge bg-primary ms-2">Lv.${p.level}</span>
                    <span class="badge bg-${this.getRoleColor(p.role)} ms-1">${p.role}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        <div class="col-md-6 mb-3">
          <div class="card border-danger">
            <div class="card-header bg-danger text-white text-center">
              <h4>Team 2</h4>
              <p class="mb-0">Total Level: ${team2Players.reduce((sum, p) => sum + p.level, 0)}</p>
            </div>
            <div class="card-body">
              ${team2Players.map(p => `
                <div class="d-flex align-items-center mb-2 p-2 ${p.id === this.currentPlayer.id ? 'bg-light rounded' : ''}">
                  ${p.profileImageBase64 
                    ? `<img src="${p.profileImageBase64}" alt="${p.gameName}" class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;">`
                    : `<div class="avatar-placeholder rounded-circle me-2" style="width: 40px; height: 40px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${p.gameName.charAt(0).toUpperCase()}</div>`
                  }
                  <div class="flex-grow-1">
                    <strong>${p.gameName}</strong>
                    <span class="badge bg-primary ms-2">Lv.${p.level}</span>
                    <span class="badge bg-${this.getRoleColor(p.role)} ms-1">${p.role}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
    
    const container = document.getElementById('teamAssignmentsContainer');
    if (container) {
      container.innerHTML = assignmentsDiv.innerHTML;
    } else {
      document.getElementById('matchStatusSection').appendChild(assignmentsDiv);
    }
  },
  
  // Request OTP
  async requestOTP() {
    console.log('🔵 requestOTP() called');
    
    if (!this.currentPlayer) {
      this.showAlert('Please select your profile first.', 'warning');
      return;
    }
    
    const player = this.currentPlayer;
    const email = player.email;
    const phone = player.phone;
    
    console.log('📧 Player email:', email);
    console.log('📱 Player phone:', phone);
    
    if (!email && !phone) {
      this.showAlert('Email or phone number is required to send OTP. Please contact admin to update your profile.', 'warning');
      return;
    }
    
    // Generate 6-digit OTP
    this.otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    this.otpExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes
    
    console.log('🔑 Generated OTP:', this.otpCode);
    
    // Show loading state
    const requestBtn = document.getElementById('requestOtpBtn');
    const originalText = requestBtn.innerHTML;
    requestBtn.disabled = true;
    requestBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Sending OTP...';
    
    try {
      // Send OTP via EmailJS
      if (email) {
        console.log('📤 Attempting to send OTP email to:', email);
        const result = await this.sendOTPEmail(email, player.gameName, this.otpCode);
        console.log('✅ sendOTPEmail returned:', result);
      } else {
        console.log('⚠️ No email address, skipping email send');
      }
      
      // For SMS, you would integrate Twilio or similar service here
      // For now, we'll show a message that SMS would be sent
      if (phone) {
        // In production, integrate with Twilio or similar SMS service
        console.log(`SMS OTP ${this.otpCode} would be sent to ${phone}`);
      }
      
      // Show success message
      this.showAlert(`OTP has been sent successfully to ${email || 'your email'}${phone ? ` and ${phone}` : ''}. Please check your inbox.`, 'success');
      
      // Show OTP modal
      const modal = new bootstrap.Modal(document.getElementById('otpModal'));
      
      // Update modal to show where OTP was sent
      const emailPhoneEl = document.getElementById('otpEmailPhone');
      if (emailPhoneEl) {
        let info = '';
        if (email) info += `<i class="bi bi-envelope"></i> ${email}<br>`;
        if (phone) info += `<i class="bi bi-phone"></i> ${phone}`;
        emailPhoneEl.innerHTML = info;
      }
      
      document.getElementById('otpTimer').textContent = '5:00';
      document.getElementById('otpInput').value = '';
      modal.show();
      
      // Start countdown
      let timeLeft = 300; // 5 minutes in seconds
      const timer = setInterval(() => {
        timeLeft--;
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        const timerEl = document.getElementById('otpTimer');
        if (timerEl) {
          timerEl.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        }
        
        if (timeLeft <= 0) {
          clearInterval(timer);
          this.otpCode = null;
          if (timerEl) {
            timerEl.textContent = 'EXPIRED';
            timerEl.classList.add('text-danger');
          }
        }
      }, 1000);
      
      // Store timer reference
      this.otpTimer = timer;
      
    } catch (error) {
      console.error('Error sending OTP:', error);
      const errorMsg = error.message || error.text || 'Unknown error';
      this.showAlert(`Failed to send OTP: ${errorMsg}. Check console (F12) for details.`, 'danger');
      
      // Show OTP in console for debugging
      console.log('Generated OTP (for testing):', this.otpCode);
    } finally {
      requestBtn.disabled = false;
      requestBtn.innerHTML = originalText;
    }
  },
  
  // Send OTP via EmailJS
  async sendOTPEmail(email, playerName, otpCode) {
    console.log('🔵 sendOTPEmail() called with:', { email, playerName, otpCode });
    
    const config = window.EmailConfig || {};
    console.log('⚙️ EmailConfig:', config);
    
    // Check if EmailJS is enabled and configured
    if (!config.enabled) {
      console.warn('⚠️ EmailJS is disabled in config');
      if (config.fallbackMode !== false) {
        return this.useFallbackOTP(email, playerName, otpCode);
      }
      throw new Error('EmailJS is disabled');
    }
    
    if (!config.publicKey || config.publicKey === 'YOUR_PUBLIC_KEY') {
      console.warn('⚠️ EmailJS public key not configured');
      if (config.fallbackMode !== false) {
        return this.useFallbackOTP(email, playerName, otpCode);
      }
      throw new Error('EmailJS public key not configured');
    }
    
    // Check if EmailJS is loaded
    if (typeof emailjs === 'undefined') {
      console.error('❌ EmailJS library not loaded');
      if (config.fallbackMode !== false) {
        return this.useFallbackOTP(email, playerName, otpCode);
      }
      throw new Error('EmailJS library not loaded. Check internet connection.');
    }
    
    console.log('✅ EmailJS library is loaded');
    
    try {
      // Initialize EmailJS with public key (EmailJS v4 API)
      // Only initialize if not already initialized
      if (!window.emailjsInitialized) {
        console.log('🔧 Initializing EmailJS with public key:', config.publicKey);
        emailjs.init(config.publicKey);
        window.emailjsInitialized = true;
        console.log('✅ EmailJS initialized');
      } else {
        console.log('✅ EmailJS already initialized');
      }
      
      // Prepare template parameters (match your EmailJS template variables)
      // Check your EmailJS template to ensure variable names match exactly
      const templateParams = {
        to_email: email,
        to_name: playerName,
        otp_code: otpCode,
        // Include these in case your template uses them
        subject: 'FreeFire Team Splitter - OTP Verification',
        message: `Your OTP code is: ${otpCode}. This code will expire in 5 minutes.`
      };
      
      console.log('📤 Sending email via EmailJS...');
      console.log('   Service ID:', config.serviceId);
      console.log('   Template ID:', config.templateId);
      console.log('   Template Params:', JSON.stringify(templateParams, null, 2));
      console.log('   Public Key:', config.publicKey);
      
      // Send email using EmailJS service (EmailJS v4 API)
      console.log('🚀 Calling emailjs.send()...');
      console.log('   emailjs object:', emailjs);
      console.log('   emailjs.send type:', typeof emailjs.send);
      
      // Verify emailjs.send exists
      if (!emailjs.send || typeof emailjs.send !== 'function') {
        throw new Error('emailjs.send is not a function. EmailJS may not be loaded correctly.');
      }
      
      // Use EmailJS v4 API format
      const response = await emailjs.send(
        config.serviceId,
        config.templateId,
        templateParams
      );
      
      console.log('✅✅✅ Email sent successfully via EmailJS!');
      console.log('   Response:', response);
      console.log('   Status:', response.status);
      console.log('   Text:', response.text);
      
      return response;
    } catch (error) {
      console.error('❌❌❌ EmailJS error occurred!');
      console.error('   Error object:', error);
      console.error('   Error type:', typeof error);
      console.error('   Error status:', error.status);
      console.error('   Error text:', error.text);
      console.error('   Error message:', error.message);
      console.error('   Error stack:', error.stack);
      
      // Log full error for debugging
      try {
        console.error('   Full error JSON:', JSON.stringify(error, null, 2));
      } catch (e) {
        console.error('   Could not stringify error');
      }
      
      // Log the actual error for debugging
      console.error('❌ EmailJS send failed. Error details:', {
        status: error.status,
        text: error.text,
        message: error.message,
        error: error
      });
      
      // Show the actual error to user
      const errorMsg = error.text || error.message || 'Unknown error';
      this.showAlert(`EmailJS Error: ${errorMsg}. Check console for details.`, 'danger');
      
      // If EmailJS fails but fallback is enabled, use fallback
      if (config.fallbackMode !== false) {
        console.warn('⚠️ EmailJS failed, falling back to console mode');
        return this.useFallbackOTP(email, playerName, otpCode);
      }
      
      // Re-throw error if fallback is disabled
      throw new Error(`EmailJS error: ${errorMsg}`);
    }
  },
  
  // Fallback OTP method
  useFallbackOTP(email, playerName, otpCode) {
    console.warn('Using fallback OTP mode');
    console.log(`📧 OTP for ${email}: ${otpCode}`);
    console.log(`👤 Player: ${playerName}`);
    console.log('⏰ Expires in 5 minutes');
    
    // Store OTP in localStorage for testing
    localStorage.setItem('temp_otp_' + email, JSON.stringify({
      code: otpCode,
      expiry: this.otpExpiry,
      player: playerName,
      email: email
    }));
    
    // Show alert with instructions (don't show OTP in alert)
    this.showAlert(
      `OTP sent (Fallback Mode). Check browser console (F12) for OTP code: ${otpCode}. ` +
      `To enable real email sending, check EmailJS configuration.`,
      'warning'
    );
    
    return { status: 200, text: 'Email sent (fallback mode - check console)' };
  },
  
  // Verify OTP
  async verifyOTP(e) {
    e.preventDefault();
    console.log('🔵 verifyOTP() called');
    
    const enteredOtp = document.getElementById('otpInput').value.trim();
    console.log('🔑 Entered OTP:', enteredOtp);
    console.log('🔑 Stored OTP:', this.otpCode);
    
    if (!this.currentPlayer) {
      console.error('❌ No current player');
      this.showAlert('Please select your profile first.', 'warning');
      return;
    }
    
    if (!this.otpCode) {
      console.error('❌ No OTP code stored');
      this.showAlert('Please request an OTP first.', 'warning');
      return;
    }
    
    if (Date.now() > this.otpExpiry) {
      console.error('❌ OTP expired');
      this.showAlert('OTP has expired. Please request a new one.', 'danger');
      this.otpCode = null;
      return;
    }
    
    if (enteredOtp === this.otpCode) {
      console.log('✅ OTP verified successfully!');
      
      // Hide modal and remove backdrop properly
      const modalElement = document.getElementById('otpModal');
      const modal = bootstrap.Modal.getInstance(modalElement);
      
      if (modal) {
        // Hide the modal
        modal.hide();
        
        // Immediate cleanup (in case event doesn't fire)
        setTimeout(() => {
          this.cleanupModalBackdrop();
        }, 100);
        
        // Wait for modal to fully close, then remove backdrop
        modalElement.addEventListener('hidden.bs.modal', () => {
          this.cleanupModalBackdrop();
          console.log('✅ Modal backdrop cleaned up via event');
        }, { once: true });
      } else {
        // If modal instance doesn't exist, manually remove backdrop
        if (modalElement) {
          modalElement.style.display = 'none';
          modalElement.classList.remove('show');
        }
        this.cleanupModalBackdrop();
        console.log('✅ Modal manually cleaned up');
      }
      
      // Clear OTP input
      const otpInput = document.getElementById('otpInput');
      if (otpInput) {
        otpInput.value = '';
      }
      
      // Mark player online
      await Storage.setPlayerOnline(this.currentPlayer.id);
      console.log('✅ Player marked online:', this.currentPlayer.id);
      
      // Clear OTP timer
      if (this.otpTimer) {
        clearInterval(this.otpTimer);
        this.otpTimer = null;
      }
      
      // Show success message
      this.showAlert('OTP verified successfully! You are now online.', 'success');
      
      // Update UI elements
      const otpVerified = document.getElementById('otpVerified');
      const requestOtpBtn = document.getElementById('requestOtpBtn');
      const otpSection = document.getElementById('otpSection');
      
      if (otpVerified) otpVerified.style.display = 'block';
      if (requestOtpBtn) requestOtpBtn.style.display = 'none';
      if (otpSection) otpSection.style.display = 'none';
      
      // Clear OTP code after successful verification
      this.otpCode = null;
      
      // Start room updates and show available rooms
      console.log('🔄 Starting room updates...');
      this.startRoomUpdates();
      this.renderAvailableRooms();
      
      // Update profile to show online status (without resetting everything)
      console.log('🔄 Updating player profile...');
      this.updatePlayerProfileStatus();
      
      console.log('✅ OTP verification complete!');
    } else {
      console.error('❌ Invalid OTP entered');
      this.showAlert('Invalid OTP. Please try again.', 'danger');
      // Clear the input
      document.getElementById('otpInput').value = '';
      document.getElementById('otpInput').focus();
    }
  },
  
  // Cleanup modal backdrop
  cleanupModalBackdrop() {
    // Remove any lingering backdrop
    const backdrops = document.querySelectorAll('.modal-backdrop');
    backdrops.forEach(backdrop => {
      backdrop.remove();
      console.log('🗑️ Removed backdrop');
    });
    
    // Remove blur from body
    if (document.body.classList.contains('modal-open')) {
      document.body.classList.remove('modal-open');
      console.log('🗑️ Removed modal-open class');
    }
    
    // Reset body styles
    if (document.body.style.overflow === 'hidden') {
      document.body.style.overflow = '';
    }
    if (document.body.style.paddingRight) {
      document.body.style.paddingRight = '';
    }
  },
  
  // Update player profile status without full re-render
  updatePlayerProfileStatus() {
    const player = this.currentPlayer;
    if (!player) return;
    
    const isOnline = Storage.isPlayerOnline(player.id);
    const profileDiv = document.getElementById('playerProfileDisplay');
    
    if (profileDiv) {
      // Update just the status badge
      const statusBadge = profileDiv.querySelector('.online-status-badge');
      if (statusBadge) {
        if (isOnline) {
          statusBadge.innerHTML = '<span class="badge bg-success fs-6 ms-2"><i class="bi bi-circle-fill"></i> Online</span>';
          statusBadge.style.display = 'inline';
        } else {
          statusBadge.style.display = 'none';
        }
      } else {
        // If badge doesn't exist, add it
        const badgeContainer = profileDiv.querySelector('.mb-3');
        if (badgeContainer && isOnline) {
          badgeContainer.innerHTML += '<span class="badge bg-success fs-6 ms-2 online-status-badge"><i class="bi bi-circle-fill"></i> Online</span>';
        }
      }
    }
  },
  
  
  // Form teams
  async formTeams(match) {
    const players = Storage.getPlayers();
    const room = Storage.getRooms().find(r => r.id === match.roomId);
    const availablePlayers = players.filter(p => match.playersJoined.includes(p.id));
    
    const result = TeamGen.generateTeams(availablePlayers, room.sizePerTeam);
    
    if (result) {
      await Storage.assignTeams(match.id, result.assignments);
      this.showAlert('Teams have been formed!', 'success');
      this.checkMatchStatus();
    }
  },
  
  // Show alert
  showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.getElementById('playerAlertContainer') || 
                     document.getElementById('alertContainer') || 
                     document.body;
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  }
};

// Event listeners are set up by router.js on DOMContentLoaded

