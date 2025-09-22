// BMT Idle - Main Application
class BMTIdle {
  constructor() {
    console.log('BMT Idle: Constructor starting...');
    
    try {
      this.currentUser = null;
      this.currentPage = 'login';
      
      console.log('BMT Idle: Loading game data...');
      this.gameData = this.loadGameData();
      console.log('BMT Idle: Game data loaded successfully');
      
      console.log('BMT Idle: Calling init...');
      this.init();
    } catch (error) {
      console.error('BMT Idle: Error in constructor:', error);
      alert('Critical error during game initialization: ' + error.message);
    }
  }

  init() {
    console.log('BMT Idle: Starting initialization...');
    
    try {
      // Check if user is logged in
      console.log('BMT Idle: Checking for saved user...');
      const savedUser = localStorage.getItem('bmtIdle_currentUser');
      if (savedUser) {
        console.log('BMT Idle: Found saved user, parsing...');
        this.currentUser = JSON.parse(savedUser);
        this.currentPage = 'dashboard';
        console.log('BMT Idle: User loaded successfully:', this.currentUser.username);
        
        // Clean up any invalid training data
        if (this.currentUser.currentTraining && this.currentUser.currentTraining.skill === 'combat' && !this.currentUser.currentMonster) {
          console.log('BMT Idle: Cleaning up invalid combat training data');
          delete this.currentUser.currentTraining;
        }
        
        // Calculate offline progress
        this.calculateOfflineProgress();
        
        // Give starting equipment if needed
        this.giveStartingEquipment();
      } else {
        console.log('BMT Idle: No saved user found, showing login page');
      }

      console.log('BMT Idle: Starting render...');
      this.render();
      
      console.log('BMT Idle: Binding events...');
      this.bindEvents();
      
      // Start game loops
      if (this.currentUser) {
        console.log('BMT Idle: Starting game loops...');
        this.startGameLoops();
      }
      
      console.log('BMT Idle: Initialization complete!');
    } catch (error) {
      console.error('BMT Idle: Error during initialization:', error);
      alert('Game failed to load: ' + error.message);
    }
  }

  loadGameData() {
    const defaultData = {
      users: {},
      items: this.getDefaultItems(),
      skills: this.getDefaultSkills(),
      monsters: this.getDefaultMonsters(),
      quests: this.getDefaultQuests()
    };

    const saved = localStorage.getItem('bmtIdle_gameData');
    if (saved) {
      const savedData = JSON.parse(saved);
      // Always use fresh data to ensure we have the latest definitions
      return { 
        ...defaultData, 
        ...savedData,
        items: this.getDefaultItems(), // Force fresh item data
        monsters: this.getDefaultMonsters() // Force fresh monster data
      };
    }
    return defaultData;
  }

  saveGameData() {
    localStorage.setItem('bmtIdle_gameData', JSON.stringify(this.gameData));
  }

  getDefaultSkills() {
    return {
      // Gathering Skills
      woodcutting: { name: 'Woodcutting', category: 'gathering', icon: '🪓' },
      mining: { name: 'Mining', category: 'gathering', icon: '⛏️' },
      fishing: { name: 'Fishing', category: 'gathering', icon: '🎣' },
      farming: { name: 'Farming', category: 'gathering', icon: '🌱' },
      
      // Production Skills
      smelting: { name: 'Smelting', category: 'production', icon: '🔥' },
      smithing: { name: 'Smithing', category: 'production', icon: '🔨' },
      cooking: { name: 'Cooking', category: 'production', icon: '🍳' },
      alchemy: { name: 'Alchemy', category: 'production', icon: '⚗️' },
      enchanting: { name: 'Enchanting', category: 'production', icon: '✨' },
      
      // Combat Skills
      attack: { name: 'Attack', category: 'combat', icon: '⚔️' },
      strength: { name: 'Strength', category: 'combat', icon: '💪' },
      defence: { name: 'Defence', category: 'combat', icon: '🛡️' },
      ranged: { name: 'Ranged', category: 'combat', icon: '🏹' },
      magic: { name: 'Magic', category: 'combat', icon: '🔮' },
      hitpoints: { name: 'Hitpoints', category: 'combat', icon: '❤️' }
    };
  }

  getDefaultItems() {
    return {
      // Logs
      logs: { name: 'Logs', category: 'resource', value: 1 },
      oak_logs: { name: 'Oak Logs', category: 'resource', value: 5 },
      willow_logs: { name: 'Willow Logs', category: 'resource', value: 10 },
      yew_logs: { name: 'Yew Logs', category: 'resource', value: 50 },
      magic_logs: { name: 'Magic Logs', category: 'resource', value: 100 },
      
      // Ores
      copper_ore: { name: 'Copper Ore', category: 'resource', value: 2 },
      tin_ore: { name: 'Tin Ore', category: 'resource', value: 2 },
      iron_ore: { name: 'Iron Ore', category: 'resource', value: 8 },
      coal: { name: 'Coal', category: 'resource', value: 15 },
      gold_ore: { name: 'Gold Ore', category: 'resource', value: 25 },
      mithril_ore: { name: 'Mithril Ore', category: 'resource', value: 40 },
      
      // Fish
      shrimp: { name: 'Raw Shrimp', category: 'resource', value: 2 },
      sardine: { name: 'Raw Sardine', category: 'resource', value: 4 },
      trout: { name: 'Raw Trout', category: 'resource', value: 8 },
      salmon: { name: 'Raw Salmon', category: 'resource', value: 12 },
      lobster: { name: 'Raw Lobster', category: 'resource', value: 20 },
      shark: { name: 'Raw Shark', category: 'resource', value: 50 },
      
      // Cooked Food
      cooked_shrimp: { name: 'Cooked Shrimp', category: 'food', value: 5, heals: 3 },
      bread: { name: 'Bread', category: 'food', value: 8, heals: 5 },
      cooked_trout: { name: 'Cooked Trout', category: 'food', value: 15, heals: 7 },
      vegetable_stew: { name: 'Vegetable Stew', category: 'food', value: 20, heals: 8 },
      cabbage_soup: { name: 'Cabbage Soup', category: 'food', value: 25, heals: 12 },
      
      // Bars
      bronze_bar: { name: 'Bronze Bar', category: 'material', value: 10 },
      iron_bar: { name: 'Iron Bar', category: 'material', value: 25 },
      steel_bar: { name: 'Steel Bar', category: 'material', value: 50 },
      gold_bar: { name: 'Gold Bar', category: 'material', value: 75 },
      mithril_bar: { name: 'Mithril Bar', category: 'material', value: 100 },
      
      // Weapons
      bronze_sword: { name: 'Bronze Sword', category: 'weapon', slot: 'weapon', value: 50, level: 1, stats: { attack: 2, strength: 1 } },
      iron_sword: { name: 'Iron Sword', category: 'weapon', slot: 'weapon', value: 150, level: 5, stats: { attack: 8, strength: 6 } },
      steel_sword: { name: 'Steel Sword', category: 'weapon', slot: 'weapon', value: 300, level: 10, stats: { attack: 15, strength: 12 } },
      mithril_sword: { name: 'Mithril Sword', category: 'weapon', slot: 'weapon', value: 600, level: 20, stats: { attack: 25, strength: 20 } },
      
      // Armor - Helmets
      bronze_helmet: { name: 'Bronze Helmet', category: 'armor', slot: 'helmet', value: 30, level: 1, stats: { defence: 2 } },
      iron_helmet: { name: 'Iron Helmet', category: 'armor', slot: 'helmet', value: 100, level: 5, stats: { defence: 6 } },
      steel_helmet: { name: 'Steel Helmet', category: 'armor', slot: 'helmet', value: 200, level: 10, stats: { defence: 12 } },
      mithril_helmet: { name: 'Mithril Helmet', category: 'armor', slot: 'helmet', value: 400, level: 20, stats: { defence: 20 } },
      
      // Armor - Body
      bronze_platebody: { name: 'Bronze Platebody', category: 'armor', slot: 'body', value: 80, level: 1, stats: { defence: 5 } },
      iron_platebody: { name: 'Iron Platebody', category: 'armor', slot: 'body', value: 250, level: 5, stats: { defence: 15 } },
      steel_platebody: { name: 'Steel Platebody', category: 'armor', slot: 'body', value: 500, level: 10, stats: { defence: 30 } },
      mithril_platebody: { name: 'Mithril Platebody', category: 'armor', slot: 'body', value: 1000, level: 20, stats: { defence: 50 } },
      
      // Armor - Legs
      bronze_platelegs: { name: 'Bronze Platelegs', category: 'armor', slot: 'legs', value: 60, level: 1, stats: { defence: 3 } },
      iron_platelegs: { name: 'Iron Platelegs', category: 'armor', slot: 'legs', value: 200, level: 5, stats: { defence: 12 } },
      steel_platelegs: { name: 'Steel Platelegs', category: 'armor', slot: 'legs', value: 400, level: 10, stats: { defence: 24 } },
      mithril_platelegs: { name: 'Mithril Platelegs', category: 'armor', slot: 'legs', value: 800, level: 20, stats: { defence: 40 } },
      
      // Armor - Boots
      bronze_boots: { name: 'Bronze Boots', category: 'armor', slot: 'boots', value: 20, level: 1, stats: { defence: 1 } },
      iron_boots: { name: 'Iron Boots', category: 'armor', slot: 'boots', value: 80, level: 5, stats: { defence: 4 } },
      steel_boots: { name: 'Steel Boots', category: 'armor', slot: 'boots', value: 160, level: 10, stats: { defence: 8 } },
      mithril_boots: { name: 'Mithril Boots', category: 'armor', slot: 'boots', value: 320, level: 20, stats: { defence: 16 } },
      
      // Armor - Gloves
      bronze_gloves: { name: 'Bronze Gloves', category: 'armor', slot: 'gloves', value: 15, level: 1, stats: { defence: 1 } },
      iron_gloves: { name: 'Iron Gloves', category: 'armor', slot: 'gloves', value: 60, level: 5, stats: { defence: 3 } },
      steel_gloves: { name: 'Steel Gloves', category: 'armor', slot: 'gloves', value: 120, level: 10, stats: { defence: 6 } },
      mithril_gloves: { name: 'Mithril Gloves', category: 'armor', slot: 'gloves', value: 240, level: 20, stats: { defence: 12 } },
      
      // Jewelry - Necklaces
      gold_necklace: { name: 'Gold Necklace', category: 'jewelry', slot: 'necklace', value: 200, level: 1, stats: { attack: 1, strength: 1 } },
      sapphire_necklace: { name: 'Sapphire Necklace', category: 'jewelry', slot: 'necklace', value: 500, level: 5, stats: { attack: 3, strength: 2 } },
      emerald_necklace: { name: 'Emerald Necklace', category: 'jewelry', slot: 'necklace', value: 1000, level: 10, stats: { attack: 5, strength: 4 } },
      ruby_necklace: { name: 'Ruby Necklace', category: 'jewelry', slot: 'necklace', value: 2000, level: 20, stats: { attack: 8, strength: 6 } },
      
      // Jewelry - Rings
      gold_ring: { name: 'Gold Ring', category: 'jewelry', slot: 'ring', value: 100, level: 1, stats: { defence: 1 } },
      sapphire_ring: { name: 'Sapphire Ring', category: 'jewelry', slot: 'ring', value: 300, level: 5, stats: { defence: 2, attack: 1 } },
      emerald_ring: { name: 'Emerald Ring', category: 'jewelry', slot: 'ring', value: 600, level: 10, stats: { defence: 4, attack: 2 } },
      ruby_ring: { name: 'Ruby Ring', category: 'jewelry', slot: 'ring', value: 1200, level: 20, stats: { defence: 6, attack: 3 } },
      
      // Capes
      cape: { name: 'Cape', category: 'armor', slot: 'cape', value: 50, level: 1, stats: { defence: 1 } },
      wool_cape: { name: 'Wool Cape', category: 'armor', slot: 'cape', value: 150, level: 5, stats: { defence: 2, attack: 1 } },
      silk_cape: { name: 'Silk Cape', category: 'armor', slot: 'cape', value: 300, level: 10, stats: { defence: 3, attack: 2 } },
      magic_cape: { name: 'Magic Cape', category: 'armor', slot: 'cape', value: 600, level: 20, stats: { defence: 5, attack: 3, strength: 2 } },
      
      // Seeds and Crops
      potato_seed: { name: 'Potato Seed', category: 'seed', value: 1 },
      wheat_seed: { name: 'Wheat Seed', category: 'seed', value: 3 },
      herb_seed: { name: 'Herb Seed', category: 'seed', value: 5 },
      carrot_seed: { name: 'Carrot Seed', category: 'seed', value: 7 },
      cabbage_seed: { name: 'Cabbage Seed', category: 'seed', value: 10 },
      potato: { name: 'Potato', category: 'food', value: 2, heals: 1 },
      wheat: { name: 'Wheat', category: 'resource', value: 4 },
      herb: { name: 'Herb', category: 'resource', value: 8 },
      carrot: { name: 'Carrot', category: 'food', value: 6, heals: 2 },
      cabbage: { name: 'Cabbage', category: 'food', value: 8, heals: 3 },
      
      // Potions
      combat_xp_potion: { name: 'Combat XP Potion', category: 'potion', value: 50, effect: 'combat_xp_boost' },
      gathering_xp_potion: { name: 'Gathering XP Potion', category: 'potion', value: 75, effect: 'gathering_xp_boost' },
      production_xp_potion: { name: 'Production XP Potion', category: 'potion', value: 100, effect: 'production_xp_boost' },
      
      // Enchantments
      xp_boost_gem: { name: 'XP Boost Gem', category: 'enchantment', value: 100, effect: 'xp_boost' },
      speed_boost_gem: { name: 'Speed Boost Gem', category: 'enchantment', value: 150, effect: 'speed_boost' },
      
      // Utilities
      vial: { name: 'Vial', category: 'resource', value: 1 },
      
      // Currency
      coins: { name: 'Coins', category: 'currency', value: 1 }
    };
  }

  getDefaultMonsters() {
    return {
      goblin: { 
        name: 'Goblin', 
        level: 2, 
        hp: 12,
        maxHp: 12,
        attack: 1,
        strength: 1,
        defence: 1,
        attackSpeed: 4000, // 4 seconds
        xp: {
          attack: 4,
          strength: 4,
          defence: 4,
          hitpoints: 4
        },
        loot: {
          coins: { min: 5, max: 15 }
        }
      },
      cow: { 
        name: 'Cow', 
        level: 2, 
        hp: 18,
        maxHp: 18,
        attack: 1,
        strength: 2,
        defence: 2,
        attackSpeed: 5000, // 5 seconds
        xp: {
          attack: 6,
          strength: 6,
          defence: 6,
          hitpoints: 6
        },
        loot: {
          coins: { min: 8, max: 20 }
        }
      },
      skeleton: { 
        name: 'Skeleton', 
        level: 15, 
        hp: 35,
        maxHp: 35,
        attack: 12,
        strength: 12,
        defence: 8,
        attackSpeed: 3500, // 3.5 seconds (faster but stronger)
        xp: {
          attack: 12,
          strength: 12,
          defence: 12,
          hitpoints: 12
        },
        loot: {
          coins: { min: 15, max: 35 }
        }
      }
    };
  }

  getDefaultQuests() {
    return {
      daily_woodcutting: { 
        name: 'Daily Woodcutting', 
        description: 'Cut 50 logs',
        requirement: { skill: 'woodcutting', amount: 50 },
        reward: { xp: 500, coins: 100 },
        resetDaily: true
      }
    };
  }

  createUser(username, email, password) {
    if (this.gameData.users[username]) {
      throw new Error('Username already exists');
    }

    const user = {
      username,
      email,
      password, // In a real app, this would be hashed
      created: Date.now(),
      lastLogin: Date.now(),
      
      // Player Stats
      totalLevel: 15, // Starting level (1 in each skill)
      combatLevel: 3,
      
      // Skills (level, xp)
      skills: {},
      
      // Inventory and Equipment
      inventory: { 
        coins: 1000,
        // Starting supplies for skill training
        potato_seed: 5,
        wheat_seed: 3,
        herb_seed: 1,
        vial: 10,
        // Starting equipment
        bronze_sword: 1,
        bronze_helmet: 1,
        bronze_platebody: 1,
        gold_necklace: 1,
        gold_ring: 1,
        cape: 1
      },
      
      // Equipment slots
      equipment: {
        weapon: null,
        helmet: null,
        body: null,
        legs: null,
        boots: null,
        gloves: null,
        necklace: null,
        ring: null,
        cape: null
      },
      bankItems: {},
      
      // Progress
      completedQuests: [],
      achievements: [],
      
      // Social
      guild: null,
      
      // Settings
      settings: {
        autoSave: true,
        notifications: true
      }
    };

    // Initialize all skills at level 1, hitpoints at level 10
    Object.keys(this.gameData.skills).forEach(skill => {
      if (skill === 'hitpoints') {
        user.skills[skill] = { level: 10, xp: 1154 }; // Level 10 = 1154 XP
      } else {
        user.skills[skill] = { level: 1, xp: 0 };
      }
    });
    
    // Player health system
    user.currentHp = user.skills.hitpoints.level;
    user.maxHp = user.skills.hitpoints.level;

    this.gameData.users[username] = user;
    this.saveGameData();
    return user;
  }

  login(username, password) {
    const user = this.gameData.users[username];
    if (!user || user.password !== password) {
      throw new Error('Invalid credentials');
    }

    user.lastLogin = Date.now();
    
    // Ensure user has health system (for existing accounts)
    if (user.currentHp === undefined) {
      user.currentHp = user.skills.hitpoints?.level || 10;
      user.maxHp = user.skills.hitpoints?.level || 10;
    }
    
    this.currentUser = user;
    localStorage.setItem('bmtIdle_currentUser', JSON.stringify(user));
    this.saveGameData();
    return user;
  }

  logout() {
    this.currentUser = null;
    localStorage.removeItem('bmtIdle_currentUser');
    this.currentPage = 'login';
    this.render();
  }

