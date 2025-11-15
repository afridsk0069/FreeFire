// Router for single-page application navigation
const Router = {
  // Show mode selection (Admin or Player)
  showModeSelection() {
    document.getElementById('landingPage').style.display = 'flex';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('playerInterface').style.display = 'none';
    
    document.getElementById('modeSelection').style.display = 'block';
    document.getElementById('adminLoginSection').style.display = 'none';
    document.getElementById('playerLoginSection').style.display = 'none';
    document.getElementById('setupSection').style.display = 'none';
  },
  
  // Show admin login
  showAdminLogin() {
    const state = Storage.getState();
    const adminHash = state?.site?.adminPasswordHash;
    
    if (!adminHash) {
      // Show setup instead
      this.showSetup();
      return;
    }
    
    document.getElementById('modeSelection').style.display = 'none';
    document.getElementById('adminLoginSection').style.display = 'block';
    document.getElementById('playerLoginSection').style.display = 'none';
    document.getElementById('setupSection').style.display = 'none';
  },
  
  // Show setup
  showSetup() {
    document.getElementById('modeSelection').style.display = 'none';
    document.getElementById('adminLoginSection').style.display = 'none';
    document.getElementById('playerLoginSection').style.display = 'none';
    document.getElementById('setupSection').style.display = 'block';
  },
  
  // Show player login
  showPlayerLogin() {
    document.getElementById('modeSelection').style.display = 'none';
    document.getElementById('adminLoginSection').style.display = 'none';
    document.getElementById('playerLoginSection').style.display = 'block';
    document.getElementById('setupSection').style.display = 'none';
    
    // Check if setup is needed
    const state = Storage.getState();
    if (!state || !state.site.sharedPasswordHash) {
      document.getElementById('setupMessage').style.display = 'block';
    } else {
      document.getElementById('setupMessage').style.display = 'none';
    }
  },
  
  // Show admin panel
  showAdminPanel() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'block';
    document.getElementById('playerInterface').style.display = 'none';
    
    // Initialize admin panel and show dashboard
    Admin.showSection('dashboard');
    Admin.loadDashboard();
  },
  
  // Show player interface
  showPlayerInterface() {
    document.getElementById('landingPage').style.display = 'none';
    document.getElementById('adminPanel').style.display = 'none';
    document.getElementById('playerInterface').style.display = 'block';
    
    // Show player selection
    document.getElementById('playerSelectionSection').style.display = 'block';
    document.getElementById('playerProfileSection').style.display = 'none';
    
    // Render players
    App.renderPlayerSelection();
  },
  
  // Logout
  logout() {
    sessionStorage.removeItem('admin_logged_in');
    
    // Mark player offline if they were online
    const selectedPlayerId = sessionStorage.getItem('selectedPlayerId');
    if (selectedPlayerId) {
      Storage.setPlayerOffline(selectedPlayerId).catch(err => {
        console.error('Error setting player offline:', err);
      });
      sessionStorage.removeItem('selectedPlayerId');
    }
    
    // Clear room update interval
    if (App.roomUpdateInterval) {
      clearInterval(App.roomUpdateInterval);
      App.roomUpdateInterval = null;
    }
    
    App.currentPlayer = null;
    App.otpCode = null;
    App.selectedPlayerId = null;
    
    // Reset all sections
    document.getElementById('playerSelectionSection').style.display = 'none';
    document.getElementById('playerProfileSection').style.display = 'none';
    document.getElementById('otpVerified').style.display = 'none';
    document.getElementById('otpSection').style.display = 'none';
    
    this.showModeSelection();
  }
};

// Override Admin methods to use router
const originalAdminLogout = Admin.logout;
Admin.logout = function() {
  Router.logout();
};

// Listen for storage updates (from Firestore real-time sync)
window.addEventListener('storageUpdated', (event) => {
  console.log('🔄 Storage updated event received');
  const data = event.detail;
  
  // Refresh admin panel if visible
  if (document.getElementById('adminPanel').style.display !== 'none') {
    Admin.loadDashboard();
  }
  
  // Refresh player interface if visible
  if (document.getElementById('playerSelectionSection').style.display !== 'none') {
    App.renderPlayerSelection();
  }
  
  if (document.getElementById('playerProfileSection').style.display !== 'none') {
    App.renderAvailableRooms();
  }
});

