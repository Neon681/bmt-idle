// BMT Idle - Main Application
class BMTIdle {
  constructor() {
    console.log('BMT Idle: Constructor starting...');
    
    try {
      this.currentUser = null;
      this.currentPage = 'login';
      this.particleContainer = null;
      this.friends = [];
      this.chatMessages = [];
      this.chatInput = '';
      this.selectedPlayer = null;
      
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
        
        // Initialize quest progress for existing users
        if (!this.currentUser.questProgress) {
          this.currentUser.questProgress = {
            firstActivityCompleted: false,
            firstCombatCompleted: false,
            firstCraftCompleted: false,
            activitiesCompleted: 0,
            monstersDefeated: 0,
            totalCoinsEarned: 0,
            questsCompleted: 0
          };
          this.saveUserData();
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
      
      // Load theme
      this.loadTheme();
      
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
      woodcutting: { 
        name: 'Woodcutting', 
        category: 'gathering', 
        icon: '🪓',
        description: 'Chop trees to gather wood',
        maxLevel: 99,
        xpPerLevel: 100
      },
      mining: { 
        name: 'Mining', 
        category: 'gathering', 
        icon: '⛏️',
        description: 'Mine rocks to gather ores and gems',
        maxLevel: 99,
        xpPerLevel: 100
      },
      fishing: { 
        name: 'Fishing', 
        category: 'gathering', 
        icon: '🎣',
        description: 'Catch fish from water sources',
        maxLevel: 99,
        xpPerLevel: 100
      },
      farming: { 
        name: 'Farming', 
        category: 'gathering', 
        icon: '🌾',
        description: 'Grow crops and herbs',
        maxLevel: 99,
        xpPerLevel: 100
      },
      
      // Production Skills
      smelting: { 
        name: 'Smelting', 
        category: 'production', 
        icon: '🔥',
        description: 'Smelt ores into bars and ingots',
        maxLevel: 99,
        xpPerLevel: 100
      },
      smithing: { 
        name: 'Smithing', 
        category: 'production', 
        icon: '🔨',
        description: 'Craft weapons, armor, and tools',
        maxLevel: 99,
        xpPerLevel: 100
      },
      cooking: { 
        name: 'Cooking', 
        category: 'production', 
        icon: '🍳',
        description: 'Cook food to restore health and provide bonuses',
        maxLevel: 99,
        xpPerLevel: 100
      },
      herblore: { 
        name: 'Herblore', 
        category: 'production', 
        icon: '🧪',
        description: 'Create potions and magical items',
        maxLevel: 99,
        xpPerLevel: 100
      },
      crafting: { 
        name: 'Crafting', 
        category: 'production', 
        icon: '✂️',
        description: 'Create jewelry, clothing, and decorative items',
        maxLevel: 99,
        xpPerLevel: 100
      },
      runecrafting: { 
        name: 'Runecrafting', 
        category: 'production', 
        icon: '🔮',
        description: 'Create magical runes and enchantments',
        maxLevel: 99,
        xpPerLevel: 100
      },
      
      // Combat Skills
      attack: { 
        name: 'Attack', 
        category: 'combat', 
        icon: '⚔️',
        description: 'Combat skill for accuracy and weapon proficiency',
        maxLevel: 99,
        xpPerLevel: 100
      },
      strength: { 
        name: 'Strength', 
        category: 'combat', 
        icon: '💪',
        description: 'Combat skill for damage and carrying capacity',
        maxLevel: 99,
        xpPerLevel: 100
      },
      defence: { 
        name: 'Defence', 
        category: 'combat', 
        icon: '🛡️',
        description: 'Combat skill for protection and damage reduction',
        maxLevel: 99,
        xpPerLevel: 100
      },
      ranged: { 
        name: 'Ranged', 
        category: 'combat', 
        icon: '🏹',
        description: 'Combat skill for ranged weapons and accuracy',
        maxLevel: 99,
        xpPerLevel: 100
      },
      magic: { 
        name: 'Magic', 
        category: 'combat', 
        icon: '🔮',
        description: 'Combat skill for spells and magical abilities',
        maxLevel: 99,
        xpPerLevel: 100
      },
      hitpoints: { 
        name: 'Hitpoints', 
        category: 'combat', 
        icon: '❤️',
        description: 'Your health and vitality',
        maxLevel: 99,
        xpPerLevel: 100
      }
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
      iron_ore: { name: 'Iron Ore', category: 'resource', value: 8 },
      coal: { name: 'Coal', category: 'resource', value: 15 },
      silver_ore: { name: 'Silver Ore', category: 'resource', value: 25 },
      mithril_ore: { name: 'Mithril Ore', category: 'resource', value: 40 },
      gold_ore: { name: 'Gold Ore', category: 'resource', value: 60 },
      adamant_ore: { name: 'Adamant Ore', category: 'resource', value: 90 },
      cobalt_ore: { name: 'Cobalt Ore', category: 'resource', value: 130 },
      rune_ore: { name: 'Rune Ore', category: 'resource', value: 180 },
      astral_ore: { name: 'Astral Ore', category: 'resource', value: 240 },
      infernal_ore: { name: 'Infernal Ore', category: 'resource', value: 300 },
      
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
      copper_bar: { name: 'Copper Bar', category: 'material', value: 10 },
      iron_bar: { name: 'Iron Bar', category: 'material', value: 25 },
      steel_bar: { name: 'Steel Bar', category: 'material', value: 50 },
      silver_bar: { name: 'Silver Bar', category: 'material', value: 75 },
      mithril_bar: { name: 'Mithril Bar', category: 'material', value: 100 },
      gold_bar: { name: 'Gold Bar', category: 'material', value: 150 },
      adamant_bar: { name: 'Adamant Bar', category: 'material', value: 225 },
      cobalt_bar: { name: 'Cobalt Bar', category: 'material', value: 325 },
      rune_bar: { name: 'Rune Bar', category: 'material', value: 450 },
      astral_bar: { name: 'Astral Bar', category: 'material', value: 600 },
      infernal_bar: { name: 'Infernal Bar', category: 'material', value: 750 },
      
      // Weapons
      copper_sword: { name: 'Copper Sword', category: 'weapon', slot: 'weapon', value: 50, level: 1, stats: { attack: 2, strength: 1 } },
      iron_sword: { name: 'Iron Sword', category: 'weapon', slot: 'weapon', value: 150, level: 5, stats: { attack: 8, strength: 6 } },
      steel_sword: { name: 'Steel Sword', category: 'weapon', slot: 'weapon', value: 300, level: 10, stats: { attack: 15, strength: 12 } },
      silver_sword: { name: 'Silver Sword', category: 'weapon', slot: 'weapon', value: 450, level: 15, stats: { attack: 20, strength: 16 } },
      mithril_sword: { name: 'Mithril Sword', category: 'weapon', slot: 'weapon', value: 600, level: 20, stats: { attack: 25, strength: 20 } },
      gold_sword: { name: 'Gold Sword', category: 'weapon', slot: 'weapon', value: 900, level: 25, stats: { attack: 32, strength: 26 } },
      adamant_sword: { name: 'Adamant Sword', category: 'weapon', slot: 'weapon', value: 1350, level: 30, stats: { attack: 40, strength: 32 } },
      cobalt_sword: { name: 'Cobalt Sword', category: 'weapon', slot: 'weapon', value: 1950, level: 35, stats: { attack: 50, strength: 40 } },
      rune_sword: { name: 'Rune Sword', category: 'weapon', slot: 'weapon', value: 2700, level: 40, stats: { attack: 62, strength: 50 } },
      astral_sword: { name: 'Astral Sword', category: 'weapon', slot: 'weapon', value: 3600, level: 45, stats: { attack: 76, strength: 62 } },
      infernal_sword: { name: 'Infernal Sword', category: 'weapon', slot: 'weapon', value: 4500, level: 50, stats: { attack: 92, strength: 76 } },
      
      // Armor - Helmets
      copper_helmet: { name: 'Copper Helmet', category: 'armor', slot: 'helmet', value: 30, level: 1, stats: { defence: 2 } },
      iron_helmet: { name: 'Iron Helmet', category: 'armor', slot: 'helmet', value: 100, level: 5, stats: { defence: 6 } },
      steel_helmet: { name: 'Steel Helmet', category: 'armor', slot: 'helmet', value: 200, level: 10, stats: { defence: 12 } },
      silver_helmet: { name: 'Silver Helmet', category: 'armor', slot: 'helmet', value: 300, level: 15, stats: { defence: 16 } },
      mithril_helmet: { name: 'Mithril Helmet', category: 'armor', slot: 'helmet', value: 400, level: 20, stats: { defence: 20 } },
      gold_helmet: { name: 'Gold Helmet', category: 'armor', slot: 'helmet', value: 600, level: 25, stats: { defence: 26 } },
      adamant_helmet: { name: 'Adamant Helmet', category: 'armor', slot: 'helmet', value: 900, level: 30, stats: { defence: 32 } },
      cobalt_helmet: { name: 'Cobalt Helmet', category: 'armor', slot: 'helmet', value: 1300, level: 35, stats: { defence: 40 } },
      rune_helmet: { name: 'Rune Helmet', category: 'armor', slot: 'helmet', value: 1800, level: 40, stats: { defence: 50 } },
      astral_helmet: { name: 'Astral Helmet', category: 'armor', slot: 'helmet', value: 2400, level: 45, stats: { defence: 62 } },
      infernal_helmet: { name: 'Infernal Helmet', category: 'armor', slot: 'helmet', value: 3000, level: 50, stats: { defence: 76 } },
      
      // Armor - Body
      copper_platebody: { name: 'Copper Platebody', category: 'armor', slot: 'body', value: 80, level: 1, stats: { defence: 5 } },
      iron_platebody: { name: 'Iron Platebody', category: 'armor', slot: 'body', value: 250, level: 5, stats: { defence: 15 } },
      steel_platebody: { name: 'Steel Platebody', category: 'armor', slot: 'body', value: 500, level: 10, stats: { defence: 30 } },
      silver_platebody: { name: 'Silver Platebody', category: 'armor', slot: 'body', value: 750, level: 15, stats: { defence: 40 } },
      mithril_platebody: { name: 'Mithril Platebody', category: 'armor', slot: 'body', value: 1000, level: 20, stats: { defence: 50 } },
      gold_platebody: { name: 'Gold Platebody', category: 'armor', slot: 'body', value: 1500, level: 25, stats: { defence: 65 } },
      adamant_platebody: { name: 'Adamant Platebody', category: 'armor', slot: 'body', value: 2250, level: 30, stats: { defence: 80 } },
      cobalt_platebody: { name: 'Cobalt Platebody', category: 'armor', slot: 'body', value: 3250, level: 35, stats: { defence: 100 } },
      rune_platebody: { name: 'Rune Platebody', category: 'armor', slot: 'body', value: 4500, level: 40, stats: { defence: 125 } },
      astral_platebody: { name: 'Astral Platebody', category: 'armor', slot: 'body', value: 6000, level: 45, stats: { defence: 155 } },
      infernal_platebody: { name: 'Infernal Platebody', category: 'armor', slot: 'body', value: 7500, level: 50, stats: { defence: 190 } },
      
      // Armor - Legs
      copper_platelegs: { name: 'Copper Platelegs', category: 'armor', slot: 'legs', value: 60, level: 1, stats: { defence: 3 } },
      iron_platelegs: { name: 'Iron Platelegs', category: 'armor', slot: 'legs', value: 200, level: 5, stats: { defence: 12 } },
      steel_platelegs: { name: 'Steel Platelegs', category: 'armor', slot: 'legs', value: 400, level: 10, stats: { defence: 24 } },
      silver_platelegs: { name: 'Silver Platelegs', category: 'armor', slot: 'legs', value: 600, level: 15, stats: { defence: 32 } },
      mithril_platelegs: { name: 'Mithril Platelegs', category: 'armor', slot: 'legs', value: 800, level: 20, stats: { defence: 40 } },
      gold_platelegs: { name: 'Gold Platelegs', category: 'armor', slot: 'legs', value: 1200, level: 25, stats: { defence: 52 } },
      adamant_platelegs: { name: 'Adamant Platelegs', category: 'armor', slot: 'legs', value: 1800, level: 30, stats: { defence: 64 } },
      cobalt_platelegs: { name: 'Cobalt Platelegs', category: 'armor', slot: 'legs', value: 2600, level: 35, stats: { defence: 80 } },
      rune_platelegs: { name: 'Rune Platelegs', category: 'armor', slot: 'legs', value: 3600, level: 40, stats: { defence: 100 } },
      astral_platelegs: { name: 'Astral Platelegs', category: 'armor', slot: 'legs', value: 4800, level: 45, stats: { defence: 124 } },
      infernal_platelegs: { name: 'Infernal Platelegs', category: 'armor', slot: 'legs', value: 6000, level: 50, stats: { defence: 152 } },
      
      // Armor - Boots
      copper_boots: { name: 'Copper Boots', category: 'armor', slot: 'boots', value: 20, level: 1, stats: { defence: 1 } },
      iron_boots: { name: 'Iron Boots', category: 'armor', slot: 'boots', value: 80, level: 5, stats: { defence: 4 } },
      steel_boots: { name: 'Steel Boots', category: 'armor', slot: 'boots', value: 160, level: 10, stats: { defence: 8 } },
      silver_boots: { name: 'Silver Boots', category: 'armor', slot: 'boots', value: 240, level: 15, stats: { defence: 12 } },
      mithril_boots: { name: 'Mithril Boots', category: 'armor', slot: 'boots', value: 320, level: 20, stats: { defence: 16 } },
      gold_boots: { name: 'Gold Boots', category: 'armor', slot: 'boots', value: 480, level: 25, stats: { defence: 20 } },
      adamant_boots: { name: 'Adamant Boots', category: 'armor', slot: 'boots', value: 720, level: 30, stats: { defence: 24 } },
      cobalt_boots: { name: 'Cobalt Boots', category: 'armor', slot: 'boots', value: 1040, level: 35, stats: { defence: 30 } },
      rune_boots: { name: 'Rune Boots', category: 'armor', slot: 'boots', value: 1440, level: 40, stats: { defence: 38 } },
      astral_boots: { name: 'Astral Boots', category: 'armor', slot: 'boots', value: 1920, level: 45, stats: { defence: 48 } },
      infernal_boots: { name: 'Infernal Boots', category: 'armor', slot: 'boots', value: 2400, level: 50, stats: { defence: 60 } },
      
      // Armor - Gloves
      copper_gloves: { name: 'Copper Gloves', category: 'armor', slot: 'gloves', value: 15, level: 1, stats: { defence: 1 } },
      iron_gloves: { name: 'Iron Gloves', category: 'armor', slot: 'gloves', value: 60, level: 5, stats: { defence: 3 } },
      steel_gloves: { name: 'Steel Gloves', category: 'armor', slot: 'gloves', value: 120, level: 10, stats: { defence: 6 } },
      silver_gloves: { name: 'Silver Gloves', category: 'armor', slot: 'gloves', value: 180, level: 15, stats: { defence: 9 } },
      mithril_gloves: { name: 'Mithril Gloves', category: 'armor', slot: 'gloves', value: 240, level: 20, stats: { defence: 12 } },
      gold_gloves: { name: 'Gold Gloves', category: 'armor', slot: 'gloves', value: 360, level: 25, stats: { defence: 15 } },
      adamant_gloves: { name: 'Adamant Gloves', category: 'armor', slot: 'gloves', value: 540, level: 30, stats: { defence: 18 } },
      cobalt_gloves: { name: 'Cobalt Gloves', category: 'armor', slot: 'gloves', value: 780, level: 35, stats: { defence: 22 } },
      rune_gloves: { name: 'Rune Gloves', category: 'armor', slot: 'gloves', value: 1080, level: 40, stats: { defence: 28 } },
      astral_gloves: { name: 'Astral Gloves', category: 'armor', slot: 'gloves', value: 1440, level: 45, stats: { defence: 36 } },
      infernal_gloves: { name: 'Infernal Gloves', category: 'armor', slot: 'gloves', value: 1800, level: 50, stats: { defence: 45 } },
      
      // Tools - Pickaxes
      copper_pickaxe: { name: 'Copper Pickaxe', category: 'tool', slot: 'tool', value: 25, level: 1, stats: { mining: 1 } },
      iron_pickaxe: { name: 'Iron Pickaxe', category: 'tool', slot: 'tool', value: 75, level: 5, stats: { mining: 2 } },
      steel_pickaxe: { name: 'Steel Pickaxe', category: 'tool', slot: 'tool', value: 150, level: 10, stats: { mining: 3 } },
      silver_pickaxe: { name: 'Silver Pickaxe', category: 'tool', slot: 'tool', value: 225, level: 15, stats: { mining: 4 } },
      mithril_pickaxe: { name: 'Mithril Pickaxe', category: 'tool', slot: 'tool', value: 300, level: 20, stats: { mining: 5 } },
      gold_pickaxe: { name: 'Gold Pickaxe', category: 'tool', slot: 'tool', value: 450, level: 25, stats: { mining: 6 } },
      adamant_pickaxe: { name: 'Adamant Pickaxe', category: 'tool', slot: 'tool', value: 675, level: 30, stats: { mining: 7 } },
      cobalt_pickaxe: { name: 'Cobalt Pickaxe', category: 'tool', slot: 'tool', value: 975, level: 35, stats: { mining: 8 } },
      rune_pickaxe: { name: 'Rune Pickaxe', category: 'tool', slot: 'tool', value: 1350, level: 40, stats: { mining: 9 } },
      astral_pickaxe: { name: 'Astral Pickaxe', category: 'tool', slot: 'tool', value: 1800, level: 45, stats: { mining: 10 } },
      infernal_pickaxe: { name: 'Infernal Pickaxe', category: 'tool', slot: 'tool', value: 2250, level: 50, stats: { mining: 12 } },
      
      // Tools - Axes
      copper_axe: { name: 'Copper Axe', category: 'tool', slot: 'tool', value: 25, level: 1, stats: { woodcutting: 1 } },
      iron_axe: { name: 'Iron Axe', category: 'tool', slot: 'tool', value: 75, level: 5, stats: { woodcutting: 2 } },
      steel_axe: { name: 'Steel Axe', category: 'tool', slot: 'tool', value: 150, level: 10, stats: { woodcutting: 3 } },
      silver_axe: { name: 'Silver Axe', category: 'tool', slot: 'tool', value: 225, level: 15, stats: { woodcutting: 4 } },
      mithril_axe: { name: 'Mithril Axe', category: 'tool', slot: 'tool', value: 300, level: 20, stats: { woodcutting: 5 } },
      gold_axe: { name: 'Gold Axe', category: 'tool', slot: 'tool', value: 450, level: 25, stats: { woodcutting: 6 } },
      adamant_axe: { name: 'Adamant Axe', category: 'tool', slot: 'tool', value: 675, level: 30, stats: { woodcutting: 7 } },
      cobalt_axe: { name: 'Cobalt Axe', category: 'tool', slot: 'tool', value: 975, level: 35, stats: { woodcutting: 8 } },
      rune_axe: { name: 'Rune Axe', category: 'tool', slot: 'tool', value: 1350, level: 40, stats: { woodcutting: 9 } },
      astral_axe: { name: 'Astral Axe', category: 'tool', slot: 'tool', value: 1800, level: 45, stats: { woodcutting: 10 } },
      infernal_axe: { name: 'Infernal Axe', category: 'tool', slot: 'tool', value: 2250, level: 50, stats: { woodcutting: 12 } },
      
      // Tools - Fishing Rods
      copper_fishing_rod: { name: 'Copper Fishing Rod', category: 'tool', slot: 'tool', value: 30, level: 1, stats: { fishing: 1 } },
      iron_fishing_rod: { name: 'Iron Fishing Rod', category: 'tool', slot: 'tool', value: 90, level: 5, stats: { fishing: 2 } },
      steel_fishing_rod: { name: 'Steel Fishing Rod', category: 'tool', slot: 'tool', value: 180, level: 10, stats: { fishing: 3 } },
      silver_fishing_rod: { name: 'Silver Fishing Rod', category: 'tool', slot: 'tool', value: 270, level: 15, stats: { fishing: 4 } },
      mithril_fishing_rod: { name: 'Mithril Fishing Rod', category: 'tool', slot: 'tool', value: 360, level: 20, stats: { fishing: 5 } },
      gold_fishing_rod: { name: 'Gold Fishing Rod', category: 'tool', slot: 'tool', value: 540, level: 25, stats: { fishing: 6 } },
      adamant_fishing_rod: { name: 'Adamant Fishing Rod', category: 'tool', slot: 'tool', value: 810, level: 30, stats: { fishing: 7 } },
      cobalt_fishing_rod: { name: 'Cobalt Fishing Rod', category: 'tool', slot: 'tool', value: 1170, level: 35, stats: { fishing: 8 } },
      rune_fishing_rod: { name: 'Rune Fishing Rod', category: 'tool', slot: 'tool', value: 1620, level: 40, stats: { fishing: 9 } },
      astral_fishing_rod: { name: 'Astral Fishing Rod', category: 'tool', slot: 'tool', value: 2160, level: 45, stats: { fishing: 10 } },
      infernal_fishing_rod: { name: 'Infernal Fishing Rod', category: 'tool', slot: 'tool', value: 2700, level: 50, stats: { fishing: 12 } },
      
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
      
      // Fish
      shrimp: { name: 'Shrimp', category: 'food', value: 2, heals: 1 },
      sardine: { name: 'Sardine', category: 'food', value: 5, heals: 2 },
      salmon: { name: 'Salmon', category: 'food', value: 15, heals: 5 },
      lobster: { name: 'Lobster', category: 'food', value: 25, heals: 8 },
      shark: { name: 'Shark', category: 'food', value: 50, heals: 15 },
      
      // Cooked Food
      cooked_shrimp: { name: 'Cooked Shrimp', category: 'food', value: 3, heals: 2 },
      cooked_sardine: { name: 'Cooked Sardine', category: 'food', value: 8, heals: 3 },
      cooked_salmon: { name: 'Cooked Salmon', category: 'food', value: 25, heals: 8 },
      cooked_lobster: { name: 'Cooked Lobster', category: 'food', value: 40, heals: 12 },
      cooked_shark: { name: 'Cooked Shark', category: 'food', value: 80, heals: 20 },
      
      // Herblore Materials
      vial: { name: 'Vial', category: 'resource', value: 1 },
      clean_herb: { name: 'Clean Herb', category: 'resource', value: 5 },
      grimy_herb: { name: 'Grimy Herb', category: 'resource', value: 3 },
      
      // Potions
      health_potion: { name: 'Health Potion', category: 'potion', value: 20, heals: 25 },
      strength_potion: { name: 'Strength Potion', category: 'potion', value: 30, effect: 'strength_boost' },
      magic_potion: { name: 'Magic Potion', category: 'potion', value: 25, effect: 'magic_boost' },
      
      // Crafting Materials
      leather: { name: 'Leather', category: 'resource', value: 3 },
      thread: { name: 'Thread', category: 'resource', value: 1 },
      gem: { name: 'Gem', category: 'resource', value: 10 },
      string: { name: 'String', category: 'resource', value: 2 },
      
      // Jewelry
      silver_ring: { name: 'Silver Ring', category: 'jewelry', value: 25 },
      diamond_ring: { name: 'Diamond Ring', category: 'jewelry', value: 100 },
      emerald_ring: { name: 'Emerald Ring', category: 'jewelry', value: 50 },
      sapphire_ring: { name: 'Sapphire Ring', category: 'jewelry', value: 75 },
      
      // Runes
      air_rune: { name: 'Air Rune', category: 'rune', value: 2 },
      fire_rune: { name: 'Fire Rune', category: 'rune', value: 3 },
      water_rune: { name: 'Water Rune', category: 'rune', value: 2 },
      earth_rune: { name: 'Earth Rune', category: 'rune', value: 3 },
      mind_rune: { name: 'Mind Rune', category: 'rune', value: 5 },
      body_rune: { name: 'Body Rune', category: 'rune', value: 8 },
      chaos_rune: { name: 'Chaos Rune', category: 'rune', value: 15 },
      death_rune: { name: 'Death Rune', category: 'rune', value: 25 },
      
      // Utilities
      
      // Currency
      coins: { name: 'Coins', category: 'currency', value: 1 }
    };
  }

  getDefaultMonsters() {
    return {
      // Low Level Monsters (1-10)
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
      rat: {
        name: 'Giant Rat',
        level: 1,
        hp: 8,
        maxHp: 8,
        attack: 1,
        strength: 1,
        defence: 0,
        attackSpeed: 3000, // 3 seconds - fast but weak
        xp: {
          attack: 2,
          strength: 2,
          defence: 2,
          hitpoints: 2
        },
        loot: {
          coins: { min: 2, max: 8 }
        }
      },
      chicken: {
        name: 'Wild Chicken',
        level: 1,
        hp: 6,
        maxHp: 6,
        attack: 1,
        strength: 1,
        defence: 0,
        attackSpeed: 2500, // 2.5 seconds - very fast
        xp: {
          attack: 1,
          strength: 1,
          defence: 1,
          hitpoints: 1
        },
        loot: {
          coins: { min: 1, max: 5 }
        }
      },
      spider: {
        name: 'Giant Spider',
        level: 3,
        hp: 15,
        maxHp: 15,
        attack: 2,
        strength: 2,
        defence: 1,
        attackSpeed: 3500, // 3.5 seconds
        xp: {
          attack: 5,
          strength: 5,
          defence: 5,
          hitpoints: 5
        },
        loot: {
          coins: { min: 6, max: 18 }
        }
      },
      wolf: {
        name: 'Wild Wolf',
        level: 5,
        hp: 25,
        maxHp: 25,
        attack: 4,
        strength: 4,
        defence: 2,
        attackSpeed: 3000, // 3 seconds - fast and strong
        xp: {
          attack: 8,
          strength: 8,
          defence: 8,
          hitpoints: 8
        },
        loot: {
          coins: { min: 12, max: 25 }
        }
      },
      
      // Mid Level Monsters (10-25)
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
      },
      orc: {
        name: 'Orc Warrior',
        level: 12,
        hp: 40,
        maxHp: 40,
        attack: 10,
        strength: 12,
        defence: 6,
        attackSpeed: 4000, // 4 seconds - slower but hits hard
        xp: {
          attack: 10,
          strength: 10,
          defence: 10,
          hitpoints: 10
        },
        loot: {
          coins: { min: 20, max: 40 }
        }
      },
      troll: {
        name: 'Cave Troll',
        level: 18,
        hp: 60,
        maxHp: 60,
        attack: 15,
        strength: 18,
        defence: 10,
        attackSpeed: 4500, // 4.5 seconds - slow but very strong
        xp: {
          attack: 15,
          strength: 15,
          defence: 15,
          hitpoints: 15
        },
        loot: {
          coins: { min: 30, max: 60 }
        }
      },
      dark_wizard: {
        name: 'Dark Wizard',
        level: 20,
        hp: 45,
        maxHp: 45,
        attack: 18,
        strength: 8,
        defence: 12,
        attackSpeed: 3000, // 3 seconds - fast magic attacks
        xp: {
          attack: 18,
          strength: 18,
          defence: 18,
          hitpoints: 18
        },
        loot: {
          coins: { min: 25, max: 50 }
        }
      },
      bandit: {
        name: 'Highway Bandit',
        level: 22,
        hp: 50,
        maxHp: 50,
        attack: 16,
        strength: 14,
        defence: 14,
        attackSpeed: 3500, // 3.5 seconds - balanced stats
        xp: {
          attack: 20,
          strength: 20,
          defence: 20,
          hitpoints: 20
        },
        loot: {
          coins: { min: 35, max: 70 }
        }
      },
      
      // High Level Monsters (25+)
      dragon: {
        name: 'Young Dragon',
        level: 30,
        hp: 100,
        maxHp: 100,
        attack: 25,
        strength: 30,
        defence: 20,
        attackSpeed: 5000, // 5 seconds - slow but devastating
        xp: {
          attack: 30,
          strength: 30,
          defence: 30,
          hitpoints: 30
        },
        loot: {
          coins: { min: 100, max: 200 }
        }
      },
      demon: {
        name: 'Lesser Demon',
        level: 35,
        hp: 120,
        maxHp: 120,
        attack: 30,
        strength: 35,
        defence: 25,
        attackSpeed: 4000, // 4 seconds
        xp: {
          attack: 35,
          strength: 35,
          defence: 35,
          hitpoints: 35
        },
        loot: {
          coins: { min: 150, max: 300 }
        }
      },
      lich: {
        name: 'Ancient Lich',
        level: 40,
        hp: 80,
        maxHp: 80,
        attack: 40,
        strength: 20,
        defence: 35,
        attackSpeed: 3000, // 3 seconds - very fast magic
        xp: {
          attack: 40,
          strength: 40,
          defence: 40,
          hitpoints: 40
        },
        loot: {
          coins: { min: 200, max: 400 }
        }
      },
      giant: {
        name: 'Mountain Giant',
        level: 45,
        hp: 200,
        maxHp: 200,
        attack: 35,
        strength: 50,
        defence: 30,
        attackSpeed: 6000, // 6 seconds - very slow but massive damage
        xp: {
          attack: 45,
          strength: 45,
          defence: 45,
          hitpoints: 45
        },
        loot: {
          coins: { min: 300, max: 600 }
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
        copper_sword: 1,
        copper_helmet: 1,
        copper_platebody: 1,
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
      questProgress: {
        firstActivityCompleted: false,
        firstCombatCompleted: false,
        firstCraftCompleted: false,
        activitiesCompleted: 0,
        monstersDefeated: 0,
        totalCoinsEarned: 0,
        questsCompleted: 0
      },
      
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
    const training = this.currentUser.currentTraining;
    
    return `
      <div class="game-header">
        <div class="header-left">
          <!-- Space for future QoL features -->
        </div>
        
        <!-- Action Timer - Center -->
        <div class="header-center">
          ${training ? this.renderActionTimer() : ''}
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

  renderActionTimer() {
    const training = this.currentUser.currentTraining;
    if (!training) return '';
    
    const skillName = this.gameData.skills[training.skill]?.name || training.skill;
    const activityName = training.activity || 'Training';
    
    return `
      <div class="header-action-timer">
        <div class="timer-header">
          <div class="timer-info">
            <div class="timer-skill">${this.getSkillIcon(training.skill)} ${skillName}</div>
            <div class="timer-activity">${activityName}</div>
          </div>
          <button class="timer-cancel-btn" onclick="game.stopTraining()" title="Stop Training"></button>
        </div>
        <div class="timer-bar-container">
          <div class="timer-bar">
            <div class="timer-fill" id="header-timer-fill"></div>
          </div>
          <div class="timer-text" id="header-timer-text">0.0s</div>
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
        
        <div class="sidebar-content">
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
              <span class="nav-item-icon">🌾</span> Farming
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
            <a href="#" class="nav-item ${this.currentPage === 'social' ? 'active' : ''}" data-page="social">
              <span class="nav-item-icon">👥</span> Social
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
      case 'social':
        return this.renderSocial();
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
      <div class="dashboard-grid">
        <!-- Player Stats Card -->
        <div class="dashboard-card">
          <div class="card-header">
            <h2 class="card-title">📊 Player Stats</h2>
          </div>
          <div class="stats-grid">
            <div class="stat-item">
              <div class="stat-icon">⭐</div>
              <div class="stat-content">
                <div class="stat-label">Total Level</div>
                <div class="stat-value" id="total-level-display">${totalLevel}</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">⚔️</div>
              <div class="stat-content">
                <div class="stat-label">Combat Level</div>
                <div class="stat-value" id="combat-level-display">${this.calculateCombatLevel()}</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">💰</div>
              <div class="stat-content">
                <div class="stat-label">Coins</div>
                <div class="stat-value" id="coins-display">${this.currentUser.inventory.coins || 0}</div>
              </div>
            </div>
            <div class="stat-item">
              <div class="stat-icon">❤️</div>
              <div class="stat-content">
                <div class="stat-label">Hitpoints</div>
                <div class="stat-value" id="hp-display">${this.currentUser.currentHp}/${this.currentUser.maxHp}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Training Card (replaces Quick Actions) -->
        ${this.currentUser.currentTraining ? `
        <div class="dashboard-card training-card">
          <div class="card-header">
            <h2 class="card-title">⏰ Currently Training</h2>
          </div>
          <div class="training-content">
            <div class="training-info">
              <div class="training-skill">
                <div class="training-icon">${this.currentUser.currentTraining.skill === 'combat' ? '⚔️' : this.gameData.skills[this.currentUser.currentTraining.skill]?.icon || '🎯'}</div>
                <div class="training-details">
                  <div class="training-name">${this.currentUser.currentTraining.skill === 'combat' ? 'Combat' : this.gameData.skills[this.currentUser.currentTraining.skill]?.name || 'Training'}</div>
                  <div class="training-activity">${this.currentUser.currentTraining.activity}</div>
                  ${this.currentUser.currentTraining.skill === 'combat' ? 
                    `<div class="training-monster">vs ${this.gameData.monsters[this.currentUser.currentTraining.monster]?.name || 'Monster'}</div>` :
                    `<div class="training-xp">${this.currentUser.currentTraining.xpRate} XP/action</div>`
                  }
                </div>
              </div>
            </div>
            
            <!-- Action Timer Bar -->
            <div class="progress-section">
              <div class="progress-label">Next Action</div>
              <div class="progress-bar">
                <div id="action-progress" class="progress-fill" style="background: linear-gradient(90deg, #ffd700 0%, #ffed4e 100%);"></div>
              </div>
              <div class="progress-text">
                <span id="action-timer">0.0</span>s / ${this.currentUser.currentTraining.actionTime / 1000}s
              </div>
            </div>
            
            <!-- Overall Training Progress -->
            <div class="progress-section">
              <div class="progress-label">Training Session</div>
              <div class="progress-bar">
                <div id="session-progress" class="progress-fill"></div>
              </div>
              <div class="progress-text">
                <span id="session-timer">${Math.floor((Date.now() - this.currentUser.currentTraining.startTime) / 60000)}</span> / ${24 * 60} minutes
              </div>
            </div>
            
            <button class="btn btn-danger stop-training-btn" onclick="game.stopTraining()">Stop Training</button>
          </div>
        </div>
        ` : `
        <!-- Quick Actions Card (when not training) -->
        <div class="dashboard-card">
          <div class="card-header">
            <h2 class="card-title">⚡ Quick Actions</h2>
          </div>
          <div class="actions-grid">
            <button class="action-btn" data-page="woodcutting">
              <div class="action-icon">🪓</div>
              <div class="action-text">Woodcutting</div>
            </button>
            <button class="action-btn" data-page="mining">
              <div class="action-icon">⛏️</div>
              <div class="action-text">Mining</div>
            </button>
            <button class="action-btn" data-page="attack">
              <div class="action-icon">⚔️</div>
              <div class="action-text">Combat</div>
            </button>
            <button class="action-btn" data-page="quests">
              <div class="action-icon">📜</div>
              <div class="action-text">Quests</div>
            </button>
            <button class="action-btn" data-page="fishing">
              <div class="action-icon">🎣</div>
              <div class="action-text">Fishing</div>
            </button>
            <button class="action-btn" data-page="farming">
              <div class="action-icon">🌾</div>
              <div class="action-text">Farming</div>
            </button>
          </div>
        </div>
        `}


      </div>

      <div class="dashboard-card skills-overview-card">
        <div class="card-header">
          <h2 class="card-title">⚡ Skills Overview</h2>
        </div>
        
        <!-- Combat Skills Section -->
        <div class="skills-section">
          <div class="section-header">
            <h3 class="section-title combat-title">⚔️ Combat Skills</h3>
          </div>
          <div class="skills-grid">
            ${Object.entries(this.gameData.skills)
              .filter(([_, skillData]) => skillData.category === 'combat')
              .map(([skillId, skillData]) => {
                const userSkill = this.currentUser.skills[skillId];
                return `
                  <div class="skill-card" onclick="game.navigateTo('${skillId}')">
                    <div class="skill-header">
                      <div class="skill-icon">${skillData.icon}</div>
                      <div class="skill-info">
                        <div class="skill-name">${skillData.name}</div>
                        <div class="skill-level">Level ${userSkill.level}</div>
                      </div>
                      <div class="skill-xp">${this.formatNumber(userSkill.xp)} XP</div>
                    </div>
                    <div class="skill-progress">
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.getXpProgress(userSkill)}%"></div>
                      </div>
                      <div class="progress-text">${this.formatNumber(userSkill.xp)} / ${this.formatNumber(this.getXpForLevel(userSkill.level + 1))} XP</div>
                    </div>
                  </div>
                `;
              }).join('')}
          </div>
        </div>
        
        <!-- Other Skills Section -->
        <div class="skills-section">
          <div class="section-header">
            <h3 class="section-title other-title">🛠️ Other Skills</h3>
          </div>
          <div class="skills-grid">
            ${Object.entries(this.gameData.skills)
              .filter(([_, skillData]) => skillData.category !== 'combat')
              .map(([skillId, skillData]) => {
                const userSkill = this.currentUser.skills[skillId];
                return `
                  <div class="skill-card" onclick="game.navigateTo('${skillId}')">
                    <div class="skill-header">
                      <div class="skill-icon">${skillData.icon}</div>
                      <div class="skill-info">
                        <div class="skill-name">${skillData.name}</div>
                        <div class="skill-level">Level ${userSkill.level}</div>
                      </div>
                      <div class="skill-xp">${this.formatNumber(userSkill.xp)} XP</div>
                    </div>
                    <div class="skill-progress">
                      <div class="progress-bar">
                        <div class="progress-fill" style="width: ${this.getXpProgress(userSkill)}%"></div>
                      </div>
                      <div class="progress-text">${this.formatNumber(userSkill.xp)} / ${this.formatNumber(this.getXpForLevel(userSkill.level + 1))} XP</div>
                    </div>
                  </div>
                `;
              }).join('')}
          </div>
        </div>
      </div>
    `;
  }

  renderInventory() {
    return `
      <div class="inventory-container">
        <!-- Item Grid -->
        <div class="dashboard-card">
          <div class="card-header">
            <h2 class="card-title">🎒 Inventory</h2>
            <div class="text-muted">Your items: ${Object.entries(this.currentUser.inventory).filter(([itemId]) => itemId !== 'coins').reduce((sum, [, qty]) => sum + qty, 0)} / ${this.getMaxInventorySlots()}</div>
          </div>
          
          <div class="inventory-grid">
            ${Object.entries(this.currentUser.inventory).filter(([itemId]) => itemId !== 'coins').map(([itemId, quantity]) => {
              const itemData = this.gameData.items[itemId];
              if (!itemData) return '';
              
              return `
                <div class="inventory-item-card" onclick="game.selectInventoryItem('${itemId}')" data-item-id="${itemId}">
                  <div class="item-icon">
                    ${this.getItemIcon(itemId)}
                  </div>
                  <div class="item-info">
                    <div class="item-name">${itemData.name}</div>
                    <div class="item-quantity">x${this.formatNumber(quantity)}</div>
                    <div class="item-value">${this.formatCoins(itemData.value * quantity)}</div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
          
          ${Object.keys(this.currentUser.inventory).filter(itemId => itemId !== 'coins').length === 0 ? 
            '<div class="empty-inventory">Your inventory is empty. Go train some skills!</div>' : ''}
        </div>
        
        <!-- Item Detail Panel -->
        <div class="dashboard-card" id="inventory-detail-panel" style="display: none;">
          <div class="card-header">
            <h3 class="card-title" id="item-detail-title">Select an Item</h3>
            <button class="btn btn-secondary btn-small" onclick="game.closeInventoryDetail()">✕ Close</button>
          </div>
          <div id="item-detail-content">
            <p class="text-muted text-center">Click on an item to view details and actions.</p>
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
        <div class="dashboard-card">
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
        <div class="dashboard-card">
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
        
        <!-- Action Timer removed - now shown in banner area -->
        
        ${this.renderSkillActions(skillId)}
      </div>
    `;
  }

  renderSkillActions(skillId) {
    const userSkill = this.currentUser.skills[skillId];
    
    switch (skillId) {
      case 'woodcutting':
        return `
          <div class="skills-grid">
            <div class="skill-card ${userSkill.level < 1 ? 'disabled-card' : ''}" onclick="game.trainSkill('woodcutting', 'logs', 15, 4000, 'Cutting Normal Trees')">
              <div class="skill-header">
                <div class="skill-icon">🌳</div>
                <div class="skill-info">
                  <div class="skill-name">Normal Tree</div>
                  <div class="skill-level">Level 1+</div>
                </div>
                <div class="skill-xp">15 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">4s per log</div>
              </div>
              <div class="skill-description">Basic woodcutting training</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 15 ? 'disabled-card' : ''}" onclick="game.trainSkill('woodcutting', 'oak_logs', 37.5, 5000, 'Cutting Oak Trees')">
              <div class="skill-header">
                <div class="skill-icon">🌲</div>
                <div class="skill-info">
                  <div class="skill-name">Oak Tree</div>
                  <div class="skill-level">Level 15+</div>
                </div>
                <div class="skill-xp">37.5 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">5s per log</div>
              </div>
              <div class="skill-description">Harder wood, better XP</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 30 ? 'disabled-card' : ''}" onclick="game.trainSkill('woodcutting', 'willow_logs', 67.5, 6000, 'Cutting Willow Trees')">
              <div class="skill-header">
                <div class="skill-icon">🌿</div>
                <div class="skill-info">
                  <div class="skill-name">Willow Tree</div>
                  <div class="skill-level">Level 30+</div>
                </div>
                <div class="skill-xp">67.5 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">6s per log</div>
              </div>
              <div class="skill-description">Fast-growing willow trees</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 60 ? 'disabled-card' : ''}" onclick="game.trainSkill('woodcutting', 'yew_logs', 175, 10000, 'Cutting Yew Trees')">
              <div class="skill-header">
                <div class="skill-icon">🌳</div>
                <div class="skill-info">
                  <div class="skill-name">Yew Tree</div>
                  <div class="skill-level">Level 60+</div>
                </div>
                <div class="skill-xp">175 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">10s per log</div>
              </div>
              <div class="skill-description">Ancient and valuable wood</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 75 ? 'disabled-card' : ''}" onclick="game.trainSkill('woodcutting', 'magic_logs', 250, 15000, 'Cutting Magic Trees')">
              <div class="skill-header">
                <div class="skill-icon">✨</div>
                <div class="skill-info">
                  <div class="skill-name">Magic Tree</div>
                  <div class="skill-level">Level 75+</div>
                </div>
                <div class="skill-xp">250 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">15s per log</div>
              </div>
              <div class="skill-description">Magical wood with great value</div>
            </div>
          </div>
        `;
      
      case 'mining':
        return `
          <div class="skills-grid">
            <div class="skill-card ${userSkill.level < 1 ? 'disabled-card' : ''}" onclick="game.trainSkill('mining', 'copper_ore', 12, 5000, 'Mining Copper')">
              <div class="skill-header">
                <div class="skill-icon">🟤</div>
                <div class="skill-info">
                  <div class="skill-name">Copper Ore</div>
                  <div class="skill-level">Level 1+</div>
                </div>
                <div class="skill-xp">12 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">5s per ore</div>
              </div>
              <div class="skill-description">Basic mining training</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 15 ? 'disabled-card' : ''}" onclick="game.trainSkill('mining', 'iron_ore', 35, 6000, 'Mining Iron')">
              <div class="skill-header">
                <div class="skill-icon">⚫</div>
                <div class="skill-info">
                  <div class="skill-name">Iron Ore</div>
                  <div class="skill-level">Level 15+</div>
                </div>
                <div class="skill-xp">35 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">6s per ore</div>
              </div>
              <div class="skill-description">Strong metal ore</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 25 ? 'disabled-card' : ''}" onclick="game.trainSkill('mining', 'silver_ore', 50, 7000, 'Mining Silver')">
              <div class="skill-header">
                <div class="skill-icon">⚪</div>
                <div class="skill-info">
                  <div class="skill-name">Silver Ore</div>
                  <div class="skill-level">Level 25+</div>
                </div>
                <div class="skill-xp">50 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">7s per ore</div>
              </div>
              <div class="skill-description">Precious metal ore</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 35 ? 'disabled-card' : ''}" onclick="game.trainSkill('mining', 'mithril_ore', 75, 8000, 'Mining Mithril')">
              <div class="skill-header">
                <div class="skill-icon">💎</div>
                <div class="skill-info">
                  <div class="skill-name">Mithril Ore</div>
                  <div class="skill-level">Level 35+</div>
                </div>
                <div class="skill-xp">75 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">8s per ore</div>
              </div>
              <div class="skill-description">Magical metal ore</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 45 ? 'disabled-card' : ''}" onclick="game.trainSkill('mining', 'gold_ore', 100, 9000, 'Mining Gold')">
              <div class="skill-header">
                <div class="skill-icon">🟡</div>
                <div class="skill-info">
                  <div class="skill-name">Gold Ore</div>
                  <div class="skill-level">Level 45+</div>
                </div>
                <div class="skill-xp">100 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">9s per ore</div>
              </div>
              <div class="skill-description">Luxury metal ore</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 55 ? 'disabled-card' : ''}" onclick="game.trainSkill('mining', 'adamant_ore', 150, 10000, 'Mining Adamant')">
              <div class="skill-header">
                <div class="skill-icon">🔵</div>
                <div class="skill-info">
                  <div class="skill-name">Adamant Ore</div>
                  <div class="skill-level">Level 55+</div>
                </div>
                <div class="skill-xp">150 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">10s per ore</div>
              </div>
              <div class="skill-description">Elite metal ore</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 65 ? 'disabled-card' : ''}" onclick="game.trainSkill('mining', 'cobalt_ore', 200, 11000, 'Mining Cobalt')">
              <div class="skill-header">
                <div class="skill-icon">🔷</div>
                <div class="skill-info">
                  <div class="skill-name">Cobalt Ore</div>
                  <div class="skill-level">Level 65+</div>
                </div>
                <div class="skill-xp">200 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">11s per ore</div>
              </div>
              <div class="skill-description">Rare metal ore</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 75 ? 'disabled-card' : ''}" onclick="game.trainSkill('mining', 'rune_ore', 275, 12000, 'Mining Rune')">
              <div class="skill-header">
                <div class="skill-icon">🔮</div>
                <div class="skill-info">
                  <div class="skill-name">Rune Ore</div>
                  <div class="skill-level">Level 75+</div>
                </div>
                <div class="skill-xp">275 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">12s per ore</div>
              </div>
              <div class="skill-description">Mystical metal ore</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 85 ? 'disabled-card' : ''}" onclick="game.trainSkill('mining', 'astral_ore', 350, 13000, 'Mining Astral')">
              <div class="skill-header">
                <div class="skill-icon">✨</div>
                <div class="skill-info">
                  <div class="skill-name">Astral Ore</div>
                  <div class="skill-level">Level 85+</div>
                </div>
                <div class="skill-xp">350 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">13s per ore</div>
              </div>
              <div class="skill-description">Cosmic metal ore</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 95 ? 'disabled-card' : ''}" onclick="game.trainSkill('mining', 'infernal_ore', 450, 14000, 'Mining Infernal')">
              <div class="skill-header">
                <div class="skill-icon">🔥</div>
                <div class="skill-info">
                  <div class="skill-name">Infernal Ore</div>
                  <div class="skill-level">Level 95+</div>
                </div>
                <div class="skill-xp">450 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">14s per ore</div>
              </div>
              <div class="skill-description">Infernal metal ore</div>
            </div>
            
          </div>
        `;

      case 'fishing':
        return `
          <div class="skills-grid">
            <div class="skill-card ${userSkill.level < 1 ? 'disabled-card' : ''}" onclick="game.trainSkill('fishing', 'shrimp', 10, 5000, 'Catching Shrimp')">
              <div class="skill-header">
                <div class="skill-icon">🦐</div>
                <div class="skill-info">
                  <div class="skill-name">Shrimp</div>
                  <div class="skill-level">Level 1+</div>
                </div>
                <div class="skill-xp">10 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">5s per shrimp</div>
              </div>
              <div class="skill-description">Basic fishing training</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 5 ? 'disabled-card' : ''}" onclick="game.trainSkill('fishing', 'sardine', 20, 5000, 'Catching Sardines')">
              <div class="skill-header">
                <div class="skill-icon">🐟</div>
                <div class="skill-info">
                  <div class="skill-name">Sardine</div>
                  <div class="skill-level">Level 5+</div>
                </div>
                <div class="skill-xp">20 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">5s per sardine</div>
              </div>
              <div class="skill-description">Small but tasty fish</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 20 ? 'disabled-card' : ''}" onclick="game.trainSkill('fishing', 'trout', 50, 6000, 'Catching Trout')">
              <div class="skill-header">
                <div class="skill-icon">🐟</div>
                <div class="skill-info">
                  <div class="skill-name">Trout</div>
                  <div class="skill-level">Level 20+</div>
                </div>
                <div class="skill-xp">50 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">6s per trout</div>
              </div>
              <div class="skill-description">Freshwater fishing</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 30 ? 'disabled-card' : ''}" onclick="game.trainSkill('fishing', 'salmon', 70, 7000, 'Catching Salmon')">
              <div class="skill-header">
                <div class="skill-icon">🐟</div>
                <div class="skill-info">
                  <div class="skill-name">Salmon</div>
                  <div class="skill-level">Level 30+</div>
                </div>
                <div class="skill-xp">70 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">7s per salmon</div>
              </div>
              <div class="skill-description">Premium fish for cooking</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 40 ? 'disabled-card' : ''}" onclick="game.trainSkill('fishing', 'lobster', 90, 8000, 'Catching Lobsters')">
              <div class="skill-header">
                <div class="skill-icon">🦞</div>
                <div class="skill-info">
                  <div class="skill-name">Lobster</div>
                  <div class="skill-level">Level 40+</div>
                </div>
                <div class="skill-xp">90 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">8s per lobster</div>
              </div>
              <div class="skill-description">Delicious and valuable</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 76 ? 'disabled-card' : ''}" onclick="game.trainSkill('fishing', 'shark', 110, 10000, 'Catching Sharks')">
              <div class="skill-header">
                <div class="skill-icon">🦈</div>
                <div class="skill-info">
                  <div class="skill-name">Shark</div>
                  <div class="skill-level">Level 76+</div>
                </div>
                <div class="skill-xp">110 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">10s per shark</div>
              </div>
              <div class="skill-description">The ultimate fishing challenge</div>
            </div>
          </div>
        `;

      case 'cooking':
        return `
          <div class="skills-grid">
            <div class="skill-card ${userSkill.level < 1 ? 'disabled-card' : ''}" onclick="game.cookFood('shrimp', 'cooked_shrimp', 30, 2000)">
              <div class="skill-header">
                <div class="skill-icon">🍤</div>
                <div class="skill-info">
                  <div class="skill-name">Cook Shrimp</div>
                  <div class="skill-level">Level 1+</div>
                </div>
                <div class="skill-xp">30 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">2s per shrimp</div>
              </div>
              <div class="skill-description">Basic cooking training</div>
            </div>
            <div class="skill-card ${userSkill.level < 1 ? 'disabled-card' : ''}" onclick="game.cookFood('wheat', 'bread', 40, 3000)">
              <div class="skill-header">
                <div class="skill-icon">🍞</div>
                <div class="skill-info">
                  <div class="skill-name">Bake Bread</div>
                  <div class="skill-level">Level 1+</div>
                </div>
                <div class="skill-xp">40 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">3s per bread</div>
              </div>
              <div class="skill-description">Simple bread baking</div>
            </div>
            <div class="skill-card ${userSkill.level < 15 ? 'disabled-card' : ''}" onclick="game.cookFood('trout', 'cooked_trout', 70, 4000)">
              <div class="skill-header">
                <div class="skill-icon">🐟</div>
                <div class="skill-info">
                  <div class="skill-name">Cook Trout</div>
                  <div class="skill-level">Level 15+</div>
                </div>
                <div class="skill-xp">70 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">4s per trout</div>
              </div>
              <div class="skill-description">Freshwater fish cooking</div>
            </div>
            <div class="skill-card ${userSkill.level < 25 ? 'disabled-card' : ''}" onclick="game.cookFood(['potato', 'carrot'], 'vegetable_stew', 60, 5000)">
              <div class="skill-header">
                <div class="skill-icon">🍲</div>
                <div class="skill-info">
                  <div class="skill-name">Vegetable Stew</div>
                  <div class="skill-level">Level 25+</div>
                </div>
                <div class="skill-xp">60 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">5s per stew</div>
              </div>
              <div class="skill-description">Hearty vegetable cooking</div>
            </div>
            <div class="skill-card ${userSkill.level < 40 ? 'disabled-card' : ''}" onclick="game.cookFood(['cabbage', 'wheat'], 'cabbage_soup', 80, 6000)">
              <div class="skill-header">
                <div class="skill-icon">🥬</div>
                <div class="skill-info">
                  <div class="skill-name">Cabbage Soup</div>
                  <div class="skill-level">Level 40+</div>
                </div>
                <div class="skill-xp">80 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">6s per soup</div>
              </div>
              <div class="skill-description">Nutritious soup making</div>
            </div>
          </div>
        `;

      case 'smelting':
        return `
          <div class="skills-grid">
            <div class="skill-card" onclick="game.smeltBar(['copper_ore'], 'copper_bar', 6.25, 3000)">
              <div class="skill-header">
                <div class="skill-icon">🟤</div>
                <div class="skill-info">
                  <div class="skill-name">Copper Bar</div>
                  <div class="skill-level">Level 1+</div>
                </div>
                <div class="skill-xp">6.25 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">3s per bar</div>
              </div>
              <div class="skill-description">Basic smelting training</div>
            </div>
            <div class="skill-card ${userSkill.level < 15 ? 'disabled-card' : ''}" onclick="game.smeltBar(['iron_ore'], 'iron_bar', 12.5, 4000)">
              <div class="skill-header">
                <div class="skill-icon">⚫</div>
                <div class="skill-info">
                  <div class="skill-name">Iron Bar</div>
                  <div class="skill-level">Level 15+</div>
                </div>
                <div class="skill-xp">12.5 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">4s per bar</div>
              </div>
              <div class="skill-description">Strong metal smelting</div>
            </div>
            <div class="skill-card ${userSkill.level < 30 ? 'disabled-card' : ''}" onclick="game.smeltBar(['iron_ore', 'coal'], 'steel_bar', 17.5, 5000)">
              <div class="skill-header">
                <div class="skill-icon">🔩</div>
                <div class="skill-info">
                  <div class="skill-name">Steel Bar</div>
                  <div class="skill-level">Level 30+</div>
                </div>
                <div class="skill-xp">17.5 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">5s per bar</div>
              </div>
              <div class="skill-description">Advanced metal smelting</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 45 ? 'disabled-card' : ''}" onclick="game.smeltBar(['silver_ore'], 'silver_bar', 25, 6000)">
              <div class="skill-header">
                <div class="skill-icon">⚪</div>
                <div class="skill-info">
                  <div class="skill-name">Silver Bar</div>
                  <div class="skill-level">Level 45+</div>
                </div>
                <div class="skill-xp">25 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">6s per bar</div>
              </div>
              <div class="skill-description">Precious metal smelting</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 60 ? 'disabled-card' : ''}" onclick="game.smeltBar(['mithril_ore'], 'mithril_bar', 35, 7000)">
              <div class="skill-header">
                <div class="skill-icon">💎</div>
                <div class="skill-info">
                  <div class="skill-name">Mithril Bar</div>
                  <div class="skill-level">Level 60+</div>
                </div>
                <div class="skill-xp">35 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">7s per bar</div>
              </div>
              <div class="skill-description">Magical metal smelting</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 75 ? 'disabled-card' : ''}" onclick="game.smeltBar(['gold_ore'], 'gold_bar', 50, 8000)">
              <div class="skill-header">
                <div class="skill-icon">🟡</div>
                <div class="skill-info">
                  <div class="skill-name">Gold Bar</div>
                  <div class="skill-level">Level 75+</div>
                </div>
                <div class="skill-xp">50 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">8s per bar</div>
              </div>
              <div class="skill-description">Luxury metal smelting</div>
            </div>
            
            <div class="skill-card ${userSkill.level < 90 ? 'disabled-card' : ''}" onclick="game.smeltBar(['adamant_ore'], 'adamant_bar', 75, 9000)">
              <div class="skill-header">
                <div class="skill-icon">🔵</div>
                <div class="skill-info">
                  <div class="skill-name">Adamant Bar</div>
                  <div class="skill-level">Level 90+</div>
                </div>
                <div class="skill-xp">75 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">9s per bar</div>
              </div>
              <div class="skill-description">Elite metal smelting</div>
            </div>
          </div>
        `;

      case 'smithing':
        return `
          <div class="skills-grid">
            <!-- Weapons -->
            <div class="skill-card" onclick="game.smithItem('copper_bar', 'copper_sword', 12.5, 4000)">
              <div class="skill-header">
                <div class="skill-icon">⚔️</div>
                <div class="skill-info">
                  <div class="skill-name">Copper Sword</div>
                  <div class="skill-level">Level 1+</div>
                </div>
                <div class="skill-xp">12.5 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">4s per sword</div>
              </div>
              <div class="skill-description">Basic weapon smithing</div>
            </div>
            <div class="skill-card ${userSkill.level < 5 ? 'disabled-card' : ''}" onclick="game.smithItem('iron_bar', 'iron_sword', 25, 5000)">
              <div class="skill-header">
                <div class="skill-icon">⚔️</div>
                <div class="skill-info">
                  <div class="skill-name">Iron Sword</div>
                  <div class="skill-level">Level 5+</div>
                </div>
                <div class="skill-xp">25 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">5s per sword</div>
              </div>
              <div class="skill-description">Improved weapon smithing</div>
            </div>
            <div class="skill-card ${userSkill.level < 10 ? 'disabled-card' : ''}" onclick="game.smithItem('steel_bar', 'steel_sword', 37.5, 6000)">
              <div class="skill-header">
                <div class="skill-icon">⚔️</div>
                <div class="skill-info">
                  <div class="skill-name">Steel Sword</div>
                  <div class="skill-level">Level 10+</div>
                </div>
                <div class="skill-xp">37.5 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">6s per sword</div>
              </div>
              <div class="skill-description">Advanced weapon smithing</div>
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
          <div class="skills-grid">
            <div class="skill-card ${userSkill.level < 1 ? 'disabled-card' : ''}" onclick="game.trainSkill('farming', 'potato', 8, 30000, 'Growing Potatoes', 'potato_seed')">
              <div class="skill-header">
                <div class="skill-icon">🥔</div>
                <div class="skill-info">
                  <div class="skill-name">Potato Seeds</div>
                  <div class="skill-level">Level 1+</div>
                </div>
                <div class="skill-xp">8 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">30s per harvest</div>
              </div>
              <div class="skill-description">Basic farming training</div>
            </div>
            <div class="skill-card ${userSkill.level < 15 ? 'disabled-card' : ''}" onclick="game.trainSkill('farming', 'wheat', 17, 45000, 'Growing Wheat', 'wheat_seed')">
              <div class="skill-header">
                <div class="skill-icon">🌾</div>
                <div class="skill-info">
                  <div class="skill-name">Wheat Seeds</div>
                  <div class="skill-level">Level 15+</div>
                </div>
                <div class="skill-xp">17 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">45s per harvest</div>
              </div>
              <div class="skill-description">For cooking bread & potions</div>
            </div>
            <div class="skill-card ${userSkill.level < 25 ? 'disabled-card' : ''}" onclick="game.trainSkill('farming', 'herb', 25, 60000, 'Growing Herbs', 'herb_seed')">
              <div class="skill-header">
                <div class="skill-icon">🌿</div>
                <div class="skill-info">
                  <div class="skill-name">Herb Seeds</div>
                  <div class="skill-level">Level 25+</div>
                </div>
                <div class="skill-xp">25 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">60s per harvest</div>
              </div>
              <div class="skill-description">Essential for all potions</div>
            </div>
            <div class="skill-card ${userSkill.level < 35 ? 'disabled-card' : ''}" onclick="game.trainSkill('farming', 'carrot', 35, 90000, 'Growing Carrots', 'carrot_seed')">
              <div class="skill-header">
                <div class="skill-icon">🥕</div>
                <div class="skill-info">
                  <div class="skill-name">Carrot Seeds</div>
                  <div class="skill-level">Level 35+</div>
                </div>
                <div class="skill-xp">35 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">90s per harvest</div>
              </div>
              <div class="skill-description">Better healing food</div>
            </div>
            <div class="skill-card ${userSkill.level < 50 ? 'disabled-card' : ''}" onclick="game.trainSkill('farming', 'cabbage', 50, 120000, 'Growing Cabbage', 'cabbage_seed')">
              <div class="skill-header">
                <div class="skill-icon">🥬</div>
                <div class="skill-info">
                  <div class="skill-name">Cabbage Seeds</div>
                  <div class="skill-level">Level 50+</div>
                </div>
                <div class="skill-xp">50 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">120s per harvest</div>
              </div>
              <div class="skill-description">High-healing food</div>
            </div>
          </div>
        `;

      case 'alchemy':
        return `
          <div class="skills-grid">
            <div class="skill-card ${userSkill.level < 1 ? 'disabled-card' : ''}" onclick="game.brewPotion(['herb', 'vial'], 'combat_xp_potion', 17.5, 5000)">
              <div class="skill-header">
                <div class="skill-icon">🧪</div>
                <div class="skill-info">
                  <div class="skill-name">Combat XP Potion</div>
                  <div class="skill-level">Level 1+</div>
                </div>
                <div class="skill-xp">17.5 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">5s per potion</div>
              </div>
              <div class="skill-description">+5% combat XP for 30 minutes</div>
            </div>
            <div class="skill-card ${userSkill.level < 25 ? 'disabled-card' : ''}" onclick="game.brewPotion(['herb', 'potato', 'vial'], 'gathering_xp_potion', 37.5, 8000)">
              <div class="skill-header">
                <div class="skill-icon">🧪</div>
                <div class="skill-info">
                  <div class="skill-name">Gathering XP Potion</div>
                  <div class="skill-level">Level 25+</div>
                </div>
                <div class="skill-xp">37.5 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">8s per potion</div>
              </div>
              <div class="skill-description">+5% gathering XP for 30 minutes</div>
            </div>
            <div class="skill-card ${userSkill.level < 50 ? 'disabled-card' : ''}" onclick="game.brewPotion(['herb', 'herb', 'wheat', 'vial'], 'production_xp_potion', 75, 12000)">
              <div class="skill-header">
                <div class="skill-icon">🧪</div>
                <div class="skill-info">
                  <div class="skill-name">Production XP Potion</div>
                  <div class="skill-level">Level 50+</div>
                </div>
                <div class="skill-xp">75 XP</div>
              </div>
              <div class="skill-progress">
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 100%"></div>
                </div>
                <div class="progress-text">12s per potion</div>
              </div>
              <div class="skill-description">+5% production XP for 30 minutes</div>
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
          
          <!-- Low Level Monsters (1-10) -->
          <div class="card mb-3">
            <div class="card-header">
              <h3>🟢 Low Level Monsters (1-10)</h3>
            </div>
            <div class="grid grid-3">
              <div class="card">
                <div style="text-align: center; margin-bottom: 1rem;">
                  <img src="./images/monsters/chicken.svg" alt="Chicken" style="width: 64px; height: 64px;">
                </div>
                <h3>🐔 Wild Chicken</h3>
                <p>Level 1 required</p>
                <p>HP: 6 | Attack: 1 | Defence: 0</p>
                <p>Attack Speed: 2.5s | Drops: 1-5 coins</p>
                <p class="text-gold">1 XP per skill per kill</p>
                <button class="btn btn-primary" onclick="game.startCombatTraining('chicken')">
                  Fight Chickens
                </button>
              </div>
              <div class="card">
                <div style="text-align: center; margin-bottom: 1rem;">
                  <img src="./images/monsters/rat.svg" alt="Rat" style="width: 64px; height: 64px;">
                </div>
                <h3>🐀 Giant Rat</h3>
                <p>Level 1 required</p>
                <p>HP: 8 | Attack: 1 | Defence: 0</p>
                <p>Attack Speed: 3s | Drops: 2-8 coins</p>
                <p class="text-gold">2 XP per skill per kill</p>
                <button class="btn btn-primary" onclick="game.startCombatTraining('rat')">
                  Fight Rats
                </button>
              </div>
              <div class="card">
                <div style="text-align: center; margin-bottom: 1rem;">
                  <img src="./images/monsters/goblin.svg" alt="Goblin" style="width: 64px; height: 64px;">
                </div>
                <h3>👹 Goblin</h3>
                <p>Level 2 required</p>
                <p>HP: 12 | Attack: 1 | Defence: 1</p>
                <p>Attack Speed: 4s | Drops: 5-15 coins</p>
                <p class="text-gold">4 XP per skill per kill</p>
                <button class="btn btn-primary" onclick="game.startCombatTraining('goblin')">
                  Fight Goblins
                </button>
              </div>
              <div class="card">
                <div style="text-align: center; margin-bottom: 1rem;">
                  <img src="./images/monsters/cow.svg" alt="Cow" style="width: 64px; height: 64px;">
                </div>
                <h3>🐄 Wild Cow</h3>
                <p>Level 2 required</p>
                <p>HP: 18 | Attack: 1 | Defence: 2</p>
                <p>Attack Speed: 5s | Drops: 8-20 coins</p>
                <p class="text-gold">6 XP per skill per kill</p>
                <button class="btn btn-primary" onclick="game.startCombatTraining('cow')">
                  Fight Cows
                </button>
              </div>
              <div class="card">
                <div style="text-align: center; margin-bottom: 1rem;">
                  <img src="./images/monsters/spider.svg" alt="Spider" style="width: 64px; height: 64px;">
                </div>
                <h3>🕷️ Giant Spider</h3>
                <p>Level 3 required</p>
                <p>HP: 15 | Attack: 2 | Defence: 1</p>
                <p>Attack Speed: 3.5s | Drops: 6-18 coins</p>
                <p class="text-gold">5 XP per skill per kill</p>
                <button class="btn btn-primary" ${userSkill.level < 3 ? 'disabled' : ''} onclick="game.startCombatTraining('spider')">
                  Fight Spiders
                </button>
              </div>
              <div class="card">
                <div style="text-align: center; margin-bottom: 1rem;">
                  <img src="./images/monsters/wolf.svg" alt="Wolf" style="width: 64px; height: 64px;">
                </div>
                <h3>🐺 Wild Wolf</h3>
                <p>Level 5 required</p>
                <p>HP: 25 | Attack: 4 | Defence: 2</p>
                <p>Attack Speed: 3s | Drops: 12-25 coins</p>
                <p class="text-gold">8 XP per skill per kill</p>
                <button class="btn btn-primary" ${userSkill.level < 5 ? 'disabled' : ''} onclick="game.startCombatTraining('wolf')">
                  Fight Wolves
                </button>
              </div>
            </div>
          </div>

          <!-- Mid Level Monsters (10-25) -->
          <div class="card mb-3">
            <div class="card-header">
              <h3>🟡 Mid Level Monsters (10-25)</h3>
            </div>
            <div class="grid grid-3">
              <div class="card">
                <div style="text-align: center; margin-bottom: 1rem;">
                  <img src="./images/monsters/orc.svg" alt="Orc" style="width: 64px; height: 64px;">
                </div>
                <h3>👹 Orc Warrior</h3>
                <p>Level 12 required</p>
                <p>HP: 40 | Attack: 10 | Defence: 6</p>
                <p>Attack Speed: 4s | Drops: 20-40 coins</p>
                <p class="text-gold">10 XP per skill per kill</p>
                <button class="btn btn-primary" ${userSkill.level < 12 ? 'disabled' : ''} onclick="game.startCombatTraining('orc')">
                  Fight Orcs
                </button>
              </div>
              <div class="card">
                <div style="text-align: center; margin-bottom: 1rem;">
                  <img src="./images/monsters/skeleton.svg" alt="Skeleton" style="width: 64px; height: 64px;">
                </div>
                <h3>💀 Skeleton</h3>
                <p>Level 15 required</p>
                <p>HP: 35 | Attack: 12 | Defence: 8</p>
                <p>Attack Speed: 3.5s | Drops: 15-35 coins</p>
                <p class="text-gold">12 XP per skill per kill</p>
                <button class="btn btn-primary" ${userSkill.level < 15 ? 'disabled' : ''} onclick="game.startCombatTraining('skeleton')">
                  Fight Skeletons
                </button>
              </div>
              <div class="card">
                <div style="text-align: center; margin-bottom: 1rem;">
                  <img src="./images/monsters/troll.svg" alt="Troll" style="width: 64px; height: 64px;">
                </div>
                <h3>👹 Cave Troll</h3>
                <p>Level 18 required</p>
                <p>HP: 60 | Attack: 15 | Defence: 10</p>
                <p>Attack Speed: 4.5s | Drops: 30-60 coins</p>
                <p class="text-gold">15 XP per skill per kill</p>
                <button class="btn btn-primary" ${userSkill.level < 18 ? 'disabled' : ''} onclick="game.startCombatTraining('troll')">
                  Fight Trolls
                </button>
              </div>
              <div class="card">
                <div style="text-align: center; margin-bottom: 1rem;">
                  <img src="./images/monsters/dark_wizard.svg" alt="Dark Wizard" style="width: 64px; height: 64px;">
                </div>
                <h3>🧙‍♂️ Dark Wizard</h3>
                <p>Level 20 required</p>
                <p>HP: 45 | Attack: 18 | Defence: 12</p>
                <p>Attack Speed: 3s | Drops: 25-50 coins</p>
                <p class="text-gold">18 XP per skill per kill</p>
                <button class="btn btn-primary" ${userSkill.level < 20 ? 'disabled' : ''} onclick="game.startCombatTraining('dark_wizard')">
                  Fight Dark Wizards
                </button>
              </div>
              <div class="card">
                <div style="text-align: center; margin-bottom: 1rem;">
                  <img src="./images/monsters/bandit.svg" alt="Bandit" style="width: 64px; height: 64px;">
                </div>
                <h3>🗡️ Highway Bandit</h3>
                <p>Level 22 required</p>
                <p>HP: 50 | Attack: 16 | Defence: 14</p>
                <p>Attack Speed: 3.5s | Drops: 35-70 coins</p>
                <p class="text-gold">20 XP per skill per kill</p>
                <button class="btn btn-primary" ${userSkill.level < 22 ? 'disabled' : ''} onclick="game.startCombatTraining('bandit')">
                  Fight Bandits
                </button>
              </div>
            </div>
          </div>

          <!-- High Level Monsters (25+) -->
          <div class="card mb-3">
            <div class="card-header">
              <h3>🔴 High Level Monsters (25+)</h3>
            </div>
            <div class="grid grid-3">
              <div class="card">
                <div style="text-align: center; margin-bottom: 1rem;">
                  <img src="./images/monsters/dragon.svg" alt="Dragon" style="width: 64px; height: 64px;">
                </div>
                <h3>🐉 Young Dragon</h3>
                <p>Level 30 required</p>
                <p>HP: 100 | Attack: 25 | Defence: 20</p>
                <p>Attack Speed: 5s | Drops: 100-200 coins</p>
                <p class="text-gold">30 XP per skill per kill</p>
                <button class="btn btn-primary" ${userSkill.level < 30 ? 'disabled' : ''} onclick="game.startCombatTraining('dragon')">
                  Fight Dragons
                </button>
              </div>
              <div class="card">
                <div style="text-align: center; margin-bottom: 1rem;">
                  <img src="./images/monsters/demon.svg" alt="Demon" style="width: 64px; height: 64px;">
                </div>
                <h3>👹 Lesser Demon</h3>
                <p>Level 35 required</p>
                <p>HP: 120 | Attack: 30 | Defence: 25</p>
                <p>Attack Speed: 4s | Drops: 150-300 coins</p>
                <p class="text-gold">35 XP per skill per kill</p>
                <button class="btn btn-primary" ${userSkill.level < 35 ? 'disabled' : ''} onclick="game.startCombatTraining('demon')">
                  Fight Demons
                </button>
              </div>
              <div class="card">
                <div style="text-align: center; margin-bottom: 1rem;">
                  <img src="./images/monsters/lich.svg" alt="Lich" style="width: 64px; height: 64px;">
                </div>
                <h3>💀 Ancient Lich</h3>
                <p>Level 40 required</p>
                <p>HP: 80 | Attack: 40 | Defence: 35</p>
                <p>Attack Speed: 3s | Drops: 200-400 coins</p>
                <p class="text-gold">40 XP per skill per kill</p>
                <button class="btn btn-primary" ${userSkill.level < 40 ? 'disabled' : ''} onclick="game.startCombatTraining('lich')">
                  Fight Liches
                </button>
              </div>
              <div class="card">
                <div style="text-align: center; margin-bottom: 1rem;">
                  <img src="./images/monsters/giant.svg" alt="Giant" style="width: 64px; height: 64px;">
                </div>
                <h3>👹 Mountain Giant</h3>
                <p>Level 45 required</p>
                <p>HP: 200 | Attack: 35 | Defence: 30</p>
                <p>Attack Speed: 6s | Drops: 300-600 coins</p>
                <p class="text-gold">45 XP per skill per kill</p>
                <button class="btn btn-primary" ${userSkill.level < 45 ? 'disabled' : ''} onclick="game.startCombatTraining('giant')">
                  Fight Giants
                </button>
              </div>
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
      
      case 'herblore':
        return `
          <div class="grid grid-3">
            <div class="card ${userSkill.level < 1 ? 'disabled-card' : ''}">
              <h3>Clean Herbs</h3>
              <p>Level 1 required</p>
              <p>12 XP per herb (2s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 1 ? 'disabled' : ''} onclick="game.trainSkill('herblore', 'clean_herbs', 12, 2000, 'Cleaning Herbs')">
                Clean Herbs
              </button>
            </div>
            <div class="card ${userSkill.level < 3 ? 'disabled-card' : ''}">
              <h3>Make Potions</h3>
              <p>Level 3 required</p>
              <p>25 XP per potion (4s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 3 ? 'disabled' : ''} onclick="game.trainSkill('herblore', 'make_potions', 25, 4000, 'Making Potions')">
                Make Potions
              </button>
            </div>
          </div>
        `;
      
      case 'crafting':
        return `
          <div class="grid grid-3">
            <div class="card ${userSkill.level < 1 ? 'disabled-card' : ''}">
              <h3>Make Jewelry</h3>
              <p>Level 1 required</p>
              <p>18 XP per item (3s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 1 ? 'disabled' : ''} onclick="game.trainSkill('crafting', 'make_jewelry', 18, 3000, 'Making Jewelry')">
                Make Jewelry
              </button>
            </div>
            <div class="card ${userSkill.level < 5 ? 'disabled-card' : ''}">
              <h3>Leather Work</h3>
              <p>Level 5 required</p>
              <p>30 XP per item (5s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 5 ? 'disabled' : ''} onclick="game.trainSkill('crafting', 'leather_work', 30, 5000, 'Leather Work')">
                Leather Work
              </button>
            </div>
          </div>
        `;
      
      case 'runecrafting':
        return `
          <div class="grid grid-3">
            <div class="card ${userSkill.level < 1 ? 'disabled-card' : ''}">
              <h3>Create Runes</h3>
              <p>Level 1 required</p>
              <p>20 XP per rune (4s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 1 ? 'disabled' : ''} onclick="game.trainSkill('runecrafting', 'create_runes', 20, 4000, 'Creating Runes')">
                Create Runes
              </button>
            </div>
            <div class="card ${userSkill.level < 10 ? 'disabled-card' : ''}">
              <h3>Enchant Items</h3>
              <p>Level 10 required</p>
              <p>50 XP per enchant (8s each)</p>
              <button class="btn btn-primary" ${userSkill.level < 10 ? 'disabled' : ''} onclick="game.trainSkill('runecrafting', 'enchant_items', 50, 8000, 'Enchanting Items')">
                Enchant Items
              </button>
            </div>
          </div>
        `;
      
      default:
        return '<p>Training actions for this skill are under development!</p>';
    }
  }

  renderProfile() {
    // Check if viewing another player's profile
    if (this.selectedPlayer && this.selectedPlayer !== this.currentUser.username) {
      return this.renderOtherPlayerProfile(this.selectedPlayer);
    }
    
    const totalLevel = Object.values(this.currentUser.skills).reduce((sum, skill) => sum + skill.level, 0);
    
    return `
      <div class="profile-container">
        <div class="dashboard-card">
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
            <h2 class="card-title">🏆 Achievements</h2>
            <div class="text-muted">Track your progress and unlock rewards</div>
          </div>
          
          <!-- Achievement Tabs -->
          <div style="display: flex; gap: 0.4rem; margin-bottom: 0.75rem; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="game.showAchievementTab('general')" id="achievement-tab-general">
              🌟 General
            </button>
            <button class="btn btn-secondary" onclick="game.showAchievementTab('skills')" id="achievement-tab-skills">
              ⚡ Skills
            </button>
            <button class="btn btn-secondary" onclick="game.showAchievementTab('combat')" id="achievement-tab-combat">
              ⚔️ Combat
            </button>
            <button class="btn btn-secondary" onclick="game.showAchievementTab('house')" id="achievement-tab-house">
              🏠 House
            </button>
            <button class="btn btn-secondary" onclick="game.showAchievementTab('guild')" id="achievement-tab-guild">
              🏛️ Guild
            </button>
          </div>
          
          <!-- Achievement Content -->
          <div id="achievement-content">
            ${this.renderGeneralAchievements()}
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3>🎨 Theme Settings</h3>
          </div>
          <div class="form-group">
            <label class="form-label">Choose Theme</label>
            <select id="theme-selector" class="form-input" onchange="game.changeTheme(this.value)">
              <option value="default">🌙 Dark (Default)</option>
              <option value="classic">⚔️ Classic OSRS</option>
              <option value="forest">🌲 Forest Green</option>
              <option value="ocean">🌊 Ocean Blue</option>
              <option value="fire">🔥 Fire Red</option>
              <option value="purple">🔮 Purple Magic</option>
              <option value="cyber">⚡ Cyber Neon</option>
            </select>
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
          <button class="btn btn-secondary" onclick="game.testLevelUp()" style="margin-top: 0.5rem;">
            🎉 Test Level Up Effect
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
    const currentCoins = this.currentUser.inventory.coins || 0;
    
    return `
      <div class="shop-container">
        <!-- Header -->
        <div class="dashboard-card">
          <div class="card-header">
            <h2 class="card-title">🏪 General Store</h2>
            <div class="text-muted">Buy essential items with coins</div>
            <div class="coins-display">
              <span class="coins-icon">🪙</span>
              <span class="coins-amount">${this.formatCoins(currentCoins)}</span>
            </div>
          </div>
        </div>
        
        <!-- Search -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>🔍 Search Starter Items</h3>
          </div>
          <div class="search-controls">
            <input type="text" id="shop-search" placeholder="Search items..." class="form-input" onkeyup="game.filterShopItems()">
            <button class="btn btn-secondary" onclick="game.clearShopFilters()">Clear</button>
          </div>
        </div>
        
        <!-- Shop Items Grid -->
        <div class="dashboard-card">
          <div class="card-header">
            <h3>🛒 Available Items</h3>
          </div>
          <div id="shop-items-container">
            ${this.renderShopItems()}
          </div>
        </div>
      </div>
    `;
  }

  renderShopItems() {
    // Only show starter/basic items in the shop
    const starterItems = [
      // Basic Tools
      { id: 'copper_pickaxe', name: 'Copper Pickaxe', category: 'tool', value: 25, level: 1, stats: { mining: 1 } },
      { id: 'copper_axe', name: 'Copper Axe', category: 'tool', value: 25, level: 1, stats: { woodcutting: 1 } },
      { id: 'copper_fishing_rod', name: 'Copper Fishing Rod', category: 'tool', value: 30, level: 1, stats: { fishing: 1 } },
      
      // Copper Equipment Only
      { id: 'copper_sword', name: 'Copper Sword', category: 'weapon', value: 50, level: 1, stats: { attack: 2, strength: 1 } },
      { id: 'copper_helmet', name: 'Copper Helmet', category: 'armor', value: 30, level: 1, stats: { defence: 2 } },
      { id: 'copper_platebody', name: 'Copper Platebody', category: 'armor', value: 80, level: 1, stats: { defence: 5 } },
      { id: 'copper_platelegs', name: 'Copper Platelegs', category: 'armor', value: 60, level: 1, stats: { defence: 3 } },
      { id: 'copper_boots', name: 'Copper Boots', category: 'armor', value: 20, level: 1, stats: { defence: 1 } },
      { id: 'copper_gloves', name: 'Copper Gloves', category: 'armor', value: 15, level: 1, stats: { defence: 1 } },
      
      // Basic Jewelry
      { id: 'gold_ring', name: 'Gold Ring', category: 'jewelry', value: 100, level: 1, stats: { defence: 1 } },
      { id: 'gold_necklace', name: 'Gold Necklace', category: 'jewelry', value: 200, level: 1, stats: { attack: 1, strength: 1 } },
      { id: 'cape', name: 'Cape', category: 'armor', value: 50, level: 1, stats: { defence: 1 } },
      
      // Seeds & Basic Supplies
      { id: 'potato_seed', name: 'Potato Seed', category: 'seed', value: 1 },
      { id: 'wheat_seed', name: 'Wheat Seed', category: 'seed', value: 3 },
      { id: 'vial', name: 'Vial', category: 'resource', value: 1 },
      
      // Basic Food
      { id: 'bread', name: 'Bread', category: 'food', value: 8, heals: 5 }
    ];

    const categories = {
      'tool': { name: '🔧 Basic Tools', items: [] },
      'weapon': { name: '⚔️ Bronze Weapons', items: [] },
      'armor': { name: '🛡️ Bronze Armor', items: [] },
      'jewelry': { name: '💎 Basic Jewelry', items: [] },
      'seed': { name: '🌱 Seeds & Supplies', items: [] },
      'food': { name: '🍖 Basic Food', items: [] }
    };

    // Organize starter items by category
    starterItems.forEach(item => {
      if (categories[item.category]) {
        categories[item.category].items.push(item);
      }
    });

    let html = '';
    Object.keys(categories).forEach(cat => {
      if (categories[cat].items.length > 0) {
        html += `
          <div class="card shop-category" data-category="${cat}" style="margin-bottom: 1rem;">
            <div class="card-header">
              <h3>${categories[cat].name}</h3>
            </div>
            <div class="grid grid-4">
              ${categories[cat].items.map(item => this.renderShopItem(item)).join('')}
            </div>
          </div>
        `;
      }
    });

    return html;
  }

  renderShopItem(item) {
    const canAfford = (this.currentUser.inventory.coins || 0) >= item.value;
    const hasLevel = !item.level || this.getPlayerLevel(item.level) >= item.level;
    const isDisabled = !canAfford || !hasLevel;
    
    let statsText = '';
    if (item.stats) {
      const statParts = [];
      if (item.stats.attack) statParts.push(`+${item.stats.attack} Atk`);
      if (item.stats.strength) statParts.push(`+${item.stats.strength} Str`);
      if (item.stats.defence) statParts.push(`+${item.stats.defence} Def`);
      if (item.stats.mining) statParts.push(`+${item.stats.mining} Mining`);
      if (item.stats.woodcutting) statParts.push(`+${item.stats.woodcutting} WC`);
      if (item.stats.fishing) statParts.push(`+${item.stats.fishing} Fish`);
      statsText = statParts.join(', ');
    }

    let healText = '';
    if (item.heals) {
      healText = `Heals: ${item.heals} HP`;
    }

    return `
      <div class="card shop-item-compact ${isDisabled ? 'disabled-card' : ''}" data-item-id="${item.id}" data-category="${item.category}">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <div style="font-size: 1.2rem;">${this.getItemIcon(item.id)}</div>
          <div style="flex: 1;">
            <h4 style="margin: 0; font-size: 0.9rem;">${item.name}</h4>
            <p style="margin: 0; font-weight: 600; color: var(--osrs-gold); font-size: 0.8rem;">
              ${this.formatCoins(item.value)}
            </p>
          </div>
        </div>
        
        ${statsText ? `<p class="text-muted" style="font-size: 0.7rem; margin: 0.25rem 0;">${statsText}</p>` : ''}
        ${healText ? `<p class="text-muted" style="font-size: 0.7rem; margin: 0.25rem 0;">${healText}</p>` : ''}
        
        <div style="display: flex; gap: 0.25rem; align-items: center; margin-top: 0.5rem;">
          <input type="number" id="qty-${item.id}" value="1" min="1" max="100" class="quantity-input" style="width: 50px; font-size: 0.75rem;">
          <button class="btn btn-primary btn-small" onclick="game.buyItemQuantity('${item.id}', ${item.value})" ${isDisabled ? 'disabled' : ''} style="font-size: 0.75rem; padding: 4px 8px;">
            Buy
          </button>
        </div>
        
        ${!canAfford ? '<p class="text-red" style="font-size: 0.65rem; text-align: center; margin: 0.25rem 0;">No coins</p>' : ''}
        ${!hasLevel ? '<p class="text-red" style="font-size: 0.65rem; text-align: center; margin: 0.25rem 0;">Low level</p>' : ''}
      </div>
    `;
  }

  filterShopItems() {
    const searchTerm = document.getElementById('shop-search').value.toLowerCase();
    const categories = document.querySelectorAll('.shop-category');

    categories.forEach(category => {
      const categoryItems = category.querySelectorAll('.shop-item-compact');
      let hasVisibleItems = false;
      
      categoryItems.forEach(item => {
        const itemName = item.querySelector('h4').textContent.toLowerCase();
        const itemVisible = !searchTerm || itemName.includes(searchTerm);
        
        if (itemVisible) {
          item.style.display = 'block';
          hasVisibleItems = true;
        } else {
          item.style.display = 'none';
        }
      });
      
      category.style.display = hasVisibleItems ? 'block' : 'none';
    });
  }

  clearShopFilters() {
    document.getElementById('shop-search').value = '';
    this.filterShopItems();
  }

  buyItemQuantity(itemId, pricePerItem) {
    const quantityInput = document.getElementById(`qty-${itemId}`);
    const quantity = parseInt(quantityInput.value) || 1;
    const totalPrice = pricePerItem * quantity;
    
    if (this.currentUser.inventory.coins < totalPrice) {
      this.showNotification(`Not enough coins! Need ${this.formatCoins(totalPrice)}, have ${this.formatCoins(this.currentUser.inventory.coins)}`);
      return;
    }
    
    this.currentUser.inventory.coins -= totalPrice;
    this.currentUser.inventory[itemId] = (this.currentUser.inventory[itemId] || 0) + quantity;
    
    const itemName = this.gameData.items[itemId].name;
    this.showNotification(`Bought ${quantity} ${itemName} for ${this.formatCoins(totalPrice)}!`);
    
    this.saveUserData();
    this.render();
  }

  getPlayerLevel(requiredLevel) {
    // For equipment items, we'll check the appropriate combat skill level
    // For other items, we'll check the relevant skill level
    const combatSkills = ['attack', 'strength', 'defence', 'hitpoints'];
    const combatLevel = combatSkills.reduce((max, skill) => {
      const level = this.currentUser.skills[skill]?.level || 1;
      return Math.max(max, level);
    }, 1);
    
    return combatLevel;
  }

  renderMarket() {
    const currentCoins = this.currentUser.inventory.coins || 0;
    
    return `
      <div class="market-container">
        <!-- Header -->
        <div class="dashboard-card">
          <div class="card-header">
            <h2 class="card-title">💰 Player Market</h2>
            <div class="text-muted">Trade items with other players</div>
            <div class="coins-display">
              <span class="coins-icon">🪙</span>
              <span class="coins-amount">${this.formatCoins(currentCoins)}</span>
            </div>
          </div>
        </div>
        
        <!-- Market Tabs -->
        <div class="market-tabs">
            <button class="btn btn-primary" onclick="game.showMarketTab('browse')" id="market-tab-browse">
              🔍 Browse Items
            </button>
            <button class="btn btn-secondary" onclick="game.showMarketTab('sell')" id="market-tab-sell">
              💰 Sell Items
            </button>
            <button class="btn btn-secondary" onclick="game.showMarketTab('orders')" id="market-tab-orders">
              📋 My Orders
            </button>
            <button class="btn btn-secondary" onclick="game.showMarketTab('history')" id="market-tab-history">
              📊 History
            </button>
        </div>
        
        <!-- Market Content -->
        <div class="dashboard-card">
          <div id="market-content">
            ${this.renderMarketBrowse()}
          </div>
        </div>
      </div>
    `;
  }

  renderMarketBrowse() {
    // Simulate some market listings from "other players"
    const marketListings = this.generateMarketListings();
    
    return `
      <div class="card">
        <div class="card-header">
          <h3>🔍 Browse Market Listings</h3>
          <div style="display: flex; gap: 1rem; align-items: center; margin-top: 1rem;">
            <input type="text" id="market-search" placeholder="Search items..." class="form-input" style="flex: 1;" onkeyup="game.filterMarketItems()">
            <select id="market-category" class="form-input" onchange="game.filterMarketItems()" style="min-width: 150px;">
              <option value="">All Categories</option>
              <option value="weapon">⚔️ Weapons</option>
              <option value="armor">🛡️ Armor</option>
              <option value="jewelry">💎 Jewelry</option>
              <option value="resource">📦 Resources</option>
              <option value="food">🍖 Food</option>
            </select>
            <button class="btn btn-secondary" onclick="game.clearMarketFilters()">Clear</button>
          </div>
        </div>
        
        <div class="grid grid-2">
          ${marketListings.map(listing => this.renderMarketListing(listing)).join('')}
        </div>
      </div>
    `;
  }

  renderMarketSell() {
    const userInventory = this.currentUser.inventory;
    const sellableItems = Object.keys(userInventory).filter(itemId => 
      itemId !== 'coins' && userInventory[itemId] > 0 && this.gameData.items[itemId]
    );
    
    return `
      <div class="card">
        <div class="card-header">
          <h3>💰 List Items for Sale</h3>
        </div>
        
        <div class="grid grid-2">
          ${sellableItems.map(itemId => this.renderSellItem(itemId, userInventory[itemId])).join('')}
        </div>
      </div>
    `;
  }

  renderMarketOrders() {
    const userOrders = this.currentUser.marketOrders || [];
    
    return `
      <div class="card">
        <div class="card-header">
          <h3>📋 My Market Orders</h3>
        </div>
        
        ${userOrders.length === 0 ? `
          <div class="text-center" style="padding: 2rem;">
            <p class="text-muted">No active orders</p>
            <p>List items for sale or create buy orders to see them here.</p>
          </div>
        ` : `
          <div class="grid grid-1">
            ${userOrders.map(order => this.renderMarketOrder(order)).join('')}
          </div>
        `}
      </div>
    `;
  }

  renderMarketHistory() {
    const userHistory = this.currentUser.marketHistory || [];
    
    return `
      <div class="card">
        <div class="card-header">
          <h3>📊 Trading History</h3>
        </div>
        
        ${userHistory.length === 0 ? `
          <div class="text-center" style="padding: 2rem;">
            <p class="text-muted">No trading history</p>
            <p>Your completed trades will appear here.</p>
          </div>
        ` : `
          <div class="grid grid-1">
            ${userHistory.map(transaction => this.renderMarketTransaction(transaction)).join('')}
          </div>
        `}
      </div>
    `;
  }

  generateMarketListings() {
    // This will fetch real market listings from the server when multiplayer is enabled
    // For now, return empty array since we're in local development mode
    return this.currentUser.marketListings || [];
  }

  async fetchMarketListings() {
    // This will be called when multiplayer is enabled
    try {
      const response = await fetch('/api/market/listings');
      if (response.ok) {
        const listings = await response.json();
        this.currentUser.marketListings = listings;
        return listings;
      }
    } catch (error) {
      console.log('Market API not available (local mode)');
    }
    return [];
  }

  async createMarketListing(itemId, quantity, price) {
    // This will create a real market listing when multiplayer is enabled
    try {
      const response = await fetch('/api/market/listings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: itemId,
          quantity: quantity,
          price: price,
          sellerId: this.currentUser.id
        })
      });
      
      if (response.ok) {
        const listing = await response.json();
        this.showNotification(`Listed ${quantity} ${this.gameData.items[itemId].name} for ${this.formatCoins(price)} each!`);
        return listing;
      }
    } catch (error) {
      console.log('Market API not available (local mode)');
      this.showNotification('Market listing feature will be available when multiplayer is enabled!');
    }
    return null;
  }


  renderMarketListing(listing) {
    const canAfford = (this.currentUser.inventory.coins || 0) >= listing.price;
    const totalPrice = listing.price * listing.quantity;
    const isOwnListing = listing.sellerId === this.currentUser.id;
    
    return `
      <div class="card market-listing ${!canAfford || isOwnListing ? 'disabled-card' : ''}">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <div style="font-size: 1.2rem;">${this.getItemIcon(listing.itemId)}</div>
          <div style="flex: 1;">
            <h4 style="margin: 0; font-size: 0.9rem;">${listing.itemName}</h4>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Seller: ${listing.sellerName}</p>
          </div>
        </div>
        
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
          <div>
            <p style="margin: 0; font-weight: 600; color: var(--osrs-gold);">${this.formatCoins(listing.price)} each</p>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Qty: ${listing.quantity}</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Total: ${this.formatCoins(totalPrice)}</p>
            <p style="margin: 0; font-size: 0.7rem; color: var(--text-muted);">${this.formatTimeLeft(listing.expiresAt)}</p>
          </div>
        </div>
        
        ${isOwnListing ? `
          <div style="text-align: center;">
            <p style="margin: 0; font-size: 0.7rem; color: var(--text-muted);">Your listing</p>
            <button class="btn btn-danger btn-small" onclick="game.cancelMarketListing('${listing.id}')" style="font-size: 0.75rem; padding: 4px 8px; margin-top: 0.25rem;">
              Cancel
            </button>
          </div>
        ` : `
          <div style="display: flex; gap: 0.25rem;">
            <input type="number" id="buy-qty-${listing.id}" value="1" min="1" max="${listing.quantity}" class="quantity-input" style="width: 60px; font-size: 0.75rem;">
            <button class="btn btn-primary btn-small" onclick="game.buyFromMarket('${listing.id}')" ${!canAfford ? 'disabled' : ''} style="font-size: 0.75rem; padding: 4px 8px;">
              Buy
            </button>
          </div>
          ${!canAfford ? '<p class="text-red" style="font-size: 0.65rem; text-align: center; margin: 0.25rem 0;">No coins</p>' : ''}
        `}
      </div>
    `;
  }

  formatTimeLeft(expiresAt) {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const diff = expires - now;
    
    if (diff <= 0) return 'Expired';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  }

  renderSellItem(itemId, quantity) {
    const item = this.gameData.items[itemId];
    const basePrice = item.value;
    
    return `
      <div class="card">
        <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;">
          <div style="font-size: 1.2rem;">${this.getItemIcon(itemId)}</div>
          <div style="flex: 1;">
            <h4 style="margin: 0; font-size: 0.9rem;">${item.name}</h4>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">You have: ${quantity}</p>
          </div>
        </div>
        
        <div style="display: flex; gap: 0.25rem; align-items: center; margin-bottom: 0.5rem;">
          <input type="number" id="sell-qty-${itemId}" value="1" min="1" max="${quantity}" class="quantity-input" style="width: 60px; font-size: 0.75rem;">
          <input type="number" id="sell-price-${itemId}" value="${basePrice}" min="1" class="quantity-input" style="width: 80px; font-size: 0.75rem;" placeholder="Price">
          <button class="btn btn-primary btn-small" onclick="game.listItemForSale('${itemId}')" style="font-size: 0.75rem; padding: 4px 8px;">
            List
          </button>
        </div>
        
        <p style="margin: 0; font-size: 0.7rem; color: var(--text-muted);">Base value: ${this.formatCoins(basePrice)}</p>
      </div>
    `;
  }

  async listItemForSale(itemId) {
    const quantityInput = document.getElementById(`sell-qty-${itemId}`);
    const priceInput = document.getElementById(`sell-price-${itemId}`);
    const quantity = parseInt(quantityInput.value) || 1;
    const price = parseInt(priceInput.value) || 1;
    
    if (quantity > (this.currentUser.inventory[itemId] || 0)) {
      this.showNotification('You don\'t have enough of this item!');
      return;
    }
    
    if (price < 1) {
      this.showNotification('Price must be at least 1 coin!');
      return;
    }
    
    // Remove items from inventory
    this.currentUser.inventory[itemId] -= quantity;
    
    // Create market listing
    const listing = await this.createMarketListing(itemId, quantity, price);
    
    if (listing) {
      // Add to user's market orders
      if (!this.currentUser.marketOrders) this.currentUser.marketOrders = [];
      this.currentUser.marketOrders.push({
        id: listing.id,
        type: 'sell',
        itemId: itemId,
        itemName: this.gameData.items[itemId].name,
        quantity: quantity,
        price: price,
        createdAt: new Date().toISOString()
      });
      
      this.saveUserData();
      this.render();
    } else {
      // Restore items if listing failed
      this.currentUser.inventory[itemId] += quantity;
    }
  }

  async cancelMarketListing(listingId) {
    try {
      const response = await fetch(`/api/market/listings/${listingId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: this.currentUser.id })
      });
      
      if (response.ok) {
        this.showNotification('Market listing cancelled!');
        // Remove from user's orders
        this.currentUser.marketOrders = this.currentUser.marketOrders.filter(order => order.id !== listingId);
        this.saveUserData();
        this.render();
      }
    } catch (error) {
      console.log('Market API not available (local mode)');
      this.showNotification('Market cancellation will be available when multiplayer is enabled!');
    }
  }

  renderMarketOrder(order) {
    return `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="margin: 0; font-size: 0.9rem;">${order.type === 'sell' ? 'Selling' : 'Buying'} ${order.itemName}</h4>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Qty: ${order.quantity} @ ${this.formatCoins(order.price)} each</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Total: ${this.formatCoins(order.price * order.quantity)}</p>
            <button class="btn btn-danger btn-small" onclick="game.cancelMarketOrder('${order.id}')" style="font-size: 0.75rem; padding: 4px 8px;">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;
  }

  renderMarketTransaction(transaction) {
    return `
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <h4 style="margin: 0; font-size: 0.9rem;">${transaction.type === 'bought' ? 'Bought' : 'Sold'} ${transaction.itemName}</h4>
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Qty: ${transaction.quantity} @ ${this.formatCoins(transaction.price)} each</p>
          </div>
          <div style="text-align: right;">
            <p style="margin: 0; font-size: 0.8rem; color: var(--text-muted);">Total: ${this.formatCoins(transaction.price * transaction.quantity)}</p>
            <p style="margin: 0; font-size: 0.7rem; color: var(--text-muted);">${transaction.date}</p>
          </div>
        </div>
      </div>
    `;
  }

  showMarketTab(tab) {
    // Update tab buttons
    document.querySelectorAll('[id^="market-tab-"]').forEach(btn => {
      btn.className = 'btn btn-secondary';
    });
    document.getElementById(`market-tab-${tab}`).className = 'btn btn-primary';
    
    // Update content
    const content = document.getElementById('market-content');
    switch(tab) {
      case 'browse':
        content.innerHTML = this.renderMarketBrowse();
        break;
      case 'sell':
        content.innerHTML = this.renderMarketSell();
        break;
      case 'orders':
        content.innerHTML = this.renderMarketOrders();
        break;
      case 'history':
        content.innerHTML = this.renderMarketHistory();
        break;
    }
  }

  filterMarketItems() {
    const searchTerm = document.getElementById('market-search').value.toLowerCase();
    const categoryFilter = document.getElementById('market-category').value;
    const listings = document.querySelectorAll('.market-listing');

    listings.forEach(listing => {
      const itemName = listing.querySelector('h4').textContent.toLowerCase();
      const itemCategory = this.gameData.items[listing.dataset.itemId]?.category || '';
      const itemVisible = (!searchTerm || itemName.includes(searchTerm)) && 
                         (!categoryFilter || itemCategory === categoryFilter);
      
      listing.style.display = itemVisible ? 'block' : 'none';
    });
  }

  clearMarketFilters() {
    document.getElementById('market-search').value = '';
    document.getElementById('market-category').value = '';
    this.filterMarketItems();
  }

  async buyFromMarket(listingId) {
    const quantityInput = document.getElementById(`buy-qty-${listingId}`);
    const quantity = parseInt(quantityInput.value) || 1;
    
    // Find the listing
    const listing = this.currentUser.marketListings?.find(l => l.id === listingId);
    if (!listing) {
      this.showNotification('Listing not found!');
      return;
    }
    
    if (quantity > listing.quantity) {
      this.showNotification('Not enough quantity available!');
      return;
    }
    
    const totalPrice = listing.price * quantity;
    if (totalPrice > (this.currentUser.inventory.coins || 0)) {
      this.showNotification('Not enough coins!');
      return;
    }
    
    // Process the purchase via API
    const result = await this.processMarketPurchase(listingId, quantity);
    
    if (result) {
      // Add items to inventory
      this.currentUser.inventory[listing.itemId] = (this.currentUser.inventory[listing.itemId] || 0) + quantity;
      
      // Add to trading history
      if (!this.currentUser.marketHistory) this.currentUser.marketHistory = [];
      this.currentUser.marketHistory.push({
        type: 'bought',
        itemId: listing.itemId,
        itemName: listing.itemName,
        quantity: quantity,
        price: listing.price,
        totalPrice: totalPrice,
        sellerName: listing.sellerName,
        date: new Date().toLocaleDateString()
      });
      
      this.saveUserData();
      this.render();
    }
  }

  async processMarketPurchase(listingId, quantity) {
    // This will process the actual purchase via API when multiplayer is enabled
    try {
      const response = await fetch('/api/market/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId: listingId,
          quantity: quantity,
          buyerId: this.currentUser.id
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        this.showNotification(`Bought ${quantity} ${result.itemName} for ${this.formatCoins(result.totalPrice)}!`);
        return result;
      }
    } catch (error) {
      console.log('Market API not available (local mode)');
      this.showNotification('Market purchasing will be available when multiplayer is enabled!');
    }
    return null;
  }

  cancelMarketOrder(orderId) {
    // Remove from user's orders
    this.currentUser.marketOrders = this.currentUser.marketOrders.filter(order => order.id !== orderId);
    this.saveUserData();
    this.render();
    this.showNotification('Order cancelled!');
  }

  renderQuests() {
    try {
      const currentCoins = this.currentUser.inventory.coins || 0;
      
      return `
      <div class="quest-container">
        <!-- Header -->
        <div class="dashboard-card">
          <div class="card-header">
            <h2 class="card-title">📜 Quest System</h2>
            <div class="text-muted">Complete quests for rewards and progression</div>
            <div class="coins-display">
              <span class="coins-icon">🪙</span>
              <span class="coins-amount">${this.formatCoins(currentCoins)}</span>
            </div>
          </div>
        </div>
        
        <!-- Quest Tabs -->
        <div class="quest-tabs">
          <button class="btn btn-primary" onclick="game.showQuestTab('daily')" id="quest-tab-daily">
            🌅 Daily Quests
          </button>
          <button class="btn btn-secondary" onclick="game.showQuestTab('weekly')" id="quest-tab-weekly">
            📅 Weekly Quests
          </button>
          <button class="btn btn-secondary" onclick="game.showQuestTab('story')" id="quest-tab-story">
            📖 Story Quests
          </button>
        </div>
        
        <!-- Quest Content -->
        <div class="dashboard-card">
          <div id="quest-content">
            ${this.renderDailyQuests()}
          </div>
        </div>
      </div>
    `;
    } catch (error) {
      console.error('Error in renderQuests:', error);
      return `
        <div class="dashboard-card">
          <div class="card-header">
            <h2 class="card-title">📜 Quest System</h2>
            <div class="text-muted">Error loading quests</div>
          </div>
          <div class="card-body">
            <p>There was an error loading the quest system. Please try refreshing the page.</p>
            <p>Error: ${error.message}</p>
          </div>
        </div>
      `;
    }
  }

  renderDailyQuests() {
    const dailyQuests = this.getDailyQuests();
    
    return `
      <div class="card">
        <div class="card-header">
          <h3>🌅 Daily Quests</h3>
          <div class="text-muted">Reset every 24 hours</div>
        </div>
        
        <div class="grid grid-3">
          ${dailyQuests.map(quest => this.renderQuestCard(quest)).join('')}
        </div>
      </div>
    `;
  }

  renderWeeklyQuests() {
    const weeklyQuests = this.getWeeklyQuests();
    
    return `
      <div class="card">
        <div class="card-header">
          <h3>📅 Weekly Quests</h3>
          <div class="text-muted">Reset every 7 days</div>
        </div>
        
        <div class="grid grid-3">
          ${weeklyQuests.map(quest => this.renderQuestCard(quest)).join('')}
        </div>
      </div>
    `;
  }

  renderStoryQuests() {
    const storyQuests = this.getStoryQuests();
    
    return `
      <div class="card">
        <div class="card-header">
          <h3>📖 Story Quests</h3>
          <div class="text-muted">Main storyline progression</div>
        </div>
        
        <div class="grid grid-1">
          ${storyQuests.map(quest => this.renderQuestCard(quest)).join('')}
        </div>
      </div>
    `;
  }

  renderAchievements() {
    const achievements = this.getAchievements();
    
    return `
      <div class="card">
        <div class="card-header">
          <h3>🏆 Achievements</h3>
          <div class="text-muted">Permanent milestones and rewards</div>
        </div>
        
        <div class="grid grid-3">
          ${achievements.map(achievement => this.renderAchievementCard(achievement)).join('')}
        </div>
      </div>
    `;
  }

  getDailyQuests() {
    try {
      return [
        {
          id: 'daily_woodcutting',
          name: '🪓 Lumberjack\'s Request',
          description: 'Cut 25 logs of any type',
          type: 'gathering',
          objective: { skill: 'woodcutting', amount: 25 },
          reward: { xp: 500, coins: 100 },
          resetDaily: true
        },
        {
          id: 'daily_mining',
          name: '⛏️ Miner\'s Challenge',
          description: 'Mine 20 ores of any type',
          type: 'gathering',
          objective: { skill: 'mining', amount: 20 },
          reward: { xp: 300, coins: 150 },
          resetDaily: true
        },
        {
          id: 'daily_cooking',
          name: '🍳 Chef\'s Order',
          description: 'Cook 10 food items',
          type: 'production',
          objective: { skill: 'cooking', amount: 10 },
          reward: { xp: 400, coins: 75 },
          resetDaily: true
        },
        {
          id: 'daily_combat',
          name: '⚔️ Warrior\'s Trial',
          description: 'Defeat 5 monsters',
          type: 'combat',
          objective: { skill: 'combat', amount: 5 },
          reward: { xp: 750, coins: 200 },
          resetDaily: true
        },
        {
          id: 'daily_fishing',
          name: '🎣 Angler\'s Quest',
          description: 'Catch 15 fish of any type',
          type: 'gathering',
          objective: { skill: 'fishing', amount: 15 },
          reward: { xp: 350, coins: 120 },
          resetDaily: true
        },
        {
          id: 'daily_smithing',
          name: '🔨 Blacksmith\'s Task',
          description: 'Smith 8 metal items',
          type: 'production',
          objective: { skill: 'smithing', amount: 8 },
          reward: { xp: 600, coins: 180 },
          resetDaily: true
        }
      ];
    } catch (error) {
      console.error('Error in getDailyQuests:', error);
      return [];
    }
  }

  getWeeklyQuests() {
    return [
      {
        id: 'weekly_mastery',
        name: '🎯 Skill Mastery',
        description: 'Reach level 10 in any skill',
        type: 'progression',
        objective: { skill: 'any', level: 10 },
        reward: { xp: 2000, coins: 500, items: ['iron_sword'] },
        resetWeekly: true
      },
      {
        id: 'weekly_wealth',
        name: '💰 Wealth Accumulator',
        description: 'Earn 1000 coins',
        type: 'economy',
        objective: { type: 'coins', amount: 1000 },
        reward: { xp: 1000, coins: 200, items: ['gold_ring'] },
        resetWeekly: true
      },
      {
        id: 'weekly_explorer',
        name: '🗺️ Explorer',
        description: 'Complete 10 different activities',
        type: 'variety',
        objective: { type: 'activities', amount: 10 },
        reward: { xp: 1500, coins: 300, items: ['cape'] },
        resetWeekly: true
      },
      {
        id: 'weekly_combat_master',
        name: '⚔️ Combat Master',
        description: 'Defeat 50 monsters',
        type: 'combat',
        objective: { skill: 'combat', amount: 50 },
        reward: { xp: 3000, coins: 800, items: ['steel_sword'] },
        resetWeekly: true
      },
      {
        id: 'weekly_crafter',
        name: '🔨 Master Crafter',
        description: 'Create 25 items',
        type: 'production',
        objective: { type: 'crafting', amount: 25 },
        reward: { xp: 2500, coins: 600, items: ['steel_helmet'] },
        resetWeekly: true
      },
      {
        id: 'weekly_gatherer',
        name: '🌿 Resource Gatherer',
        description: 'Gather 100 resources',
        type: 'gathering',
        objective: { type: 'gathering', amount: 100 },
        reward: { xp: 1800, coins: 400, items: ['iron_pickaxe'] },
        resetWeekly: true
      },
      {
        id: 'weekly_achiever',
        name: '🏆 Achievement Hunter',
        description: 'Complete 5 achievements',
        type: 'milestone',
        objective: { type: 'achievements', amount: 5 },
        reward: { xp: 4000, coins: 1000, items: ['sapphire_ring'] },
        resetWeekly: true
      }
    ];
  }

  getStoryQuests() {
    return [
      {
        id: 'story_beginner',
        name: '🌱 The Beginning',
        description: 'Complete your first gathering activity',
        type: 'story',
        objective: { type: 'first_activity', amount: 1 },
        reward: { xp: 100, coins: 50, items: ['bronze_pickaxe'] },
        prerequisite: null
      },
      {
        id: 'story_warrior',
        name: '⚔️ Path of the Warrior',
        description: 'Defeat your first monster',
        type: 'story',
        objective: { type: 'first_combat', amount: 1 },
        reward: { xp: 200, coins: 100, items: ['bronze_sword'] },
        prerequisite: 'story_beginner'
      },
      {
        id: 'story_crafter',
        name: '🔨 The Art of Crafting',
        description: 'Create your first item',
        type: 'story',
        objective: { type: 'first_craft', amount: 1 },
        reward: { xp: 300, coins: 150, items: ['bronze_helmet'] },
        prerequisite: 'story_warrior'
      }
    ];
  }

  getAchievements() {
    return [
      {
        id: 'ach_first_steps',
        name: '👶 First Steps',
        description: 'Complete your first quest',
        type: 'milestone',
        objective: { type: 'quests_completed', amount: 1 },
        reward: { xp: 500, coins: 100, items: ['bronze_axe'] }
      },
      {
        id: 'ach_skill_master',
        name: '🎓 Skill Master',
        description: 'Reach level 25 in any skill',
        type: 'progression',
        objective: { type: 'skill_level', amount: 25 },
        reward: { xp: 5000, coins: 1000, items: ['steel_sword'] }
      },
      {
        id: 'ach_wealthy',
        name: '💎 Wealthy',
        description: 'Accumulate 10,000 coins',
        type: 'economy',
        objective: { type: 'total_coins', amount: 10000 },
        reward: { xp: 2000, coins: 500, items: ['sapphire_ring'] }
      },
      {
        id: 'ach_explorer',
        name: '🗺️ Explorer',
        description: 'Complete 50 different activities',
        type: 'variety',
        objective: { type: 'activities_completed', amount: 50 },
        reward: { xp: 3000, coins: 750, items: ['magic_cape'] }
      }
    ];
  }

  renderQuestCard(quest) {
    const progress = this.getQuestProgress(quest.id);
    const completed = this.isQuestCompleted(quest.id);
    const accepted = this.isQuestAccepted(quest.id);
    const progressPercent = (progress.current / progress.required) * 100;
    const canComplete = progress.current >= progress.required && !completed;
    
    return `
      <div class="card quest-card ${completed ? 'quest-completed' : ''} ${accepted ? 'quest-accepted' : ''}">
        <div class="quest-header">
          <h3>${quest.name} ${accepted ? '✓' : ''}</h3>
          <div class="quest-type">${this.getQuestTypeIcon(quest.type)}</div>
        </div>
        
        <p class="quest-description">${quest.description}</p>
        
        <div class="quest-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(progressPercent, 100)}%"></div>
          </div>
          <div class="progress-text">${progress.current} / ${progress.required}</div>
        </div>
        
        <div class="quest-reward">
          <strong>Reward:</strong>
          ${quest.reward.xp ? `<span class="reward-xp">+${quest.reward.xp} XP</span>` : ''}
          ${quest.reward.coins ? `<span class="reward-coins">+${this.formatCoins(quest.reward.coins)}</span>` : ''}
          ${quest.reward.items ? quest.reward.items.map(item => `<span class="reward-item">${this.getItemIcon(item)} ${this.gameData.items[item]?.name}</span>`).join('') : ''}
        </div>
        
        <div class="quest-actions">
          ${canComplete ? `
            <button class="btn btn-success" onclick="game.completeQuest('${quest.id}')">
              Complete Quest
            </button>
          ` : completed ? `
            <button class="btn btn-secondary" disabled>
              ✓ Completed
            </button>
          ` : accepted ? `
            <button class="btn btn-info" disabled>
              ✓ Accepted - In Progress
            </button>
          ` : `
            <button class="btn btn-primary" onclick="game.acceptQuest('${quest.id}')">
              Accept Quest
            </button>
          `}
        </div>
      </div>
    `;
  }

  renderAchievementCard(achievement) {
    const progress = this.getQuestProgress(achievement.id);
    const completed = this.isQuestCompleted(achievement.id);
    const progressPercent = (progress.current / progress.required) * 100;
    const canComplete = progress.current >= progress.required && !completed;
    
    return `
      <div class="card achievement-card ${completed ? 'achievement-completed' : ''}">
        <div class="achievement-header">
          <h3>${achievement.name}</h3>
          <div class="achievement-type">🏆</div>
        </div>
        
        <p class="achievement-description">${achievement.description}</p>
        
        <div class="achievement-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${Math.min(progressPercent, 100)}%"></div>
          </div>
          <div class="progress-text">${progress.current} / ${progress.required}</div>
        </div>
        
        <div class="achievement-reward">
          <strong>Reward:</strong>
          ${achievement.reward.xp ? `<span class="reward-xp">+${achievement.reward.xp} XP</span>` : ''}
          ${achievement.reward.coins ? `<span class="reward-coins">+${this.formatCoins(achievement.reward.coins)}</span>` : ''}
          ${achievement.reward.items ? achievement.reward.items.map(item => `<span class="reward-item">${this.getItemIcon(item)} ${this.gameData.items[item]?.name}</span>`).join('') : ''}
        </div>
        
        <div class="achievement-actions">
          ${canComplete ? `
            <button class="btn btn-success" onclick="game.completeQuest('${achievement.id}')">
              Claim Reward
            </button>
          ` : completed ? `
            <button class="btn btn-secondary" disabled>
              ✓ Claimed
            </button>
          ` : `
            <button class="btn btn-primary" disabled>
              In Progress
            </button>
          `}
        </div>
      </div>
    `;
  }

  getQuestTypeIcon(type) {
    const icons = {
      'gathering': '🪓',
      'production': '🔨',
      'combat': '⚔️',
      'progression': '📈',
      'economy': '💰',
      'variety': '🎯',
      'story': '📖',
      'milestone': '🏆'
    };
    return icons[type] || '📜';
  }

  getQuestProgress(questId) {
    if (!this.currentUser.questProgress) {
      this.currentUser.questProgress = {};
    }
    
    const quest = this.getQuestById(questId);
    if (!quest) {
      return { current: 0, required: 1 };
    }
    
    let current = 0;
    const required = quest.objective.amount;
    
    switch(quest.objective.type) {
      case 'skill':
        if (quest.objective.skill === 'any') {
          // Find highest skill level
          current = Math.max(...Object.values(this.currentUser.skills).map(skill => skill.level));
        } else {
          current = this.currentUser.skills[quest.objective.skill]?.level || 0;
        }
        break;
      case 'coins':
        current = this.currentUser.inventory.coins || 0;
        break;
      case 'activities':
        current = this.currentUser.questProgress.activitiesCompleted || 0;
        break;
      case 'first_activity':
        current = this.currentUser.questProgress.firstActivityCompleted ? 1 : 0;
        break;
      case 'first_combat':
        current = this.currentUser.questProgress.firstCombatCompleted ? 1 : 0;
        break;
      case 'first_craft':
        current = this.currentUser.questProgress.firstCraftCompleted ? 1 : 0;
        break;
      case 'quests_completed':
        current = this.currentUser.questProgress.questsCompleted || 0;
        break;
      case 'skill_level':
        if (quest.objective.skill === 'any') {
          current = Math.max(...Object.values(this.currentUser.skills).map(skill => skill.level));
        } else {
          current = this.currentUser.skills[quest.objective.skill]?.level || 0;
        }
        break;
      case 'total_coins':
        current = this.currentUser.questProgress.totalCoinsEarned || 0;
        break;
      case 'activities_completed':
        current = this.currentUser.questProgress.activitiesCompleted || 0;
        break;
      default:
        // For skill-based objectives
        if (quest.objective.skill) {
          current = this.getSkillProgress(quest.objective.skill, quest.objective.amount);
        }
        break;
    }
    
    return { current: Math.min(current, required), required };
  }

  getSkillProgress(skill, amount) {
    if (skill === 'woodcutting') {
      return (this.currentUser.inventory.logs || 0) + (this.currentUser.inventory.oak_logs || 0);
    } else if (skill === 'mining') {
      return (this.currentUser.inventory.copper_ore || 0) + (this.currentUser.inventory.iron_ore || 0);
    } else if (skill === 'cooking') {
      return (this.currentUser.inventory.cooked_shrimp || 0) + (this.currentUser.inventory.bread || 0);
    } else if (skill === 'combat') {
      return this.currentUser.questProgress.monstersDefeated || 0;
    }
    return 0;
  }

  getQuestById(questId) {
    try {
      const allQuests = [
        ...this.getDailyQuests(),
        ...this.getWeeklyQuests(),
        ...this.getStoryQuests(),
        ...this.getAchievements()
      ];
      return allQuests.find(quest => quest.id === questId);
    } catch (error) {
      console.error('Error in getQuestById:', error);
      return null;
    }
  }

  isQuestCompleted(questId) {
    if (!this.currentUser.questProgress) {
      this.currentUser.questProgress = {};
    }
    return this.currentUser.questProgress[questId]?.completed || false;
  }

  isQuestAccepted(questId) {
    if (!this.currentUser.questProgress) {
      this.currentUser.questProgress = {};
    }
    return this.currentUser.questProgress[questId]?.accepted || false;
  }

  updateQuestProgress(questId, progress) {
    if (!this.currentUser.questProgress) {
      this.currentUser.questProgress = {};
    }
    if (!this.currentUser.questProgress[questId]) {
      this.currentUser.questProgress[questId] = { completed: false, progress: 0 };
    }
    this.currentUser.questProgress[questId].progress = progress;
  }

  markQuestCompleted(questId) {
    if (!this.currentUser.questProgress) {
      this.currentUser.questProgress = {};
    }
    if (!this.currentUser.questProgress[questId]) {
      this.currentUser.questProgress[questId] = { completed: false, progress: 0 };
    }
    this.currentUser.questProgress[questId].completed = true;
  }

  showQuestTab(tab) {
    // Update tab buttons
    document.querySelectorAll('[id^="quest-tab-"]').forEach(btn => {
      btn.className = 'btn btn-secondary';
    });
    document.getElementById(`quest-tab-${tab}`).className = 'btn btn-primary';
    
    // Update content
    const content = document.getElementById('quest-content');
    switch(tab) {
      case 'daily':
        content.innerHTML = this.renderDailyQuests();
        break;
      case 'weekly':
        content.innerHTML = this.renderWeeklyQuests();
        break;
      case 'story':
        content.innerHTML = this.renderStoryQuests();
        break;
    }
  }

  acceptQuest(questId) {
    if (!this.currentUser.questProgress) {
      this.currentUser.questProgress = {};
    }
    
    const quest = this.getQuestById(questId);
    if (!quest) {
      this.showNotification('Quest not found!');
      return;
    }
    
    // Check prerequisites
    if (quest.prerequisite && !this.isQuestCompleted(quest.prerequisite)) {
      this.showNotification('Complete prerequisite quest first!');
      return;
    }
    
    // Accept the quest
    this.currentUser.questProgress[questId] = {
      accepted: true,
      completed: false,
      progress: 0,
      acceptedAt: new Date().toISOString()
    };
    
    this.saveUserData();
    this.render();
    this.showNotification(`Quest "${quest.name}" accepted!`);
  }

  completeQuest(questId) {
    if (!this.currentUser.questProgress) {
      this.currentUser.questProgress = {};
    }
    
    const quest = this.getQuestById(questId);
    if (!quest) {
      this.showNotification('Quest not found!');
      return;
    }
    
    const progress = this.getQuestProgress(questId);
    if (progress.current < progress.required) {
      this.showNotification('Quest not yet complete!');
      return;
    }
    
    if (this.isQuestCompleted(questId)) {
      this.showNotification('Quest already completed!');
      return;
    }
    
    // Mark quest as completed
    this.markQuestCompleted(questId);
    
    // Give rewards
    let rewardText = 'Quest completed! Rewards: ';
    const rewards = [];
    
    if (quest.reward.xp) {
      // Add XP to appropriate skill
      if (quest.objective.skill && quest.objective.skill !== 'any') {
        this.addXP(quest.objective.skill, quest.reward.xp);
        rewards.push(`+${quest.reward.xp} ${quest.objective.skill} XP`);
      } else {
        // Add XP to all skills or highest skill
        const skills = Object.keys(this.currentUser.skills);
        skills.forEach(skill => {
          this.addXP(skill, Math.floor(quest.reward.xp / skills.length));
        });
        rewards.push(`+${quest.reward.xp} XP (all skills)`);
      }
    }
    
    if (quest.reward.coins) {
      this.addCoins(quest.reward.coins);
      rewards.push(`+${this.formatCoins(quest.reward.coins)}`);
    }
    
    if (quest.reward.items) {
      quest.reward.items.forEach(itemId => {
        this.currentUser.inventory[itemId] = (this.currentUser.inventory[itemId] || 0) + 1;
        rewards.push(`${this.getItemIcon(itemId)} ${this.gameData.items[itemId]?.name}`);
      });
    }
    
    // Update quest progress counters
    this.currentUser.questProgress.questsCompleted = (this.currentUser.questProgress.questsCompleted || 0) + 1;
    
    this.saveUserData();
    this.render();
    this.showNotification(`Quest completed! ${rewards.join(', ')}`);
  }

  addXP(skillId, amount) {
    if (!this.currentUser.skills[skillId]) {
      this.currentUser.skills[skillId] = { level: 1, xp: 0 };
    }
    
    // Add XP with house bonuses
    const houseBonuses = this.getHouseBonuses();
    let bonusXP = 0;
    houseBonuses.forEach(bonus => {
      if (bonus.type === 'all' || bonus.type === skillId) {
        bonusXP += bonus.xp || 0;
      }
    });
    
    this.currentUser.skills[skillId].xp += amount + bonusXP;
    
    // Check for level up
    const newLevel = this.calculateLevel(this.currentUser.skills[skillId].xp);
    console.log(`XP added to ${skillId}: ${amount}, new level: ${newLevel}, current level: ${this.currentUser.skills[skillId].level}`);
    if (newLevel > this.currentUser.skills[skillId].level) {
      console.log(`Level up detected! ${skillId} from ${this.currentUser.skills[skillId].level} to ${newLevel}`);
      this.currentUser.skills[skillId].level = newLevel;
      this.showLevelUpEffect(skillId, newLevel);
    }
    
    this.saveUserData();
  }

  calculateLevel(xp) {
    // OSRS-style level calculation: level = sqrt(xp / 100) + 1
    return Math.floor(Math.sqrt(xp / 100)) + 1;
  }

  trackQuestProgress(skill, amount) {
    if (!this.currentUser.questProgress) {
      this.currentUser.questProgress = {};
    }
    
    // Track first activity completion
    if (!this.currentUser.questProgress.firstActivityCompleted) {
      this.currentUser.questProgress.firstActivityCompleted = true;
    }
    
    // Track activities completed
    this.currentUser.questProgress.activitiesCompleted = (this.currentUser.questProgress.activitiesCompleted || 0) + 1;
    
    // Track skill-specific progress
    if (skill === 'combat') {
      this.currentUser.questProgress.monstersDefeated = (this.currentUser.questProgress.monstersDefeated || 0) + amount;
      if (!this.currentUser.questProgress.firstCombatCompleted) {
        this.currentUser.questProgress.firstCombatCompleted = true;
      }
    }
    
    // Track total coins earned
    if (skill === 'woodcutting' || skill === 'mining' || skill === 'fishing') {
      // These skills generate items that can be sold
      this.currentUser.questProgress.totalCoinsEarned = (this.currentUser.questProgress.totalCoinsEarned || 0) + (amount * 5); // Estimate
    }
  }

  renderGuild() {
    const guildData = this.getGuildData();
    const currentCoins = this.currentUser.inventory.coins || 0;
    
    return `
      <div class="guild-container">
        <!-- Header -->
        <div class="dashboard-card">
          <div class="card-header">
            <h2 class="card-title">🏛️ Guild System</h2>
            <div class="text-muted">Join a guild and play with others</div>
            <div class="coins-display">
              <span class="coins-icon">🪙</span>
              <span class="coins-amount">${this.formatCoins(currentCoins)}</span>
            </div>
          </div>
        </div>
        
        <!-- Guild Status -->
        <div class="dashboard-card">
          <div class="guild-stats-grid">
            <div class="guild-stat">
              <div class="stat-icon">🏛️</div>
              <div class="stat-info">
                <div class="stat-label">Guild</div>
                <div class="stat-value">${guildData.name || 'None'}</div>
              </div>
            </div>
            <div class="guild-stat">
              <div class="stat-icon">👥</div>
              <div class="stat-info">
                <div class="stat-label">Members</div>
                <div class="stat-value">${guildData.memberCount || 0}</div>
              </div>
            </div>
            <div class="guild-stat">
              <div class="stat-icon">⭐</div>
              <div class="stat-info">
                <div class="stat-label">Level</div>
                <div class="stat-value">${guildData.level || 1}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Guild Tabs -->
        <div class="guild-tabs">
          <button class="btn btn-primary" onclick="game.showGuildTab('overview')" id="guild-tab-overview">
            🏛️ Overview
          </button>
          <button class="btn btn-secondary" onclick="game.showGuildTab('members')" id="guild-tab-members">
            👥 Members
          </button>
          <button class="btn btn-secondary" onclick="game.showGuildTab('chat')" id="guild-tab-chat">
            💬 Chat
          </button>
          <button class="btn btn-secondary" onclick="game.showGuildTab('events')" id="guild-tab-events">
            🎯 Events
          </button>
          <button class="btn btn-secondary" onclick="game.showGuildTab('hall')" id="guild-tab-hall">
            🏰 Guild Hall
          </button>
          <button class="btn btn-secondary" onclick="game.showGuildTab('browse')" id="guild-tab-browse">
            🔍 Browse
          </button>
        </div>
        
        <!-- Guild Content -->
        <div class="dashboard-card">
          <div id="guild-content">
            ${this.renderGuildOverview()}
          </div>
        </div>
      </div>
    `;
  }

  renderGuildOverview() {
    const guildData = this.getGuildData();
    
    if (!guildData.name) {
      return this.renderNoGuild();
    }
    
    return `
      <div class="card">
        <div class="card-header">
          <h3>🏛️ ${guildData.name}</h3>
          <div class="text-muted">Level ${guildData.level} • ${guildData.memberCount} members</div>
        </div>
        
        <div class="grid grid-2">
          <div class="guild-info">
            <h4>📋 Guild Info</h4>
            <p><strong>Description:</strong> ${guildData.description || 'No description set'}</p>
            <p><strong>Founded:</strong> ${new Date(guildData.foundedAt).toLocaleDateString()}</p>
            <p><strong>Guild Master:</strong> ${guildData.guildMaster}</p>
            <p><strong>Your Rank:</strong> ${guildData.memberRank}</p>
          </div>
          
          <div class="guild-stats">
            <h4>📊 Guild Statistics</h4>
            <div class="stat-row">
              <span>Total XP:</span>
              <span>${guildData.totalXP?.toLocaleString() || 0}</span>
            </div>
            <div class="stat-row">
              <span>Guild Coins:</span>
              <span>${this.formatCoins(guildData.guildCoins || 0)}</span>
            </div>
            <div class="stat-row">
              <span>Events Won:</span>
              <span>${guildData.eventsWon || 0}</span>
            </div>
            <div class="stat-row">
              <span>Hall Level:</span>
              <span>${guildData.hallLevel || 1}</span>
            </div>
          </div>
        </div>
        
        <div class="guild-actions" style="margin-top: 1rem;">
          ${guildData.memberRank === 'Guild Master' ? `
            <button class="btn btn-primary" onclick="game.showGuildManagement()">Manage Guild</button>
          ` : `
            <button class="btn btn-secondary" onclick="game.leaveGuild()">Leave Guild</button>
          `}
        </div>
      </div>
    `;
  }

  renderNoGuild() {
    return `
      <div class="card">
        <div class="card-header">
          <h3>🏛️ No Guild</h3>
          <div class="text-muted">Join or create a guild to get started</div>
        </div>
        
        <div class="grid grid-2">
          <div class="card">
            <h4>🔍 Browse Guilds</h4>
            <p>Find existing guilds to join</p>
            <button class="btn btn-primary" onclick="game.showGuildTab('browse')">
              Browse Guilds
            </button>
          </div>
          
          <div class="card">
            <h4>➕ Create Guild</h4>
            <p>Start your own guild</p>
            <button class="btn btn-primary" onclick="game.showCreateGuild()">
              Create Guild
            </button>
          </div>
        </div>
        
        <div class="card" style="margin-top: 1rem;">
          <h4>🎯 Guild Benefits</h4>
          <div class="grid grid-2">
            <ul>
              <li>Guild chat and messaging</li>
              <li>Shared guild achievements</li>
              <li>Guild events and competitions</li>
            </ul>
            <ul>
              <li>Guild hall upgrades</li>
              <li>Guild-specific bonuses</li>
              <li>Team-based progression</li>
            </ul>
          </div>
        </div>
      </div>
    `;
  }

  renderGuildMembers() {
    const guildData = this.getGuildData();
    
    if (!guildData.name) {
      return this.renderNoGuild();
    }
    
    return `
      <div class="card">
        <div class="card-header">
          <h3>👥 Guild Members</h3>
          <div class="text-muted">${guildData.memberCount} members</div>
        </div>
        
        <div class="guild-members">
          ${guildData.members?.map(member => this.renderGuildMember(member)).join('') || ''}
        </div>
      </div>
    `;
  }

  renderGuildChat() {
    const guildData = this.getGuildData();
    
    if (!guildData.name) {
      return this.renderNoGuild();
    }
    
    return `
      <div class="card">
        <div class="card-header">
          <h3>💬 Guild Chat</h3>
          <div class="text-muted">Chat with your guild members</div>
        </div>
        
        <div class="guild-chat-container">
          <div class="guild-chat-messages" id="guild-chat-messages">
            ${guildData.chatMessages?.map(msg => this.renderChatMessage(msg)).join('') || ''}
          </div>
          
          <div class="guild-chat-input">
            <input type="text" id="guild-chat-input" placeholder="Type a message..." maxlength="200">
            <button class="btn btn-primary" onclick="game.sendGuildMessage()">Send</button>
          </div>
        </div>
      </div>
    `;
  }

  renderGuildEvents() {
    const guildData = this.getGuildData();
    
    if (!guildData.name) {
      return this.renderNoGuild();
    }
    
    return `
      <div class="card">
        <div class="card-header">
          <h3>🎯 Guild Events</h3>
          <div class="text-muted">Participate in guild competitions</div>
        </div>
        
        <div class="guild-events">
          ${this.getGuildEvents().map(event => this.renderGuildEvent(event)).join('')}
        </div>
      </div>
    `;
  }

  renderGuildHall() {
    const guildData = this.getGuildData();
    
    if (!guildData.name) {
      return this.renderNoGuild();
    }
    
    return `
      <div class="card">
        <div class="card-header">
          <h3>🏰 Guild Hall</h3>
          <div class="text-muted">Upgrade your guild's hall for benefits</div>
        </div>
        
        <div class="guild-hall-info">
          <div class="hall-level">
            <h4>Current Level: ${guildData.hallLevel || 1}</h4>
            <div class="hall-progress">
              <div class="progress-bar">
                <div class="progress-fill" style="width: ${((guildData.hallXP || 0) / (guildData.hallLevel * 1000)) * 100}%"></div>
              </div>
              <span class="progress-text">${guildData.hallXP || 0} / ${(guildData.hallLevel || 1) * 1000} XP</span>
            </div>
          </div>
          
          <div class="hall-upgrades">
            ${this.getGuildHallUpgrades().map(upgrade => this.renderGuildHallUpgrade(upgrade)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  renderGuildBrowse() {
    return `
      <div class="card">
        <div class="card-header">
          <h3>🔍 Browse Guilds</h3>
          <div class="text-muted">Find a guild to join</div>
        </div>
        
        <div class="guild-search">
          <input type="text" id="guild-search-input" placeholder="Search guilds..." onkeyup="game.searchGuilds()">
          <button class="btn btn-primary" onclick="game.searchGuilds()">Search</button>
        </div>
        
        <div class="guild-list" id="guild-list">
          ${this.getGuildList().map(guild => this.renderGuildListItem(guild)).join('')}
        </div>
      </div>
    `;
  }

  getGuildData() {
    if (!this.currentUser.guild) {
      this.currentUser.guild = {
        name: null,
        level: 1,
        memberCount: 0,
        description: '',
        foundedAt: null,
        guildMaster: '',
        memberRank: 'None',
        totalXP: 0,
        guildCoins: 0,
        eventsWon: 0,
        hallLevel: 1,
        hallXP: 0,
        members: [],
        chatMessages: [],
        upgrades: []
      };
    }
    return this.currentUser.guild;
  }

  getGuildEvents() {
    return [
      {
        id: 'weekly_competition',
        name: 'Weekly Competition',
        description: 'Compete with other guilds for rewards',
        type: 'weekly',
        status: 'active',
        endTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        rewards: { coins: 10000, xp: 5000 }
      },
      {
        id: 'guild_raid',
        name: 'Guild Raid',
        description: 'Team up to defeat powerful bosses',
        type: 'raid',
        status: 'upcoming',
        startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
        rewards: { coins: 25000, xp: 10000 }
      },
      {
        id: 'skill_challenge',
        name: 'Skill Challenge',
        description: 'Guild members compete in specific skills',
        type: 'skill',
        status: 'completed',
        endTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        rewards: { coins: 5000, xp: 2500 }
      }
    ];
  }

  getGuildHallUpgrades() {
    return [
      {
        id: 'xp_boost',
        name: 'XP Boost',
        description: 'Increases XP gain for all guild members',
        level: 1,
        cost: { guildCoins: 1000, guildXP: 500 },
        bonus: { xp: 5, type: 'all' }
      },
      {
        id: 'efficiency_boost',
        name: 'Efficiency Boost',
        description: 'Increases efficiency for all guild members',
        level: 2,
        cost: { guildCoins: 2000, guildXP: 1000 },
        bonus: { efficiency: 2, type: 'all' }
      },
      {
        id: 'guild_storage',
        name: 'Guild Storage',
        description: 'Shared storage for guild members',
        level: 3,
        cost: { guildCoins: 5000, guildXP: 2500 },
        bonus: { storage: 50, type: 'all' }
      }
    ];
  }

  getGuildList() {
    // This will fetch from API when multiplayer is enabled
    return [
      {
        id: 'dragons_lair',
        name: 'Dragon\'s Lair',
        description: 'Elite guild for experienced players',
        level: 15,
        memberCount: 45,
        maxMembers: 50,
        requirements: { minLevel: 50, minXP: 100000 },
        guildMaster: 'DragonSlayer',
        foundedAt: new Date('2025-01-01')
      },
      {
        id: 'newbie_helpers',
        name: 'Newbie Helpers',
        description: 'Friendly guild for new players',
        level: 8,
        memberCount: 32,
        maxMembers: 50,
        requirements: { minLevel: 1, minXP: 0 },
        guildMaster: 'HelperBot',
        foundedAt: new Date('2025-02-15')
      },
      {
        id: 'skill_masters',
        name: 'Skill Masters',
        description: 'Focus on skill development and training',
        level: 12,
        memberCount: 28,
        maxMembers: 40,
        requirements: { minLevel: 25, minXP: 50000 },
        guildMaster: 'SkillMaster',
        foundedAt: new Date('2025-03-01')
      }
    ];
  }

  renderGuildMember(member) {
    return `
      <div class="guild-member">
        <div class="member-info">
          <div class="member-name">${member.name}</div>
          <div class="member-rank">${member.rank}</div>
        </div>
        <div class="member-stats">
          <div class="member-level">Level ${member.level}</div>
          <div class="member-xp">${member.xp?.toLocaleString() || 0} XP</div>
        </div>
        <div class="member-status">
          <span class="status-indicator ${member.online ? 'online' : 'offline'}"></span>
          ${member.online ? 'Online' : 'Offline'}
        </div>
      </div>
    `;
  }

  renderChatMessage(message) {
    return `
      <div class="chat-message">
        <div class="message-header">
          <span class="message-author">${message.author}</span>
          <span class="message-time">${new Date(message.timestamp).toLocaleTimeString()}</span>
        </div>
        <div class="message-content">${message.content}</div>
      </div>
    `;
  }

  renderGuildEvent(event) {
    const statusClass = event.status === 'active' ? 'event-active' : 
                       event.status === 'upcoming' ? 'event-upcoming' : 'event-completed';
    
    return `
      <div class="guild-event ${statusClass}">
        <div class="event-header">
          <h4>${event.name}</h4>
          <span class="event-status">${event.status}</span>
        </div>
        <p class="event-description">${event.description}</p>
        <div class="event-rewards">
          <strong>Rewards:</strong>
          ${event.rewards.coins ? `<span class="reward-coins">+${this.formatCoins(event.rewards.coins)}</span>` : ''}
          ${event.rewards.xp ? `<span class="reward-xp">+${event.rewards.xp} XP</span>` : ''}
        </div>
        <div class="event-actions">
          ${event.status === 'active' ? `
            <button class="btn btn-primary" onclick="game.joinGuildEvent('${event.id}')">Join Event</button>
          ` : event.status === 'upcoming' ? `
            <button class="btn btn-secondary" disabled>Starting Soon</button>
          ` : `
            <button class="btn btn-success" disabled>Completed</button>
          `}
        </div>
      </div>
    `;
  }

  renderGuildHallUpgrade(upgrade) {
    const canUpgrade = this.canUpgradeGuildHall(upgrade);
    
    return `
      <div class="guild-hall-upgrade">
        <div class="upgrade-header">
          <h4>${upgrade.name}</h4>
          <span class="upgrade-level">Level ${upgrade.level}</span>
        </div>
        <p class="upgrade-description">${upgrade.description}</p>
        <div class="upgrade-cost">
          <strong>Cost:</strong>
          ${this.formatCoins(upgrade.cost.guildCoins)} + ${upgrade.cost.guildXP} XP
        </div>
        <div class="upgrade-bonus">
          <strong>Bonus:</strong>
          ${upgrade.bonus.xp ? `+${upgrade.bonus.xp}% XP` : ''}
          ${upgrade.bonus.efficiency ? `+${upgrade.bonus.efficiency}% Efficiency` : ''}
          ${upgrade.bonus.storage ? `+${upgrade.bonus.storage} Storage` : ''}
        </div>
        <div class="upgrade-actions">
          ${canUpgrade ? `
            <button class="btn btn-primary" onclick="game.upgradeGuildHall('${upgrade.id}')">
              Upgrade
            </button>
          ` : `
            <button class="btn btn-secondary" disabled>Need Resources</button>
          `}
        </div>
      </div>
    `;
  }

  renderGuildListItem(guild) {
    const canJoin = this.canJoinGuild(guild);
    
    return `
      <div class="guild-list-item">
        <div class="guild-info">
          <h4>${guild.name}</h4>
          <p class="guild-description">${guild.description}</p>
          <div class="guild-stats">
            <span>Level ${guild.level}</span>
            <span>${guild.memberCount}/${guild.maxMembers} members</span>
            <span>Founded: ${guild.foundedAt.toLocaleDateString()}</span>
          </div>
        </div>
        <div class="guild-requirements">
          <strong>Requirements:</strong>
          <div>Min Level: ${guild.requirements.minLevel}</div>
          <div>Min XP: ${guild.requirements.minXP.toLocaleString()}</div>
        </div>
        <div class="guild-actions">
          ${canJoin ? `
            <button class="btn btn-primary" onclick="game.joinGuild('${guild.id}')">
              Join Guild
            </button>
          ` : `
            <button class="btn btn-secondary" disabled>Requirements Not Met</button>
          `}
        </div>
      </div>
    `;
  }

  // Guild API Functions (Multiplayer Ready)
  async fetchGuildList() {
    try {
      // This will be replaced with real API call when multiplayer is enabled
      const response = await fetch('/api/guilds/list');
      return await response.json();
    } catch (error) {
      console.log('Using local guild data (offline mode)');
      return this.getGuildList();
    }
  }

  async createGuild(guildData) {
    try {
      const response = await fetch('/api/guilds/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(guildData)
      });
      return await response.json();
    } catch (error) {
      console.log('Creating guild locally (offline mode)');
      return this.createGuildLocally(guildData);
    }
  }

  async joinGuild(guildId) {
    try {
      const response = await fetch('/api/guilds/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guildId })
      });
      return await response.json();
    } catch (error) {
      console.log('Joining guild locally (offline mode)');
      return this.joinGuildLocally(guildId);
    }
  }

  async leaveGuild() {
    try {
      const response = await fetch('/api/guilds/leave', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      return await response.json();
    } catch (error) {
      console.log('Leaving guild locally (offline mode)');
      return this.leaveGuildLocally();
    }
  }

  async sendGuildMessage(message) {
    try {
      const response = await fetch('/api/guilds/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message })
      });
      return await response.json();
    } catch (error) {
      console.log('Sending message locally (offline mode)');
      return this.sendGuildMessageLocally(message);
    }
  }

  // Local Guild Functions (Offline Mode)
  createGuildLocally(guildData) {
    const guild = {
      name: guildData.name,
      level: 1,
      memberCount: 1,
      description: guildData.description,
      foundedAt: new Date().toISOString(),
      guildMaster: this.currentUser.username,
      memberRank: 'Guild Master',
      totalXP: 0,
      guildCoins: 0,
      eventsWon: 0,
      hallLevel: 1,
      hallXP: 0,
      members: [{
        name: this.currentUser.username,
        rank: 'Guild Master',
        level: this.getTotalLevel(),
        xp: this.getTotalXP(),
        online: true
      }],
      chatMessages: [],
      upgrades: []
    };
    
    this.currentUser.guild = guild;
    this.saveUserData();
    this.render();
    this.showNotification(`Guild "${guildData.name}" created successfully!`);
  }

  joinGuildLocally(guildId) {
    const guild = this.getGuildList().find(g => g.id === guildId);
    if (!guild) {
      this.showNotification('Guild not found!');
      return;
    }
    
    if (!this.canJoinGuild(guild)) {
      this.showNotification('You do not meet the requirements to join this guild!');
      return;
    }
    
    const member = {
      name: this.currentUser.username,
      rank: 'Member',
      level: this.getTotalLevel(),
      xp: this.getTotalXP(),
      online: true
    };
    
    guild.members.push(member);
    guild.memberCount++;
    
    this.currentUser.guild = guild;
    this.saveUserData();
    this.render();
    this.showNotification(`Joined guild "${guild.name}"!`);
  }

  leaveGuildLocally() {
    if (!this.currentUser.guild.name) {
      this.showNotification('You are not in a guild!');
      return;
    }
    
    this.currentUser.guild = {
      name: null,
      level: 1,
      memberCount: 0,
      description: '',
      foundedAt: null,
      guildMaster: '',
      memberRank: 'None',
      totalXP: 0,
      guildCoins: 0,
      eventsWon: 0,
      hallLevel: 1,
      hallXP: 0,
      members: [],
      chatMessages: [],
      upgrades: []
    };
    
    this.saveUserData();
    this.render();
    this.showNotification('Left guild successfully!');
  }

  sendGuildMessageLocally(message) {
    if (!this.currentUser.guild.name) {
      this.showNotification('You are not in a guild!');
      return;
    }
    
    const chatMessage = {
      author: this.currentUser.username,
      content: message,
      timestamp: new Date().toISOString()
    };
    
    this.currentUser.guild.chatMessages.push(chatMessage);
    this.saveUserData();
    this.render();
  }

  // Guild Helper Functions
  canJoinGuild(guild) {
    const totalLevel = this.getTotalLevel();
    const totalXP = this.getTotalXP();
    
    return totalLevel >= guild.requirements.minLevel && 
           totalXP >= guild.requirements.minXP &&
           guild.memberCount < guild.maxMembers;
  }

  canUpgradeGuildHall(upgrade) {
    const guildData = this.getGuildData();
    return guildData.guildCoins >= upgrade.cost.guildCoins && 
           guildData.hallXP >= upgrade.cost.guildXP;
  }

  getTotalLevel() {
    return Object.values(this.currentUser.skills).reduce((sum, skill) => sum + skill.level, 0);
  }

  getTotalXP() {
    return Object.values(this.currentUser.skills).reduce((sum, skill) => sum + skill.xp, 0);
  }

  // Guild UI Functions
  showGuildTab(tab) {
    // Update tab buttons
    document.querySelectorAll('[id^="guild-tab-"]').forEach(btn => {
      btn.className = 'btn btn-secondary';
    });
    document.getElementById(`guild-tab-${tab}`).className = 'btn btn-primary';
    
    // Update content
    const content = document.getElementById('guild-content');
    switch(tab) {
      case 'overview':
        content.innerHTML = this.renderGuildOverview();
        break;
      case 'members':
        content.innerHTML = this.renderGuildMembers();
        break;
      case 'chat':
        content.innerHTML = this.renderGuildChat();
        break;
      case 'events':
        content.innerHTML = this.renderGuildEvents();
        break;
      case 'hall':
        content.innerHTML = this.renderGuildHall();
        break;
      case 'browse':
        content.innerHTML = this.renderGuildBrowse();
        break;
    }
  }

  showCreateGuild() {
    const name = prompt('Enter guild name:');
    if (!name) return;
    
    const description = prompt('Enter guild description:');
    if (!description) return;
    
    this.createGuild({ name, description });
  }

  showGuildManagement() {
    this.showNotification('Guild management coming soon!');
  }

  searchGuilds() {
    const searchTerm = document.getElementById('guild-search-input')?.value.toLowerCase() || '';
    const guildList = document.getElementById('guild-list');
    
    if (!guildList) return;
    
    const filteredGuilds = this.getGuildList().filter(guild => 
      guild.name.toLowerCase().includes(searchTerm) ||
      guild.description.toLowerCase().includes(searchTerm)
    );
    
    guildList.innerHTML = filteredGuilds.map(guild => this.renderGuildListItem(guild)).join('');
  }

  sendGuildMessage() {
    const input = document.getElementById('guild-chat-input');
    const message = input?.value.trim();
    
    if (!message) return;
    
    this.sendGuildMessage(message);
    input.value = '';
  }

  joinGuildEvent(eventId) {
    this.showNotification(`Joined guild event: ${eventId}`);
  }

  upgradeGuildHall(upgradeId) {
    this.showNotification(`Upgraded guild hall: ${upgradeId}`);
  }

  renderHouse() {
    const houseData = this.getHouseData();
    const currentCoins = this.currentUser.inventory.coins || 0;
    
    return `
      <div class="house-container">
        <!-- Header -->
        <div class="dashboard-card">
          <div class="card-header">
            <h2 class="card-title">🏠 Player House</h2>
            <div class="text-muted">Upgrade your home for permanent benefits</div>
            <div class="coins-display">
              <span class="coins-icon">🪙</span>
              <span class="coins-amount">${this.formatCoins(currentCoins)}</span>
            </div>
          </div>
        </div>
        
        <!-- House Overview -->
        <div class="dashboard-card">
          <div class="house-stats-grid">
            <div class="house-stat">
              <div class="stat-icon">🏠</div>
              <div class="stat-info">
                <div class="stat-label">House Level</div>
                <div class="stat-value">${houseData.level}</div>
              </div>
            </div>
            <div class="house-stat">
              <div class="stat-icon">🚪</div>
              <div class="stat-info">
                <div class="stat-label">Rooms</div>
                <div class="stat-value">${houseData.rooms.length}</div>
              </div>
            </div>
            <div class="house-stat">
              <div class="stat-icon">✨</div>
              <div class="stat-info">
                <div class="stat-label">Total Bonuses</div>
                <div class="stat-value">${this.getTotalHouseBonuses()}</div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- House Tabs -->
        <div class="house-tabs">
          <button class="btn btn-primary" onclick="game.showHouseTab('rooms')" id="house-tab-rooms">
            🏠 Rooms
          </button>
          <button class="btn btn-secondary" onclick="game.showHouseTab('furniture')" id="house-tab-furniture">
            🪑 Furniture
          </button>
          <button class="btn btn-secondary" onclick="game.showHouseTab('bonuses')" id="house-tab-bonuses">
            ⭐ Bonuses
          </button>
        </div>
        
        <!-- House Content -->
        <div class="dashboard-card">
          <div id="house-content">
            ${this.renderHouseRooms()}
          </div>
        </div>
      </div>
    `;
  }

  renderHouseRooms() {
    const houseData = this.getHouseData();
    
    return `
      <div class="card">
        <div class="card-header">
          <h3>🏠 House Rooms</h3>
          <div class="text-muted">Upgrade rooms for permanent benefits</div>
        </div>
        
        <div class="grid grid-3">
          ${houseData.rooms.map(room => this.renderRoomCard(room)).join('')}
        </div>
      </div>
    `;
  }

  renderHouseFurniture() {
    const furniture = this.getFurnitureData();
    
    return `
      <div class="card">
        <div class="card-header">
          <h3>🪑 Furniture</h3>
          <div class="text-muted">Craft furniture for additional bonuses</div>
        </div>
        
        <div class="grid grid-4">
          ${furniture.map(item => this.renderFurnitureCard(item)).join('')}
        </div>
      </div>
    `;
  }

  renderHouseBonuses() {
    const bonuses = this.getHouseBonuses();
    
    return `
      <div class="card">
        <div class="card-header">
          <h3>⭐ House Bonuses</h3>
          <div class="text-muted">Active benefits from your house upgrades</div>
        </div>
        
        <div class="grid grid-3">
          ${bonuses.map(bonus => this.renderBonusCard(bonus)).join('')}
        </div>
      </div>
    `;
  }

  renderHouseAchievements() {
    const achievements = this.getHouseAchievements();
    
    return `
      <div class="card">
        <div class="card-header">
          <h3>🏆 House Achievements</h3>
          <div class="text-muted">Unlock achievements by upgrading your house</div>
        </div>
        
        <div class="grid grid-3">
          ${achievements.map(achievement => this.renderHouseAchievementCard(achievement)).join('')}
        </div>
      </div>
    `;
  }

  getHouseData() {
    if (!this.currentUser.house) {
      this.currentUser.house = {
        level: 1,
        rooms: [
          { id: 'bedroom', name: 'Bedroom', level: 1, maxLevel: 10, unlocked: true },
          { id: 'kitchen', name: 'Kitchen', level: 0, maxLevel: 10, unlocked: false },
          { id: 'workshop', name: 'Workshop', level: 0, maxLevel: 10, unlocked: false },
          { id: 'garden', name: 'Garden', level: 0, maxLevel: 10, unlocked: false },
          { id: 'library', name: 'Library', level: 0, maxLevel: 10, unlocked: false },
          { id: 'storage', name: 'Storage Room', level: 0, maxLevel: 10, unlocked: false }
        ],
        furniture: [],
        achievements: []
      };
    }
    return this.currentUser.house;
  }

  getFurnitureData() {
    return [
      {
        id: 'wooden_chair',
        name: 'Wooden Chair',
        description: 'Basic seating furniture',
        cost: { coins: 100, logs: 5 },
        bonus: { xp: 1, type: 'all' },
        unlocked: true
      },
      {
        id: 'oak_table',
        name: 'Oak Table',
        description: 'Sturdy dining table',
        cost: { coins: 500, oak_logs: 10 },
        bonus: { xp: 2, type: 'all' },
        unlocked: false
      },
      {
        id: 'iron_lamp',
        name: 'Iron Lamp',
        description: 'Provides light and focus',
        cost: { coins: 300, iron_ore: 5 },
        bonus: { efficiency: 1, type: 'all' },
        unlocked: false
      },
      {
        id: 'bookshelf',
        name: 'Bookshelf',
        description: 'Stores knowledge and wisdom',
        cost: { coins: 800, logs: 15, paper: 20 },
        bonus: { xp: 3, efficiency: 1, type: 'all' },
        unlocked: false
      },
      {
        id: 'trophy_case',
        name: 'Trophy Case',
        description: 'Displays your achievements',
        cost: { coins: 1000, logs: 20, iron_ore: 10 },
        bonus: { xp: 5, type: 'all' },
        unlocked: false
      },
      {
        id: 'magic_crystal',
        name: 'Magic Crystal',
        description: 'Enhances all activities',
        cost: { coins: 2000, sapphire: 1, logs: 30 },
        bonus: { xp: 10, efficiency: 2, type: 'all' },
        unlocked: false
      }
    ];
  }

  getHouseBonuses() {
    const houseData = this.getHouseData();
    const bonuses = [];
    
    // Room bonuses
    houseData.rooms.forEach(room => {
      if (room.level > 0) {
        const roomBonuses = this.getRoomBonuses(room);
        bonuses.push(...roomBonuses);
      }
    });
    
    // Furniture bonuses
    houseData.furniture.forEach(furniture => {
      const furnitureData = this.getFurnitureData().find(f => f.id === furniture.id);
      if (furnitureData) {
        bonuses.push({
          name: furnitureData.name,
          type: furnitureData.bonus.type,
          xp: furnitureData.bonus.xp || 0,
          efficiency: furnitureData.bonus.efficiency || 0,
          inventory: furnitureData.bonus.inventory || 0
        });
      }
    });
    
    return bonuses;
  }

  getRoomBonuses(room) {
    const bonuses = [];
    const level = room.level;
    
    switch(room.id) {
      case 'bedroom':
        bonuses.push({
          name: 'Restful Sleep',
          type: 'all',
          xp: level * 2,
          efficiency: Math.floor(level / 2),
          inventory: Math.floor(level / 3)
        });
        break;
      case 'kitchen':
        bonuses.push({
          name: 'Cooking Mastery',
          type: 'cooking',
          xp: level * 3,
          efficiency: level
        });
        break;
      case 'workshop':
        bonuses.push({
          name: 'Crafting Efficiency',
          type: 'smithing',
          xp: level * 2,
          efficiency: level
        });
        break;
      case 'garden':
        bonuses.push({
          name: 'Green Thumb',
          type: 'farming',
          xp: level * 2,
          efficiency: level
        });
        break;
      case 'library':
        bonuses.push({
          name: 'Scholarly Focus',
          type: 'all',
          xp: level * 1,
          efficiency: Math.floor(level / 2)
        });
        break;
      case 'storage':
        bonuses.push({
          name: 'Organized Storage',
          type: 'all',
          inventory: level * 5
        });
        break;
    }
    
    return bonuses;
  }

  getHouseAchievements() {
    const houseData = this.getHouseData();
    const totalLevel = houseData.rooms.reduce((sum, room) => sum + room.level, 0);
    
    return [
      {
        id: 'first_room',
        name: '🏠 First Room',
        description: 'Upgrade your first room',
        requirement: 'Upgrade any room to level 1',
        completed: houseData.rooms.some(room => room.level >= 1),
        reward: { coins: 100, xp: 50 }
      },
      {
        id: 'house_level_5',
        name: '🏘️ Growing Home',
        description: 'Reach house level 5',
        requirement: 'Total room levels: 5',
        completed: totalLevel >= 5,
        reward: { coins: 500, xp: 200 }
      },
      {
        id: 'house_level_10',
        name: '🏰 Mansion',
        description: 'Reach house level 10',
        requirement: 'Total room levels: 10',
        completed: totalLevel >= 10,
        reward: { coins: 1000, xp: 500 }
      },
      {
        id: 'all_rooms',
        name: '🏠 Complete Home',
        description: 'Unlock all room types',
        requirement: 'Unlock all 6 room types',
        completed: houseData.rooms.every(room => room.unlocked),
        reward: { coins: 2000, xp: 1000 }
      },
      {
        id: 'furniture_collector',
        name: '🪑 Furniture Collector',
        description: 'Craft 5 pieces of furniture',
        requirement: 'Craft 5 furniture items',
        completed: houseData.furniture.length >= 5,
        reward: { coins: 1500, xp: 750 }
      },
      {
        id: 'house_master',
        name: '👑 House Master',
        description: 'Reach house level 25',
        requirement: 'Total room levels: 25',
        completed: totalLevel >= 25,
        reward: { coins: 5000, xp: 2500 }
      }
    ];
  }

  renderRoomCard(room) {
    const canUpgrade = this.canUpgradeRoom(room);
    const upgradeCost = this.getRoomUpgradeCost(room);
    const currentBonuses = this.getRoomBonuses(room);
    
    return `
      <div class="card room-card ${!room.unlocked ? 'room-locked' : ''}">
        <div class="room-header">
          <h3>${room.name}</h3>
          <div class="room-level">Level ${room.level}/${room.maxLevel}</div>
        </div>
        
        <div class="room-status">
          ${!room.unlocked ? `
            <p class="text-muted">Locked - Complete previous rooms to unlock</p>
          ` : `
            <div class="room-bonuses">
              ${currentBonuses.map(bonus => `
                <div class="bonus-item">
                  <span class="bonus-icon">${bonus.xp ? '⭐' : bonus.efficiency ? '⚡' : '🎒'}</span>
                  <span class="bonus-text">
                    ${bonus.xp ? `+${bonus.xp} XP` : ''}
                    ${bonus.efficiency ? `+${bonus.efficiency}% Efficiency` : ''}
                    ${bonus.inventory ? `+${bonus.inventory} Inventory` : ''}
                  </span>
                </div>
              `).join('')}
            </div>
          `}
        </div>
        
        <div class="room-actions">
          ${!room.unlocked ? `
            <button class="btn btn-secondary" disabled>Locked</button>
          ` : room.level >= room.maxLevel ? `
            <button class="btn btn-success" disabled>Max Level</button>
          ` : canUpgrade ? `
            <button class="btn btn-primary" onclick="game.upgradeRoom('${room.id}')">
              Upgrade (${this.formatCoins(upgradeCost.coins)})
            </button>
          ` : `
            <button class="btn btn-secondary" disabled>Insufficient Resources</button>
          `}
        </div>
      </div>
    `;
  }

  renderFurnitureCard(furniture) {
    const canCraft = this.canCraftFurniture(furniture);
    const isOwned = this.currentUser.house.furniture.some(f => f.id === furniture.id);
    
    return `
      <div class="card furniture-card ${isOwned ? 'furniture-owned' : ''}">
        <div class="furniture-header">
          <h3>${furniture.name}</h3>
          <div class="furniture-status">${isOwned ? '✓ Owned' : 'Not Owned'}</div>
        </div>
        
        <p class="furniture-description">${furniture.description}</p>
        
        <div class="furniture-bonus">
          <strong>Bonus:</strong>
          ${furniture.bonus.xp ? `<span class="bonus-xp">+${furniture.bonus.xp} XP</span>` : ''}
          ${furniture.bonus.efficiency ? `<span class="bonus-efficiency">+${furniture.bonus.efficiency}% Efficiency</span>` : ''}
        </div>
        
        <div class="furniture-cost">
          <strong>Cost:</strong>
          ${this.formatCoins(furniture.cost.coins)}
          ${furniture.cost.logs ? ` + ${furniture.cost.logs} logs` : ''}
          ${furniture.cost.oak_logs ? ` + ${furniture.cost.oak_logs} oak logs` : ''}
          ${furniture.cost.iron_ore ? ` + ${furniture.cost.iron_ore} iron ore` : ''}
        </div>
        
        <div class="furniture-actions">
          ${isOwned ? `
            <button class="btn btn-success" disabled>✓ Owned</button>
          ` : canCraft ? `
            <button class="btn btn-primary" onclick="game.craftFurniture('${furniture.id}')">
              Craft
            </button>
          ` : `
            <button class="btn btn-secondary" disabled>Need Resources</button>
          `}
        </div>
      </div>
    `;
  }

  renderBonusCard(bonus) {
    return `
      <div class="card bonus-card">
        <div class="bonus-header">
          <h3>${bonus.name}</h3>
          <div class="bonus-type">${bonus.type === 'all' ? 'All Skills' : bonus.type}</div>
        </div>
        
        <div class="bonus-effects">
          ${bonus.xp ? `<div class="bonus-effect">⭐ +${bonus.xp} XP</div>` : ''}
          ${bonus.efficiency ? `<div class="bonus-effect">⚡ +${bonus.efficiency}% Efficiency</div>` : ''}
          ${bonus.inventory ? `<div class="bonus-effect">🎒 +${bonus.inventory} Inventory</div>` : ''}
        </div>
      </div>
    `;
  }

  renderHouseAchievementCard(achievement) {
    return `
      <div class="card achievement-card ${achievement.completed ? 'achievement-completed' : ''}">
        <div class="achievement-header">
          <h3>${achievement.name}</h3>
          <div class="achievement-status">${achievement.completed ? '✓' : '○'}</div>
        </div>
        
        <p class="achievement-description">${achievement.description}</p>
        <p class="achievement-requirement">${achievement.requirement}</p>
        
        <div class="achievement-reward">
          <strong>Reward:</strong>
          ${achievement.reward.coins ? `<span class="reward-coins">+${this.formatCoins(achievement.reward.coins)}</span>` : ''}
          ${achievement.reward.xp ? `<span class="reward-xp">+${achievement.reward.xp} XP</span>` : ''}
        </div>
      </div>
    `;
  }

  canUpgradeRoom(room) {
    if (!room.unlocked || room.level >= room.maxLevel) return false;
    
    const cost = this.getRoomUpgradeCost(room);
    const coins = this.currentUser.inventory.coins || 0;
    
    if (coins < cost.coins) return false;
    
    // Check resource requirements
    for (const [resource, amount] of Object.entries(cost)) {
      if (resource === 'coins') continue;
      if ((this.currentUser.inventory[resource] || 0) < amount) return false;
    }
    
    return true;
  }

  getRoomUpgradeCost(room) {
    const level = room.level + 1;
    const baseCost = {
      bedroom: { coins: 100, logs: 10 },
      kitchen: { coins: 200, logs: 15, iron_ore: 5 },
      workshop: { coins: 300, logs: 20, iron_ore: 10 },
      garden: { coins: 150, logs: 5, wheat: 10 },
      library: { coins: 400, logs: 25, paper: 15 },
      storage: { coins: 250, logs: 20, iron_ore: 5 }
    };
    
    const cost = baseCost[room.id] || { coins: 100 };
    return {
      coins: cost.coins * level,
      ...Object.fromEntries(
        Object.entries(cost)
          .filter(([key]) => key !== 'coins')
          .map(([key, value]) => [key, value * level])
      )
    };
  }

  canCraftFurniture(furniture) {
    if (!furniture.unlocked) return false;
    
    const coins = this.currentUser.inventory.coins || 0;
    if (coins < furniture.cost.coins) return false;
    
    // Check resource requirements
    for (const [resource, amount] of Object.entries(furniture.cost)) {
      if (resource === 'coins') continue;
      if ((this.currentUser.inventory[resource] || 0) < amount) return false;
    }
    
    return true;
  }

  getTotalHouseBonuses() {
    const bonuses = this.getHouseBonuses();
    return bonuses.length;
  }

  getMaxInventorySlots() {
    const baseSlots = 20; // Base inventory slots
    const houseBonuses = this.getHouseBonuses();
    let bonusSlots = 0;
    
    houseBonuses.forEach(bonus => {
      bonusSlots += bonus.inventory || 0;
    });
    
    return baseSlots + bonusSlots;
  }

  getCurrentInventorySlots() {
    return Object.keys(this.currentUser.inventory).filter(itemId => itemId !== 'coins').length;
  }

  canAddToInventory() {
    return this.getCurrentInventorySlots() < this.getMaxInventorySlots();
  }

  upgradeRoom(roomId) {
    const houseData = this.getHouseData();
    const room = houseData.rooms.find(r => r.id === roomId);
    
    if (!room || !this.canUpgradeRoom(room)) {
      this.showNotification('Cannot upgrade room!');
      return;
    }
    
    const cost = this.getRoomUpgradeCost(room);
    
    // Deduct costs
    this.currentUser.inventory.coins -= cost.coins;
    for (const [resource, amount] of Object.entries(cost)) {
      if (resource === 'coins') continue;
      this.currentUser.inventory[resource] -= amount;
    }
    
    // Upgrade room
    room.level++;
    
    // Unlock next room if applicable
    this.checkRoomUnlocks();
    
    this.saveUserData();
    this.render();
    this.showNotification(`${room.name} upgraded to level ${room.level}!`);
  }

  craftFurniture(furnitureId) {
    const furniture = this.getFurnitureData().find(f => f.id === furnitureId);
    
    if (!furniture || !this.canCraftFurniture(furniture)) {
      this.showNotification('Cannot craft furniture!');
      return;
    }
    
    // Deduct costs
    this.currentUser.inventory.coins -= furniture.cost.coins;
    for (const [resource, amount] of Object.entries(furniture.cost)) {
      if (resource === 'coins') continue;
      this.currentUser.inventory[resource] -= amount;
    }
    
    // Add furniture
    this.currentUser.house.furniture.push({
      id: furnitureId,
      craftedAt: new Date().toISOString()
    });
    
    this.saveUserData();
    this.render();
    this.showNotification(`${furniture.name} crafted successfully!`);
  }

  checkRoomUnlocks() {
    const houseData = this.getHouseData();
    const totalLevel = houseData.rooms.reduce((sum, room) => sum + room.level, 0);
    
    // Unlock rooms based on total level
    if (totalLevel >= 2 && !houseData.rooms.find(r => r.id === 'kitchen').unlocked) {
      houseData.rooms.find(r => r.id === 'kitchen').unlocked = true;
    }
    if (totalLevel >= 5 && !houseData.rooms.find(r => r.id === 'workshop').unlocked) {
      houseData.rooms.find(r => r.id === 'workshop').unlocked = true;
    }
    if (totalLevel >= 8 && !houseData.rooms.find(r => r.id === 'garden').unlocked) {
      houseData.rooms.find(r => r.id === 'garden').unlocked = true;
    }
    if (totalLevel >= 12 && !houseData.rooms.find(r => r.id === 'library').unlocked) {
      houseData.rooms.find(r => r.id === 'library').unlocked = true;
    }
    if (totalLevel >= 15 && !houseData.rooms.find(r => r.id === 'storage').unlocked) {
      houseData.rooms.find(r => r.id === 'storage').unlocked = true;
    }
  }

  showHouseTab(tab) {
    // Update tab buttons
    document.querySelectorAll('[id^="house-tab-"]').forEach(btn => {
      btn.className = 'btn btn-secondary';
    });
    document.getElementById(`house-tab-${tab}`).className = 'btn btn-primary';
    
    // Update content
    const content = document.getElementById('house-content');
    switch(tab) {
      case 'rooms':
        content.innerHTML = this.renderHouseRooms();
        break;
      case 'furniture':
        content.innerHTML = this.renderHouseFurniture();
        break;
      case 'bonuses':
        content.innerHTML = this.renderHouseBonuses();
        break;
    }
  }

  renderSkillsOverview() {
    const skills = this.gameData.skills;
    const categories = {
      gathering: Object.entries(skills).filter(([_, skill]) => skill.category === 'gathering'),
      production: Object.entries(skills).filter(([_, skill]) => skill.category === 'production'),
      combat: Object.entries(skills).filter(([_, skill]) => skill.category === 'combat')
    };

    return `
      <div class="card">
        <div class="card-header">
          <h2 class="card-title">⚡ Skills Overview</h2>
          <div class="text-muted">All your skills at a glance</div>
        </div>
        
        <!-- Skills Categories -->
        <div class="skills-categories">
          ${this.renderSkillsCategory('Gathering', categories.gathering, '🪓')}
          ${this.renderSkillsCategory('Production', categories.production, '🔨')}
          ${this.renderSkillsCategory('Combat', categories.combat, '⚔️')}
        </div>
      </div>
    `;
  }

  renderSkillsCategory(title, skills, icon) {
    return `
      <div class="skills-category">
        <div class="category-header">
          <h3>${icon} ${title}</h3>
          <div class="category-stats">
            <span class="stat">Total Level: <strong>${this.getCategoryTotalLevel(skills)}</strong></span>
            <span class="stat">Skills: <strong>${skills.length}</strong></span>
          </div>
        </div>
        
        <div class="skills-grid">
          ${skills.map(([skillId, skillData]) => this.renderSkillCard(skillId, skillData)).join('')}
        </div>
      </div>
    `;
  }

  renderSkillCard(skillId, skillData) {
    const userSkill = this.currentUser.skills[skillId] || { level: 1, xp: 0 };
    const nextLevelXP = this.calculateXPForLevel(userSkill.level + 1);
    const currentLevelXP = this.calculateXPForLevel(userSkill.level);
    const progress = ((userSkill.xp - currentLevelXP) / (nextLevelXP - currentLevelXP)) * 100;
    
    return `
      <div class="skill-card" onclick="game.navigateTo('${skillId}')">
        <div class="skill-header">
          <div class="skill-icon">${skillData.icon}</div>
          <div class="skill-info">
            <div class="skill-name">${skillData.name}</div>
            <div class="skill-level">Level ${userSkill.level}</div>
          </div>
          <div class="skill-xp">${userSkill.xp.toLocaleString()} XP</div>
        </div>
        
        <div class="skill-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${progress}%"></div>
          </div>
          <div class="progress-text">
            ${Math.floor(progress)}% to level ${userSkill.level + 1}
          </div>
        </div>
        
        <div class="skill-description">${skillData.description}</div>
      </div>
    `;
  }

  getCategoryTotalLevel(skills) {
    return skills.reduce((total, [skillId, _]) => {
      const userSkill = this.currentUser.skills[skillId] || { level: 1 };
      return total + userSkill.level;
    }, 0);
  }

  calculateXPForLevel(level) {
    // OSRS-style XP formula: XP = level^2 * 100
    return Math.floor(Math.pow(level - 1, 2) * 100);
  }

  renderSocial() {
    return `
      <div class="social-container">
        <!-- Header -->
        <div class="dashboard-card">
          <div class="card-header">
            <h2 class="card-title">👥 Social</h2>
            <div class="text-muted">Connect with other players</div>
          </div>
        </div>
        
        <!-- Social Tabs -->
        <div class="social-tabs">
          <button class="btn btn-primary" onclick="game.showSocialTab('chat')" id="social-tab-chat">
            💬 Global Chat
          </button>
          <button class="btn btn-secondary" onclick="game.showSocialTab('friends')" id="social-tab-friends">
            👥 Friends
          </button>
          <button class="btn btn-secondary" onclick="game.showSocialTab('players')" id="social-tab-players">
            🔍 Find Players
          </button>
        </div>
        
        <!-- Social Content -->
        <div class="dashboard-card">
          <div id="social-content">
            ${this.renderGlobalChat()}
          </div>
        </div>
      </div>
    `;
  }

  renderLeaderboard() {
    return `
      <div class="leaderboard-container">
        <!-- Header -->
        <div class="dashboard-card">
          <div class="card-header">
            <h2 class="card-title">🏆 Leaderboards</h2>
            <div class="text-muted">Compete with players worldwide</div>
          </div>
        </div>
        
        <!-- Leaderboard Tabs -->
        <div class="leaderboard-tabs">
          <button class="btn btn-primary" onclick="game.showLeaderboardTab('overall')" id="leaderboard-tab-overall">
            📊 Overall
          </button>
          <button class="btn btn-secondary" onclick="game.showLeaderboardTab('combat')" id="leaderboard-tab-combat">
            ⚔️ Combat
          </button>
          <button class="btn btn-secondary" onclick="game.showLeaderboardTab('skills')" id="leaderboard-tab-skills">
            ⚡ Skills
          </button>
          <button class="btn btn-secondary" onclick="game.showLeaderboardTab('guilds')" id="leaderboard-tab-guilds">
            🏛️ Guilds
          </button>
          <button class="btn btn-secondary" onclick="game.showLeaderboardTab('wealth')" id="leaderboard-tab-wealth">
            💰 Wealth
          </button>
        </div>
        
        <!-- Leaderboard Content -->
        <div class="dashboard-card">
          <div id="leaderboard-content">
            ${this.renderOverallLeaderboard()}
          </div>
        </div>
      </div>
    `;
  }

  renderOverallLeaderboard() {
    return `
      <div class="leaderboard-container">
        <div class="leaderboard-header">
          <h3>📊 Overall Rankings</h3>
          <div class="leaderboard-stats">
            <span class="stat-item">Total Players: <strong>1,247</strong></span>
            <span class="stat-item">Your Rank: <strong class="text-primary">#1</strong></span>
          </div>
        </div>
        
        <div class="leaderboard-table">
          <div class="leaderboard-row leaderboard-header-row">
            <div class="rank-col">Rank</div>
            <div class="player-col">Player</div>
            <div class="level-col">Total Level</div>
            <div class="xp-col">Total XP</div>
            <div class="status-col">Status</div>
          </div>
          
          ${this.renderLeaderboardRows('overall')}
        </div>
      </div>
    `;
  }

  renderCombatLeaderboard() {
    return `
      <div class="leaderboard-container">
        <div class="leaderboard-header">
          <h3>⚔️ Combat Rankings</h3>
          <div class="leaderboard-stats">
            <span class="stat-item">Combatants: <strong>892</strong></span>
            <span class="stat-item">Your Rank: <strong class="text-primary">#1</strong></span>
          </div>
        </div>
        
        <div class="leaderboard-table">
          <div class="leaderboard-row leaderboard-header-row">
            <div class="rank-col">Rank</div>
            <div class="player-col">Player</div>
            <div class="level-col">Combat Level</div>
            <div class="xp-col">Combat XP</div>
            <div class="status-col">Status</div>
          </div>
          
          ${this.renderLeaderboardRows('combat')}
        </div>
      </div>
    `;
  }

  renderSkillsLeaderboard() {
    return `
      <div class="leaderboard-container">
        <div class="leaderboard-header">
          <h3>⚡ Skills Rankings</h3>
          <div class="leaderboard-stats">
            <span class="stat-item">Skill Masters: <strong>1,156</strong></span>
            <span class="stat-item">Your Rank: <strong class="text-primary">#1</strong></span>
          </div>
        </div>
        
        <!-- Skill Selection -->
        <div class="skill-selector">
          <button class="btn btn-secondary active" onclick="game.showSkillLeaderboard('woodcutting')" id="skill-woodcutting">
            🪓 Woodcutting
          </button>
          <button class="btn btn-secondary" onclick="game.showSkillLeaderboard('mining')" id="skill-mining">
            ⛏️ Mining
          </button>
          <button class="btn btn-secondary" onclick="game.showSkillLeaderboard('fishing')" id="skill-fishing">
            🎣 Fishing
          </button>
          <button class="btn btn-secondary" onclick="game.showSkillLeaderboard('farming')" id="skill-farming">
            🌾 Farming
          </button>
          <button class="btn btn-secondary" onclick="game.showSkillLeaderboard('smithing')" id="skill-smithing">
            🔨 Smithing
          </button>
        </div>
        
        <div class="leaderboard-table">
          <div class="leaderboard-row leaderboard-header-row">
            <div class="rank-col">Rank</div>
            <div class="player-col">Player</div>
            <div class="level-col">Level</div>
            <div class="xp-col">XP</div>
            <div class="status-col">Status</div>
          </div>
          
          <div id="skill-leaderboard-content">
            ${this.renderSkillLeaderboardRows('woodcutting')}
          </div>
        </div>
      </div>
    `;
  }

  renderGuildsLeaderboard() {
    return `
      <div class="leaderboard-container">
        <div class="leaderboard-header">
          <h3>🏛️ Guild Rankings</h3>
          <div class="leaderboard-stats">
            <span class="stat-item">Active Guilds: <strong>156</strong></span>
            <span class="stat-item">Your Guild: <strong class="text-primary">#1</strong></span>
          </div>
        </div>
        
        <div class="leaderboard-table">
          <div class="leaderboard-row leaderboard-header-row">
            <div class="rank-col">Rank</div>
            <div class="guild-col">Guild</div>
            <div class="members-col">Members</div>
            <div class="level-col">Avg Level</div>
            <div class="xp-col">Total XP</div>
          </div>
          
          ${this.renderGuildLeaderboardRows()}
        </div>
      </div>
    `;
  }

  renderWealthLeaderboard() {
    return `
      <div class="leaderboard-container">
        <div class="leaderboard-header">
          <h3>💰 Wealth Rankings</h3>
          <div class="leaderboard-stats">
            <span class="stat-item">Wealthy Players: <strong>743</strong></span>
            <span class="stat-item">Your Rank: <strong class="text-primary">#1</strong></span>
          </div>
        </div>
        
        <div class="leaderboard-table">
          <div class="leaderboard-row leaderboard-header-row">
            <div class="rank-col">Rank</div>
            <div class="player-col">Player</div>
            <div class="wealth-col">Total Wealth</div>
            <div class="coins-col">Coins</div>
            <div class="status-col">Status</div>
          </div>
          
          ${this.renderLeaderboardRows('wealth')}
        </div>
      </div>
    `;
  }

  renderLeaderboardRows(category) {
    // In multiplayer mode, this would fetch real data from the server
    // For now, we'll show the current user as #1 with sample data
    const currentUser = this.currentUser;
    const totalLevel = Object.values(currentUser.skills).reduce((sum, skill) => sum + skill.level, 0);
    const totalXP = Object.values(currentUser.skills).reduce((sum, skill) => sum + skill.xp, 0);
    const combatLevel = this.calculateCombatLevel();
    const totalWealth = (currentUser.inventory.coins || 0) + this.calculateItemValue();
    
    let playerData = {};
    
    switch(category) {
      case 'overall':
        playerData = {
          level: totalLevel,
          xp: totalXP,
          displayValue: totalLevel
        };
        break;
      case 'combat':
        playerData = {
          level: combatLevel,
          xp: currentUser.skills.attack?.xp + currentUser.skills.strength?.xp + currentUser.skills.defence?.xp || 0,
          displayValue: combatLevel
        };
        break;
      case 'wealth':
        playerData = {
          wealth: totalWealth,
          coins: currentUser.inventory.coins || 0,
          displayValue: this.formatCoins(totalWealth)
        };
        break;
    }
    
    return `
      <div class="leaderboard-row leaderboard-player-row current-player">
        <div class="rank-col">
          <span class="rank-number">1</span>
          <span class="rank-medal">🥇</span>
        </div>
        <div class="player-col">
          <div class="player-info">
            <span class="player-name">${currentUser.username}</span>
            <span class="player-guild">${this.getGuildData().name || 'No Guild'}</span>
          </div>
        </div>
        <div class="level-col">${playerData.level || playerData.wealth || 'N/A'}</div>
        <div class="xp-col">${playerData.xp ? this.formatNumber(playerData.xp) : (playerData.coins ? this.formatCoins(playerData.coins) : 'N/A')}</div>
        <div class="status-col">
          <span class="status-indicator online">Online</span>
        </div>
      </div>
      
      <!-- Sample players for demonstration -->
      <div class="leaderboard-row leaderboard-player-row">
        <div class="rank-col">
          <span class="rank-number">2</span>
        </div>
        <div class="player-col">
          <div class="player-info">
            <span class="player-name">DragonSlayer99</span>
            <span class="player-guild">Elite Warriors</span>
          </div>
        </div>
        <div class="level-col">${(totalLevel - 15)}</div>
        <div class="xp-col">${this.formatNumber(totalXP - 5000)}</div>
        <div class="status-col">
          <span class="status-indicator online">Online</span>
        </div>
      </div>
      
      <div class="leaderboard-row leaderboard-player-row">
        <div class="rank-col">
          <span class="rank-number">3</span>
        </div>
        <div class="player-col">
          <div class="player-info">
            <span class="player-name">MiningMaster</span>
            <span class="player-guild">Crafters United</span>
          </div>
        </div>
        <div class="level-col">${(totalLevel - 25)}</div>
        <div class="xp-col">${this.formatNumber(totalXP - 8000)}</div>
        <div class="status-col">
          <span class="status-indicator offline">Offline</span>
        </div>
      </div>
      
      <div class="leaderboard-row leaderboard-player-row">
        <div class="rank-col">
          <span class="rank-number">4</span>
        </div>
        <div class="player-col">
          <div class="player-info">
            <span class="player-name">FishingKing</span>
            <span class="player-guild">Ocean Guardians</span>
          </div>
        </div>
        <div class="level-col">${(totalLevel - 35)}</div>
        <div class="xp-col">${this.formatNumber(totalXP - 12000)}</div>
        <div class="status-col">
          <span class="status-indicator online">Online</span>
        </div>
      </div>
      
      <div class="leaderboard-row leaderboard-player-row">
        <div class="rank-col">
          <span class="rank-number">5</span>
        </div>
        <div class="player-col">
          <div class="player-info">
            <span class="player-name">GuildLeader</span>
            <span class="player-guild">Mystic Order</span>
          </div>
        </div>
        <div class="level-col">${(totalLevel - 45)}</div>
        <div class="xp-col">${this.formatNumber(totalXP - 15000)}</div>
        <div class="status-col">
          <span class="status-indicator online">Online</span>
        </div>
      </div>
    `;
  }

  renderSkillLeaderboardRows(skill) {
    const skillData = this.currentUser.skills[skill];
    const skillName = skill.charAt(0).toUpperCase() + skill.slice(1);
    
    return `
      <div class="leaderboard-row leaderboard-player-row current-player">
        <div class="rank-col">
          <span class="rank-number">1</span>
          <span class="rank-medal">🥇</span>
        </div>
        <div class="player-col">
          <div class="player-info">
            <span class="player-name">${this.currentUser.username}</span>
            <span class="player-guild">${this.getGuildData().name || 'No Guild'}</span>
          </div>
        </div>
        <div class="level-col">${skillData.level}</div>
        <div class="xp-col">${this.formatNumber(skillData.xp)}</div>
        <div class="status-col">
          <span class="status-indicator online">Online</span>
        </div>
      </div>
      
      <!-- Sample players for this skill -->
      <div class="leaderboard-row leaderboard-player-row">
        <div class="rank-col">
          <span class="rank-number">2</span>
        </div>
        <div class="player-col">
          <div class="player-info">
            <span class="player-name">${skillName}Expert</span>
            <span class="player-guild">Skill Masters</span>
          </div>
        </div>
        <div class="level-col">${Math.max(1, skillData.level - 5)}</div>
        <div class="xp-col">${this.formatNumber(Math.max(0, skillData.xp - 1000))}</div>
        <div class="status-col">
          <span class="status-indicator online">Online</span>
        </div>
      </div>
      
      <div class="leaderboard-row leaderboard-player-row">
        <div class="rank-col">
          <span class="rank-number">3</span>
        </div>
        <div class="player-col">
          <div class="player-info">
            <span class="player-name">${skillName}Pro</span>
            <span class="player-guild">Elite Crafters</span>
          </div>
        </div>
        <div class="level-col">${Math.max(1, skillData.level - 8)}</div>
        <div class="xp-col">${this.formatNumber(Math.max(0, skillData.xp - 2000))}</div>
        <div class="status-col">
          <span class="status-indicator offline">Offline</span>
        </div>
      </div>
    `;
  }

  renderGuildLeaderboardRows() {
    const guildData = this.getGuildData();
    const totalLevel = Object.values(this.currentUser.skills).reduce((sum, skill) => sum + skill.level, 0);
    const totalXP = Object.values(this.currentUser.skills).reduce((sum, skill) => sum + skill.xp, 0);
    
    return `
      <div class="leaderboard-row leaderboard-player-row current-player">
        <div class="rank-col">
          <span class="rank-number">1</span>
          <span class="rank-medal">🥇</span>
        </div>
        <div class="guild-col">
          <div class="guild-info">
            <span class="guild-name">${guildData.name || 'Your Guild'}</span>
            <span class="guild-tag">${guildData.tag || 'TAG'}</span>
          </div>
        </div>
        <div class="members-col">${guildData.memberCount || 1}</div>
        <div class="level-col">${Math.floor(totalLevel / (guildData.memberCount || 1))}</div>
        <div class="xp-col">${this.formatNumber(totalXP)}</div>
      </div>
      
      <!-- Sample guilds -->
      <div class="leaderboard-row leaderboard-player-row">
        <div class="rank-col">
          <span class="rank-number">2</span>
        </div>
        <div class="guild-col">
          <div class="guild-info">
            <span class="guild-name">Elite Warriors</span>
            <span class="guild-tag">EWAR</span>
          </div>
        </div>
        <div class="members-col">25</div>
        <div class="level-col">${Math.floor((totalLevel - 50) / 25)}</div>
        <div class="xp-col">${this.formatNumber(totalXP - 10000)}</div>
      </div>
      
      <div class="leaderboard-row leaderboard-player-row">
        <div class="rank-col">
          <span class="rank-number">3</span>
        </div>
        <div class="guild-col">
          <div class="guild-info">
            <span class="guild-name">Crafters United</span>
            <span class="guild-tag">CRAFT</span>
          </div>
        </div>
        <div class="members-col">18</div>
        <div class="level-col">${Math.floor((totalLevel - 75) / 18)}</div>
        <div class="xp-col">${this.formatNumber(totalXP - 15000)}</div>
      </div>
    `;
  }

  showLeaderboardTab(tab) {
    // Update tab buttons
    document.querySelectorAll('[id^="leaderboard-tab-"]').forEach(btn => {
      btn.className = 'btn btn-secondary';
    });
    document.getElementById(`leaderboard-tab-${tab}`).className = 'btn btn-primary';
    
    // Update content
    const content = document.getElementById('leaderboard-content');
    switch(tab) {
      case 'overall':
        content.innerHTML = this.renderOverallLeaderboard();
        break;
      case 'combat':
        content.innerHTML = this.renderCombatLeaderboard();
        break;
      case 'skills':
        content.innerHTML = this.renderSkillsLeaderboard();
        break;
      case 'guilds':
        content.innerHTML = this.renderGuildsLeaderboard();
        break;
      case 'wealth':
        content.innerHTML = this.renderWealthLeaderboard();
        break;
    }
  }

  showSkillLeaderboard(skill) {
    // Update skill buttons
    document.querySelectorAll('.skill-selector .btn').forEach(btn => {
      btn.className = 'btn btn-secondary';
    });
    document.getElementById(`skill-${skill}`).className = 'btn btn-secondary active';
    
    // Update skill leaderboard content
    const content = document.getElementById('skill-leaderboard-content');
    content.innerHTML = this.renderSkillLeaderboardRows(skill);
  }

  calculateItemValue() {
    // Calculate total value of items in inventory
    let totalValue = 0;
    for (const [itemId, quantity] of Object.entries(this.currentUser.inventory)) {
      if (itemId === 'coins') continue;
      const itemData = this.gameData.items[itemId];
      if (itemData && itemData.value) {
        totalValue += itemData.value * quantity;
      }
    }
    return totalValue;
  }

  // API functions for multiplayer (will be implemented when game goes online)
  async fetchLeaderboardData(category, skill = null) {
    try {
      const endpoint = skill ? `/api/leaderboard/${category}/${skill}` : `/api/leaderboard/${category}`;
      const response = await fetch(endpoint);
      if (!response.ok) throw new Error('Failed to fetch leaderboard data');
      return await response.json();
    } catch (error) {
      console.log('Offline mode: Using local leaderboard data');
      return this.getLocalLeaderboardData(category, skill);
    }
  }

  getLocalLeaderboardData(category, skill = null) {
    // Return local data for offline mode
    // This would be replaced with real server data in multiplayer
    return {
      players: [],
      totalPlayers: 1,
      userRank: 1
    };
  }

  renderChangelog() {
    return `
      <div class="changelog-container">
        <div class="dashboard-card">
          <div class="card-header">
            <h2 class="card-title">📋 Game Updates</h2>
            <div class="text-muted">Latest changes and improvements</div>
          </div>
        
        <div class="card">
          <h3>🎯 Version 1.4.0 - Quest System Overhaul</h3>
          <div class="text-muted" style="margin-bottom: 1rem;">September 23, 2025</div>
          
          <h4>✨ New Features:</h4>
          <ul>
            <li>Comprehensive quest system with 4 quest types</li>
            <li>6 Daily quests with 24-hour reset cycle</li>
            <li>7 Weekly quests with 7-day reset cycle</li>
            <li>Story quests with prerequisite chains</li>
            <li>Achievement system with permanent rewards</li>
            <li>Quest acceptance feedback and progress tracking</li>
            <li>Compact 3-column quest interface</li>
            <li>Real-time quest progress updates</li>
          </ul>
          
          <h4>🛠️ Improvements:</h4>
          <ul>
            <li>Fixed quest system infinite loop bug</li>
            <li>Enhanced quest card visual design</li>
            <li>Added quest state indicators (Accept → Accepted → Complete)</li>
            <li>Improved mobile responsiveness for quest interface</li>
            <li>Optimized quest progress calculation performance</li>
          </ul>
        </div>
        
        <div class="card">
          <h3>🛒 Version 1.3.0 - Market & Shop Overhaul</h3>
          <div class="text-muted" style="margin-bottom: 1rem;">September 22, 2025</div>
          
          <h4>✨ New Features:</h4>
          <ul>
            <li>Multiplayer-ready market system with API integration</li>
            <li>Streamlined shop with starter items only</li>
            <li>Compact shop interface with 4-column grid</li>
            <li>Market trading tabs (Browse, Sell, Orders, History)</li>
            <li>Dynamic pricing and seller simulation</li>
            <li>Item quantity selection and bulk purchasing</li>
          </ul>
          
          <h4>🛠️ Improvements:</h4>
          <ul>
            <li>Removed high-tier items from shop (now craftable only)</li>
            <li>Enhanced inventory management with detail panel</li>
            <li>Improved coin display in header</li>
            <li>Fixed farming XP and seed consumption bugs</li>
            <li>Added proper coin formatting (1 coin vs 5 coins)</li>
          </ul>
        </div>
        
        <div class="card">
          <h3>⚔️ Version 1.2.0 - Combat & Equipment System</h3>
          <div class="text-muted" style="margin-bottom: 1rem;">September 21, 2025</div>
          
          <h4>✨ New Features:</h4>
          <ul>
            <li>Complete equipment system with 8 equipment slots</li>
            <li>Real-time tick-based combat system</li>
            <li>12 new monsters with varying difficulty levels</li>
            <li>Combat animations and visual effects</li>
            <li>Equipment stat bonuses and level requirements</li>
            <li>Side-by-side battle arena layout</li>
            <li>Monster defeat tracking and loot system</li>
          </ul>
          
          <h4>🛠️ Improvements:</h4>
          <ul>
            <li>Fixed combat HP real-time updates</li>
            <li>Added monster images and combat animations</li>
            <li>Enhanced equipment interface with compact design</li>
            <li>Improved combat skill page layout</li>
            <li>Added equipment stat aggregation system</li>
          </ul>
        </div>
        
        <div class="card">
          <h3>🎨 Version 1.1.0 - UI/UX Improvements</h3>
          <div class="text-muted" style="margin-bottom: 1rem;">September 20, 2025</div>
          
          <h4>✨ New Features:</h4>
          <ul>
            <li>Dark theme implementation</li>
            <li>Header action timer for all activities</li>
            <li>Bottom-right notification system</li>
            <li>Improved inventory with item detail panel</li>
            <li>Enhanced scroll position preservation</li>
            <li>Compact shop and market interfaces</li>
          </ul>
          
          <h4>🛠️ Improvements:</h4>
          <ul>
            <li>Fixed farming XP and seed consumption issues</li>
            <li>Improved inventory management controls</li>
            <li>Enhanced mobile responsiveness</li>
            <li>Added proper coin display and formatting</li>
            <li>Optimized page navigation performance</li>
          </ul>
        </div>
        
        <div class="card">
          <h3>🚀 Version 1.0.0 - Initial Launch</h3>
          <div class="text-muted" style="margin-bottom: 1rem;">September 19, 2025</div>
          
          <h4>✨ Core Features:</h4>
          <ul>
            <li>Complete skill system with 13+ skills</li>
            <li>OSRS-style XP system and leveling</li>
            <li>Comprehensive item system with 40+ items</li>
            <li>Skill interconnections and resource chains</li>
            <li>Player authentication and profiles</li>
            <li>Inventory management system</li>
            <li>Basic combat training system</li>
            <li>Shop system for essential items</li>
            <li>Player housing framework</li>
            <li>Leaderboard system</li>
          </ul>
          
          <h4>🛠️ Technical Foundation:</h4>
          <ul>
            <li>Single-page application architecture</li>
            <li>Local storage for offline play</li>
            <li>Responsive design for all devices</li>
            <li>OSRS-inspired visual theme</li>
            <li>Modular code structure</li>
          </ul>
        </div>
        
        <div class="card">
          <h3>🔮 Upcoming Features</h3>
          <div class="text-muted" style="margin-bottom: 1rem;">Coming Soon</div>
          
          <h4>🎯 Next Update (v1.5.0):</h4>
          <ul>
            <li>Guild system with multiplayer features</li>
            <li>Advanced housing customization</li>
            <li>Enhanced leaderboard system</li>
            <li>Player vs Player combat</li>
            <li>More quest types and storylines</li>
            <li>Idle/offline progression improvements</li>
            <li>Additional skills and content</li>
            <li>Performance optimizations</li>
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
    
    // Start new 24-hour training session
    const startTime = Date.now();
    this.currentUser.currentTraining = {
      skill: skillId,
      activity: activityName,
      itemReward: itemReward,
      seedRequired: seedRequired, // For farming
      xpRate: xpGain,
      actionTime: actionTime, // Time per action in milliseconds
      startTime: startTime,
      duration: 24 * 60 * 60 * 1000, // 24 hours
      lastAction: startTime // Start at exact same time so timer starts at 0
    };
    
    this.showNotification(`Started training ${this.gameData.skills[skillId].name} for 24 hours!`);
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
      this.showNotification(`24-hour ${training.skill === 'combat' ? 'Combat' : this.gameData.skills[training.skill].name} training completed!`);
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
        
        // Add items for this action with efficiency bonuses
        if (training.itemReward) {
          // Base items: 1 per action
          let itemsThisAction = 1;
          
          // Apply house efficiency bonuses
          const houseBonuses = this.getHouseBonuses();
          houseBonuses.forEach(bonus => {
            if (bonus.type === 'all' || bonus.type === training.skill) {
              if (Math.random() < (bonus.efficiency || 0) / 100) {
                itemsThisAction++; // Double loot chance
              }
            }
          });
          
          this.currentUser.inventory[training.itemReward] = (this.currentUser.inventory[training.itemReward] || 0) + itemsThisAction;
        }
        
        // Track quest progress
        this.trackQuestProgress(training.skill, 1);
        
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
      duration: 24 * 60 * 60 * 1000, // 24 hours
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
    this.addCoins(coinReward);
    
    // Track quest progress
    this.trackQuestProgress('combat', 1);
    
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
    const hasEquipment = this.currentUser.inventory.copper_sword || 
                        this.currentUser.inventory.copper_helmet || 
                        this.currentUser.inventory.copper_platebody;
    
    if (!hasEquipment) {
      console.log('Giving starting equipment to user');
      this.currentUser.inventory.copper_sword = 1;
      this.currentUser.inventory.copper_helmet = 1;
      this.currentUser.inventory.copper_platebody = 1;
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
    this.addCoins(totalSellPrice);
    
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

  getSkillIcon(skillId) {
    const skillIcons = {
      woodcutting: '🪓',
      mining: '⛏️',
      fishing: '🎣',
      farming: '🌱',
      smelting: '🔥',
      smithing: '🔨',
      cooking: '🍳',
      alchemy: '🧪',
      enchanting: '✨',
      attack: '⚔️',
      strength: '💪',
      defence: '🛡️',
      ranged: '🏹',
      magic: '🔮',
      hitpoints: '❤️'
    };
    return skillIcons[skillId] || '📊';
  }

  getItemIcon(itemId) {
    // Use SVG images for items that have them, fallback to emojis
    const svgItems = {
      // Equipment - Copper Items
      copper_sword: 'images/items/copper_sword.svg',
      copper_helmet: 'images/items/copper_helmet.svg',
      copper_platebody: 'images/items/copper_platebody.svg',
      copper_platelegs: 'images/items/copper_platelegs.svg',
      copper_boots: 'images/items/copper_boots.svg',
      copper_gloves: 'images/items/copper_gloves.svg',
      
      // Tools - Copper Items
      copper_pickaxe: 'images/items/copper_pickaxe.svg',
      copper_axe: 'images/items/copper_axe.svg',
      copper_fishing_rod: 'images/items/copper_fishing_rod.svg',
      
      // Jewelry
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
      // Copper Equipment
      copper_sword: '⚔️',
      copper_helmet: '⛑️',
      copper_platebody: '🛡️',
      copper_platelegs: '🦵',
      copper_boots: '👢',
      copper_gloves: '🧤',
      copper_pickaxe: '⛏️',
      copper_axe: '🪓',
      copper_fishing_rod: '🎣',
      
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
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.animation = 'slideInFromRight 0.3s ease-out reverse';
      setTimeout(() => {
        notification.remove();
      }, 300);
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
    
    // Update header timer
    const headerTimerFill = document.getElementById('header-timer-fill');
    const headerTimerText = document.getElementById('header-timer-text');
    
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
    
    // Update header timer
    if (headerTimerFill) {
      headerTimerFill.style.width = actionProgress + '%';
    }
    if (headerTimerText) {
      headerTimerText.textContent = `${actionTimeElapsed.toFixed(1)}s`;
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
        e.stopPropagation();
        e.stopImmediatePropagation();
        this.navigateTo(e.target.dataset.page);
        return false;
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
    if (!itemData) {
      // Handle bronze to copper migration
      const bronzeToCopper = {
        'bronze_helmet': 'copper_helmet',
        'bronze_platebody': 'copper_platebody',
        'bronze_sword': 'copper_sword',
        'bronze_shield': 'copper_shield',
        'bronze_legs': 'copper_legs',
        'bronze_boots': 'copper_boots',
        'bronze_gloves': 'copper_gloves'
      };
      
      const newItemId = bronzeToCopper[itemId];
      if (newItemId && this.gameData.items[newItemId]) {
        // Update the equipped item to the new copper version
        const slot = this.findEquippedSlot(itemId);
        if (slot) {
          this.currentUser.equipment[slot] = newItemId;
          this.saveUserData();
          return this.renderEquippedItem(newItemId);
        }
      }
      
      // If no migration found, unequip the item
      const slot = this.findEquippedSlot(itemId);
      if (slot) {
        this.currentUser.equipment[slot] = null;
        this.saveUserData();
      }
      return this.renderEmptySlot(slot || 'unknown');
    }
    
    return `
      <div class="equipped-item">
        <div class="item-icon">${this.getItemIcon(itemId)}</div>
        <div class="item-name">${itemData.name}</div>
        <div class="item-level">Lv.${itemData.level}</div>
        <button class="btn btn-danger btn-small unequip-btn" onclick="game.unequipItem('${itemId}')">✕</button>
      </div>
    `;
  }

  findEquippedSlot(itemId) {
    const equipment = this.currentUser.equipment;
    for (const [slot, equippedItem] of Object.entries(equipment)) {
      if (equippedItem === itemId) {
        return slot;
      }
    }
    return null;
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

  renderGeneralAchievements() {
    const achievements = this.getGeneralAchievements();
    
    return `
      <div class="achievement-grid">
        ${achievements.map(achievement => this.renderAchievementCard(achievement)).join('')}
      </div>
    `;
  }

  renderSkillAchievements() {
    const achievements = this.getSkillAchievements();
    
    return `
      <div class="achievement-grid">
        ${achievements.map(achievement => this.renderAchievementCard(achievement)).join('')}
      </div>
    `;
  }

  renderCombatAchievements() {
    const achievements = this.getCombatAchievements();
    
    return `
      <div class="achievement-grid">
        ${achievements.map(achievement => this.renderAchievementCard(achievement)).join('')}
      </div>
    `;
  }

  renderHouseAchievements() {
    const achievements = this.getHouseAchievements();
    
    return `
      <div class="achievement-grid">
        ${achievements.map(achievement => this.renderAchievementCard(achievement)).join('')}
      </div>
    `;
  }

  renderGuildAchievements() {
    const achievements = this.getGuildAchievements();
    
    return `
      <div class="achievement-grid">
        ${achievements.map(achievement => this.renderAchievementCard(achievement)).join('')}
      </div>
    `;
  }

  getGeneralAchievements() {
    const totalLevel = Object.values(this.currentUser.skills).reduce((sum, skill) => sum + skill.level, 0);
    const totalXP = Object.values(this.currentUser.skills).reduce((sum, skill) => sum + skill.xp, 0);
    const totalCoins = this.currentUser.inventory.coins || 0;
    
    return [
      {
        id: 'first_login',
        name: '🌟 First Steps',
        description: 'Log in for the first time',
        requirement: 'Complete account creation',
        completed: true,
        reward: { coins: 100, xp: 50 }
      },
      {
        id: 'level_10',
        name: '📈 Rising Star',
        description: 'Reach total level 10',
        requirement: 'Total level: 10',
        completed: totalLevel >= 10,
        reward: { coins: 500, xp: 200 }
      },
      {
        id: 'level_50',
        name: '⭐ Skilled Player',
        description: 'Reach total level 50',
        requirement: 'Total level: 50',
        completed: totalLevel >= 50,
        reward: { coins: 2000, xp: 1000 }
      },
      {
        id: 'level_100',
        name: '🏆 Master Player',
        description: 'Reach total level 100',
        requirement: 'Total level: 100',
        completed: totalLevel >= 100,
        reward: { coins: 5000, xp: 2500 }
      },
      {
        id: 'first_1000_xp',
        name: '💪 Experience Gainer',
        description: 'Gain 1,000 total XP',
        requirement: 'Total XP: 1,000',
        completed: totalXP >= 1000,
        reward: { coins: 300, xp: 150 }
      },
      {
        id: 'first_10000_xp',
        name: '🎯 XP Hunter',
        description: 'Gain 10,000 total XP',
        requirement: 'Total XP: 10,000',
        completed: totalXP >= 10000,
        reward: { coins: 1500, xp: 750 }
      },
      {
        id: 'first_1000_coins',
        name: '💰 Coin Collector',
        description: 'Earn 1,000 coins',
        requirement: 'Total coins: 1,000',
        completed: totalCoins >= 1000,
        reward: { coins: 200, xp: 100 }
      },
      {
        id: 'first_10000_coins',
        name: '💎 Wealthy Player',
        description: 'Earn 10,000 coins',
        requirement: 'Total coins: 10,000',
        completed: totalCoins >= 10000,
        reward: { coins: 1000, xp: 500 }
      }
    ];
  }

  getSkillAchievements() {
    const skills = this.currentUser.skills;
    
    return [
      {
        id: 'first_skill_level_10',
        name: '⚡ Skillful',
        description: 'Reach level 10 in any skill',
        requirement: 'Any skill level: 10',
        completed: Object.values(skills).some(skill => skill.level >= 10),
        reward: { coins: 300, xp: 150 }
      },
      {
        id: 'first_skill_level_25',
        name: '🎯 Expert',
        description: 'Reach level 25 in any skill',
        requirement: 'Any skill level: 25',
        completed: Object.values(skills).some(skill => skill.level >= 25),
        reward: { coins: 800, xp: 400 }
      },
      {
        id: 'first_skill_level_50',
        name: '🏅 Master',
        description: 'Reach level 50 in any skill',
        requirement: 'Any skill level: 50',
        completed: Object.values(skills).some(skill => skill.level >= 50),
        reward: { coins: 2000, xp: 1000 }
      },
      {
        id: 'all_skills_level_10',
        name: '🌟 Well-Rounded',
        description: 'Reach level 10 in all skills',
        requirement: 'All skills level: 10',
        completed: Object.values(skills).every(skill => skill.level >= 10),
        reward: { coins: 1500, xp: 750 }
      },
      {
        id: 'woodcutting_level_20',
        name: '🪓 Lumberjack',
        description: 'Reach level 20 in Woodcutting',
        requirement: 'Woodcutting level: 20',
        completed: skills.woodcutting?.level >= 20,
        reward: { coins: 400, xp: 200 }
      },
      {
        id: 'mining_level_20',
        name: '⛏️ Miner',
        description: 'Reach level 20 in Mining',
        requirement: 'Mining level: 20',
        completed: skills.mining?.level >= 20,
        reward: { coins: 400, xp: 200 }
      },
      {
        id: 'fishing_level_20',
        name: '🎣 Angler',
        description: 'Reach level 20 in Fishing',
        requirement: 'Fishing level: 20',
        completed: skills.fishing?.level >= 20,
        reward: { coins: 400, xp: 200 }
      },
      {
        id: 'farming_level_20',
        name: '🌾 Farmer',
        description: 'Reach level 20 in Farming',
        requirement: 'Farming level: 20',
        completed: skills.farming?.level >= 20,
        reward: { coins: 400, xp: 200 }
      }
    ];
  }

  getCombatAchievements() {
    const combatStats = this.currentUser.questProgress || {};
    
    return [
      {
        id: 'first_monster_kill',
        name: '⚔️ First Blood',
        description: 'Defeat your first monster',
        requirement: 'Defeat 1 monster',
        completed: (combatStats.monstersDefeated || 0) >= 1,
        reward: { coins: 200, xp: 100 }
      },
      {
        id: 'monster_killer_10',
        name: '🗡️ Monster Slayer',
        description: 'Defeat 10 monsters',
        requirement: 'Defeat 10 monsters',
        completed: (combatStats.monstersDefeated || 0) >= 10,
        reward: { coins: 500, xp: 250 }
      },
      {
        id: 'monster_killer_50',
        name: '👹 Beast Hunter',
        description: 'Defeat 50 monsters',
        requirement: 'Defeat 50 monsters',
        completed: (combatStats.monstersDefeated || 0) >= 50,
        reward: { coins: 1500, xp: 750 }
      },
      {
        id: 'monster_killer_100',
        name: '🐉 Dragon Slayer',
        description: 'Defeat 100 monsters',
        requirement: 'Defeat 100 monsters',
        completed: (combatStats.monstersDefeated || 0) >= 100,
        reward: { coins: 3000, xp: 1500 }
      },
      {
        id: 'first_combat',
        name: '🥊 Fighter',
        description: 'Complete your first combat training',
        requirement: 'Complete 1 combat session',
        completed: (combatStats.firstCombatCompleted || false),
        reward: { coins: 150, xp: 75 }
      },
      {
        id: 'combat_master',
        name: '🥋 Combat Master',
        description: 'Complete 25 combat training sessions',
        requirement: 'Complete 25 combat sessions',
        completed: (combatStats.combatSessions || 0) >= 25,
        reward: { coins: 1000, xp: 500 }
      }
    ];
  }

  getGuildAchievements() {
    const guildData = this.getGuildData();
    
    return [
      {
        id: 'first_guild',
        name: '🏛️ Guild Member',
        description: 'Join your first guild',
        requirement: 'Join a guild',
        completed: !!guildData.name,
        reward: { coins: 300, xp: 150 }
      },
      {
        id: 'guild_master',
        name: '👑 Guild Master',
        description: 'Create your own guild',
        requirement: 'Create a guild',
        completed: guildData.memberRank === 'Guild Master',
        reward: { coins: 1000, xp: 500 }
      },
      {
        id: 'guild_chat',
        name: '💬 Social Butterfly',
        description: 'Send your first guild message',
        requirement: 'Send 1 guild message',
        completed: (guildData.chatMessages || []).length > 0,
        reward: { coins: 100, xp: 50 }
      },
      {
        id: 'guild_event',
        name: '🎯 Team Player',
        description: 'Participate in a guild event',
        requirement: 'Join 1 guild event',
        completed: (guildData.eventsParticipated || 0) >= 1,
        reward: { coins: 400, xp: 200 }
      },
      {
        id: 'guild_hall_upgrade',
        name: '🏰 Hall Upgrader',
        description: 'Upgrade the guild hall',
        requirement: 'Upgrade guild hall 1 time',
        completed: (guildData.hallUpgrades || 0) >= 1,
        reward: { coins: 600, xp: 300 }
      }
    ];
  }

  renderAchievementCard(achievement) {
    const statusIcon = achievement.completed ? '✓' : '○';
    const statusClass = achievement.completed ? 'achievement-completed' : '';
    
    return `
      <div class="achievement-card ${statusClass}">
        <div class="achievement-header">
          <h3>${achievement.name}</h3>
          <div class="achievement-status">${statusIcon}</div>
        </div>
        
        <p class="achievement-description">${achievement.description}</p>
        <div class="achievement-requirement">${achievement.requirement}</div>
        
        <div class="achievement-reward">
          <strong>Reward:</strong>
          ${achievement.reward.coins ? `<span class="reward-coins">+${this.formatCoins(achievement.reward.coins)}</span>` : ''}
          ${achievement.reward.xp ? `<span class="reward-xp">+${achievement.reward.xp} XP</span>` : ''}
        </div>
      </div>
    `;
  }

  showAchievementTab(tab) {
    // Update tab buttons
    document.querySelectorAll('[id^="achievement-tab-"]').forEach(btn => {
      btn.className = 'btn btn-secondary';
    });
    document.getElementById(`achievement-tab-${tab}`).className = 'btn btn-primary';
    
    // Update content
    const content = document.getElementById('achievement-content');
    switch(tab) {
      case 'general':
        content.innerHTML = this.renderGeneralAchievements();
        break;
      case 'skills':
        content.innerHTML = this.renderSkillAchievements();
        break;
      case 'combat':
        content.innerHTML = this.renderCombatAchievements();
        break;
      case 'house':
        content.innerHTML = this.renderHouseAchievements();
        break;
      case 'guild':
        content.innerHTML = this.renderGuildAchievements();
        break;
    }
  }

  showSocialTab(tab) {
    // Update tab buttons
    document.querySelectorAll('[id^="social-tab-"]').forEach(btn => {
      btn.className = 'btn btn-secondary';
    });
    document.getElementById(`social-tab-${tab}`).className = 'btn btn-primary';
    
    // Update content
    const content = document.getElementById('social-content');
    switch(tab) {
      case 'chat':
        content.innerHTML = this.renderGlobalChat();
        break;
      case 'friends':
        content.innerHTML = this.renderFriendsList();
        break;
      case 'players':
        content.innerHTML = this.renderPlayerSearch();
        break;
    }
  }

  // Particle Effect System
  initParticleSystem() {
    if (!this.particleContainer) {
      this.particleContainer = document.createElement('div');
      this.particleContainer.className = 'particle-container';
      document.body.appendChild(this.particleContainer);
    }
  }

  createParticle(text, type, x, y, options = {}) {
    this.initParticleSystem();
    
    const particle = document.createElement('div');
    particle.className = `particle ${type}`;
    particle.textContent = text;
    particle.style.left = x + 'px';
    particle.style.top = y + 'px';
    
    // Add animation class based on type
    switch(type) {
      case 'coin':
        particle.classList.add('animate-coinCollect');
        break;
      case 'xp':
        particle.classList.add('animate-xpGain');
        break;
      case 'damage':
        particle.classList.add('animate-damageNumber');
        break;
      case 'level-up':
        particle.classList.add('animate-levelUp');
        break;
      case 'item':
        particle.classList.add('animate-itemDrop');
        break;
    }
    
    this.particleContainer.appendChild(particle);
    
    // Remove particle after animation
    setTimeout(() => {
      if (particle.parentNode) {
        particle.parentNode.removeChild(particle);
      }
    }, options.duration || 2000);
  }

  // Enhanced notification with animations
  showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Position notification at bottom right
    notification.style.position = 'fixed';
    notification.style.bottom = '20px';
    notification.style.right = '20px';
    notification.style.padding = '12px 20px';
    notification.style.borderRadius = '8px';
    notification.style.color = 'white';
    notification.style.fontWeight = 'bold';
    notification.style.zIndex = '10000';
    notification.style.maxWidth = '300px';
    notification.style.wordWrap = 'break-word';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    notification.style.border = '2px solid rgba(255, 255, 255, 0.2)';
    
    // Set background color based on type (solid colors)
    switch(type) {
      case 'success':
        notification.style.backgroundColor = '#4caf50';
        break;
      case 'error':
        notification.style.backgroundColor = '#f44336';
        break;
      case 'warning':
        notification.style.backgroundColor = '#ff9800';
        break;
      case 'info':
      default:
        notification.style.backgroundColor = '#2196f3';
        break;
    }
    
    document.body.appendChild(notification);
    
    // Remove notification after duration
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = 'fadeOut 0.3s ease-out forwards';
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, duration);
  }


  showLevelUpEffect(skillId, newLevel) {
    console.log(`Level up effect triggered for ${skillId} level ${newLevel}`);
    
    // Create level up particle
    const skillName = this.gameData.skills[skillId]?.name || skillId;
    this.createParticle(`LEVEL UP!`, 'level-up', window.innerWidth / 2, window.innerHeight / 2);
    this.createParticle(`${skillName} ${newLevel}`, 'level-up', window.innerWidth / 2, window.innerHeight / 2 + 30);
    
    // Show notification
    this.showNotification(`🎉 ${skillName} level up! Level ${newLevel}`, 'success', 4000);
    
    // Add glow effect to skill
    const skillElement = document.querySelector(`[data-skill="${skillId}"]`);
    if (skillElement) {
      console.log(`Adding glow effect to skill element: ${skillId}`);
      skillElement.classList.add('animate-glow');
      setTimeout(() => {
        skillElement.classList.remove('animate-glow');
      }, 3000);
    } else {
      console.log(`Skill element not found: ${skillId}`);
    }
  }

  // Enhanced combat with particle effects
  processCombatTraining() {
    if (!this.currentUser.currentTraining || this.currentUser.currentTraining.skill !== 'combat') return;
    
    const monster = this.currentUser.currentMonster;
    if (!monster) return;
    
    const now = Date.now();
    const timeSinceStart = now - this.currentUser.currentTraining.startTime;
    const actionTime = monster.attackSpeed * 1000;
    
    // Calculate attacks
    const totalPlayerAttacksSinceStart = Math.floor(timeSinceStart / actionTime);
    const totalMonsterAttacksSinceStart = Math.floor(timeSinceStart / actionTime);
    
    const newPlayerAttacks = totalPlayerAttacksSinceStart - (this.currentUser.currentTraining.playerAttacksCompleted || 0);
    const newMonsterAttacks = totalMonsterAttacksSinceStart - (this.currentUser.currentTraining.monsterAttacksCompleted || 0);
    
    const maxAttacks = Math.max(newPlayerAttacks, newMonsterAttacks);
    
    for (let i = 0; i < maxAttacks; i++) {
      // Player attack
      if (i < newPlayerAttacks) {
        const damage = this.calculatePlayerDamage(monster);
        monster.currentHp = Math.max(0, monster.currentHp - damage);
        
        // Create damage particle
        this.createParticle(`-${damage}`, 'damage', 
          window.innerWidth / 2 - 100, 
          window.innerHeight / 2 - 50);
        
        if (monster.currentHp <= 0) {
          this.onMonsterDefeated(monster);
          return;
        }
      }
      
      // Monster attack
      if (i < newMonsterAttacks) {
        const damage = this.calculateMonsterDamage(monster);
        this.currentUser.hp = Math.max(0, this.currentUser.hp - damage);
        
        // Create damage particle for player
        this.createParticle(`-${damage}`, 'damage', 
          window.innerWidth / 2 + 100, 
          window.innerHeight / 2 - 50);
        
        if (this.currentUser.hp <= 0) {
          this.stopTraining();
          this.showNotification('💀 You died! Training stopped.', 'error');
          return;
        }
      }
    }
    
    // Update attack counts
    this.currentUser.currentTraining.playerAttacksCompleted = totalPlayerAttacksSinceStart;
    this.currentUser.currentTraining.monsterAttacksCompleted = totalMonsterAttacksSinceStart;
  }

  // Enhanced item collection with particles
  addToInventory(itemId, quantity = 1) {
    if (!this.canAddToInventory()) {
      this.showNotification('Inventory full!', 'warning');
      return false;
    }
    
    this.currentUser.inventory[itemId] = (this.currentUser.inventory[itemId] || 0) + quantity;
    
    // Create item particle
    const itemData = this.gameData.items[itemId];
    if (itemData) {
      this.createParticle(`+${quantity} ${itemData.name}`, 'item', 
        window.innerWidth / 2, 
        window.innerHeight / 2);
    }
    
    this.saveUserData();
    return true;
  }

  // Enhanced coin collection
  addCoins(amount) {
    this.currentUser.inventory.coins = (this.currentUser.inventory.coins || 0) + amount;
    
    // Create coin particle
    this.createParticle(`+${this.formatCoins(amount)}`, 'coin', 
      window.innerWidth / 2, 
      window.innerHeight / 2);
    
    this.saveUserData();
  }

  // Add page transition animations
  navigateTo(page) {
    // Preserve scroll position
    const scrollY = window.scrollY;
    
    this.currentPage = page;
    
    // Only update the main content, not the entire page
    const mainContent = document.querySelector('.main-content');
    if (mainContent) {
      mainContent.innerHTML = this.renderMainContent();
      this.updateSidebarActiveStates();
      
      // Restore scroll position after content update
      setTimeout(() => {
        window.scrollTo(0, scrollY);
      }, 0);
    } else {
      // Fallback to full render if main content not found
      this.render();
      setTimeout(() => {
        window.scrollTo(0, scrollY);
      }, 0);
    }
  }

  // Add loading animation to buttons
  addLoadingAnimation(element) {
    element.classList.add('loading');
    element.disabled = true;
  }

  removeLoadingAnimation(element) {
    element.classList.remove('loading');
    element.disabled = false;
  }

  // Theme Management
  changeTheme(themeName) {
    // Remove all existing theme classes
    document.body.className = document.body.className.replace(/theme-\w+/g, '');
    
    // Add new theme class
    if (themeName !== 'default') {
      document.body.classList.add(`theme-${themeName}`);
    }
    
    // Save theme preference
    localStorage.setItem('bmt-idle-theme', themeName);
    
    // Show notification
    this.showNotification(`🎨 Theme changed to ${themeName}`, 'success', 2000);
  }

  loadTheme() {
    const savedTheme = localStorage.getItem('bmt-idle-theme') || 'default';
    this.changeTheme(savedTheme);
    
    // Update theme selector if it exists
    const themeSelector = document.getElementById('theme-selector');
    if (themeSelector) {
      themeSelector.value = savedTheme;
    }
  }

  // Test function for level up effects
  testLevelUp() {
    console.log('Testing level up effect...');
    this.showLevelUpEffect('attack', 5);
    this.createParticle(`+100`, 'xp', window.innerWidth / 2, window.innerHeight / 2);
    this.createParticle(`+50 coins`, 'coin', window.innerWidth / 2 + 100, window.innerHeight / 2);
  }

  // Social System Functions
  renderGlobalChat() {
    return `
      <div class="chat-container">
        <div class="chat-header">
          <h3>💬 Global Chat</h3>
          <div class="chat-stats">
            <span class="online-count">👥 ${this.getOnlinePlayerCount()} online</span>
          </div>
        </div>
        
        <div class="chat-messages" id="chat-messages">
          ${this.renderChatMessages()}
        </div>
        
        <div class="chat-input-container">
          <input 
            type="text" 
            id="chat-input" 
            class="chat-input" 
            placeholder="Type your message..." 
            maxlength="200"
            onkeypress="game.handleChatKeyPress(event)"
            value="${this.chatInput}"
          >
          <button class="btn btn-primary" onclick="game.sendChatMessage()">
            Send
          </button>
        </div>
      </div>
    `;
  }

  renderChatMessages() {
    if (this.chatMessages.length === 0) {
      return `
        <div class="chat-message system">
          <span class="message-time">Welcome to Global Chat!</span>
          <span class="message-text">Start a conversation with other players.</span>
        </div>
      `;
    }
    
    return this.chatMessages.map(msg => `
      <div class="chat-message ${msg.type}">
        <span class="message-time">${msg.time}</span>
        <span class="message-sender">${msg.sender}:</span>
        <span class="message-text">${msg.text}</span>
      </div>
    `).join('');
  }

  renderFriendsList() {
    return `
      <div class="friends-container">
        <div class="friends-header">
          <h3>👥 Friends</h3>
          <button class="btn btn-primary" onclick="game.showAddFriendModal()">
            ➕ Add Friend
          </button>
        </div>
        
        <div class="friends-list">
          ${this.renderFriends()}
        </div>
      </div>
    `;
  }

  renderFriends() {
    if (this.friends.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">👥</div>
          <h4>No friends yet</h4>
          <p>Add some friends to see their progress and chat with them!</p>
          <button class="btn btn-primary" onclick="game.showAddFriendModal()">
            Find Friends
          </button>
        </div>
      `;
    }
    
    return this.friends.map(friend => `
      <div class="friend-item">
        <div class="friend-avatar">${friend.avatar || '👤'}</div>
        <div class="friend-info">
          <div class="friend-name">${friend.name}</div>
          <div class="friend-status ${friend.online ? 'online' : 'offline'}">
            ${friend.online ? '🟢 Online' : '🔴 Offline'}
          </div>
          <div class="friend-level">Level ${friend.totalLevel}</div>
        </div>
        <div class="friend-actions">
          <button class="btn btn-secondary" onclick="game.viewPlayerProfile('${friend.name}')">
            👁️ View
          </button>
          <button class="btn btn-danger" onclick="game.removeFriend('${friend.name}')">
            ❌ Remove
          </button>
        </div>
      </div>
    `).join('');
  }

  renderPlayerSearch() {
    return `
      <div class="player-search-container">
        <div class="search-header">
          <h3>🔍 Find Players</h3>
          <div class="search-box">
            <input 
              type="text" 
              id="player-search-input" 
              class="search-input" 
              placeholder="Search by username..." 
              onkeyup="game.searchPlayers(this.value)"
            >
            <button class="btn btn-primary" onclick="game.searchPlayers(document.getElementById('player-search-input').value)">
              🔍 Search
            </button>
          </div>
        </div>
        
        <div class="search-results" id="search-results">
          ${this.renderSearchResults()}
        </div>
      </div>
    `;
  }

  renderSearchResults() {
    // Sample search results for demo
    const samplePlayers = [
      { name: 'DragonSlayer', level: 45, guild: 'Knights of Valor', online: true },
      { name: 'MiningKing', level: 32, guild: 'Resource Masters', online: false },
      { name: 'FishingPro', level: 28, guild: null, online: true },
      { name: 'CombatMaster', level: 67, guild: 'Elite Warriors', online: true }
    ];
    
    return samplePlayers.map(player => `
      <div class="search-result-item">
        <div class="player-avatar">👤</div>
        <div class="player-info">
          <div class="player-name">${player.name}</div>
          <div class="player-details">
            <span class="player-level">Level ${player.level}</span>
            ${player.guild ? `<span class="player-guild">🏛️ ${player.guild}</span>` : ''}
            <span class="player-status ${player.online ? 'online' : 'offline'}">
              ${player.online ? '🟢 Online' : '🔴 Offline'}
            </span>
          </div>
        </div>
        <div class="player-actions">
          <button class="btn btn-secondary" onclick="game.viewPlayerProfile('${player.name}')">
            👁️ View Profile
          </button>
          <button class="btn btn-primary" onclick="game.addFriend('${player.name}')">
            ➕ Add Friend
          </button>
        </div>
      </div>
    `).join('');
  }

  // Chat Functions
  handleChatKeyPress(event) {
    if (event.key === 'Enter') {
      this.sendChatMessage();
    }
  }

  sendChatMessage() {
    const input = document.getElementById('chat-input');
    const message = input.value.trim();
    
    if (message.length === 0) return;
    
    const chatMessage = {
      type: 'player',
      sender: this.currentUser.username,
      text: message,
      time: new Date().toLocaleTimeString()
    };
    
    this.chatMessages.push(chatMessage);
    this.chatInput = '';
    input.value = '';
    
    // Keep only last 50 messages
    if (this.chatMessages.length > 50) {
      this.chatMessages = this.chatMessages.slice(-50);
    }
    
    this.render();
    this.scrollChatToBottom();
  }

  scrollChatToBottom() {
    const chatMessages = document.getElementById('chat-messages');
    if (chatMessages) {
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }
  }

  // Friend Functions
  addFriend(username) {
    if (this.friends.find(f => f.name === username)) {
      this.showNotification('Already friends with this player!', 'warning');
      return;
    }
    
    // In multiplayer, this would send a friend request
    // For now, we'll add them directly
    this.friends.push({
      name: username,
      online: Math.random() > 0.5,
      totalLevel: Math.floor(Math.random() * 50) + 10,
      avatar: '👤'
    });
    
    this.showNotification(`Added ${username} as a friend!`, 'success');
    this.render();
  }

  removeFriend(username) {
    this.friends = this.friends.filter(f => f.name !== username);
    this.showNotification(`Removed ${username} from friends`, 'info');
    this.render();
  }

  // Player Profile Functions
  viewPlayerProfile(username) {
    this.selectedPlayer = username;
    this.navigateTo('profile');
  }

  getOnlinePlayerCount() {
    // In multiplayer, this would be real data
    return Math.floor(Math.random() * 50) + 25;
  }

  searchPlayers(query) {
    // In multiplayer, this would search the database
    // For now, we'll just re-render the search results
    this.render();
  }

  showAddFriendModal() {
    const username = prompt('Enter username to add as friend:');
    if (username && username.trim()) {
      this.addFriend(username.trim());
    }
  }

  // Other Player Profile Viewing
  renderOtherPlayerProfile(username) {
    // In multiplayer, this would fetch real player data
    // For now, we'll show sample data
    const samplePlayer = {
      username: username,
      totalLevel: Math.floor(Math.random() * 100) + 20,
      combatLevel: Math.floor(Math.random() * 50) + 10,
      guild: Math.random() > 0.3 ? 'Knights of Valor' : null,
      joinDate: '2024-01-15',
      lastSeen: Math.random() > 0.5 ? 'Online now' : '2 hours ago',
      achievements: Math.floor(Math.random() * 50) + 10,
      skills: {
        woodcutting: { level: Math.floor(Math.random() * 50) + 10 },
        mining: { level: Math.floor(Math.random() * 50) + 10 },
        fishing: { level: Math.floor(Math.random() * 50) + 10 },
        farming: { level: Math.floor(Math.random() * 50) + 10 },
        smithing: { level: Math.floor(Math.random() * 50) + 10 },
        attack: { level: Math.floor(Math.random() * 50) + 10 },
        strength: { level: Math.floor(Math.random() * 50) + 10 },
        defence: { level: Math.floor(Math.random() * 50) + 10 },
        hitpoints: { level: Math.floor(Math.random() * 50) + 10 }
      }
    };

    return `
      <div class="card">
        <div class="card-header">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h2 class="card-title">👤 ${samplePlayer.username}</h2>
              <div class="text-muted">Player Profile</div>
            </div>
            <button class="btn btn-secondary" onclick="game.selectedPlayer = null; game.navigateTo('profile')">
              ← Back to My Profile
            </button>
          </div>
        </div>
        
        <div class="grid grid-2">
          <div class="card">
            <div class="card-header">
              <h3>📊 Player Stats</h3>
            </div>
            <div class="form-group">
              <label class="form-label">Username</label>
              <div class="text-gold">${samplePlayer.username}</div>
            </div>
            <div class="form-group">
              <label class="form-label">Total Level</label>
              <div class="text-gold">${samplePlayer.totalLevel}</div>
            </div>
            <div class="form-group">
              <label class="form-label">Combat Level</label>
              <div class="text-gold">${samplePlayer.combatLevel}</div>
            </div>
            <div class="form-group">
              <label class="form-label">Guild</label>
              <div class="text-gold">${samplePlayer.guild || 'No Guild'}</div>
            </div>
            <div class="form-group">
              <label class="form-label">Join Date</label>
              <div class="text-muted">${samplePlayer.joinDate}</div>
            </div>
            <div class="form-group">
              <label class="form-label">Last Seen</label>
              <div class="text-muted">${samplePlayer.lastSeen}</div>
            </div>
            <div class="form-group">
              <label class="form-label">Achievements</label>
              <div class="text-gold">${samplePlayer.achievements} completed</div>
            </div>
          </div>
          
          <div class="card">
            <div class="card-header">
              <h3>⚡ Skill Levels</h3>
            </div>
            <div class="skills-grid">
              ${Object.entries(samplePlayer.skills).map(([skillId, skill]) => `
                <div class="skill-item">
                  <div class="skill-icon">${this.gameData.skills[skillId]?.icon || '⚡'}</div>
                  <div class="skill-info">
                    <div class="skill-name">${this.gameData.skills[skillId]?.name || skillId}</div>
                    <div class="skill-level">Level ${skill.level}</div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3>🏆 Recent Achievements</h3>
          </div>
          <div class="achievements-preview">
            <div class="achievement-item">
              <div class="achievement-icon">🎯</div>
              <div class="achievement-info">
                <div class="achievement-name">Skill Master</div>
                <div class="achievement-desc">Reached level 50 in a skill</div>
              </div>
            </div>
            <div class="achievement-item">
              <div class="achievement-icon">⚔️</div>
              <div class="achievement-info">
                <div class="achievement-name">Combat Veteran</div>
                <div class="achievement-desc">Defeated 100 monsters</div>
              </div>
            </div>
            <div class="achievement-item">
              <div class="achievement-icon">💰</div>
              <div class="achievement-info">
                <div class="achievement-name">Wealthy</div>
                <div class="achievement-desc">Earned 10,000 coins</div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="card">
          <div class="card-header">
            <h3>👥 Social Actions</h3>
          </div>
          <div style="display: flex; gap: 1rem; flex-wrap: wrap;">
            <button class="btn btn-primary" onclick="game.addFriend('${samplePlayer.username}')">
              ➕ Add Friend
            </button>
            <button class="btn btn-secondary" onclick="game.sendPrivateMessage('${samplePlayer.username}')">
              💬 Send Message
            </button>
            <button class="btn btn-secondary" onclick="game.viewPlayerGuild('${samplePlayer.username}')">
              🏛️ View Guild
            </button>
          </div>
        </div>
      </div>
    `;
  }

  sendPrivateMessage(username) {
    this.showNotification(`Private messaging to ${username} would be implemented in multiplayer mode`, 'info');
  }

  viewPlayerGuild(username) {
    this.showNotification(`Viewing ${username}'s guild would be implemented in multiplayer mode`, 'info');
  }
}

// Initialize the game
const game = new BMTIdle();