  navigateTo(page) {
    this.currentPage = page;
    
    // Only update main content, not the entire page
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.innerHTML = this.renderMainContent();
      this.updateSidebarActiveStates();
    } else {
      // Fallback to full render if main content not found
      this.render();
    }
  }

  updateSidebarActiveStates() {
    // Remove all active classes
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.remove('active');
    });
    
    // Add active class to current page
    const currentNavItem = document.querySelector(`[data-page="${this.currentPage}"]`);
    if (currentNavItem) {
      currentNavItem.classList.add('active');
    }
  }

  render() {
    console.log('BMT Idle: Render method called');
    
    try {
      const appComponent = document.querySelector('app-component');
      console.log('BMT Idle: App component found:', !!appComponent);
      
      if (!this.currentUser) {
        console.log('BMT Idle: Rendering auth page');
        appComponent.innerHTML = this.renderAuthPage();
      } else {
        console.log('BMT Idle: Rendering game page for user:', this.currentUser.username);
        appComponent.innerHTML = this.renderGamePage();
      }
      
      console.log('BMT Idle: Render completed successfully');
    } catch (error) {
      console.error('BMT Idle: Error in render method:', error);
      throw error;
    }
  }

  renderAuthPage() {
    return `
      <div class="auth-container">
        <div class="auth-card">
          <h1 class="auth-title">BMT Idle</h1>
          
          <div id="login-form" ${this.currentPage === 'register' ? 'class="hidden"' : ''}>
            <form class="auth-form">
              <div class="form-group">
                <label class="form-label">Username</label>
                <input type="text" class="form-input" id="login-username" required>
              </div>
              <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" class="form-input" id="login-password" required>
              </div>
              <button type="submit" class="btn btn-primary">Login</button>
            </form>
            <div class="auth-links">
              <a href="#" id="show-register">Don't have an account? Register</a>
            </div>
          </div>

          <div id="register-form" ${this.currentPage === 'login' ? 'class="hidden"' : ''}>
            <form class="auth-form">
              <div class="form-group">
                <label class="form-label">Username</label>
                <input type="text" class="form-input" id="register-username" required>
              </div>
              <div class="form-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-input" id="register-email" required>
              </div>
              <div class="form-group">
                <label class="form-label">Password</label>
                <input type="password" class="form-input" id="register-password" required>
              </div>
              <button type="submit" class="btn btn-primary">Register</button>
            </form>
            <div class="auth-links">
              <a href="#" id="show-login">Already have an account? Login</a>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderGamePage() {
    return `
      <div class="app-container">
        ${this.renderSidebar()}
        <div class="main-section">
          ${this.renderHeader()}
          <div class="main-content">
            ${this.renderMainContent()}
          </div>
        </div>
      </div>
    `;
  }

  renderHeader() {
    const coins = this.currentUser.inventory.coins || 0;
    return `
      <div class="game-header">
        <div class="header-left">
          <h1 class="page-title">${this.getPageTitle()}</h1>
        </div>
        <div class="header-right">
          <div class="coins-display" id="coins-display-header">
            <span class="coins-icon">🪙</span>
            <span class="coins-amount">${coins.toLocaleString()}</span>
          </div>
        </div>
      </div>
    `;
  }

  getPageTitle() {
    const titles = {
      dashboard: 'Dashboard',
      inventory: 'Inventory',
      equipment: 'Equipment',
      woodcutting: 'Woodcutting',
      mining: 'Mining',
      fishing: 'Fishing',
      farming: 'Farming',
      smelting: 'Smelting',
      smithing: 'Smithing',
      cooking: 'Cooking',
      alchemy: 'Alchemy',
      enchanting: 'Enchanting',
      attack: 'Attack',
      strength: 'Strength',
      defence: 'Defence',
      ranged: 'Ranged',
      magic: 'Magic',
      shop: 'Shop',
      market: 'Market',
      quests: 'Quests',
      guild: 'Guild',
      house: 'House',
      leaderboard: 'Leaderboard',
      changelog: 'Changelog',
      profile: 'Profile'
    };
    return titles[this.currentPage] || 'BMT Idle';
  }

  renderSidebar() {
    return `
      <div class="sidebar">
        <div class="nav-header">
          <div class="nav-title">BMT Idle</div>
          <div class="text-muted">Welcome, ${this.currentUser.username}</div>
        </div>
        
        <div class="nav-menu">
          <div class="nav-section">
            <div class="nav-section-title">Game</div>
            <a href="#" class="nav-item ${this.currentPage === 'dashboard' ? 'active' : ''}" data-page="dashboard">
              <span class="nav-item-icon">🏠</span> Dashboard
            </a>
            <a href="#" class="nav-item ${this.currentPage === 'inventory' ? 'active' : ''}" data-page="inventory">
              <span class="nav-item-icon">🎒</span> Inventory
            </a>
            <a href="#" class="nav-item ${this.currentPage === 'equipment' ? 'active' : ''}" data-page="equipment">
              <span class="nav-item-icon">⚔️</span> Equipment
            </a>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Skills</div>
            <a href="#" class="nav-item ${this.currentPage === 'woodcutting' ? 'active' : ''}" data-page="woodcutting">
              <span class="nav-item-icon">🪓</span> Woodcutting
            </a>
            <a href="#" class="nav-item ${this.currentPage === 'mining' ? 'active' : ''}" data-page="mining">
              <span class="nav-item-icon">⛏️</span> Mining
            </a>
            <a href="#" class="nav-item ${this.currentPage === 'fishing' ? 'active' : ''}" data-page="fishing">
              <span class="nav-item-icon">🎣</span> Fishing
            </a>
            <a href="#" class="nav-item ${this.currentPage === 'farming' ? 'active' : ''}" data-page="farming">
              <span class="nav-item-icon">🌱</span> Farming
            </a>
            <a href="#" class="nav-item ${this.currentPage === 'smelting' ? 'active' : ''}" data-page="smelting">
              <span class="nav-item-icon">🔥</span> Smelting
            </a>
            <a href="#" class="nav-item ${this.currentPage === 'smithing' ? 'active' : ''}" data-page="smithing">
              <span class="nav-item-icon">🔨</span> Smithing
            </a>
            <a href="#" class="nav-item ${this.currentPage === 'cooking' ? 'active' : ''}" data-page="cooking">
              <span class="nav-item-icon">🍳</span> Cooking
            </a>
            <a href="#" class="nav-item ${this.currentPage === 'alchemy' ? 'active' : ''}" data-page="alchemy">
              <span class="nav-item-icon">⚗️</span> Alchemy
            </a>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Combat</div>
            <a href="#" class="nav-item ${this.currentPage === 'attack' ? 'active' : ''}" data-page="attack">
              <span class="nav-item-icon">⚔️</span> Attack
            </a>
            <a href="#" class="nav-item ${this.currentPage === 'strength' ? 'active' : ''}" data-page="strength">
              <span class="nav-item-icon">💪</span> Strength
            </a>
            <a href="#" class="nav-item ${this.currentPage === 'defence' ? 'active' : ''}" data-page="defence">
              <span class="nav-item-icon">🛡️</span> Defence
            </a>
            <a href="#" class="nav-item ${this.currentPage === 'ranged' ? 'active' : ''}" data-page="ranged">
              <span class="nav-item-icon">🏹</span> Ranged
            </a>
            <a href="#" class="nav-item ${this.currentPage === 'magic' ? 'active' : ''}" data-page="magic">
              <span class="nav-item-icon">🔮</span> Magic
            </a>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Social</div>
            <a href="#" class="nav-item ${this.currentPage === 'profile' ? 'active' : ''}" data-page="profile">
              <span class="nav-item-icon">👤</span> Profile
            </a>
            <a href="#" class="nav-item ${this.currentPage === 'guild' ? 'active' : ''}" data-page="guild">
              <span class="nav-item-icon">🏛️</span> Guild
            </a>
            <a href="#" class="nav-item ${this.currentPage === 'leaderboard' ? 'active' : ''}" data-page="leaderboard">
              <span class="nav-item-icon">🏆</span> Leaderboard
            </a>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Economy</div>
            <a href="#" class="nav-item ${this.currentPage === 'shop' ? 'active' : ''}" data-page="shop">
              <span class="nav-item-icon">🏪</span> Shop
            </a>
            <a href="#" class="nav-item ${this.currentPage === 'market' ? 'active' : ''}" data-page="market">
              <span class="nav-item-icon">💰</span> Market
            </a>
          </div>

          <div class="nav-section">
            <div class="nav-section-title">Other</div>
            <a href="#" class="nav-item ${this.currentPage === 'quests' ? 'active' : ''}" data-page="quests">
              <span class="nav-item-icon">📜</span> Quests
            </a>
            <a href="#" class="nav-item ${this.currentPage === 'house' ? 'active' : ''}" data-page="house">
              <span class="nav-item-icon">🏠</span> House
            </a>
            <a href="#" class="nav-item ${this.currentPage === 'changelog' ? 'active' : ''}" data-page="changelog">
              <span class="nav-item-icon">📋</span> Updates
            </a>
            <a href="#" class="nav-item" id="logout-btn">
              <span class="nav-item-icon">🚪</span> Logout
            </a>
          </div>
        </div>
      </div>
    `;
  }

  renderMainContent() {
    switch (this.currentPage) {
      case 'dashboard':
        return this.renderDashboard();
      case 'inventory':
        return this.renderInventory();
      case 'equipment':
        return this.renderEquipment();
      case 'woodcutting':
        return this.renderSkillPage('woodcutting');
      case 'mining':
        return this.renderSkillPage('mining');
      case 'fishing':
        return this.renderSkillPage('fishing');
      case 'farming':
        return this.renderSkillPage('farming');
      case 'smelting':
        return this.renderSkillPage('smelting');
      case 'smithing':
        return this.renderSkillPage('smithing');
      case 'cooking':
        return this.renderSkillPage('cooking');
      case 'alchemy':
        return this.renderSkillPage('alchemy');
      case 'enchanting':
        return this.renderSkillPage('enchanting');
      case 'attack':
        return this.renderSkillPage('attack');
      case 'strength':
        return this.renderSkillPage('strength');
      case 'defence':
        return this.renderSkillPage('defence');
      case 'ranged':
        return this.renderSkillPage('ranged');
      case 'magic':
        return this.renderSkillPage('magic');
      case 'shop':
        return this.renderShop();
      case 'market':
        return this.renderMarket();
      case 'quests':
        return this.renderQuests();
      case 'guild':
        return this.renderGuild();
      case 'house':
        return this.renderHouse();
      case 'leaderboard':
        return this.renderLeaderboard();
      case 'changelog':
        return this.renderChangelog();
      case 'profile':
        return this.renderProfile();
      default:
        return `<div class="card"><h2>Page: ${this.currentPage}</h2><p>This page is under construction!</p></div>`;
    }
  }

  renderDashboard() {
    const totalLevel = Object.values(this.currentUser.skills).reduce((sum, skill) => sum + skill.level, 0);
    
    return `
      <div class="grid grid-2">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Player Stats</h2>
          </div>
          <div class="grid grid-2">
            <div>
              <div class="text-muted">Total Level</div>
              <div class="text-gold" style="font-size: 1.5rem; font-weight: bold;" id="total-level-display">${totalLevel}</div>
            </div>
            <div>
              <div class="text-muted">Combat Level</div>
              <div class="text-gold" style="font-size: 1.5rem; font-weight: bold;" id="combat-level-display">${this.calculateCombatLevel()}</div>
            </div>
            <div>
              <div class="text-muted">Coins</div>
              <div class="text-gold" style="font-size: 1.5rem; font-weight: bold;" id="coins-display">${this.currentUser.inventory.coins || 0}</div>
            </div>
            <div>
              <div class="text-muted">Hitpoints</div>
              <div class="text-gold" style="font-size: 1.5rem; font-weight: bold;" id="hp-display">${this.currentUser.currentHp}/${this.currentUser.maxHp}</div>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Quick Actions</h2>
          </div>
          <div class="grid grid-2">
            <button class="btn btn-primary" data-page="woodcutting">🪓 Train Woodcutting</button>
            <button class="btn btn-primary" data-page="mining">⛏️ Train Mining</button>
            <button class="btn btn-primary" data-page="attack">⚔️ Combat</button>
            <button class="btn btn-primary" data-page="quests">📜 View Quests</button>
          </div>
        </div>

        ${this.currentUser.currentTraining ? `
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">⏰ Currently Training</h2>
          </div>
          <div style="text-align: center; padding: 1rem;">
            <p>Training: <strong><span id="current-skill-name">${this.currentUser.currentTraining.skill === 'combat' ? 'Combat' : this.gameData.skills[this.currentUser.currentTraining.skill].name}</span></strong></p>
            <p>Activity: <span id="current-activity">${this.currentUser.currentTraining.activity}</span></p>
            ${this.currentUser.currentTraining.skill === 'combat' ? 
              `<p>Monster: <span class="text-gold">${this.gameData.monsters[this.currentUser.currentTraining.monster].name}</span></p>` :
              `<p>XP Rate: <span id="current-xp-rate">${this.currentUser.currentTraining.xpRate}</span> XP/action</p>`
            }
            
            <!-- Action Timer Bar -->
            <div style="margin: 1rem 0;">
              <div class="text-muted" style="font-size: 0.875rem; margin-bottom: 4px;">Next Action</div>
              <div class="xp-bar">
                <div id="action-progress" class="xp-progress" style="background: linear-gradient(90deg, #ffd700 0%, #ffed4e 100%);"></div>
              </div>
              <div class="text-muted" style="font-size: 0.75rem;">
                <span id="action-timer">0.0</span>s / ${this.currentUser.currentTraining.actionTime / 1000}s
              </div>
            </div>
            
            <!-- Overall Training Progress -->
            <div style="margin: 1rem 0;">
              <div class="text-muted" style="font-size: 0.875rem; margin-bottom: 4px;">Training Session</div>
              <div class="xp-bar">
                <div id="session-progress" class="xp-progress"></div>
              </div>
              <div class="text-muted" style="font-size: 0.75rem;">
                <span id="session-timer">${Math.floor((Date.now() - this.currentUser.currentTraining.startTime) / 60000)}</span> / ${8 * 60} minutes
              </div>
            </div>
            
            <button class="btn btn-danger" onclick="game.stopTraining()">Stop Training</button>
          </div>
        </div>
        ` : ''}

      </div>

      <div class="card">
        <div class="card-header">
          <h2 class="card-title">Skill Overview</h2>
        </div>
        <div class="grid grid-4">
          ${Object.entries(this.gameData.skills).map(([skillId, skillData]) => {
            const userSkill = this.currentUser.skills[skillId];
            return `
              <div class="skill-overview">
                <div class="flex" style="align-items: center; margin-bottom: 8px;">
                  <span class="skill-icon">${skillData.icon}</span>
                  <div>
                    <div style="font-weight: 500;">${skillData.name}</div>
                    <div class="skill-level">Level ${userSkill.level}</div>
                  </div>
                </div>
                <div class="xp-bar">
                  <div class="xp-progress" style="width: ${this.getXpProgress(userSkill)}%"></div>
                </div>
                <div class="text-muted" style="font-size: 0.75rem;">
                  ${this.formatNumber(userSkill.xp)} / ${this.formatNumber(this.getXpForLevel(userSkill.level + 1))} XP
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  renderInventory() {
    return `
      <div class="inventory-container">
        <!-- Item Grid -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">🎒 Inventory</h2>
            <div class="text-muted">Your items: ${Object.entries(this.currentUser.inventory).filter(([itemId]) => itemId !== 'coins').reduce((sum, [, qty]) => sum + qty, 0)} / 100</div>
          </div>
          
          <div class="grid grid-4">
            ${Object.entries(this.currentUser.inventory).filter(([itemId]) => itemId !== 'coins').map(([itemId, quantity]) => {
              const itemData = this.gameData.items[itemId];
              if (!itemData) return '';
              
              return `
                <div class="inventory-item-card card" onclick="game.selectInventoryItem('${itemId}')" data-item-id="${itemId}">
                  <div style="font-size: 2rem; margin-bottom: 8px;">
                    ${this.getItemIcon(itemId)}
                  </div>
                  <div style="font-weight: 500;">${itemData.name}</div>
                  <div class="text-gold">x${this.formatNumber(quantity)}</div>
                  <div class="text-muted" style="font-size: 0.75rem;">
                    ${this.formatCoins(itemData.value * quantity)}
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          
          ${Object.keys(this.currentUser.inventory).filter(itemId => itemId !== 'coins').length === 0 ? 
            '<div class="text-center text-muted" style="padding: 2rem;">Your inventory is empty. Go train some skills!</div>' : ''}
        </div>
        
        <!-- Item Detail Panel -->
        <div class="card" id="inventory-detail-panel" style="display: none;">
          <div class="card-header">
            <h3 class="card-title" id="item-detail-title">Select an Item</h3>
            <button class="btn btn-secondary btn-small" onclick="game.closeInventoryDetail()">✕ Close</button>
          </div>
          <div id="item-detail-content">
            <p class="text-muted text-center" style="padding: 2rem;">Click on an item to view details and actions.</p>
          </div>
        </div>
      </div>
    `;
  }

  renderEquipment() {
    const equipment = this.currentUser.equipment;
    const totalStats = this.calculateTotalStats();
    
    return `
      <div class="equipment-container">
        <!-- Equipment Slots -->
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">⚔️ Equipment</h2>
            <div class="text-muted">Equip items to boost your combat stats</div>
          </div>
          
          <div class="equipment-layout">
            <!-- Left Side - Armor -->
            <div class="equipment-side">
              <div class="equipment-slot" data-slot="helmet">
                <div class="slot-label">Helmet</div>
                <div class="slot-content" onclick="game.openEquipmentSlot('helmet')">
                  ${equipment.helmet ? this.renderEquippedItem(equipment.helmet) : this.renderEmptySlot('helmet')}
                </div>
              </div>
              
              <div class="equipment-slot" data-slot="necklace">
                <div class="slot-label">Necklace</div>
                <div class="slot-content" onclick="game.openEquipmentSlot('necklace')">
                  ${equipment.necklace ? this.renderEquippedItem(equipment.necklace) : this.renderEmptySlot('necklace')}
                </div>
              </div>
              
              <div class="equipment-slot" data-slot="cape">
                <div class="slot-label">Cape</div>
                <div class="slot-content" onclick="game.openEquipmentSlot('cape')">
                  ${equipment.cape ? this.renderEquippedItem(equipment.cape) : this.renderEmptySlot('cape')}
                </div>
              </div>
            </div>
            
            <!-- Center - Main Equipment -->
            <div class="equipment-center">
              <div class="equipment-slot" data-slot="weapon">
                <div class="slot-label">Weapon</div>
                <div class="slot-content" onclick="game.openEquipmentSlot('weapon')">
                  ${equipment.weapon ? this.renderEquippedItem(equipment.weapon) : this.renderEmptySlot('weapon')}
                </div>
              </div>
              
              <div class="equipment-slot" data-slot="body">
                <div class="slot-label">Body</div>
                <div class="slot-content" onclick="game.openEquipmentSlot('body')">
                  ${equipment.body ? this.renderEquippedItem(equipment.body) : this.renderEmptySlot('body')}
                </div>
              </div>
              
              <div class="equipment-slot" data-slot="legs">
                <div class="slot-label">Legs</div>
                <div class="slot-content" onclick="game.openEquipmentSlot('legs')">
                  ${equipment.legs ? this.renderEquippedItem(equipment.legs) : this.renderEmptySlot('legs')}
                </div>
              </div>
            </div>
            
            <!-- Right Side - Accessories -->
            <div class="equipment-side">
              <div class="equipment-slot" data-slot="gloves">
                <div class="slot-label">Gloves</div>
                <div class="slot-content" onclick="game.openEquipmentSlot('gloves')">
                  ${equipment.gloves ? this.renderEquippedItem(equipment.gloves) : this.renderEmptySlot('gloves')}
                </div>
              </div>
              
              <div class="equipment-slot" data-slot="boots">
                <div class="slot-label">Boots</div>
                <div class="slot-content" onclick="game.openEquipmentSlot('boots')">
                  ${equipment.boots ? this.renderEquippedItem(equipment.boots) : this.renderEmptySlot('boots')}
                </div>
              </div>
              
              <div class="equipment-slot" data-slot="ring">
                <div class="slot-label">Ring</div>
                <div class="slot-content" onclick="game.openEquipmentSlot('ring')">
                  ${equipment.ring ? this.renderEquippedItem(equipment.ring) : this.renderEmptySlot('ring')}
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Stats Display -->
        <div class="card">
          <div class="card-header">
            <h3>📊 Combat Stats</h3>
          </div>
          <div class="grid grid-3">
            <div>
              <div class="text-muted">Attack</div>
              <div class="text-gold">${totalStats.attack}</div>
            </div>
            <div>
              <div class="text-muted">Strength</div>
              <div class="text-gold">${totalStats.strength}</div>
            </div>
            <div>
              <div class="text-muted">Defence</div>
              <div class="text-gold">${totalStats.defence}</div>
            </div>
          </div>
        </div>
        
        <!-- Equipment Selection Modal -->
        <div class="card" id="equipment-selection" style="display: none;">
          <div class="card-header">
            <h3 id="equipment-selection-title">Select Equipment</h3>
            <button class="btn btn-secondary btn-small" onclick="game.closeEquipmentSelection()">✕ Close</button>
          </div>
          <div id="equipment-selection-content">
            <p class="text-muted text-center" style="padding: 2rem;">Loading equipment...</p>
          </div>
        </div>
      </div>
    `;
  }

  renderSkillPage(skillId) {
    const skillData = this.gameData.skills[skillId];
    const userSkill = this.currentUser.skills[skillId];
    
    return `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">
            <span class="skill-icon">${skillData.icon}</span>
            ${skillData.name}
          </h2>
          <div class="text-gold skill-level" data-skill="${skillId}">Level <span id="skill-level-${skillId}">${userSkill.level}</span></div>
        </div>
        
        <div class="grid grid-2 mb-3">
          <div>
            <div class="text-muted">Current XP</div>
            <div class="text-gold" id="current-xp-${skillId}">${this.formatNumber(userSkill.xp)}</div>
          </div>
          <div>
            <div class="text-muted">XP to Next Level</div>
            <div class="text-gold" id="xp-to-next-${skillId}">${this.formatNumber(this.getXpForLevel(userSkill.level + 1) - userSkill.xp)}</div>
          </div>
        </div>
        
        <div class="xp-bar" style="margin-bottom: 1rem;">
          <div class="xp-progress" id="xp-progress-${skillId}" style="width: ${this.getXpProgress(userSkill)}%"></div>
        </div>
        
        <!-- Action Timer (only show if training this skill) -->
        ${this.currentUser.currentTraining && this.currentUser.currentTraining.skill === skillId ? `
        <div class="card" style="margin-bottom: 2rem; background: rgba(255, 215, 0, 0.1); border-color: var(--osrs-gold);">
          <div class="card-header">
            <h3>⏰ Action Timer</h3>
          </div>
          <div style="text-align: center;">
            <p>Current Activity: <strong><span id="skill-page-activity">${this.currentUser.currentTraining.activity}</span></strong></p>
            <div style="margin: 1rem 0;">
              <div class="xp-bar">
                <div id="skill-action-progress" class="xp-progress" style="background: linear-gradient(90deg, #ffd700 0%, #ffed4e 100%);"></div>
              </div>
              <div class="text-muted" style="font-size: 0.75rem;">
                <span id="skill-action-timer">0.0</span>s / ${this.currentUser.currentTraining.actionTime / 1000}s
              </div>
            </div>
            <button class="btn btn-danger" onclick="game.stopTraining()">Stop Training</button>
          </div>
        </div>
        ` : ''}
        
        ${this.renderSkillActions(skillId)}
      </div>
    `;
  }

  renderSkillActions(skillId) {
    const userSkill = this.currentUser.skills[skillId];
    
    switch (skillId) {
      case 'woodcutting':
        return `
          <div class="grid grid-3">
            <div class="card ${userSkill.level < 1 ? 'disabled-card' : ''}">
              <div style="text-align: center; margin-bottom: 1rem;">
                <img src="./images/trees/normal_tree.svg" alt="Normal Tree" style="width: 64px; height: 64px;">
              </div>
              <h3>Normal Tree</h3>
              <p>Level 1 required</p>
              <p>25 XP per log (5s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 1 ? 'disabled' : ''} onclick="game.trainSkill('woodcutting', 'logs', 25, 5000, 'Cutting Normal Trees')">
                Cut Tree
              </button>
            </div>
            <div class="card ${userSkill.level < 15 ? 'disabled-card' : ''}">
              <div style="text-align: center; margin-bottom: 1rem;">
                <img src="./images/trees/oak_tree.svg" alt="Oak Tree" style="width: 64px; height: 64px;">
              </div>
              <h3>Oak Tree</h3>
              <p>Level 15 required</p>
              <p>37.5 XP per log (5s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 15 ? 'disabled' : ''} 
                onclick="game.trainSkill('woodcutting', 'oak_logs', 37.5, 5000, 'Cutting Oak Trees')">
                Cut Oak Tree
              </button>
            </div>
            <div class="card ${userSkill.level < 30 ? 'disabled-card' : ''}">
              <div style="text-align: center; margin-bottom: 1rem;">
                <img src="./images/trees/willow_tree.svg" alt="Willow Tree" style="width: 64px; height: 64px;">
              </div>
              <h3>Willow Tree</h3>
              <p>Level 30 required</p>
              <p>67.5 XP per log (6s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 30 ? 'disabled' : ''} 
                onclick="game.trainSkill('woodcutting', 'willow_logs', 67.5, 6000, 'Cutting Willow Trees')">
                Cut Willow Tree
              </button>
            </div>
            <div class="card ${userSkill.level < 60 ? 'disabled-card' : ''}">
              <h3>Yew Tree</h3>
              <p>Level 60 required</p>
              <p>175 XP per log (10s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 60 ? 'disabled' : ''} 
                onclick="game.trainSkill('woodcutting', 'yew_logs', 175, 10000, 'Cutting Yew Trees')">
                Cut Yew Tree
              </button>
            </div>
            <div class="card ${userSkill.level < 75 ? 'disabled-card' : ''}">
              <h3>Magic Tree</h3>
              <p>Level 75 required</p>
              <p>250 XP per log (15s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 75 ? 'disabled' : ''} 
                onclick="game.trainSkill('woodcutting', 'magic_logs', 250, 15000, 'Cutting Magic Trees')">
                Cut Magic Tree
              </button>
            </div>
          </div>
        `;
      
      case 'mining':
        return `
          <div class="grid grid-3">
            <div class="card ${userSkill.level < 1 ? 'disabled-card' : ''}">
              <div style="text-align: center; margin-bottom: 1rem;">
                <img src="./images/ores/copper_ore.svg" alt="Copper Ore" style="width: 64px; height: 64px;">
              </div>
              <h3>Copper Ore</h3>
              <p>Level 1 required</p>
              <p>17.5 XP per ore (6s each)</p>
              <button class="btn btn-primary" onclick="game.trainSkill('mining', 'copper_ore', 17.5, 6000, 'Mining Copper')">
                Mine Copper
              </button>
            </div>
            <div class="card ${userSkill.level < 1 ? 'disabled-card' : ''}">
              <h3>Tin Ore</h3>
              <p>Level 1 required</p>
              <p>17.5 XP per ore (6s each)</p>
              <button class="btn btn-primary" onclick="game.trainSkill('mining', 'tin_ore', 17.5, 6000, 'Mining Tin')">
                Mine Tin
              </button>
            </div>
            <div class="card ${userSkill.level < 15 ? 'disabled-card' : ''}">
              <div style="text-align: center; margin-bottom: 1rem;">
                <img src="./images/ores/iron_ore.svg" alt="Iron Ore" style="width: 64px; height: 64px;">
              </div>
              <h3>Iron Ore</h3>
              <p>Level 15 required</p>
              <p>35 XP per ore (6s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 15 ? 'disabled' : ''} 
                onclick="game.trainSkill('mining', 'iron_ore', 35, 6000, 'Mining Iron')">
                Mine Iron
              </button>
            </div>
            <div class="card ${userSkill.level < 30 ? 'disabled-card' : ''}">
              <h3>Coal</h3>
              <p>Level 30 required</p>
              <p>50 XP per coal (8s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 30 ? 'disabled' : ''} 
                onclick="game.trainSkill('mining', 'coal', 50, 8000, 'Mining Coal')">
                Mine Coal
              </button>
            </div>
            <div class="card ${userSkill.level < 40 ? 'disabled-card' : ''}">
              <h3>Gold Ore</h3>
              <p>Level 40 required</p>
              <p>65 XP per ore (8s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 40 ? 'disabled' : ''} 
                onclick="game.trainSkill('mining', 'gold_ore', 65, 8000, 'Mining Gold')">
                Mine Gold
              </button>
            </div>
            <div class="card ${userSkill.level < 55 ? 'disabled-card' : ''}">
              <h3>Mithril Ore</h3>
              <p>Level 55 required</p>
              <p>80 XP per ore (10s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 55 ? 'disabled' : ''} 
                onclick="game.trainSkill('mining', 'mithril_ore', 80, 10000, 'Mining Mithril')">
                Mine Mithril
              </button>
            </div>
          </div>
        `;

      case 'fishing':
        return `
          <div class="grid grid-3">
            <div class="card ${userSkill.level < 1 ? 'disabled-card' : ''}">
              <h3>Shrimp</h3>
              <p>Level 1 required</p>
              <p>10 XP per shrimp (5s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 1 ? 'disabled' : ''} onclick="game.trainSkill('fishing', 'shrimp', 10, 5000, 'Catching Shrimp')">
                Catch Shrimp
              </button>
            </div>
            <div class="card ${userSkill.level < 5 ? 'disabled-card' : ''}">
              <h3>Sardine</h3>
              <p>Level 5 required</p>
              <p>20 XP per sardine (5s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 5 ? 'disabled' : ''} 
                onclick="game.trainSkill('fishing', 'sardine', 20, 5000, 'Catching Sardines')">
                Catch Sardine
              </button>
            </div>
            <div class="card ${userSkill.level < 20 ? 'disabled-card' : ''}">
              <h3>Trout</h3>
              <p>Level 20 required</p>
              <p>50 XP per trout (6s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 20 ? 'disabled' : ''} 
                onclick="game.trainSkill('fishing', 'trout', 50, 6000, 'Catching Trout')">
                Catch Trout
              </button>
            </div>
            <div class="card ${userSkill.level < 30 ? 'disabled-card' : ''}">
              <h3>Salmon</h3>
              <p>Level 30 required</p>
              <p>70 XP per salmon (7s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 30 ? 'disabled' : ''} 
                onclick="game.trainSkill('fishing', 'salmon', 70, 7000, 'Catching Salmon')">
                Catch Salmon
              </button>
            </div>
            <div class="card ${userSkill.level < 40 ? 'disabled-card' : ''}">
              <h3>Lobster</h3>
              <p>Level 40 required</p>
              <p>90 XP per lobster (8s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 40 ? 'disabled' : ''} 
                onclick="game.trainSkill('fishing', 'lobster', 90, 8000, 'Catching Lobsters')">
                Catch Lobster
              </button>
            </div>
            <div class="card ${userSkill.level < 76 ? 'disabled-card' : ''}">
              <h3>Shark</h3>
              <p>Level 76 required</p>
              <p>110 XP per shark (10s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 76 ? 'disabled' : ''} 
                onclick="game.trainSkill('fishing', 'shark', 110, 10000, 'Catching Sharks')">
                Catch Shark
              </button>
            </div>
          </div>
        `;

      case 'cooking':
        return `
          <div class="grid grid-3">
            <div class="card ${userSkill.level < 1 ? 'disabled-card' : ''}">
              <h3>Cooked Shrimp</h3>
              <p>Level 1 required</p>
              <p>30 XP per shrimp</p>
              <p>Requires: Raw Shrimp</p>
              <p class="text-muted">Heals 3 HP</p>
              <button class="btn btn-primary" ${userSkill.level < 1 ? 'disabled' : ''} onclick="game.cookFood('shrimp', 'cooked_shrimp', 30, 2000)">
                Cook Shrimp
              </button>
            </div>
            <div class="card ${userSkill.level < 1 ? 'disabled-card' : ''}">
              <h3>Bread</h3>
              <p>Level 1 required</p>
              <p>40 XP per bread</p>
              <p>Requires: Wheat</p>
              <p class="text-muted">Heals 5 HP</p>
              <button class="btn btn-primary" ${userSkill.level < 1 ? 'disabled' : ''} onclick="game.cookFood('wheat', 'bread', 40, 3000)">
                Bake Bread
              </button>
            </div>
            <div class="card ${userSkill.level < 15 ? 'disabled-card' : ''}">
              <h3>Cooked Trout</h3>
              <p>Level 15 required</p>
              <p>70 XP per trout</p>
              <p>Requires: Raw Trout</p>
              <p class="text-muted">Heals 7 HP</p>
              <button class="btn btn-primary" ${userSkill.level < 15 ? 'disabled' : ''} 
                onclick="game.cookFood('trout', 'cooked_trout', 70, 4000)">
                Cook Trout
              </button>
            </div>
            <div class="card ${userSkill.level < 25 ? 'disabled-card' : ''}">
              <h3>Vegetable Stew</h3>
              <p>Level 25 required</p>
              <p>60 XP per stew</p>
              <p>Requires: Potato + Carrot</p>
              <p class="text-muted">Heals 8 HP</p>
              <button class="btn btn-primary" ${userSkill.level < 25 ? 'disabled' : ''} 
                onclick="game.cookFood(['potato', 'carrot'], 'vegetable_stew', 60, 5000)">
                Cook Stew
              </button>
            </div>
            <div class="card ${userSkill.level < 40 ? 'disabled-card' : ''}">
              <h3>Cabbage Soup</h3>
              <p>Level 40 required</p>
              <p>80 XP per soup</p>
              <p>Requires: Cabbage + Wheat</p>
              <p class="text-muted">Heals 12 HP</p>
              <button class="btn btn-primary" ${userSkill.level < 40 ? 'disabled' : ''} 
                onclick="game.cookFood(['cabbage', 'wheat'], 'cabbage_soup', 80, 6000)">
                Cook Soup
              </button>
            </div>
          </div>
        `;

      case 'smelting':
        return `
          <div class="grid grid-3">
            <div class="card">
              <h3>Bronze Bar</h3>
              <p>Level 1 required</p>
              <p>6.25 XP per bar</p>
              <p>Requires: Copper + Tin</p>
              <button class="btn btn-primary" onclick="game.smeltBar(['copper_ore', 'tin_ore'], 'bronze_bar', 6.25, 3000)">
                Smelt Bronze
              </button>
            </div>
            <div class="card">
              <h3>Iron Bar</h3>
              <p>Level 15 required</p>
              <p>12.5 XP per bar</p>
              <p>Requires: Iron Ore</p>
              <button class="btn btn-primary" ${userSkill.level < 15 ? 'disabled' : ''} 
                onclick="game.smeltBar(['iron_ore'], 'iron_bar', 12.5, 4000)">
                Smelt Iron
              </button>
            </div>
            <div class="card">
              <h3>Steel Bar</h3>
              <p>Level 30 required</p>
              <p>17.5 XP per bar</p>
              <p>Requires: Iron Ore + Coal</p>
              <button class="btn btn-primary" ${userSkill.level < 30 ? 'disabled' : ''} 
                onclick="game.smeltBar(['iron_ore', 'coal'], 'steel_bar', 17.5, 5000)">
                Smelt Steel
              </button>
            </div>
          </div>
        `;

      case 'smithing':
        return `
          <div class="grid grid-3">
            <!-- Weapons -->
            <div class="card">
              <h3>Bronze Sword</h3>
              <p>Level 1 required</p>
              <p>12.5 XP per sword</p>
              <p>Requires: Bronze Bar</p>
              <button class="btn btn-primary" onclick="game.smithItem('bronze_bar', 'bronze_sword', 12.5, 4000)">
                Smith Bronze Sword
              </button>
            </div>
            <div class="card">
              <h3>Iron Sword</h3>
              <p>Level 5 required</p>
              <p>25 XP per sword</p>
              <p>Requires: Iron Bar</p>
              <button class="btn btn-primary" ${userSkill.level < 5 ? 'disabled' : ''} 
                onclick="game.smithItem('iron_bar', 'iron_sword', 25, 5000)">
                Smith Iron Sword
              </button>
            </div>
            <div class="card">
              <h3>Steel Sword</h3>
              <p>Level 10 required</p>
              <p>37.5 XP per sword</p>
              <p>Requires: Steel Bar</p>
              <button class="btn btn-primary" ${userSkill.level < 10 ? 'disabled' : ''} 
                onclick="game.smithItem('steel_bar', 'steel_sword', 37.5, 6000)">
                Smith Steel Sword
              </button>
            </div>
            
            <!-- Armor - Helmets -->
            <div class="card">
              <h3>Bronze Helmet</h3>
              <p>Level 1 required</p>
              <p>10 XP per helmet</p>
              <p>Requires: Bronze Bar</p>
              <button class="btn btn-primary" onclick="game.smithItem('bronze_bar', 'bronze_helmet', 10, 3000)">
                Smith Bronze Helmet
              </button>
            </div>
            <div class="card">
              <h3>Iron Helmet</h3>
              <p>Level 5 required</p>
              <p>20 XP per helmet</p>
              <p>Requires: Iron Bar</p>
              <button class="btn btn-primary" ${userSkill.level < 5 ? 'disabled' : ''} 
                onclick="game.smithItem('iron_bar', 'iron_helmet', 20, 4000)">
                Smith Iron Helmet
              </button>
            </div>
            <div class="card">
              <h3>Steel Helmet</h3>
              <p>Level 10 required</p>
              <p>30 XP per helmet</p>
              <p>Requires: Steel Bar</p>
              <button class="btn btn-primary" ${userSkill.level < 10 ? 'disabled' : ''} 
                onclick="game.smithItem('steel_bar', 'steel_helmet', 30, 5000)">
                Smith Steel Helmet
              </button>
            </div>
            
            <!-- Armor - Body -->
            <div class="card">
              <h3>Bronze Platebody</h3>
              <p>Level 1 required</p>
              <p>15 XP per platebody</p>
              <p>Requires: Bronze Bar</p>
              <button class="btn btn-primary" onclick="game.smithItem('bronze_bar', 'bronze_platebody', 15, 5000)">
                Smith Bronze Platebody
              </button>
            </div>
            <div class="card">
              <h3>Iron Platebody</h3>
              <p>Level 5 required</p>
              <p>30 XP per platebody</p>
              <p>Requires: Iron Bar</p>
              <button class="btn btn-primary" ${userSkill.level < 5 ? 'disabled' : ''} 
                onclick="game.smithItem('iron_bar', 'iron_platebody', 30, 6000)">
                Smith Iron Platebody
              </button>
            </div>
            <div class="card">
              <h3>Steel Platebody</h3>
              <p>Level 10 required</p>
              <p>45 XP per platebody</p>
              <p>Requires: Steel Bar</p>
              <button class="btn btn-primary" ${userSkill.level < 10 ? 'disabled' : ''} 
                onclick="game.smithItem('steel_bar', 'steel_platebody', 45, 7000)">
                Smith Steel Platebody
              </button>
            </div>
          </div>
        `;

      case 'farming':
        return `
          <div class="grid grid-3">
            <div class="card ${userSkill.level < 1 ? 'disabled-card' : ''}">
              <h3>Potato Seeds</h3>
              <p>Level 1 required</p>
              <p>8 XP per harvest</p>
              <p>1 potato per seed (30s each)</p>
              <p class="text-muted">Food for healing</p>
              <button class="btn btn-primary" ${userSkill.level < 1 ? 'disabled' : ''} onclick="game.trainSkill('farming', 'potato', 8, 30000, 'Growing Potatoes', 'potato_seed')">
                Plant Potatoes
              </button>
            </div>
            <div class="card ${userSkill.level < 15 ? 'disabled-card' : ''}">
              <h3>Wheat Seeds</h3>
              <p>Level 15 required</p>
              <p>17 XP per harvest</p>
              <p>1 wheat per seed (45s each)</p>
              <p class="text-muted">For cooking bread & potions</p>
              <button class="btn btn-primary" ${userSkill.level < 15 ? 'disabled' : ''} 
                onclick="game.trainSkill('farming', 'wheat', 17, 45000, 'Growing Wheat', 'wheat_seed')">
                Plant Wheat
              </button>
            </div>
            <div class="card ${userSkill.level < 25 ? 'disabled-card' : ''}">
              <h3>Herb Seeds</h3>
              <p>Level 25 required</p>
              <p>25 XP per harvest</p>
              <p>1 herb per seed (60s each)</p>
              <p class="text-muted">Essential for all potions</p>
              <button class="btn btn-primary" ${userSkill.level < 25 ? 'disabled' : ''} 
                onclick="game.trainSkill('farming', 'herb', 25, 60000, 'Growing Herbs', 'herb_seed')">
                Plant Herbs
              </button>
            </div>
            <div class="card ${userSkill.level < 35 ? 'disabled-card' : ''}">
              <h3>Carrot Seeds</h3>
              <p>Level 35 required</p>
              <p>35 XP per harvest</p>
              <p>1 carrot per seed (90s each)</p>
              <p class="text-muted">Better healing food</p>
              <button class="btn btn-primary" ${userSkill.level < 35 ? 'disabled' : ''} 
                onclick="game.trainSkill('farming', 'carrot', 35, 90000, 'Growing Carrots', 'carrot_seed')">
                Plant Carrots
              </button>
            </div>
            <div class="card ${userSkill.level < 50 ? 'disabled-card' : ''}">
              <h3>Cabbage Seeds</h3>
              <p>Level 50 required</p>
              <p>50 XP per harvest</p>
              <p>1 cabbage per seed (120s each)</p>
              <p class="text-muted">High-healing food</p>
              <button class="btn btn-primary" ${userSkill.level < 50 ? 'disabled' : ''} 
                onclick="game.trainSkill('farming', 'cabbage', 50, 120000, 'Growing Cabbage', 'cabbage_seed')">
                Plant Cabbage
              </button>
            </div>
          </div>
        `;

      case 'alchemy':
        return `
          <div class="grid grid-3">
            <div class="card ${userSkill.level < 1 ? 'disabled-card' : ''}">
              <h3>Combat XP Potion</h3>
              <p>Level 1 required</p>
              <p>17.5 XP per potion</p>
              <p>Requires: Herb + Vial</p>
              <p class="text-muted">+5% combat XP for 30 minutes</p>
              <button class="btn btn-primary" ${userSkill.level < 1 ? 'disabled' : ''} onclick="game.brewPotion(['herb', 'vial'], 'combat_xp_potion', 17.5, 5000)">
                Brew Combat XP Potion
              </button>
            </div>
            <div class="card ${userSkill.level < 25 ? 'disabled-card' : ''}">
              <h3>Gathering XP Potion</h3>
              <p>Level 25 required</p>
              <p>37.5 XP per potion</p>
              <p>Requires: Herb + Potato + Vial</p>
              <p class="text-muted">+5% gathering XP for 30 minutes</p>
              <button class="btn btn-primary" ${userSkill.level < 25 ? 'disabled' : ''} 
                onclick="game.brewPotion(['herb', 'potato', 'vial'], 'gathering_xp_potion', 37.5, 8000)">
                Brew Gathering XP Potion
              </button>
            </div>
            <div class="card ${userSkill.level < 50 ? 'disabled-card' : ''}">
              <h3>Production XP Potion</h3>
              <p>Level 50 required</p>
              <p>75 XP per potion</p>
              <p>Requires: 2x Herb + Wheat + Vial</p>
              <p class="text-muted">+5% production XP for 30 minutes</p>
              <button class="btn btn-primary" ${userSkill.level < 50 ? 'disabled' : ''} 
                onclick="game.brewPotion(['herb', 'herb', 'wheat', 'vial'], 'production_xp_potion', 75, 12000)">
                Brew Production XP Potion
              </button>
            </div>
          </div>
        `;

      case 'enchanting':
        return `
          <div class="grid grid-3">
            <div class="card ${userSkill.level < 1 ? 'disabled-card' : ''}">
              <h3>XP Boost Gem</h3>
              <p>Level 1 required</p>
              <p>20 XP per gem</p>
              <p>Requires: Gold Ore</p>
              <p class="text-muted">+10% XP for 10 minutes</p>
              <button class="btn btn-primary" ${userSkill.level < 1 ? 'disabled' : ''} onclick="game.createEnchantment('gold_ore', 'xp_boost_gem', 20, 8000)">
                Create XP Boost
              </button>
            </div>
            <div class="card ${userSkill.level < 25 ? 'disabled-card' : ''}">
              <h3>Speed Boost Gem</h3>
              <p>Level 25 required</p>
              <p>50 XP per gem</p>
              <p>Requires: Mithril Ore</p>
              <p class="text-muted">+25% training speed for 5 minutes</p>
              <button class="btn btn-primary" ${userSkill.level < 25 ? 'disabled' : ''} 
                onclick="game.createEnchantment('mithril_ore', 'speed_boost_gem', 50, 12000)">
                Create Speed Boost
              </button>
            </div>
          </div>
        `;

      case 'attack':
      case 'strength':
      case 'defence':
        return `
          <div class="card mb-3">
            <div class="card-header">
              <h3>💖 Health Status</h3>
            </div>
            <div class="grid grid-2">
              <div>
                <div class="text-muted">Current HP</div>
                <div class="text-gold" style="font-size: 1.2rem;" id="combat-hp-display">${this.currentUser.currentHp}/${this.currentUser.maxHp}</div>
                <div class="xp-bar">
                  <div class="xp-progress" id="combat-hp-bar" style="width: ${(this.currentUser.currentHp / this.currentUser.maxHp) * 100}%; background: linear-gradient(90deg, #dc143c 0%, #ff6b6b 100%);"></div>
                </div>
              </div>
              <div>
                <button class="btn btn-success" onclick="game.eatFood()">🍖 Eat Food</button>
                <div class="text-muted" style="font-size: 0.75rem; margin-top: 4px;">
                  Food: ${(this.currentUser.inventory.cooked_shrimp || 0) + (this.currentUser.inventory.bread || 0) + (this.currentUser.inventory.cooked_trout || 0) + (this.currentUser.inventory.potato || 0) + (this.currentUser.inventory.carrot || 0) + (this.currentUser.inventory.cabbage || 0) + (this.currentUser.inventory.vegetable_stew || 0) + (this.currentUser.inventory.cabbage_soup || 0)}
                </div>
              </div>
            </div>
          </div>
          
          ${this.currentUser.currentTraining && this.currentUser.currentTraining.skill === 'combat' && this.currentUser.currentMonster ? `
          <div class="card mb-3" style="background: linear-gradient(135deg, rgba(139, 0, 0, 0.1) 0%, rgba(255, 215, 0, 0.1) 100%); border-color: var(--osrs-gold);">
            <div class="card-header">
              <h3>⚔️ Battle Arena</h3>
            </div>
            
            <!-- Battle Scene -->
            <div class="battle-arena">
              <!-- Player Side -->
              <div class="battle-entity player-side">
                <div class="entity-avatar">
                  <div class="player-avatar">🛡️</div>
                  <div class="entity-name">You</div>
                </div>
                <div class="entity-stats">
                  <div class="hp-bar-container">
                    <div class="hp-label">HP</div>
                    <div class="hp-bar">
                      <div class="hp-fill player-hp" id="battle-player-hp-bar" style="width: ${(this.currentUser.currentHp / this.currentUser.maxHp) * 100}%"></div>
                    </div>
                    <div class="hp-text" id="battle-player-hp-text">${this.currentUser.currentHp}/${this.currentUser.maxHp}</div>
                  </div>
                  <div class="attack-speed">
                    <span class="stat-icon">⚡</span>
                    <span>${this.getPlayerAttackSpeed() / 1000}s</span>
                  </div>
                </div>
              </div>
              
              <!-- VS Divider -->
              <div class="vs-divider">
                <div class="vs-text">VS</div>
                <div class="battle-timer">
                  <div class="timer-bar">
                    <div class="timer-fill" id="battle-action-timer" style="width: 0%"></div>
                  </div>
                  <div class="timer-text" id="battle-timer-text">0.0s / ${this.getPlayerAttackSpeed() / 1000}s</div>
                </div>
              </div>
              
              <!-- Monster Side -->
              <div class="battle-entity monster-side">
                <div class="entity-avatar">
                  <div class="monster-avatar">
                    <img src="./images/monsters/${this.currentUser.currentTraining.monster}.svg" alt="${this.gameData.monsters[this.currentUser.currentTraining.monster]?.name || 'Monster'}" style="width: 48px; height: 48px;">
                  </div>
                  <div class="entity-name">${this.gameData.monsters[this.currentUser.currentTraining.monster]?.name || 'Unknown'}</div>
                </div>
                <div class="entity-stats">
                  <div class="hp-bar-container">
                    <div class="hp-label">HP</div>
                    <div class="hp-bar">
                      <div class="hp-fill monster-hp" id="battle-monster-hp-bar" style="width: ${this.currentUser.currentMonster ? (this.currentUser.currentMonster.hp / this.currentUser.currentMonster.maxHp) * 100 : 0}%"></div>
                    </div>
                    <div class="hp-text" id="battle-monster-hp-text">${this.currentUser.currentMonster?.hp || 0}/${this.currentUser.currentMonster?.maxHp || 0}</div>
                  </div>
                  <div class="attack-speed">
                    <span class="stat-icon">⚡</span>
                    <span>${(this.gameData.monsters[this.currentUser.currentTraining.monster]?.attackSpeed || 0) / 1000}s</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          ` : ''}
          
          <div class="grid grid-3">
            <div class="card">
              <div style="text-align: center; margin-bottom: 1rem;">
                <img src="./images/monsters/goblin.svg" alt="Goblin" style="width: 64px; height: 64px;">
              </div>
              <h3>Fight Goblins</h3>
              <p>Level 1 required</p>
              <p>HP: 12 | Attack: 1 | Defence: 1</p>
              <p>Attack Speed: 4s | Drops: 5-15 coins</p>
              <p class="text-gold">4 XP per skill per kill</p>
              <button class="btn btn-primary" onclick="console.log('Fight Goblins clicked!'); game.startCombatTraining('goblin')">
                Fight Goblins
              </button>
            </div>
            <div class="card">
              <h3>🐄 Fight Cows</h3>
              <p>Level 1 required</p>
              <p>HP: 18 | Attack: 1 | Defence: 2</p>
              <p>Attack Speed: 5s | Drops: 8-20 coins</p>
              <p class="text-gold">6 XP per skill per kill</p>
              <button class="btn btn-primary" onclick="game.startCombatTraining('cow')">
                Fight Cows
              </button>
            </div>
            <div class="card">
              <h3>💀 Fight Skeletons</h3>
              <p>Level 10 required</p>
              <p>HP: 35 | Attack: 12 | Defence: 8</p>
              <p>Attack Speed: 3.5s | Drops: 15-35 coins</p>
              <p class="text-gold">12 XP per skill per kill</p>
              <button class="btn btn-primary" ${userSkill.level < 10 ? 'disabled' : ''} 
                onclick="game.startCombatTraining('skeleton')">
                Fight Skeletons
              </button>
            </div>
          </div>
        `;

      case 'ranged':
        return `
          <div class="grid grid-3">
            <div class="card">
              <h3>🎯 Target Practice</h3>
              <p>Level 1 required</p>
              <p>10 XP per session</p>
              <button class="btn btn-primary" onclick="game.trainSkill('ranged', null, 10, 4000)">
                Practice Archery
              </button>
            </div>
            <div class="card">
              <h3>🐗 Hunt Goblins</h3>
              <p>Level 5 required</p>
              <p>15 XP per hunt</p>
              <button class="btn btn-primary" ${userSkill.level < 5 ? 'disabled' : ''} 
                onclick="game.trainSkill('ranged', null, 15, 5000)">
                Hunt with Bow
              </button>
            </div>
            <div class="card">
              <h3>🏹 Advanced Training</h3>
              <p>Level 20 required</p>
              <p>35 XP per session</p>
              <button class="btn btn-primary" ${userSkill.level < 20 ? 'disabled' : ''} 
                onclick="game.trainSkill('ranged', null, 35, 6000)">
                Advanced Archery
              </button>
            </div>
          </div>
        `;

      case 'magic':
        return `
          <div class="grid grid-3">
            <div class="card">
              <h3>✨ Wind Strike</h3>
              <p>Level 1 required</p>
              <p>5.5 XP per cast</p>
              <button class="btn btn-primary" onclick="game.trainSkill('magic', null, 5.5, 3000)">
                Cast Wind Strike
              </button>
            </div>
            <div class="card">
              <h3>🔥 Fire Strike</h3>
              <p>Level 13 required</p>
              <p>11.5 XP per cast</p>
              <button class="btn btn-primary" ${userSkill.level < 13 ? 'disabled' : ''} 
                onclick="game.trainSkill('magic', null, 11.5, 4000)">
                Cast Fire Strike
              </button>
            </div>
            <div class="card">
              <h3>⚡ Lightning Bolt</h3>
              <p>Level 35 required</p>
              <p>42.5 XP per cast</p>
              <button class="btn btn-primary" ${userSkill.level < 35 ? 'disabled' : ''} 
                onclick="game.trainSkill('magic', null, 42.5, 5000)">
                Cast Lightning Bolt
              </button>
            </div>
          </div>
        `;
      
      default:
        return '<p>Training actions for this skill are under development!</p>';
    }
  }

  renderProfile() {
    const totalLevel = Object.values(this.currentUser.skills).reduce((sum, skill) => sum + skill.level, 0);
    
    return `
      <div class="grid grid-2">
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Player Information</h2>
          </div>
          <div class="form-group">
            <label class="form-label">Username</label>
            <div class="text-gold">${this.currentUser.username}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Total Level</label>
            <div class="text-gold">${totalLevel}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Combat Level</label>
            <div class="text-gold">${this.calculateCombatLevel()}</div>
          </div>
          <div class="form-group">
            <label class="form-label">Account Created</label>
            <div class="text-muted">${new Date(this.currentUser.created).toLocaleDateString()}</div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h2 class="card-title">Achievements</h2>
          </div>
          <div class="text-center text-muted" style="padding: 2rem;">
            Achievements system coming soon!
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3>🔧 Debug Tools</h3>
          </div>
          <p class="text-muted">Debug functions for testing</p>
          <button class="btn btn-secondary" onclick="game.giveStartingEquipment()" style="margin-top: 1rem;">
            ⚔️ Give Starting Equipment
          </button>
        </div>
        
        <div class="card" style="border-color: var(--osrs-red);">
          <div class="card-header">
            <h3 class="text-red">⚠️ Danger Zone</h3>
          </div>
          <p class="text-muted">This will permanently delete your account and all progress. This action cannot be undone!</p>
          <button class="btn btn-danger" onclick="game.resetAccount()" style="margin-top: 1rem;">
            🗑️ Reset Account
          </button>
        </div>
      </div>
    `;
  }


  renderShop() {
    return `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">🏪 General Store</h2>
          <div class="text-muted">Buy essential items with coins</div>
        </div>
        
        <!-- Equipment Section -->
        <div class="card" style="margin-bottom: 1rem;">
          <div class="card-header">
            <h3>⚔️ Equipment</h3>
          </div>
          <div class="grid grid-3">
            <div class="card">
              <h3>🗡️ Bronze Sword</h3>
              <p>Price: 50 coins</p>
              <p class="text-muted">+2 Attack, +1 Strength</p>
              <button class="btn btn-primary" onclick="game.buyItem('bronze_sword', 50)">
                Buy Bronze Sword
              </button>
            </div>
            <div class="card">
              <h3>⛑️ Bronze Helmet</h3>
              <p>Price: 30 coins</p>
              <p class="text-muted">+2 Defence</p>
              <button class="btn btn-primary" onclick="game.buyItem('bronze_helmet', 30)">
                Buy Bronze Helmet
              </button>
            </div>
            <div class="card">
              <h3>🛡️ Bronze Platebody</h3>
              <p>Price: 80 coins</p>
              <p class="text-muted">+5 Defence</p>
              <button class="btn btn-primary" onclick="game.buyItem('bronze_platebody', 80)">
                Buy Bronze Platebody
              </button>
            </div>
            <div class="card">
              <h3>💍 Gold Ring</h3>
              <p>Price: 100 coins</p>
              <p class="text-muted">+1 Defence</p>
              <button class="btn btn-primary" onclick="game.buyItem('gold_ring', 100)">
                Buy Gold Ring
              </button>
            </div>
            <div class="card">
              <h3>📿 Gold Necklace</h3>
              <p>Price: 200 coins</p>
              <p class="text-muted">+1 Attack, +1 Strength</p>
              <button class="btn btn-primary" onclick="game.buyItem('gold_necklace', 200)">
                Buy Gold Necklace
              </button>
            </div>
            <div class="card">
              <h3>🧥 Cape</h3>
              <p>Price: 50 coins</p>
              <p class="text-muted">+1 Defence</p>
              <button class="btn btn-primary" onclick="game.buyItem('cape', 50)">
                Buy Cape
              </button>
            </div>
          </div>
        </div>
        
        <!-- Seeds Section -->
        <div class="card">
          <div class="card-header">
            <h3>🌱 Seeds & Supplies</h3>
          </div>
          <div class="grid grid-3">
          <div class="card">
            <h3>🌰 Potato Seeds</h3>
            <p>Price: 5 coins each</p>
            <button class="btn btn-primary" onclick="game.buyItem('potato_seed', 5)">
              Buy Potato Seeds
            </button>
          </div>
          <div class="card">
            <h3>🌾 Wheat Seeds</h3>
            <p>Price: 15 coins each</p>
            <button class="btn btn-primary" onclick="game.buyItem('wheat_seed', 15)">
              Buy Wheat Seeds
            </button>
          </div>
          <div class="card">
            <h3>🌿 Herb Seeds</h3>
            <p>Price: 25 coins each</p>
            <button class="btn btn-primary" onclick="game.buyItem('herb_seed', 25)">
              Buy Herb Seeds
            </button>
          </div>
          <div class="card">
            <h3>🧪 Vials</h3>
            <p>Price: 2 coins each</p>
            <p class="text-muted">Essential for potions</p>
            <button class="btn btn-primary" onclick="game.buyItem('vial', 2)">
              Buy Vials
            </button>
          </div>
          <div class="card">
            <h3>🥕 Carrot Seeds</h3>
            <p>Price: 35 coins each</p>
            <p class="text-muted">Level 35 farming required</p>
            <button class="btn btn-primary" onclick="game.buyItem('carrot_seed', 35)">
              Buy Carrot Seeds
            </button>
          </div>
          <div class="card">
            <h3>🥬 Cabbage Seeds</h3>
            <p>Price: 50 coins each</p>
            <p class="text-muted">Level 50 farming required</p>
            <button class="btn btn-primary" onclick="game.buyItem('cabbage_seed', 50)">
              Buy Cabbage Seeds
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderMarket() {
    return `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">💰 Player Market</h2>
          <div class="text-muted">Trade items with other players</div>
        </div>
        
        <div class="text-center" style="padding: 2rem;">
          <h3>Market System</h3>
          <p class="text-muted">The player trading system will be available when multiplayer features are implemented.</p>
          <p>For now, you can sell items to the general store for half their value.</p>
          
          <div class="grid grid-2" style="margin-top: 2rem;">
            <button class="btn btn-secondary" onclick="game.navigateTo('shop')">
              Visit Shop Instead
            </button>
            <button class="btn btn-secondary" onclick="game.navigateTo('inventory')">
              Manage Inventory
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderQuests() {
    return `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">📜 Daily Quests</h2>
          <div class="text-muted">Complete quests for rewards - Reset daily!</div>
        </div>
        
        <div class="grid grid-2">
          <div class="card">
            <h3>🪓 Lumberjack's Request</h3>
            <p>Cut 25 logs of any type</p>
            <p><strong>Reward:</strong> 500 XP + 100 coins</p>
            <div class="text-muted">Progress: ${(this.currentUser.inventory.logs || 0) + (this.currentUser.inventory.oak_logs || 0)} / 25</div>
            <button class="btn btn-success" ${(this.currentUser.inventory.logs || 0) + (this.currentUser.inventory.oak_logs || 0) < 25 ? 'disabled' : ''}>
              Complete Quest
            </button>
          </div>
          
          <div class="card">
            <h3>⛏️ Miner's Challenge</h3>
            <p>Mine 20 ores of any type</p>
            <p><strong>Reward:</strong> 300 XP + 150 coins</p>
            <div class="text-muted">Progress: ${(this.currentUser.inventory.copper_ore || 0) + (this.currentUser.inventory.iron_ore || 0)} / 20</div>
            <button class="btn btn-success" ${(this.currentUser.inventory.copper_ore || 0) + (this.currentUser.inventory.iron_ore || 0) < 20 ? 'disabled' : ''}>
              Complete Quest
            </button>
          </div>
          
          <div class="card">
            <h3>🍳 Chef's Order</h3>
            <p>Cook 10 food items</p>
            <p><strong>Reward:</strong> 400 XP + 75 coins</p>
            <div class="text-muted">Progress: ${(this.currentUser.inventory.cooked_shrimp || 0) + (this.currentUser.inventory.bread || 0)} / 10</div>
            <button class="btn btn-success" ${(this.currentUser.inventory.cooked_shrimp || 0) + (this.currentUser.inventory.bread || 0) < 10 ? 'disabled' : ''}>
              Complete Quest
            </button>
          </div>
          
          <div class="card">
            <h3>⚔️ Warrior's Trial</h3>
            <p>Defeat 5 monsters</p>
            <p><strong>Reward:</strong> 750 XP + 200 coins</p>
            <div class="text-muted">Progress: 0 / 5</div>
            <button class="btn btn-success" disabled>
              Complete Quest
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderGuild() {
    return `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">🏛️ Guild System</h2>
          <div class="text-muted">Join a guild and play with others</div>
        </div>
        
        <div class="text-center" style="padding: 2rem;">
          <h3>Guild Features</h3>
          <p class="text-muted">Guild system will be available when multiplayer features are implemented.</p>
          
          <div style="margin: 2rem 0;">
            <h4>Planned Features:</h4>
            <ul style="text-align: left; max-width: 400px; margin: 0 auto;">
              <li>Create or join guilds</li>
              <li>Guild chat and messaging</li>
              <li>Guild competitions and events</li>
              <li>Shared guild achievements</li>
              <li>Guild halls and upgrades</li>
            </ul>
          </div>
          
          <button class="btn btn-secondary" onclick="game.navigateTo('leaderboard')">
            View Leaderboards Instead
          </button>
        </div>
      </div>
    `;
  }

  renderHouse() {
    return `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">🏠 Player House</h2>
          <div class="text-muted">Customize your personal space</div>
        </div>
        
        <div class="grid grid-2">
          <div class="card">
            <h3>🏠 House Status</h3>
            <p><strong>House Level:</strong> 1</p>
            <p><strong>Rooms:</strong> 3</p>
            <p><strong>Decorations:</strong> 0</p>
            <p><strong>Visitors Today:</strong> 0</p>
          </div>
          
          <div class="card">
            <h3>🔨 Upgrades Available</h3>
            <div style="margin-bottom: 1rem;">
              <div>Kitchen Upgrade</div>
              <div class="text-muted">Cost: 1000 coins + 50 logs</div>
              <button class="btn btn-primary" disabled>Upgrade</button>
            </div>
            <div style="margin-bottom: 1rem;">
              <div>Garden Plot</div>
              <div class="text-muted">Cost: 500 coins + 25 wheat</div>
              <button class="btn btn-primary" disabled>Build</button>
            </div>
          </div>
          
          <div class="card">
            <h3>🪑 Furniture</h3>
            <p class="text-muted">House customization coming soon!</p>
            <p>Craft furniture using your Woodcutting and Smithing skills.</p>
          </div>
          
          <div class="card">
            <h3>👥 Visitors</h3>
            <p class="text-muted">Invite friends to visit your house!</p>
            <p>Available with multiplayer features.</p>
          </div>
        </div>
      </div>
    `;
  }

  renderLeaderboard() {
    return `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">🏆 Leaderboards</h2>
          <div class="text-muted">Top players in various categories</div>
        </div>
        
        <div class="grid grid-2">
          <div class="card">
            <h3>📊 Overall Rankings</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid #37474f;">
                  <th style="padding: 8px; text-align: left;">Rank</th>
                  <th style="padding: 8px; text-align: left;">Player</th>
                  <th style="padding: 8px; text-align: left;">Total Level</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 8px;">1</td>
                  <td style="padding: 8px; color: var(--osrs-gold);">${this.currentUser.username}</td>
                  <td style="padding: 8px;">${Object.values(this.currentUser.skills).reduce((sum, skill) => sum + skill.level, 0)}</td>
                </tr>
                <tr>
                  <td style="padding: 8px;" class="text-muted" colspan="3">More players will appear when multiplayer is available</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="card">
            <h3>⚔️ Combat Rankings</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <thead>
                <tr style="border-bottom: 1px solid #37474f;">
                  <th style="padding: 8px; text-align: left;">Rank</th>
                  <th style="padding: 8px; text-align: left;">Player</th>
                  <th style="padding: 8px; text-align: left;">Combat Level</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style="padding: 8px;">1</td>
                  <td style="padding: 8px; color: var(--osrs-gold);">${this.currentUser.username}</td>
                  <td style="padding: 8px;">${this.calculateCombatLevel()}</td>
                </tr>
                <tr>
                  <td style="padding: 8px;" class="text-muted" colspan="3">More players will appear when multiplayer is available</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <div class="card">
            <h3>🪓 Woodcutting Rankings</h3>
            <p><strong>Your Level:</strong> ${this.currentUser.skills.woodcutting.level}</p>
            <p><strong>Your XP:</strong> ${this.formatNumber(this.currentUser.skills.woodcutting.xp)}</p>
            <p class="text-muted">Compete with other players when multiplayer is available!</p>
          </div>
          
          <div class="card">
            <h3>⛏️ Mining Rankings</h3>
            <p><strong>Your Level:</strong> ${this.currentUser.skills.mining.level}</p>
            <p><strong>Your XP:</strong> ${this.formatNumber(this.currentUser.skills.mining.xp)}</p>
            <p class="text-muted">Compete with other players when multiplayer is available!</p>
          </div>
        </div>
      </div>
    `;
  }

  renderChangelog() {
    return `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">📋 Game Updates</h2>
          <div class="text-muted">Latest changes and improvements</div>
        </div>
        
        <div class="card">
          <h3>🚀 Version 1.0.0 - Launch Update</h3>
          <div class="text-muted" style="margin-bottom: 1rem;">September 21, 2025</div>
          
          <h4>✨ New Features:</h4>
          <ul>
            <li>Complete skill system with 13+ skills</li>
            <li>OSRS-style XP system and leveling</li>
            <li>Comprehensive item system with 40+ items</li>
            <li>Skill interconnections and resource chains</li>
            <li>Player authentication and profiles</li>
            <li>Inventory management system</li>
            <li>Daily quest system</li>
            <li>Combat training against monsters</li>
            <li>Shop system for buying essential items</li>
            <li>Player housing framework</li>
            <li>Leaderboard system</li>
          </ul>
          
          <h4>🛠️ Technical:</h4>
          <ul>
            <li>Single-page application architecture</li>
            <li>Local storage for offline play</li>
            <li>Responsive design for all devices</li>
            <li>OSRS-inspired visual theme</li>
          </ul>
        </div>
        
        <div class="card">
          <h3>🔮 Upcoming Features</h3>
          <div class="text-muted" style="margin-bottom: 1rem;">Coming Soon</div>
          
          <h4>🎯 Next Update:</h4>
          <ul>
            <li>Advanced combat system with equipment</li>
            <li>Player vs Player combat</li>
            <li>Guild system and multiplayer features</li>
            <li>Market trading between players</li>
            <li>Achievement system</li>
            <li>Idle/offline progression</li>
            <li>House customization and furniture</li>
            <li>More skills and content</li>
          </ul>
        </div>
      </div>
    `;
  }

  // Game Logic Methods
  trainSkill(skillId, itemReward, xpGain, actionTime, activityName, seedRequired = null) {
    // For farming, check if player has seeds
    if (seedRequired && (!this.currentUser.inventory[seedRequired] || this.currentUser.inventory[seedRequired] < 1)) {
      this.showNotification(`You need ${seedRequired} to start this training!`);
      return;
    }
    
    // Stop any current training
    if (this.currentUser.currentTraining) {
      this.stopTraining();
    }
    
    // Start new 8-hour training session
    const startTime = Date.now();
    this.currentUser.currentTraining = {
      skill: skillId,
      activity: activityName,
      itemReward: itemReward,
      seedRequired: seedRequired, // For farming
      xpRate: xpGain,
      actionTime: actionTime, // Time per action in milliseconds
      startTime: startTime,
      duration: 8 * 60 * 60 * 1000, // 8 hours
      lastAction: startTime // Start at exact same time so timer starts at 0
    };
    
    this.showNotification(`Started training ${this.gameData.skills[skillId].name} for 8 hours!`);
    this.saveUserData();
    this.render();
  }

  stopTraining() {
    if (!this.currentUser.currentTraining) return;
    
    delete this.currentUser.currentTraining;
    this.showNotification('Training stopped.');
    this.saveUserData();
    this.render();
  }

  processTrainingProgress() {
    if (!this.currentUser.currentTraining) return;
    
    const training = this.currentUser.currentTraining;
    const now = Date.now();
    
    // Check if training duration is complete
    if (now >= training.startTime + training.duration) {
      this.showNotification(`8-hour ${training.skill === 'combat' ? 'Combat' : this.gameData.skills[training.skill].name} training completed!`);
      delete this.currentUser.currentTraining;
      this.saveUserData();
      this.render();
      return;
    }
    
    // Calculate how many complete actions should have happened since training started
    const totalActionsSinceStart = Math.floor((now - training.startTime) / training.actionTime);
    const actionsCompleted = Math.floor((training.lastAction - training.startTime) / training.actionTime);
    const newActionsToProcess = totalActionsSinceStart - actionsCompleted;
    
    if (newActionsToProcess > 0) {
      // Process each action individually
      let actualActionsProcessed = 0;
      
      for (let i = 0; i < newActionsToProcess; i++) {
        // For farming, check if we have a seed for this action
        if (training.seedRequired) {
          if (!this.currentUser.inventory[training.seedRequired] || this.currentUser.inventory[training.seedRequired] < 1) {
            this.showNotification(`Out of ${training.seedRequired}! Training stopped.`);
            delete this.currentUser.currentTraining;
            this.saveUserData();
            this.render();
            return;
          }
          
          // Use one seed for this action
          this.currentUser.inventory[training.seedRequired]--;
          if (this.currentUser.inventory[training.seedRequired] === 0) {
            delete this.currentUser.inventory[training.seedRequired];
          }
        }
        
        // Add XP for this action
        this.currentUser.skills[training.skill].xp += training.xpRate;
        
        // Add items for this action
        if (training.itemReward) {
          // Default: 1 item per action (efficiency bonuses will be added later with gear)
          const itemsThisAction = 1;
          this.currentUser.inventory[training.itemReward] = (this.currentUser.inventory[training.itemReward] || 0) + itemsThisAction;
        }
        
        actualActionsProcessed++;
      }
      
      // Check for level up after all actions
      const newLevel = this.calculateLevel(this.currentUser.skills[training.skill].xp);
      if (newLevel > this.currentUser.skills[training.skill].level) {
        this.currentUser.skills[training.skill].level = newLevel;
        this.showNotification(`${training.skill === 'combat' ? 'Combat' : this.gameData.skills[training.skill].name} level up! You are now level ${newLevel}.`);
      }
      
      // Update last action time
      training.lastAction = training.startTime + totalActionsSinceStart * training.actionTime;
      this.saveUserData();
    }
  }

  cookFood(ingredients, result, xpGain, duration) {
    // Handle single ingredient (string) or multiple ingredients (array)
    const ingredientList = Array.isArray(ingredients) ? ingredients : [ingredients];
    
    // Check if player has all required ingredients
    for (const ingredient of ingredientList) {
      if (!this.currentUser.inventory[ingredient] || this.currentUser.inventory[ingredient] < 1) {
        this.showNotification(`You need ${ingredient} to cook this!`);
        return;
      }
    }

    const button = event.target;
    button.disabled = true;
    button.textContent = 'Cooking...';
    
    setTimeout(() => {
      // Remove all ingredients
      for (const ingredient of ingredientList) {
        this.currentUser.inventory[ingredient]--;
        if (this.currentUser.inventory[ingredient] === 0) {
          delete this.currentUser.inventory[ingredient];
        }
      }
      
      // Add XP
      this.currentUser.skills.cooking.xp += xpGain;
      
      // Check for level up
      const newLevel = this.calculateLevel(this.currentUser.skills.cooking.xp);
      if (newLevel > this.currentUser.skills.cooking.level) {
        this.currentUser.skills.cooking.level = newLevel;
        this.showNotification(`Cooking level up! You are now level ${newLevel}.`);
      }
      
      // Add cooked item
      this.currentUser.inventory[result] = (this.currentUser.inventory[result] || 0) + 1;
      
      this.saveUserData();
      this.render();
      
      button.disabled = false;
      button.textContent = button.textContent.replace('Cooking...', 'Cook');
    }, duration);
  }

  smeltBar(ingredients, result, xpGain, duration) {
    // Check if player has all required ingredients
    for (const ingredient of ingredients) {
      if (!this.currentUser.inventory[ingredient] || this.currentUser.inventory[ingredient] < 1) {
        this.showNotification(`You need ${ingredient} to smelt this!`);
        return;
      }
    }

    const button = event.target;
    button.disabled = true;
    button.textContent = 'Smelting...';
    
    setTimeout(() => {
      // Remove ingredients
      for (const ingredient of ingredients) {
        this.currentUser.inventory[ingredient]--;
        if (this.currentUser.inventory[ingredient] === 0) {
          delete this.currentUser.inventory[ingredient];
        }
      }
      
      // Add XP
      this.currentUser.skills.smelting.xp += xpGain;
      
      // Check for level up
      const newLevel = this.calculateLevel(this.currentUser.skills.smelting.xp);
      if (newLevel > this.currentUser.skills.smelting.level) {
        this.currentUser.skills.smelting.level = newLevel;
        this.showNotification(`Smelting level up! You are now level ${newLevel}.`);
      }
      
      // Add smelted bar
      this.currentUser.inventory[result] = (this.currentUser.inventory[result] || 0) + 1;
      
      this.saveUserData();
      this.render();
      
      button.disabled = false;
      button.textContent = button.textContent.replace('Smelting...', 'Smelt');
    }, duration);
  }

  smithItem(ingredient, result, xpGain, duration) {
    if (!this.currentUser.inventory[ingredient] || this.currentUser.inventory[ingredient] < 1) {
      this.showNotification(`You need ${ingredient} to smith this!`);
      return;
    }

    const button = event.target;
    button.disabled = true;
    button.textContent = 'Smithing...';
    
    setTimeout(() => {
      // Remove ingredient
      this.currentUser.inventory[ingredient]--;
      if (this.currentUser.inventory[ingredient] === 0) {
        delete this.currentUser.inventory[ingredient];
      }
      
      // Add XP
      this.currentUser.skills.smithing.xp += xpGain;
      
      // Check for level up
      const newLevel = this.calculateLevel(this.currentUser.skills.smithing.xp);
      if (newLevel > this.currentUser.skills.smithing.level) {
        this.currentUser.skills.smithing.level = newLevel;
        this.showNotification(`Smithing level up! You are now level ${newLevel}.`);
      }
      
      // Add smithed item
      this.currentUser.inventory[result] = (this.currentUser.inventory[result] || 0) + 1;
      
      this.saveUserData();
      this.render();
      
      button.disabled = false;
      button.textContent = button.textContent.replace('Smithing...', 'Smith');
    }, duration);
  }


  brewPotion(ingredients, result, xpGain, duration) {
    // Check if player has all required ingredients
    for (const ingredient of ingredients) {
      if (!this.currentUser.inventory[ingredient] || this.currentUser.inventory[ingredient] < 1) {
        this.showNotification(`You need ${ingredient} to brew this potion!`);
        return;
      }
    }

    const button = event.target;
    button.disabled = true;
    button.textContent = 'Brewing...';
    
    setTimeout(() => {
      // Remove ingredients
      for (const ingredient of ingredients) {
        this.currentUser.inventory[ingredient]--;
        if (this.currentUser.inventory[ingredient] === 0) {
          delete this.currentUser.inventory[ingredient];
        }
      }
      
      // Add XP
      this.currentUser.skills.alchemy.xp += xpGain;
      
      // Check for level up
      const newLevel = this.calculateLevel(this.currentUser.skills.alchemy.xp);
      if (newLevel > this.currentUser.skills.alchemy.level) {
        this.currentUser.skills.alchemy.level = newLevel;
        this.showNotification(`Alchemy level up! You are now level ${newLevel}.`);
      }
      
      // Add potion
      this.currentUser.inventory[result] = (this.currentUser.inventory[result] || 0) + 1;
      
      this.saveUserData();
      this.render();
      
      button.disabled = false;
      button.textContent = button.textContent.replace('Brewing...', 'Brew');
    }, duration);
  }

  createEnchantment(ingredient, result, xpGain, duration) {
    if (!this.currentUser.inventory[ingredient] || this.currentUser.inventory[ingredient] < 1) {
      this.showNotification(`You need ${ingredient} to create this enchantment!`);
      return;
    }

    const button = event.target;
    button.disabled = true;
    button.textContent = 'Enchanting...';
    
    setTimeout(() => {
      // Remove ingredient
      this.currentUser.inventory[ingredient]--;
      if (this.currentUser.inventory[ingredient] === 0) {
        delete this.currentUser.inventory[ingredient];
      }
      
      // Add XP
      this.currentUser.skills.enchanting.xp += xpGain;
      
      // Check for level up
      const newLevel = this.calculateLevel(this.currentUser.skills.enchanting.xp);
      if (newLevel > this.currentUser.skills.enchanting.level) {
        this.currentUser.skills.enchanting.level = newLevel;
        this.showNotification(`Enchanting level up! You are now level ${newLevel}.`);
      }
      
      // Add enchanted item
      this.currentUser.inventory[result] = (this.currentUser.inventory[result] || 0) + 1;
      
      this.saveUserData();
      this.render();
      
      button.disabled = false;
      button.textContent = button.textContent.replace('Enchanting...', 'Create');
    }, duration);
  }

  // Combat System
  startCombatTraining(monsterId) {
    console.log('Starting combat training with monster:', monsterId);
    
    // Stop any current training
    if (this.currentUser.currentTraining) {
      this.stopTraining();
    }
    
    console.log('Looking for monster:', monsterId);
    console.log('Available monsters:', Object.keys(this.gameData.monsters));
    console.log('Monster data:', this.gameData.monsters[monsterId]);
    
    const monster = this.gameData.monsters[monsterId];
    if (!monster) {
      console.error('Monster not found:', monsterId, 'Available:', Object.keys(this.gameData.monsters));
      return;
    }
    
    // Check if player has enough HP to fight
    console.log('Current HP check:', this.currentUser.currentHp);
    if (this.currentUser.currentHp <= 0) {
      console.log('HP too low, stopping combat');
      this.showNotification('💀 You need to heal before fighting!');
      return;
    }
    
    // Start combat session
    const startTime = Date.now();
    this.currentUser.currentTraining = {
      skill: 'combat',
      activity: `Fighting ${monster.name}`,
      monster: monsterId,
      actionTime: this.getPlayerAttackSpeed(), // Player's attack speed
      startTime: startTime,
      duration: 8 * 60 * 60 * 1000, // 8 hours
      lastAction: startTime // Start at exact same time so timer starts at 0
    };
    
    // Initialize current monster instance
    this.currentUser.currentMonster = {
      id: monsterId,
      hp: monster.maxHp,
      maxHp: monster.maxHp,
      lastAttack: startTime
    };
    
    console.log('Combat training started successfully:', {
      monster: monster.name,
      playerHP: this.currentUser.currentHp,
      monsterHP: this.currentUser.currentMonster.hp,
      monsterMaxHP: this.currentUser.currentMonster.maxHp,
      monsterAttackSpeed: monster.attackSpeed
    });
    
    this.showNotification(`Started fighting ${monster.name}s!`);
    this.saveUserData();
    this.render();
  }

  processCombatTraining() {
    if (!this.currentUser.currentTraining || this.currentUser.currentTraining.skill !== 'combat') return;
    
    console.log('Processing combat training...');
    
    const training = this.currentUser.currentTraining;
    const monster = this.gameData.monsters[training.monster];
    const now = Date.now();
    const timeSinceStart = now - training.startTime;
    
    console.log('Combat processing data:', {
      monster: monster?.name,
      timeSinceStart: timeSinceStart,
      actionTime: training.actionTime
    });
    
    // Check if training session has ended
    if (timeSinceStart >= training.duration) {
      this.showNotification('Combat training session completed!');
      delete this.currentUser.currentTraining;
      delete this.currentUser.currentMonster;
      this.saveUserData();
      this.render();
      return;
    }
    
    // Check if player is alive
    if (this.currentUser.currentHp <= 0) {
      this.showNotification('💀 You died! Training stopped. Eat food to heal.');
      delete this.currentUser.currentTraining;
      delete this.currentUser.currentMonster;
      this.saveUserData();
      this.render();
      return;
    }
    
    // Process player attacks
    const totalPlayerAttacksSinceStart = Math.floor(timeSinceStart / training.actionTime);
    const playerAttacksCompleted = Math.floor((training.lastAction - training.startTime) / training.actionTime);
    const newPlayerAttacks = totalPlayerAttacksSinceStart - playerAttacksCompleted;
    
    console.log('Player attack calculation:', {
      timeSinceStart: timeSinceStart,
      actionTime: training.actionTime,
      totalPlayerAttacksSinceStart: totalPlayerAttacksSinceStart,
      lastAction: training.lastAction,
      startTime: training.startTime,
      playerAttacksCompleted: playerAttacksCompleted,
      newPlayerAttacks: newPlayerAttacks
    });
    
    // Process monster attacks
    const monsterAttackSpeed = monster.attackSpeed;
    const totalMonsterAttacksSinceStart = Math.floor(timeSinceStart / monsterAttackSpeed);
    
    // Initialize monster if it doesn't exist
    if (!this.currentUser.currentMonster) {
      this.currentUser.currentMonster = {
        id: training.monster,
        hp: monster.maxHp,
        maxHp: monster.maxHp,
        lastAttack: training.startTime
      };
    }
    
    const monsterAttacksCompleted = Math.floor((this.currentUser.currentMonster.lastAttack - training.startTime) / monsterAttackSpeed);
    const newMonsterAttacks = totalMonsterAttacksSinceStart - monsterAttacksCompleted;
    
    console.log('Attack processing:', {
      newPlayerAttacks: newPlayerAttacks,
      newMonsterAttacks: newMonsterAttacks,
      maxAttacks: Math.max(newPlayerAttacks, newMonsterAttacks)
    });
    
    // Process all new attacks
    for (let i = 0; i < Math.max(newPlayerAttacks, newMonsterAttacks); i++) {
      // Player attack
      if (i < newPlayerAttacks) {
        const damage = this.calculatePlayerDamage(monster);
        console.log(`Player attacks for ${damage} damage. Monster HP: ${this.currentUser.currentMonster.hp} -> ${this.currentUser.currentMonster.hp - damage}`);
        this.currentUser.currentMonster.hp -= damage;
        
        if (this.currentUser.currentMonster.hp <= 0) {
          // Monster defeated!
          console.log('Monster defeated!');
          this.onMonsterDefeated(monster);
          // Spawn new monster
          this.currentUser.currentMonster = {
            id: training.monster,
            hp: monster.maxHp,
            maxHp: monster.maxHp,
            lastAttack: this.currentUser.currentMonster.lastAttack
          };
        }
      }
      
      // Monster attack
      if (i < newMonsterAttacks && this.currentUser.currentMonster.hp > 0) {
        const damage = this.calculateMonsterDamage(monster);
        console.log(`Monster attacks for ${damage} damage. Player HP: ${this.currentUser.currentHp} -> ${this.currentUser.currentHp - damage}`);
        this.currentUser.currentHp = Math.max(0, this.currentUser.currentHp - damage);
        
        if (this.currentUser.currentHp <= 0) {
          this.showNotification('💀 You died! Training stopped. Eat food to heal.');
          delete this.currentUser.currentTraining;
          delete this.currentUser.currentMonster;
          this.saveUserData();
          this.render();
          return;
        }
      }
    }
    
    // Update last action times
    if (newPlayerAttacks > 0) {
      training.lastAction = training.startTime + totalPlayerAttacksSinceStart * training.actionTime;
    }
    if (newMonsterAttacks > 0) {
      this.currentUser.currentMonster.lastAttack = training.startTime + totalMonsterAttacksSinceStart * monsterAttackSpeed;
    }
    
    this.saveUserData();
  }

  // Combat helper methods
  getPlayerAttackSpeed() {
    // Default attack speed is 4 seconds, can be modified by weapons later
    return 4000; // 4 seconds
  }

  calculatePlayerDamage(monster) {
    const totalStats = this.calculateTotalStats();
    const playerAttack = totalStats.attack;
    const playerStrength = totalStats.strength;
    const monsterDefence = monster.defence;
    
    console.log('Player damage calculation:', {
      playerAttack: playerAttack,
      playerStrength: playerStrength,
      monsterDefence: monsterDefence
    });
    
    // Accuracy check
    const accuracy = this.calculateAccuracy(playerAttack, monsterDefence);
    console.log('Accuracy check:', { accuracy: accuracy, randomRoll: Math.random() });
    
    if (Math.random() > accuracy) {
      console.log('Player attack missed!');
      this.triggerCombatAnimation('player-miss');
      return 0; // Miss
    }
    
    // Calculate damage (1 to max hit)
    const maxHit = Math.floor(playerStrength / 4) + 1;
    const damage = Math.floor(Math.random() * maxHit) + 1;
    console.log('Player damage calculated:', { maxHit: maxHit, damage: damage });
    
    // Trigger combat animations
    this.triggerCombatAnimation('player-attack');
    this.showDamageNumber(damage, 'monster');
    
    return damage;
  }

  calculateMonsterDamage(monster) {
    const monsterAttack = monster.attack;
    const monsterStrength = monster.strength;
    const playerDefence = this.currentUser.skills.defence.level;
    
    // Accuracy check
    const accuracy = this.calculateAccuracy(monsterAttack, playerDefence);
    if (Math.random() > accuracy) {
      this.triggerCombatAnimation('monster-miss');
      return 0; // Miss
    }
    
    // Calculate damage (1 to max hit)
    const maxHit = Math.floor(monsterStrength / 4) + 1;
    const damage = Math.floor(Math.random() * maxHit) + 1;
    
    // Trigger combat animations
    this.triggerCombatAnimation('monster-attack');
    this.showDamageNumber(damage, 'player');
    
    return damage;
  }

  calculateAccuracy(attackLevel, defenceLevel) {
    // Simple accuracy formula: higher attack vs defence
    const attackRoll = attackLevel + Math.floor(Math.random() * 20);
    const defenceRoll = defenceLevel + Math.floor(Math.random() * 20);
    return attackRoll > defenceRoll ? 0.8 : 0.4; // 80% or 40% accuracy
  }

  onMonsterDefeated(monster) {
    // Give XP
    this.currentUser.skills.attack.xp += monster.xp.attack;
    this.currentUser.skills.strength.xp += monster.xp.strength;
    this.currentUser.skills.defence.xp += monster.xp.defence;
    this.currentUser.skills.hitpoints.xp += monster.xp.hitpoints;
    
    // Give loot
    const coinReward = Math.floor(Math.random() * (monster.loot.coins.max - monster.loot.coins.min + 1)) + monster.loot.coins.min;
    this.currentUser.inventory.coins = (this.currentUser.inventory.coins || 0) + coinReward;
    
    // Check for level ups
    ['attack', 'strength', 'defence', 'hitpoints'].forEach(skill => {
      const newLevel = this.calculateLevel(this.currentUser.skills[skill].xp);
      if (newLevel > this.currentUser.skills[skill].level) {
        this.currentUser.skills[skill].level = newLevel;
        
        // Update max HP when hitpoints levels up
        if (skill === 'hitpoints') {
          this.currentUser.maxHp = newLevel;
        }
        
        this.showNotification(`${this.gameData.skills[skill].name} level up! You are now level ${newLevel}.`);
      }
    });
  }

  eatFood() {
    // Find best food in inventory (ordered by healing amount)
    const foods = [
      { id: 'cabbage_soup', heals: 12 },
      { id: 'vegetable_stew', heals: 8 },
      { id: 'cooked_trout', heals: 7 },
      { id: 'bread', heals: 5 },
      { id: 'cabbage', heals: 3 },
      { id: 'cooked_shrimp', heals: 3 },
      { id: 'carrot', heals: 2 },
      { id: 'potato', heals: 1 }
    ];
    
    for (const food of foods) {
      if (this.currentUser.inventory[food.id] && this.currentUser.inventory[food.id] > 0) {
        // Eat the food
        this.currentUser.inventory[food.id]--;
        if (this.currentUser.inventory[food.id] === 0) {
          delete this.currentUser.inventory[food.id];
        }
        
        // Heal HP
        this.currentUser.currentHp = Math.min(this.currentUser.maxHp, this.currentUser.currentHp + food.heals);
        
        this.showNotification(`Ate ${this.gameData.items[food.id].name}! Healed ${food.heals} HP.`);
        this.saveUserData();
        this.render();
        return;
      }
    }
    
    this.showNotification('No food available! Cook some fish or buy bread from the shop.');
  }

  // Shop System
  buyItem(itemId, price) {
    console.log('Buying item:', itemId, 'Price:', price, 'Current coins:', this.currentUser.inventory.coins);
    
    if (this.currentUser.inventory.coins < price) {
      this.showNotification(`Not enough coins! Need ${price}, have ${this.currentUser.inventory.coins}`);
      return;
    }
    
    this.currentUser.inventory.coins -= price;
    this.currentUser.inventory[itemId] = (this.currentUser.inventory[itemId] || 0) + 1;
    
    const itemName = this.gameData.items[itemId].name;
    this.showNotification(`Bought ${itemName} for ${price} coins!`);
    
    this.saveUserData();
    this.render();
  }

  // Give starting equipment to existing users who don't have any
  giveStartingEquipment() {
    const hasEquipment = this.currentUser.inventory.bronze_sword || 
                        this.currentUser.inventory.bronze_helmet || 
                        this.currentUser.inventory.bronze_platebody;
    
    if (!hasEquipment) {
      console.log('Giving starting equipment to user');
      this.currentUser.inventory.bronze_sword = 1;
      this.currentUser.inventory.bronze_helmet = 1;
      this.currentUser.inventory.bronze_platebody = 1;
      this.currentUser.inventory.gold_necklace = 1;
      this.currentUser.inventory.gold_ring = 1;
      this.currentUser.inventory.cape = 1;
      this.saveUserData();
      this.showNotification('Starting equipment added to your inventory!');
    }
  }

  // Inventory interaction methods
  selectInventoryItem(itemId) {
    const itemData = this.gameData.items[itemId];
    const quantity = this.currentUser.inventory[itemId] || 0;
    
    if (!itemData || quantity === 0) return;
    
    // Highlight selected item
    document.querySelectorAll('.inventory-item-card').forEach(card => {
      card.classList.remove('selected');
    });
    document.querySelector(`[data-item-id="${itemId}"]`).classList.add('selected');
    
    // Show and populate detail panel
    const detailPanel = document.getElementById('inventory-detail-panel');
    const detailTitle = document.getElementById('item-detail-title');
    const detailContent = document.getElementById('item-detail-content');
    
    detailTitle.innerHTML = `${this.getItemIcon(itemId)} ${itemData.name}`;
    
    detailContent.innerHTML = `
      <div class="item-detail-info">
        <div class="grid grid-2" style="margin-bottom: 1rem;">
          <div>
            <div class="text-muted">Quantity</div>
            <div class="text-gold">${this.formatNumber(quantity)}</div>
          </div>
          <div>
            <div class="text-muted">Unit Value</div>
            <div class="text-gold">${this.formatCoins(itemData.value)}</div>
          </div>
          <div>
            <div class="text-muted">Total Value</div>
            <div class="text-gold">${this.formatCoins(itemData.value * quantity)}</div>
          </div>
          <div>
            <div class="text-muted">Category</div>
            <div class="text-primary">${itemData.category.charAt(0).toUpperCase() + itemData.category.slice(1)}</div>
          </div>
        </div>
        
        ${itemData.heals ? `
        <div style="margin-bottom: 1rem;">
          <div class="text-muted">Heals</div>
          <div class="text-success">${itemData.heals} HP</div>
        </div>
        ` : ''}
        
        ${itemData.effect ? `
        <div style="margin-bottom: 1rem;">
          <div class="text-muted">Effect</div>
          <div class="text-primary">${itemData.effect.replace('_', ' ').toUpperCase()}</div>
        </div>
        ` : ''}
        
        <!-- Action Buttons -->
        <div class="item-actions" style="margin-top: 1.5rem;">
          ${itemData.category === 'food' ? 
            `<button class="btn btn-success" onclick="game.useItem('${itemId}')">🍴 Eat</button>` : 
            itemData.category === 'potion' ? 
            `<button class="btn btn-primary" onclick="game.useItem('${itemId}')">🧪 Drink</button>` :
            ''
          }
          
          <!-- Selling Controls -->
          <div class="selling-controls" style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid var(--border-color);">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
              <label class="text-muted" style="min-width: 60px;">Quantity:</label>
              <input type="number" min="1" max="${quantity}" value="1" 
                id="detail-quantity-${itemId}" 
                class="quantity-input" style="width: 80px;">
              <button class="btn btn-secondary" onclick="game.sellItems('${itemId}', document.getElementById('detail-quantity-${itemId}').value)">
                💰 Sell
              </button>
            </div>
            <div class="quick-sell-buttons" style="display: flex; gap: 4px;">
              <button class="btn btn-secondary btn-small" onclick="game.sellItems('${itemId}', ${quantity})">
                Sell All
              </button>
              <button class="btn btn-secondary btn-small" onclick="game.sellItems('${itemId}', ${Math.max(1, quantity - 1)})">
                Sell All-1
              </button>
              <button class="btn btn-secondary btn-small" onclick="document.getElementById('detail-quantity-${itemId}').value = ${Math.floor(quantity / 2)}">
                Half
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    detailPanel.style.display = 'block';
  }
  
  closeInventoryDetail() {
    document.getElementById('inventory-detail-panel').style.display = 'none';
    document.querySelectorAll('.inventory-item-card').forEach(card => {
      card.classList.remove('selected');
    });
  }

  sellItem(itemId) {
    this.sellItems(itemId, 1);
  }

  sellItems(itemId, quantity) {
    quantity = parseInt(quantity);
    
    if (!this.currentUser.inventory[itemId] || this.currentUser.inventory[itemId] < quantity) {
      this.showNotification(`You don't have enough ${this.gameData.items[itemId].name}!`);
      return;
    }
    
    if (quantity < 1) {
      this.showNotification('Invalid quantity!');
      return;
    }
    
    const itemData = this.gameData.items[itemId];
    const sellPriceEach = Math.floor(itemData.value / 2);
    const totalSellPrice = sellPriceEach * quantity;
    
    // Debug logging
    console.log(`Selling ${quantity}x ${itemData.name} for ${totalSellPrice} coins`);
    console.log(`Coins before: ${this.currentUser.inventory.coins}`);
    
    // Remove items
    this.currentUser.inventory[itemId] -= quantity;
    if (this.currentUser.inventory[itemId] === 0) {
      delete this.currentUser.inventory[itemId];
    }
    
    // Add coins - ensure coins property exists
    this.currentUser.inventory.coins = (this.currentUser.inventory.coins || 0) + totalSellPrice;
    
    console.log(`Coins after: ${this.currentUser.inventory.coins}`);
    
    this.showNotification(`Sold ${quantity}x ${itemData.name} for ${totalSellPrice} coins!`);
    this.saveUserData();
    
    // Update just the main content to preserve scroll
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.innerHTML = this.renderMainContent();
      
      // If inventory detail panel was open for this item, refresh it
      const detailPanel = document.getElementById('inventory-detail-panel');
      if (detailPanel && detailPanel.style.display !== 'none') {
        const selectedCard = document.querySelector('.inventory-item-card.selected');
        if (selectedCard) {
          const currentItemId = selectedCard.getAttribute('data-item-id');
          if (currentItemId === itemId) {
            // Check if item still exists in inventory
            if (this.currentUser.inventory[itemId]) {
              // Refresh the detail panel
              this.selectInventoryItem(itemId);
            } else {
              // Item was completely sold, close detail panel
              this.closeInventoryDetail();
            }
          }
        }
      }
    }
  }

  useItem(itemId) {
    if (!this.currentUser.inventory[itemId] || this.currentUser.inventory[itemId] < 1) {
      this.showNotification('You don\'t have this item!');
      return;
    }
    
    const itemData = this.gameData.items[itemId];
    
    if (itemData.category === 'food') {
      // Eat food to heal
      this.currentUser.inventory[itemId]--;
      if (this.currentUser.inventory[itemId] === 0) {
        delete this.currentUser.inventory[itemId];
      }
      
      this.currentUser.currentHp = Math.min(this.currentUser.maxHp, this.currentUser.currentHp + itemData.heals);
      this.showNotification(`Ate ${itemData.name}! Healed ${itemData.heals} HP.`);
      
    } else if (itemData.category === 'potion') {
      // Drink potion for effects
      this.currentUser.inventory[itemId]--;
      if (this.currentUser.inventory[itemId] === 0) {
        delete this.currentUser.inventory[itemId];
      }
      
      // Apply potion effect (30 minutes)
      const effectDuration = 30 * 60 * 1000; // 30 minutes
      this.currentUser.activeEffects = this.currentUser.activeEffects || {};
      this.currentUser.activeEffects[itemData.effect] = Date.now() + effectDuration;
      
      this.showNotification(`Drank ${itemData.name}! Effect active for 30 minutes.`);
    }
    
    this.saveUserData();
    
    // Update just the main content to preserve scroll
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.innerHTML = this.renderMainContent();
    }
  }

  calculateLevel(xp) {
    // OSRS-style XP table
    let level = 1;
    let totalXp = 0;
    
    while (totalXp <= xp) {
      totalXp += Math.floor(level + 300 * Math.pow(2, level / 7)) / 4;
      if (totalXp <= xp) level++;
    }
    
    return level;
  }

  getXpForLevel(level) {
    let totalXp = 0;
    for (let i = 1; i < level; i++) {
      totalXp += Math.floor(i + 300 * Math.pow(2, i / 7)) / 4;
    }
    return Math.floor(totalXp);
  }

  getXpProgress(skill) {
    const currentLevelXp = this.getXpForLevel(skill.level);
    const nextLevelXp = this.getXpForLevel(skill.level + 1);
    const progress = (skill.xp - currentLevelXp) / (nextLevelXp - currentLevelXp);
    return Math.min(100, Math.max(0, progress * 100));
  }

  calculateCombatLevel() {
    const att = this.currentUser.skills.attack?.level || 1;
    const str = this.currentUser.skills.strength?.level || 1;
    const def = this.currentUser.skills.defence?.level || 1;
    const hp = this.currentUser.skills.hitpoints?.level || 10;
    const ranged = this.currentUser.skills.ranged?.level || 1;
    const magic = this.currentUser.skills.magic?.level || 1;
    
    const melee = (att + str) * 0.325;
    const rangedCb = ranged * 0.4875;
    const magicCb = magic * 0.4875;
    
    return Math.floor((def + hp + Math.floor(Math.max(melee, rangedCb, magicCb))) * 0.25);
  }

  getPlaytime() {
    const hours = Math.floor((Date.now() - this.currentUser.created) / (1000 * 60 * 60));
    return `${hours}h`;
  }

  getItemIcon(itemId) {
    // Use SVG images for items that have them, fallback to emojis
    const svgItems = {
      // Equipment
      bronze_sword: 'images/items/bronze_sword.svg',
      bronze_helmet: 'images/items/bronze_helmet.svg',
      bronze_platebody: 'images/items/bronze_platebody.svg',
      gold_ring: 'images/items/gold_ring.svg',
      gold_necklace: 'images/items/gold_necklace.svg',
      cape: 'images/items/cape.svg',
      
      // Resources
      logs: 'images/items/logs.svg',
      copper_ore: 'images/items/copper_ore.svg',
      iron_ore: 'images/items/iron_ore.svg',
      
      // Bars
      bronze_bar: 'images/items/bronze_bar.svg',
      
      // Fish
      shrimp: 'images/items/shrimp.svg',
      
      // Seeds & Crops
      potato_seed: 'images/items/potato_seed.svg',
      potato: 'images/items/potato.svg',
      wheat_seed: 'images/items/wheat_seed.svg',
      
      // Supplies
      vial: 'images/items/vial.svg',
    };
    
    if (svgItems[itemId]) {
      return `<img src="${svgItems[itemId]}" style="width: 32px; height: 32px;" alt="${itemId}">`;
    }
    
    // Fallback to emojis for items without SVG images
    const icons = {
      // Logs
      oak_logs: '🪵', willow_logs: '🪵', yew_logs: '🌲', magic_logs: '✨',
      
      // Ores
      tin_ore: '⚪', coal: '⚫', 
      gold_ore: '🟡', mithril_ore: '🔵',
      
      // Fish
      sardine: '🐟', trout: '🐟', salmon: '🐟', 
      lobster: '🦞', shark: '🦈',
      
      // Cooked Food
      cooked_shrimp: '🍤', bread: '🍞', cooked_trout: '🍖',
      
      // Bars
      iron_bar: '🔸', steel_bar: '⚪', 
      gold_bar: '🟨', mithril_bar: '🟦',
      
      // Equipment
      iron_sword: '⚔️', steel_sword: '⚔️',
      
      // Seeds and Crops
      herb_seed: '🌿', carrot_seed: '🥕', cabbage_seed: '🥬',
      wheat: '🌾', herb: '🌿', carrot: '🥕', cabbage: '🥬',
      
      // Cooked Foods
      vegetable_stew: '🍲', cabbage_soup: '🍜',
      
      // Potions
      combat_xp_potion: '🧪', gathering_xp_potion: '🧪', production_xp_potion: '⚗️',
      
      // Enchantments
      xp_boost_gem: '💎', speed_boost_gem: '💎',
      
      // Utilities
      vial: '🧪',
      
      // Currency
      coins: '🪙'
    };
    return icons[itemId] || '📦';
  }

  getSkillImage(skillId) {
    const images = {
      woodcutting: './images/skills/woodcutting.svg',
      mining: './images/skills/mining.svg',
      fishing: './images/skills/fishing.svg',
      farming: './images/skills/farming.svg',
      smelting: './images/skills/smelting.svg',
      smithing: './images/skills/smithing.svg',
      cooking: './images/skills/cooking.svg',
      alchemy: './images/skills/alchemy.svg',
      enchanting: './images/skills/enchanting.svg',
      attack: './images/skills/attack.svg',
      strength: './images/skills/strength.svg',
      defence: './images/skills/defence.svg',
      ranged: './images/skills/ranged.svg',
      magic: './images/skills/magic.svg',
      hitpoints: './images/skills/hitpoints.svg'
    };
    return images[skillId] || null;
  }

  getActivityImage(activity) {
    const images = {
      // Trees
      'normal_tree': './images/trees/normal_tree.svg',
      'oak_tree': './images/trees/oak_tree.svg',
      'willow_tree': './images/trees/willow_tree.svg',
      'yew_tree': './images/trees/yew_tree.svg',
      'magic_tree': './images/trees/magic_tree.svg',
      
      // Ores
      'copper_ore': './images/ores/copper_ore.svg',
      'tin_ore': './images/ores/tin_ore.svg',
      'iron_ore': './images/ores/iron_ore.svg',
      'coal': './images/ores/coal.svg',
      'gold_ore': './images/ores/gold_ore.svg',
      'mithril_ore': './images/ores/mithril_ore.svg',
      
      // Fish
      'shrimp': './images/fish/shrimp.svg',
      'sardine': './images/fish/sardine.svg',
      'trout': './images/fish/trout.svg',
      'salmon': './images/fish/salmon.svg',
      'lobster': './images/fish/lobster.svg',
      'shark': './images/fish/shark.svg',
      
      // Monsters
      'goblin': './images/monsters/goblin.svg',
      'cow': './images/monsters/cow.svg',
      'skeleton': './images/monsters/skeleton.svg'
    };
    return images[activity] || null;
  }

  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }

  formatCoins(amount) {
    const formattedAmount = this.formatNumber(amount);
    return `${formattedAmount} ${amount === 1 ? 'coin' : 'coins'}`;
  }

  saveUserData() {
    this.gameData.users[this.currentUser.username] = this.currentUser;
    localStorage.setItem('bmtIdle_currentUser', JSON.stringify(this.currentUser));
    this.saveGameData();
  }

  showNotification(message) {
    // Simple notification system
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--osrs-gold);
      color: var(--osrs-darker);
      padding: 12px 20px;
      border-radius: 6px;
      font-weight: 500;
      z-index: 1000;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  calculateOfflineProgress() {
    if (!this.currentUser.lastLogin) return;
    
    const now = Date.now();
    const timeOffline = now - this.currentUser.lastLogin;
    const hoursOffline = timeOffline / (1000 * 60 * 60);
    
    // Only calculate if offline for more than 5 minutes
    if (hoursOffline < 0.083) return;
    
    // Cap offline time at 24 hours
    const cappedHours = Math.min(hoursOffline, 24);
    
    // Only calculate offline progress if player was actively training when they logged out
    if (!this.currentUser.currentTraining) {
      console.log('No active training when logged out, skipping offline progress');
      return;
    }
    
    // Calculate idle gains based on the skill they were training
    let totalGains = {};
    let hasGains = false;
    
    const trainingSkill = this.currentUser.currentTraining.skill;
    if (trainingSkill && this.currentUser.skills[trainingSkill]) {
      const skill = this.currentUser.skills[trainingSkill];
      
      // Calculate idle XP based on the training skill
      const idleXpPerHour = Math.floor(skill.level * 2.5);
      const totalIdleXp = Math.floor(idleXpPerHour * cappedHours);
      
      if (totalIdleXp > 0) {
        totalGains[trainingSkill] = totalIdleXp;
        hasGains = true;
      }
    }
    
    // Apply gains and show notification
    if (hasGains) {
      let gainsText = [];
      Object.entries(totalGains).forEach(([skillId, xp]) => {
        this.currentUser.skills[skillId].xp += xp;
        
        // Check for level ups
        const newLevel = this.calculateLevel(this.currentUser.skills[skillId].xp);
        if (newLevel > this.currentUser.skills[skillId].level) {
          this.currentUser.skills[skillId].level = newLevel;
        }
        
        gainsText.push(`${this.gameData.skills[skillId].name}: +${this.formatNumber(xp)} XP`);
      });
      
      // Add some idle resource gathering
      const idleResources = Math.floor(cappedHours * 5);
      if (idleResources > 0) {
        this.currentUser.inventory.logs = (this.currentUser.inventory.logs || 0) + idleResources;
        this.currentUser.inventory.copper_ore = (this.currentUser.inventory.copper_ore || 0) + Math.floor(idleResources / 2);
        gainsText.push(`Resources: +${idleResources} logs, +${Math.floor(idleResources / 2)} copper ore`);
      }
      
      // Show offline progress notification (disabled for now)
      // setTimeout(() => {
      //   this.showOfflineProgressModal(cappedHours, gainsText);
      // }, 1000);
    }
    
    this.saveUserData();
  }
  
  showOfflineProgressModal(hours, gains) {
    const modal = document.createElement('div');
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 2000;
    `;
    
    modal.innerHTML = `
      <div style="
        background: var(--bg-secondary);
        border: 2px solid var(--osrs-gold);
        border-radius: 12px;
        padding: 2rem;
        max-width: 500px;
        width: 90%;
        text-align: center;
        color: white;
      ">
        <h2 style="color: var(--osrs-gold); margin-bottom: 1rem;">⏰ Welcome Back!</h2>
        <p style="margin-bottom: 1rem;">You were offline for <strong>${hours.toFixed(1)} hours</strong></p>
        <p style="margin-bottom: 1rem;">Here's what you gained while away:</p>
        <div style="text-align: left; margin: 1rem 0; padding: 1rem; background: var(--bg-tertiary); border-radius: 8px;">
          ${gains.map(gain => `<div style="margin: 0.5rem 0;">• ${gain}</div>`).join('')}
        </div>
        <button onclick="this.parentElement.parentElement.remove(); game.render();" 
          style="background: var(--osrs-gold); color: var(--osrs-darker); border: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; cursor: pointer;">
          Awesome!
        </button>
      </div>
    `;
    
    document.body.appendChild(modal);
  }


  startGameLoops() {
    // Auto-save every 30 seconds
    setInterval(() => {
      this.saveUserData();
    }, 30000);
    
    // Process training progress every 500ms for smooth updates
    setInterval(() => {
      try {
        if (this.currentUser && this.currentUser.currentTraining) {
          if (this.currentUser.currentTraining.skill === 'combat') {
            this.processCombatTraining();
          } else {
            this.processTrainingProgress();
          }
        }
      } catch (error) {
        console.error('Error in training progress:', error);
      }
    }, 500);
    
    // Update UI elements every 100ms for smooth timers
    setInterval(() => {
      try {
        this.updateRealTimeUI();
      } catch (error) {
        console.error('Error in real-time UI update:', error);
      }
    }, 100);
    
    // Passive resource generation every minute
    setInterval(() => {
      if (this.currentUser) {
        // Small passive gains based of total level
        const totalLevel = Object.values(this.currentUser.skills).reduce((sum, skill) => sum + skill.level, 0);
        const passiveCoins = Math.floor(totalLevel / 10);
        
        if (passiveCoins > 0) {
          this.currentUser.inventory.coins += passiveCoins;
          this.saveUserData();
        }
      }
    }, 60000);
  }

  updateRealTimeUI() {
    if (!this.currentUser || !this.currentUser.currentTraining) return;
    
    const training = this.currentUser.currentTraining;
    const now = Date.now();
    
    // Simple modulo approach for timer display
    const timeSinceStart = now - training.startTime;
    const timeInCurrentAction = timeSinceStart % training.actionTime;
    const actionProgress = (timeInCurrentAction / training.actionTime) * 100;
    const actionTimeElapsed = timeInCurrentAction / 1000;
    
    // Calculate session progress
    const sessionProgress = Math.min(100, ((now - training.startTime) / training.duration) * 100);
    const sessionMinutes = Math.floor((now - training.startTime) / 60000);
    
    // Update action timer bars
    const actionProgressBar = document.getElementById('action-progress');
    const skillActionProgressBar = document.getElementById('skill-action-progress');
    const actionTimer = document.getElementById('action-timer');
    const skillActionTimer = document.getElementById('skill-action-timer');
    
    if (actionProgressBar) {
      actionProgressBar.style.width = actionProgress + '%';
    }
    if (skillActionProgressBar) {
      skillActionProgressBar.style.width = actionProgress + '%';
    }
    if (actionTimer) {
      actionTimer.textContent = actionTimeElapsed.toFixed(1);
    }
    if (skillActionTimer) {
      skillActionTimer.textContent = actionTimeElapsed.toFixed(1);
    }
    
    // Update combat timer (if in combat)
    if (training.skill === 'combat') {
      const combatActionProgressBar = document.getElementById('combat-action-timer');
      const combatTimerText = document.getElementById('combat-timer-text');
      const battleActionTimer = document.getElementById('battle-action-timer');
      const battleTimerText = document.getElementById('battle-timer-text');
      
      if (combatActionProgressBar) {
        combatActionProgressBar.style.width = actionProgress + '%';
      }
      if (battleActionTimer) {
        battleActionTimer.style.width = actionProgress + '%';
      }
      if (combatTimerText) {
        combatTimerText.textContent = `${actionTimeElapsed.toFixed(1)}s / ${(training.actionTime / 1000).toFixed(1)}s`;
      }
      if (battleTimerText) {
        battleTimerText.textContent = `${actionTimeElapsed.toFixed(1)}s / ${(training.actionTime / 1000).toFixed(1)}s`;
      }
    }
    
    // Update session progress
    const sessionProgressBar = document.getElementById('session-progress');
    const sessionTimer = document.getElementById('session-timer');
    
    if (sessionProgressBar) {
      sessionProgressBar.style.width = sessionProgress + '%';
    }
    if (sessionTimer) {
      sessionTimer.textContent = sessionMinutes;
    }
    
    // Update combat HP displays (if in combat)
    if (training.skill === 'combat' && this.currentUser.currentMonster) {
      const monsterHpDisplay = document.getElementById('monster-hp-display');
      if (monsterHpDisplay) {
        monsterHpDisplay.textContent = `${this.currentUser.currentMonster.hp}/${this.currentUser.currentMonster.maxHp}`;
      }
      
      // Update battle arena monster HP
      const battleMonsterHpText = document.getElementById('battle-monster-hp-text');
      if (battleMonsterHpText) {
        battleMonsterHpText.textContent = `${this.currentUser.currentMonster.hp}/${this.currentUser.currentMonster.maxHp}`;
      }
      
      const battleMonsterHpBar = document.getElementById('battle-monster-hp-bar');
      if (battleMonsterHpBar) {
        battleMonsterHpBar.style.width = `${(this.currentUser.currentMonster.hp / this.currentUser.currentMonster.maxHp) * 100}%`;
      }
    }
    
    // Update skill levels in real-time
    this.updateSkillDisplays();
  }

  updateSkillDisplays() {
    // Update skill level displays
    Object.keys(this.gameData.skills).forEach(skillId => {
      const skillLevelElement = document.getElementById(`skill-level-${skillId}`);
      if (skillLevelElement) {
        skillLevelElement.textContent = this.currentUser.skills[skillId].level;
      }
      
      // Update XP progress bars
      const xpBar = document.getElementById(`xp-progress-${skillId}`);
      if (xpBar) {
        xpBar.style.width = this.getXpProgress(this.currentUser.skills[skillId]) + '%';
      }
      
      // Update current XP display
      const currentXpElement = document.getElementById(`current-xp-${skillId}`);
      if (currentXpElement) {
        currentXpElement.textContent = this.formatNumber(this.currentUser.skills[skillId].xp);
      }
      
      // Update XP to next level
      const xpToNextElement = document.getElementById(`xp-to-next-${skillId}`);
      if (xpToNextElement) {
        xpToNextElement.textContent = this.formatNumber(this.getXpForLevel(this.currentUser.skills[skillId].level + 1) - this.currentUser.skills[skillId].xp);
      }
    });
    
    // Update hitpoints display
    const hpDisplay = document.querySelector('#hp-display');
    if (hpDisplay) {
      hpDisplay.textContent = `${this.currentUser.currentHp}/${this.currentUser.maxHp}`;
    }
    
    // Update combat skill page HP display
    const combatHpDisplay = document.querySelector('#combat-hp-display');
    if (combatHpDisplay) {
      combatHpDisplay.textContent = `${this.currentUser.currentHp}/${this.currentUser.maxHp}`;
    }
    
    // Update combat skill page HP bar
    const combatHpBar = document.querySelector('#combat-hp-bar');
    if (combatHpBar) {
      combatHpBar.style.width = `${(this.currentUser.currentHp / this.currentUser.maxHp) * 100}%`;
    }
    
    // Update battle arena HP displays
    const battlePlayerHpText = document.querySelector('#battle-player-hp-text');
    if (battlePlayerHpText) {
      battlePlayerHpText.textContent = `${this.currentUser.currentHp}/${this.currentUser.maxHp}`;
    }
    
    const battlePlayerHpBar = document.querySelector('#battle-player-hp-bar');
    if (battlePlayerHpBar) {
      battlePlayerHpBar.style.width = `${(this.currentUser.currentHp / this.currentUser.maxHp) * 100}%`;
    }
    
    // Update coins display
    const coinsDisplay = document.querySelector('#coins-display');
    if (coinsDisplay) {
      coinsDisplay.textContent = this.currentUser.inventory.coins || 0;
    }
    
    // Update header coins display
    const headerCoinsDisplay = document.querySelector('#coins-display-header .coins-amount');
    if (headerCoinsDisplay) {
      headerCoinsDisplay.textContent = (this.currentUser.inventory.coins || 0).toLocaleString();
    }
    
    // Update total level display
    const totalLevelElement = document.getElementById('total-level-display');
    if (totalLevelElement) {
      const totalLevel = Object.values(this.currentUser.skills).reduce((sum, skill) => sum + skill.level, 0);
      totalLevelElement.textContent = totalLevel;
    }
    
    // Update combat level display
    const combatLevelElement = document.getElementById('combat-level-display');
    if (combatLevelElement) {
      combatLevelElement.textContent = this.calculateCombatLevel();
    }
  }

  bindEvents() {
    document.addEventListener('click', (e) => {
      // Navigation
      if (e.target.matches('[data-page]')) {
        e.preventDefault();
        this.navigateTo(e.target.dataset.page);
      }
      
      // Auth forms
      if (e.target.matches('#show-register')) {
        e.preventDefault();
        this.currentPage = 'register';
        this.render();
      }
      
      if (e.target.matches('#show-login')) {
        e.preventDefault();
        this.currentPage = 'login';
        this.render();
      }
      
      // Logout
      if (e.target.matches('#logout-btn')) {
        e.preventDefault();
        this.logout();
      }
    });

    document.addEventListener('submit', (e) => {
      e.preventDefault();
      
      if (e.target.closest('#login-form')) {
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
        
        try {
          this.login(username, password);
          this.currentPage = 'dashboard';
          this.render();
          this.startGameLoops();
        } catch (error) {
          alert(error.message);
        }
      }
      
      if (e.target.closest('#register-form')) {
        const username = document.getElementById('register-username').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        
        try {
          this.createUser(username, email, password);
          this.login(username, password);
          this.currentPage = 'dashboard';
          this.render();
          this.startGameLoops();
        } catch (error) {
          alert(error.message);
        }
      }
    });
  }

  // Combat Animation Functions
  triggerCombatAnimation(type) {
    const battleArena = document.querySelector('.battle-arena');
    if (!battleArena) return;

    const playerSide = battleArena.querySelector('.player-side');
    const monsterSide = battleArena.querySelector('.monster-side');

    switch (type) {
      case 'player-attack':
        if (playerSide) {
          playerSide.classList.add('attack-flash');
          setTimeout(() => playerSide.classList.remove('attack-flash'), 300);
        }
        if (monsterSide) {
          monsterSide.classList.add('monster-hit');
          setTimeout(() => monsterSide.classList.remove('monster-hit'), 300);
        }
        break;
      
      case 'monster-attack':
        if (monsterSide) {
          monsterSide.classList.add('attack-flash');
          setTimeout(() => monsterSide.classList.remove('attack-flash'), 300);
        }
        if (playerSide) {
          playerSide.classList.add('player-hit');
          setTimeout(() => playerSide.classList.remove('player-hit'), 300);
        }
        break;
      
      case 'player-miss':
        if (playerSide) {
          playerSide.classList.add('attack-flash');
          setTimeout(() => playerSide.classList.remove('attack-flash'), 300);
        }
        break;
      
      case 'monster-miss':
        if (monsterSide) {
          monsterSide.classList.add('attack-flash');
          setTimeout(() => monsterSide.classList.remove('attack-flash'), 300);
        }
        break;
    }
  }

  showDamageNumber(damage, target) {
    const battleArena = document.querySelector('.battle-arena');
    if (!battleArena) return;

    const damageElement = document.createElement('div');
    damageElement.textContent = `-${damage}`;
    damageElement.className = 'damage-number';
    
    // Position based on target
    if (target === 'monster') {
      const monsterSide = battleArena.querySelector('.monster-side');
      if (monsterSide) {
        const rect = monsterSide.getBoundingClientRect();
        damageElement.style.left = (rect.left + rect.width / 2) + 'px';
        damageElement.style.top = (rect.top + rect.height / 2) + 'px';
      }
    } else {
      const playerSide = battleArena.querySelector('.player-side');
      if (playerSide) {
        const rect = playerSide.getBoundingClientRect();
        damageElement.style.left = (rect.left + rect.width / 2) + 'px';
        damageElement.style.top = (rect.top + rect.height / 2) + 'px';
      }
    }

    document.body.appendChild(damageElement);
    
    // Remove after animation
    setTimeout(() => {
      if (damageElement.parentNode) {
        damageElement.remove();
      }
    }, 1000);
  }

  resetAccount() {
    if (confirm('Are you sure you want to reset your account? This will permanently delete all your progress and cannot be undone!')) {
      if (confirm('This is your final warning! Click OK to permanently delete your account.')) {
        // Clear all saved data
        localStorage.removeItem('bmtIdle_currentUser');
        localStorage.removeItem('bmtIdle_gameData');
        
        // Show confirmation
        this.showNotification('Account reset! Redirecting to login...');
        
        // Redirect to login after a short delay
        setTimeout(() => {
          this.currentUser = null;
          this.currentPage = 'login';
          this.render();
        }, 2000);
      }
    }
  }

  // Equipment Helper Functions
  calculateTotalStats() {
    const baseStats = {
      attack: this.currentUser.skills.attack?.level || 1,
      strength: this.currentUser.skills.strength?.level || 1,
      defence: this.currentUser.skills.defence?.level || 1
    };

    // Add equipment bonuses
    Object.values(this.currentUser.equipment).forEach(itemId => {
      if (itemId && this.gameData.items[itemId]?.stats) {
        const itemStats = this.gameData.items[itemId].stats;
        Object.keys(itemStats).forEach(stat => {
          baseStats[stat] = (baseStats[stat] || 0) + itemStats[stat];
        });
      }
    });

    return baseStats;
  }

  renderEquippedItem(itemId) {
    const itemData = this.gameData.items[itemId];
    if (!itemData) return '<div class="empty-slot">Error</div>';
    
    return `
      <div class="equipped-item">
        <div class="item-icon">${this.getItemIcon(itemId)}</div>
        <div class="item-name">${itemData.name}</div>
        <div class="item-level">Lv.${itemData.level}</div>
        <button class="btn btn-danger btn-small" onclick="game.unequipItem('${itemId}')" style="margin-top: 4px;">Unequip</button>
      </div>
    `;
  }

  renderEmptySlot(slot) {
    return `
      <div class="empty-slot">
        <div class="empty-icon">+</div>
        <div class="empty-text">Empty</div>
      </div>
    `;
  }

  openEquipmentSlot(slot) {
    const selectionModal = document.getElementById('equipment-selection');
    const selectionTitle = document.getElementById('equipment-selection-title');
    const selectionContent = document.getElementById('equipment-selection-content');
    
    if (!selectionModal) return;
    
    selectionTitle.textContent = `Select ${slot.charAt(0).toUpperCase() + slot.slice(1)}`;
    
    // Get available equipment for this slot
    const availableItems = Object.entries(this.currentUser.inventory)
      .filter(([itemId, quantity]) => {
        const itemData = this.gameData.items[itemId];
        return itemData && itemData.slot === slot && quantity > 0;
      })
      .map(([itemId, quantity]) => {
        const itemData = this.gameData.items[itemId];
        const canEquip = this.canEquipItem(itemId);
        
        return `
          <div class="equipment-item-card card ${!canEquip ? 'disabled-card' : ''}" onclick="${canEquip ? `game.equipItem('${itemId}')` : ''}">
            <div class="item-icon">${this.getItemIcon(itemId)}</div>
            <div class="item-name">${itemData.name}</div>
            <div class="item-level">Level ${itemData.level}</div>
            <div class="item-stats">
              ${Object.entries(itemData.stats || {}).map(([stat, value]) => 
                `<div class="stat">${stat}: +${value}</div>`
              ).join('')}
            </div>
            <div class="item-quantity">x${quantity}</div>
            ${!canEquip ? '<div class="text-red">Level too low</div>' : ''}
          </div>
        `;
      }).join('');
    
    selectionContent.innerHTML = availableItems || '<div class="text-muted text-center" style="padding: 2rem;">No equipment available for this slot</div>';
    selectionModal.style.display = 'block';
  }

  closeEquipmentSelection() {
    const selectionModal = document.getElementById('equipment-selection');
    if (selectionModal) {
      selectionModal.style.display = 'none';
    }
  }

  canEquipItem(itemId) {
    const itemData = this.gameData.items[itemId];
    if (!itemData || !itemData.level) return true;
    
    // Check if player has required level in the relevant skill
    const requiredLevel = itemData.level;
    const skillLevel = this.currentUser.skills.attack?.level || 1; // Default to attack level
    
    return skillLevel >= requiredLevel;
  }

  equipItem(itemId) {
    const itemData = this.gameData.items[itemId];
    if (!itemData || !itemData.slot) return;
    
    const slot = itemData.slot;
    
    // Unequip current item if any
    if (this.currentUser.equipment[slot]) {
      this.unequipItem(this.currentUser.equipment[slot]);
    }
    
    // Equip new item
    this.currentUser.equipment[slot] = itemId;
    
    // Remove from inventory
    this.currentUser.inventory[itemId]--;
    if (this.currentUser.inventory[itemId] === 0) {
      delete this.currentUser.inventory[itemId];
    }
    
    this.saveUserData();
    this.render();
    this.closeEquipmentSelection();
    this.showNotification(`Equipped ${itemData.name}!`);
  }

  unequipItem(itemId) {
    const itemData = this.gameData.items[itemId];
    if (!itemData || !itemData.slot) return;
    
    const slot = itemData.slot;
    
    // Remove from equipment
    delete this.currentUser.equipment[slot];
    
    // Add back to inventory
    this.currentUser.inventory[itemId] = (this.currentUser.inventory[itemId] || 0) + 1;
    
    this.saveUserData();
    this.render();
    this.showNotification(`Unequipped ${itemData.name}!`);
  }
}

// Initialize the game
const game = new BMTIdle();