// Override Admin checkAdminAuth to use router
const originalCheckAdminAuth = Admin.checkAdminAuth;
Admin.checkAdminAuth = function() {
  const state = Storage.getState();
  const adminHash = state?.site?.adminPasswordHash;
  
  if (!adminHash) {
    // Don't show setup here, router will handle it
    return;
  }
  
  const adminLoggedIn = sessionStorage.getItem('admin_logged_in') === 'true';
  if (!adminLoggedIn) {
    // Don't show login here, router will handle it
    return;
  }
  
  // Already logged in, show dashboard
  this.showSection('dashboard');
  this.loadDashboard();
};

// Override Admin handleAdminLogin to use router
const originalHandleAdminLogin = Admin.handleAdminLogin;
Admin.handleAdminLogin = async function(e) {
  e.preventDefault();
  const password = document.getElementById('adminPassword').value;
  const state = Storage.getState();
  
  const isValid = await Storage.verifyPassword(password, state.site.adminPasswordHash);
  if (isValid) {
    sessionStorage.setItem('admin_logged_in', 'true');
    Router.showAdminPanel();
  } else {
    this.showAlert('Invalid admin password.', 'danger');
  }
};

// Override Admin handleSetup to use router
const originalHandleSetup = Admin.handleSetup;
Admin.handleSetup = async function(e) {
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
  Router.showAdminPanel();
  this.showAlert('Setup completed successfully!', 'success');
};

// Override App handlePlayerLogin to use router
const originalHandlePlayerLogin = App.handlePlayerLogin;
App.handlePlayerLogin = async function(e) {
  e.preventDefault();
  const password = document.getElementById('sharedPassword').value;
  const state = Storage.getState();
  
  if (!state || !state.site.sharedPasswordHash) {
    this.showAlert('Please set up the shared password in the admin panel first.', 'warning');
    return;
  }
  
  const isValid = await Storage.verifyPassword(password, state.site.sharedPasswordHash);
  if (isValid) {
    Router.showPlayerInterface();
  } else {
    this.showAlert('Invalid password. Please try again.', 'danger');
  }
};

// Override App showAlert to use correct container
const originalShowAlert = App.showAlert;
App.showAlert = function(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  const container = document.getElementById('playerAlertContainer') || document.getElementById('alertContainer') || document.body;
  container.insertBefore(alertDiv, container.firstChild);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
};

// Override Admin showAlert to use correct container
const originalAdminShowAlert = Admin.showAlert;
Admin.showAlert = function(message, type = 'info') {
  const alertDiv = document.createElement('div');
  alertDiv.className = `alert alert-${type} alert-dismissible fade show`;
  alertDiv.innerHTML = `
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
  `;
  
  const container = document.getElementById('adminAlertContainer') || document.getElementById('alertContainer') || document.body;
  container.insertBefore(alertDiv, container.firstChild);
  
  setTimeout(() => {
    alertDiv.remove();
  }, 5000);
};

// Setup event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Admin login form
  const adminLoginForm = document.getElementById('adminLoginForm');
  if (adminLoginForm) {
    adminLoginForm.addEventListener('submit', (e) => Admin.handleAdminLogin(e));
  }
  
  // Setup form
  const setupForm = document.getElementById('setupForm');
  if (setupForm) {
    setupForm.addEventListener('submit', (e) => Admin.handleSetup(e));
  }
  
  // Player login form
  const playerLoginForm = document.getElementById('playerLoginForm');
  if (playerLoginForm) {
    playerLoginForm.addEventListener('submit', (e) => App.handlePlayerLogin(e));
  }
  
  // Password form (fix ID)
  const passwordForm = document.getElementById('passwordForm');
  if (passwordForm) {
    passwordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const sharedPassword = document.getElementById('sharedPasswordModal').value;
      
      if (sharedPassword.length < 4) {
        Admin.showAlert('Password must be at least 4 characters long.', 'warning');
        return;
      }
      
      await Storage.setSharedPassword(sharedPassword);
      Admin.showAlert('Shared password updated successfully!', 'success');
      e.target.reset();
      
      const modal = bootstrap.Modal.getInstance(document.getElementById('passwordModal'));
      modal.hide();
    });
  }
  
  // Initialize router
  Router.showModeSelection();
  
  // Initialize App and Admin (sets up event listeners)
  App.init();
  Admin.setupEventListeners();
});

