// Admin panel logic for FreeFire Team Splitter
const Admin = {
  currentEditingPlayer: null,
  
  // Initialize admin panel (called by router when needed)
  init() {
    // checkAdminAuth is handled by router now
    // setupEventListeners is called separately by router
  },
  
  // Setup event listeners
  setupEventListeners() {
    // Admin login
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
      adminLoginForm.addEventListener('submit', (e) => this.handleAdminLogin(e));
    }
    
    // Setup form (first time)
    const setupForm = document.getElementById('setupForm');
    if (setupForm) {
      setupForm.addEventListener('submit', (e) => this.handleSetup(e));
    }
    
    // Player form
    const playerForm = document.getElementById('playerForm');
    if (playerForm) {
      playerForm.addEventListener('submit', (e) => this.handlePlayerSubmit(e));
    }
    
    // Room form
    const roomForm = document.getElementById('roomForm');
    if (roomForm) {
      roomForm.addEventListener('submit', (e) => this.handleRoomSubmit(e));
    }
    
    // Password form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
      passwordForm.addEventListener('submit', (e) => this.handlePasswordSubmit(e));
    }
    
    // Image upload
    const imageInput = document.getElementById('playerImage');
    if (imageInput) {
      imageInput.addEventListener('change', (e) => this.handleImageUpload(e));
    }
    
    // Export/Import
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportData());
    }
    
    const importBtn = document.getElementById('importBtn');
    if (importBtn) {
      importBtn.addEventListener('click', () => this.importData());
    }
    
    // Navigation
    document.querySelectorAll('[data-nav]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const section = e.currentTarget.dataset.nav;
        this.showSection(section);
      });
    });
  },
  
  // Check admin authentication
  checkAdminAuth() {
    const state = Storage.getState();
    const adminHash = state?.site?.adminPasswordHash;
    
    if (!adminHash) {
      this.showSection('setup');
      return;
    }
    
    const adminLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
    if (!adminLoggedIn) {
      this.showSection('adminLogin');
    } else {
      this.showSection('dashboard');
    }
  },
  
  // Handle admin login
  async handleAdminLogin(e) {
    e.preventDefault();
    const password = document.getElementById('adminPassword').value;
    const state = Storage.getState();
    
    const isValid = await Storage.verifyPassword(password, state.site.adminPasswordHash);
    if (isValid) {
      sessionStorage.setItem('admin_logged_in', 'true');
      this.showSection('dashboard');
      this.loadDashboard();
    } else {
      this.showAlert('Invalid admin password.', 'danger');
    }
  },
  
  // Handle setup
  async handleSetup(e) {
    e.preventDefault();
    const adminPassword = document.getElementById('setupAdminPassword').value;
    const sharedPassword = document.getElementById('setupSharedPassword').value;
    
    if (adminPassword.length < 4 || sharedPassword.length < 4) {
      this.showAlert('Passwords must be at least 4 characters long.', 'warning');
      return;
    }
    
    await Storage.setAdminPassword(adminPassword);
    await Storage.setSharedPassword(sharedPassword);
    
    sessionStorage.setItem('admin_logged_in', 'true');
    this.showSection('dashboard');
    this.loadDashboard();
    this.showAlert('Setup completed successfully!', 'success');
  },
  
  // Show section
  showSection(sectionName) {
    document.querySelectorAll('.admin-section').forEach(section => {
      section.style.display = 'none';
    });
    
    const targetSection = document.getElementById(sectionName + 'Section');
    if (targetSection) {
      targetSection.style.display = 'block';
      
      // Reload data if needed
      if (sectionName === 'dashboard') {
        this.loadDashboard();
      } else if (sectionName === 'players') {
        this.renderPlayers();
      } else if (sectionName === 'rooms') {
        this.renderRooms();
      } else if (sectionName === 'matches') {
        this.renderMatches();
      }
    }
    
    // Update nav active state
    document.querySelectorAll('[data-nav]').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.nav === sectionName) {
        btn.classList.add('active');
      }
    });
  },
  
  // Load dashboard
  loadDashboard() {
    this.renderPlayers();
    this.renderRooms();
    this.renderMatches();
    this.updateDashboardStats();
  },
  
  // Update dashboard statistics
  updateDashboardStats() {
    const players = Storage.getPlayers();
    const rooms = Storage.getRooms();
    const matches = Storage.getMatches();
    
    const playerCountEl = document.getElementById('dashboardPlayerCount');
    const roomCountEl = document.getElementById('dashboardRoomCount');
    const matchCountEl = document.getElementById('dashboardMatchCount');
    
    if (playerCountEl) playerCountEl.textContent = players.length;
    if (roomCountEl) roomCountEl.textContent = rooms.length;
    if (matchCountEl) matchCountEl.textContent = matches.length;
  },
  
  // Render players
  renderPlayers() {
    const container = document.getElementById('playersList');
    const players = Storage.getPlayers();
    
    if (players.length === 0) {
      container.innerHTML = '<div class="alert alert-info">No players added yet.</div>';
      return;
    }
    
    container.innerHTML = players.map(player => `
      <div class="col-md-4 col-sm-6 mb-3">
        <div class="card player-card-admin h-100">
          <div class="card-body">
            <div class="d-flex align-items-center mb-2">
              <div class="player-avatar me-3">
                ${player.profileImageBase64 
                  ? `<img src="${player.profileImageBase64}" alt="${player.gameName}" class="rounded-circle" style="width: 60px; height: 60px; object-fit: cover;">`
                  : `<div class="avatar-placeholder rounded-circle" style="width: 60px; height: 60px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; font-weight: bold;">${player.gameName.charAt(0).toUpperCase()}</div>`
                }
              </div>
              <div class="flex-grow-1">
                <h6 class="mb-0">${player.gameName}</h6>
                <small class="text-muted">Level ${player.level}</small>
              </div>
            </div>
            <div class="mb-2">
              <span class="badge bg-${this.getRoleColor(player.role)}">${player.role.toUpperCase()}</span>
            </div>
            <div class="btn-group w-100" role="group">
              <button class="btn btn-sm btn-outline-primary" onclick="Admin.editPlayer('${player.id}')">Edit</button>
              <button class="btn btn-sm btn-outline-danger" onclick="Admin.deletePlayer('${player.id}')">Delete</button>
            </div>
          </div>
        </div>
      </div>
    `).join('');
    
    // Update player count badge
    const playerCount = players.length;
    document.getElementById('playerCountBadge').textContent = `${playerCount} / 12`;
    if (playerCount >= 12) {
      document.getElementById('addPlayerBtn').disabled = true;
      document.getElementById('addPlayerBtn').title = 'Maximum 12 players reached';
    } else {
      document.getElementById('addPlayerBtn').disabled = false;
      document.getElementById('addPlayerBtn').title = '';
    }
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
  
  // Handle player submit
  async handlePlayerSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const playerData = {
      gameName: formData.get('gameName'),
      level: parseInt(formData.get('level')),
      role: formData.get('role'),
      email: formData.get('email') || '',
      phone: formData.get('phone') || '',
      profileImageBase64: formData.get('profileImageBase64') || ''
    };
    
    try {
      if (this.currentEditingPlayer) {
        await Storage.updatePlayer(this.currentEditingPlayer, playerData);
        this.showAlert('Player updated successfully!', 'success');
      } else {
        await Storage.addPlayer(playerData);
        this.showAlert('Player added successfully!', 'success');
      }
      
      e.target.reset();
      this.currentEditingPlayer = null;
      document.getElementById('playerFormTitle').textContent = 'Add Player';
      document.getElementById('playerImagePreview').innerHTML = '';
      this.renderPlayers();
      this.updateDashboardStats();
      
      const modal = bootstrap.Modal.getInstance(document.getElementById('playerModal'));
      modal.hide();
    } catch (error) {
      this.showAlert(error.message, 'danger');
    }
  },
  
  // Edit player
  editPlayer(playerId) {
    const players = Storage.getPlayers();
    const player = players.find(p => p.id === playerId);
    
    if (!player) return;
    
    this.currentEditingPlayer = playerId;
    document.getElementById('playerFormTitle').textContent = 'Edit Player';
    document.getElementById('gameName').value = player.gameName;
    document.getElementById('playerLevel').value = player.level;
    document.getElementById('playerRole').value = player.role;
    document.getElementById('playerEmail').value = player.email || '';
    document.getElementById('playerPhone').value = player.phone || '';
    document.getElementById('playerImagePreview').innerHTML = player.profileImageBase64 
      ? `<img src="${player.profileImageBase64}" class="img-thumbnail" style="max-width: 200px;">`
      : '';
    document.getElementById('playerImageBase64').value = player.profileImageBase64 || '';
    
    const modal = new bootstrap.Modal(document.getElementById('playerModal'));
    modal.show();
  },
  
  // Delete player
  async deletePlayer(playerId) {
    if (confirm('Are you sure you want to delete this player?')) {
      await Storage.deletePlayer(playerId);
      this.showAlert('Player deleted successfully!', 'success');
      this.renderPlayers();
      this.updateDashboardStats();
    }
  },
  
  // Handle image upload
  handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      this.showAlert('Please select an image file.', 'warning');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target.result;
      document.getElementById('playerImageBase64').value = base64;
      document.getElementById('playerImagePreview').innerHTML = 
        `<img src="${base64}" class="img-thumbnail" style="max-width: 200px;">`;
    };
    reader.readAsDataURL(file);
  },
  
  // Handle room submit
  async handleRoomSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const roomData = {
      name: formData.get('roomName'),
      sizePerTeam: parseInt(formData.get('sizePerTeam')),
      description: formData.get('roomDescription') || ''
    };
    
    await Storage.addRoom(roomData);
    this.showAlert('Room created successfully!', 'success');
    e.target.reset();
    this.renderRooms();
    this.updateDashboardStats();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('roomModal'));
    modal.hide();
  },
  
  // Render rooms
  renderRooms() {
    const container = document.getElementById('roomsList');
    const rooms = Storage.getRooms();
    
    if (rooms.length === 0) {
      container.innerHTML = '<div class="alert alert-info">No rooms created yet.</div>';
      return;
    }
    
    container.innerHTML = rooms.map(room => {
      const activeMatch = Storage.getActiveMatch(room.id);
      const isActive = activeMatch !== undefined;
      
      return `
        <div class="col-md-6 mb-3">
          <div class="card ${isActive ? 'border-success' : ''}">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <div>
                  <h5 class="card-title mb-0">${room.name}</h5>
                  <p class="text-muted mb-0">${room.sizePerTeam}v${room.sizePerTeam}</p>
                </div>
                ${isActive ? '<span class="badge bg-success">Active</span>' : ''}
              </div>
              ${room.description ? `<p class="card-text">${room.description}</p>` : ''}
              <div class="btn-group w-100" role="group">
                ${!isActive 
                  ? `<button class="btn btn-sm btn-success" onclick="Admin.startMatch('${room.id}')">Start Match</button>`
                  : `<button class="btn btn-sm btn-primary" onclick="Admin.viewMatch('${room.id}')">View Match</button>`
                }
                <button class="btn btn-sm btn-outline-danger" onclick="Admin.deleteRoom('${room.id}')">Delete</button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },
  
  // Start match
  async startMatch(roomId) {
    const match = await Storage.createMatch(roomId);
    if (match) {
      this.showAlert('Match started successfully!', 'success');
      this.renderRooms();
      this.renderMatches();
    }
  },
  
  // View match
  viewMatch(roomId) {
    const match = Storage.getActiveMatch(roomId);
    if (!match) return;
    
    const room = Storage.getRooms().find(r => r.id === roomId);
    const players = Storage.getPlayers();
    const joinedPlayers = players.filter(p => match.playersJoined.includes(p.id));
    
    let content = `
      <div class="card">
        <div class="card-header">
          <h5>${room.name} - Match #${match.id}</h5>
        </div>
        <div class="card-body">
          <div class="mb-3">
            <div class="d-flex justify-content-between mb-1">
              <span>Players Joined</span>
              <span><strong>${match.playersJoined.length} / ${match.requiredPlayers}</strong></span>
            </div>
            <div class="progress" style="height: 25px;">
              <div class="progress-bar ${match.playersJoined.length >= match.requiredPlayers ? 'bg-success' : 'progress-bar-striped progress-bar-animated'}" 
                   role="progressbar" style="width: ${(match.playersJoined.length / match.requiredPlayers) * 100}%">
                ${match.playersJoined.length} / ${match.requiredPlayers}
              </div>
            </div>
          </div>
          
          <h6>Joined Players:</h6>
          <div class="row">
    `;
    
    joinedPlayers.forEach(player => {
      content += `
        <div class="col-md-4 mb-2">
          <div class="d-flex align-items-center">
            ${player.profileImageBase64 
              ? `<img src="${player.profileImageBase64}" alt="${player.gameName}" class="rounded-circle me-2" style="width: 40px; height: 40px; object-fit: cover;">`
              : `<div class="avatar-placeholder rounded-circle me-2" style="width: 40px; height: 40px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${player.gameName.charAt(0).toUpperCase()}</div>`
            }
            <div>
              <strong>${player.gameName}</strong><br>
              <small>Level ${player.level} - ${player.role}</small>
            </div>
          </div>
        </div>
      `;
    });
    
    content += `</div>`;
    
    if (match.status === 'assigned' && match.assignments) {
      const team1Players = [];
      const team2Players = [];
      
      Object.entries(match.assignments).forEach(([playerId, teamNum]) => {
        const player = players.find(p => p.id === playerId);
        if (player) {
          if (teamNum === 1) team1Players.push(player);
          else team2Players.push(player);
        }
      });
      
      content += `
        <hr>
        <h5>Team Assignments</h5>
        <div class="row">
          <div class="col-md-6">
            <div class="card border-primary">
              <div class="card-header bg-primary text-white">
                <h6>Team 1 (Total Level: ${team1Players.reduce((sum, p) => sum + p.level, 0)})</h6>
              </div>
              <div class="card-body">
                ${team1Players.map(p => `
                  <div class="mb-2">
                    <strong>${p.gameName}</strong>
                    <span class="badge bg-primary ms-2">Lv.${p.level}</span>
                    <span class="badge bg-${this.getRoleColor(p.role)} ms-1">${p.role}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card border-danger">
              <div class="card-header bg-danger text-white">
                <h6>Team 2 (Total Level: ${team2Players.reduce((sum, p) => sum + p.level, 0)})</h6>
              </div>
              <div class="card-body">
                ${team2Players.map(p => `
                  <div class="mb-2">
                    <strong>${p.gameName}</strong>
                    <span class="badge bg-primary ms-2">Lv.${p.level}</span>
                    <span class="badge bg-${this.getRoleColor(p.role)} ms-1">${p.role}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (joinedPlayers.length >= match.requiredPlayers) {
      content += `
        <hr>
        <button class="btn btn-primary" onclick="Admin.formTeams('${match.id}')">Form Teams Now</button>
      `;
    }
    
    content += `</div></div>`;
    
    document.getElementById('matchDetails').innerHTML = content;
    this.showSection('matchDetails');
  },
  
  // Form teams
  async formTeams(matchId) {
    const match = Storage.getMatches().find(m => m.id === matchId);
    if (!match) return;
    
    const players = Storage.getPlayers();
    const room = Storage.getRooms().find(r => r.id === match.roomId);
    const availablePlayers = players.filter(p => match.playersJoined.includes(p.id));
    
    const result = TeamGen.generateTeams(availablePlayers, room.sizePerTeam);
    
    if (result) {
      await Storage.assignTeams(matchId, result.assignments);
      this.showAlert('Teams formed successfully!', 'success');
      this.viewMatch(match.roomId);
    } else {
      this.showAlert('Not enough players to form teams.', 'warning');
    }
  },
  
  // Delete room
  async deleteRoom(roomId) {
    if (confirm('Are you sure you want to delete this room? All associated matches will also be deleted.')) {
      await Storage.deleteRoom(roomId);
      this.showAlert('Room deleted successfully!', 'success');
      this.renderRooms();
      this.renderMatches();
      this.updateDashboardStats();
    }
  },
  
  // Render matches
  renderMatches() {
    const container = document.getElementById('matchesList');
    const matches = Storage.getMatches();
    
    if (matches.length === 0) {
      container.innerHTML = '<div class="alert alert-info">No matches yet.</div>';
      return;
    }
    
    const rooms = Storage.getRooms();
    container.innerHTML = matches.map(match => {
      const room = rooms.find(r => r.id === match.roomId);
      return `
        <div class="card mb-2">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-center">
              <div>
                <strong>${room?.name || 'Unknown Room'}</strong> - Match #${match.id}
                <br>
                <small class="text-muted">
                  ${match.playersJoined.length} / ${match.requiredPlayers} players
                  <span class="badge bg-${match.status === 'assigned' ? 'success' : 'warning'} ms-2">${match.status}</span>
                </small>
              </div>
              <button class="btn btn-sm btn-primary" onclick="Admin.viewMatch('${match.roomId}')">View</button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },
  
  // Handle password submit
  async handlePasswordSubmit(e) {
    e.preventDefault();
    const sharedPassword = document.getElementById('sharedPasswordModal')?.value || 
                          new FormData(e.target).get('sharedPassword');
    
    if (!sharedPassword || sharedPassword.length < 4) {
      this.showAlert('Password must be at least 4 characters long.', 'warning');
      return;
    }
    
    await Storage.setSharedPassword(sharedPassword);
    this.showAlert('Shared password updated successfully!', 'success');
    e.target.reset();
    
    const modal = bootstrap.Modal.getInstance(document.getElementById('passwordModal'));
    if (modal) modal.hide();
  },
  
  // Export data
  exportData() {
    const data = Storage.exportState();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freefire-team-splitter-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    this.showAlert('Data exported successfully!', 'success');
  },
  
  // Import data
  importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = async (event) => {
        const success = await Storage.importState(event.target.result);
        if (success) {
          this.showAlert('Data imported successfully!', 'success');
          this.loadDashboard();
        } else {
          this.showAlert('Failed to import data. Please check the file format.', 'danger');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  },
  
  // Show alert
  showAlert(message, type = 'info') {
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
    alertDiv.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    const container = document.getElementById('adminAlertContainer') || 
                     document.getElementById('alertContainer') || 
                     document.body;
    container.insertBefore(alertDiv, container.firstChild);
    
    setTimeout(() => {
      alertDiv.remove();
    }, 5000);
  },
  
  // Logout
  logout() {
    sessionStorage.removeItem('admin_logged_in');
    this.showSection('adminLogin');
  }
};

// Admin.init() is called by router.js when needed
// Event listeners are set up by router.js on DOMContentLoaded

