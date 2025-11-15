// Team formation algorithm for FreeFire Team Splitter
const TeamGen = {
  // Generate balanced teams
  generateTeams(players, sizePerTeam) {
    if (players.length < sizePerTeam * 2) {
      return null;
    }
    
    // Get player objects with full data
    const playerData = players.slice(0, sizePerTeam * 2);
    
    // Sort by level descending
    const sorted = [...playerData].sort((a, b) => b.level - a.level);
    
    // Initialize teams
    let teamA = [];
    let teamB = [];
    let sumA = 0;
    let sumB = 0;
    const roleCountA = { rusher: 0, mid: 0, pro: 0 };
    const roleCountB = { rusher: 0, mid: 0, pro: 0 };
    
    // First pass: distribute by level
    for (const player of sorted) {
      const levelDiff = Math.abs((sumA + player.level) - sumB) - Math.abs(sumA - (sumB + player.level));
      
      if (sumA < sumB || (sumA === sumB && levelDiff <= 0)) {
        teamA.push(player);
        sumA += player.level;
        roleCountA[player.role] = (roleCountA[player.role] || 0) + 1;
      } else {
        teamB.push(player);
        sumB += player.level;
        roleCountB[player.role] = (roleCountB[player.role] || 0) + 1;
      }
    }
    
    // Optimization pass: try swapping players to improve balance
    let improved = true;
    let iterations = 0;
    const maxIterations = 20;
    
    while (improved && iterations < maxIterations) {
      improved = false;
      iterations++;
      
      for (let i = 0; i < teamA.length; i++) {
        for (let j = 0; j < teamB.length; j++) {
          const playerA = teamA[i];
          const playerB = teamB[j];
          
          // Calculate current level difference
          const currentDiff = Math.abs(sumA - sumB);
          
          // Calculate new level difference after swap
          const newSumA = sumA - playerA.level + playerB.level;
          const newSumB = sumB - playerB.level + playerA.level;
          const newDiff = Math.abs(newSumA - newSumB);
          
          // Calculate role balance improvement
          const currentRoleBalance = this.calculateRoleBalance(roleCountA, roleCountB);
          const newRoleCountA = { ...roleCountA };
          const newRoleCountB = { ...roleCountB };
          newRoleCountA[playerA.role]--;
          newRoleCountA[playerB.role] = (newRoleCountA[playerB.role] || 0) + 1;
          newRoleCountB[playerB.role]--;
          newRoleCountB[playerA.role] = (newRoleCountB[playerA.role] || 0) + 1;
          const newRoleBalance = this.calculateRoleBalance(newRoleCountA, newRoleCountB);
          
          // Accept swap if it improves balance
          if (newDiff < currentDiff || (newDiff === currentDiff && newRoleBalance < currentRoleBalance)) {
            // Perform swap
            teamA[i] = playerB;
            teamB[j] = playerA;
            sumA = newSumA;
            sumB = newSumB;
            roleCountA[playerA.role]--;
            roleCountA[playerB.role] = (roleCountA[playerB.role] || 0) + 1;
            roleCountB[playerB.role]--;
            roleCountB[playerA.role] = (roleCountB[playerA.role] || 0) + 1;
            improved = true;
            break;
          }
        }
        if (improved) break;
      }
    }
    
    // Create assignments object
    const assignments = {};
    teamA.forEach(player => {
      assignments[player.id] = 1; // Team 1
    });
    teamB.forEach(player => {
      assignments[player.id] = 2; // Team 2
    });
    
    return {
      teamA,
      teamB,
      assignments,
      stats: {
        teamALevel: sumA,
        teamBLevel: sumB,
        levelDiff: Math.abs(sumA - sumB),
        teamARoles: { ...roleCountA },
        teamBRoles: { ...roleCountB }
      }
    };
  },
  
  // Calculate role balance score (lower is better)
  calculateRoleBalance(rolesA, rolesB) {
    const roles = ['rusher', 'mid', 'pro'];
    let imbalance = 0;
    roles.forEach(role => {
      const diff = Math.abs((rolesA[role] || 0) - (rolesB[role] || 0));
      imbalance += diff;
    });
    return imbalance;
  },
  
  // Get player by ID from array
  getPlayerById(players, playerId) {
    return players.find(p => p.id === playerId);
  }
};

