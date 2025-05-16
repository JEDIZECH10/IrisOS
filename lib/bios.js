// IrisOS - BIOS Configuration Module
// Handles system boot configuration

const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');
const { colorText, clearScreen } = require('./terminal');

// Default BIOS configuration
const defaultConfig = {
  bootDelay: 2,
  splashScreen: true,
  startDesktop: true,
  startupSound: true,
  language: 'en',
  timezone: 'UTC',
  username: 'user',
  hostname: 'irisos',
  desktopTheme: 'dark',
  systemMemory: 512, // MB
  hardDriveSize: 2048, // MB
  // Network configuration
  networkEnabled: true,
  autoConnect: true,
  // Boot options
  bootPriority: ['internal', 'usb', 'network']
};

// Path to config file
const getConfigPath = () => {
  // In a real installation, this would be in a proper location
  const userHome = os.homedir();
  const configDir = path.join(userHome, '.irisos');
  
  // Ensure directory exists
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  return path.join(configDir, 'bios.json');
};

// Load BIOS configuration
function loadConfig() {
  const configPath = getConfigPath();
  
  try {
    if (fs.existsSync(configPath)) {
      const configData = fs.readFileSync(configPath, 'utf8');
      return JSON.parse(configData);
    } else {
      // First time setup - create default config
      saveConfig(defaultConfig);
      return defaultConfig;
    }
  } catch (error) {
    console.error('Error loading BIOS configuration:', error);
    return defaultConfig;
  }
}

// Save BIOS configuration
function saveConfig(config) {
  const configPath = getConfigPath();
  
  try {
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving BIOS configuration:', error);
    return false;
  }
}

// Check if first boot (no config file exists)
function isFirstBoot() {
  const configPath = getConfigPath();
  return !fs.existsSync(configPath);
}

// Run BIOS setup interface
function setupBIOS() {
  return new Promise((resolve) => {
    clearScreen();
    
    const config = loadConfig();
    
    console.log(colorText('\n■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■', 'blue'));
    console.log(colorText('■                                          ■', 'blue'));
    console.log(colorText('■             IrisOS BIOS Setup            ■', 'blue'));
    console.log(colorText('■                                          ■', 'blue'));
    console.log(colorText('■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■', 'blue'));
    console.log('\n');
    
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    // Show configuration options
    function showMainMenu() {
      console.log(colorText('\nBIOS Configuration Options:\n', 'cyan'));
      console.log('1. System Settings');
      console.log('2. Boot Options');
      console.log('3. Display Settings');
      console.log('4. Network Settings');
      console.log('5. Save and Exit');
      console.log('6. Exit Without Saving');
      console.log('');
      
      rl.question('Enter your choice (1-6): ', (choice) => {
        switch (choice) {
          case '1':
            configureSystem();
            break;
          case '2':
            configureBoot();
            break;
          case '3':
            configureDisplay();
            break;
          case '4':
            configureNetwork();
            break;
          case '5':
            saveConfig(config);
            console.log(colorText('\nConfiguration saved. Booting IrisOS...\n', 'green'));
            rl.close();
            resolve(config);
            break;
          case '6':
            console.log(colorText('\nExiting without saving. Booting IrisOS with existing configuration...\n', 'yellow'));
            rl.close();
            resolve(loadConfig());
            break;
          default:
            console.log(colorText('Invalid choice. Please try again.', 'red'));
            showMainMenu();
        }
      });
    }
    
    // System settings
    function configureSystem() {
      console.log(colorText('\nSystem Settings:\n', 'cyan'));
      console.log(`1. Username: ${config.username}`);
      console.log(`2. Hostname: ${config.hostname}`);
      console.log(`3. Language: ${config.language}`);
      console.log(`4. Timezone: ${config.timezone}`);
      console.log(`5. System Memory: ${config.systemMemory} MB`);
      console.log(`6. Hard Drive Size: ${config.hardDriveSize} MB`);
      console.log('7. Back to Main Menu');
      console.log('');
      
      rl.question('Enter option to change (1-7): ', (choice) => {
        switch (choice) {
          case '1':
            rl.question('Enter new username: ', (value) => {
              config.username = value.trim() || 'user';
              configureSystem();
            });
            break;
          case '2':
            rl.question('Enter new hostname: ', (value) => {
              config.hostname = value.trim() || 'irisos';
              configureSystem();
            });
            break;
          case '3':
            rl.question('Enter language code (e.g., en, es, fr): ', (value) => {
              config.language = value.trim() || 'en';
              configureSystem();
            });
            break;
          case '4':
            rl.question('Enter timezone: ', (value) => {
              config.timezone = value.trim() || 'UTC';
              configureSystem();
            });
            break;
          case '5':
            rl.question('Enter system memory (MB): ', (value) => {
              const memory = parseInt(value);
              config.systemMemory = isNaN(memory) ? 512 : memory;
              configureSystem();
            });
            break;
          case '6':
            rl.question('Enter hard drive size (MB): ', (value) => {
              const size = parseInt(value);
              config.hardDriveSize = isNaN(size) ? 2048 : size;
              configureSystem();
            });
            break;
          case '7':
            showMainMenu();
            break;
          default:
            console.log(colorText('Invalid choice. Please try again.', 'red'));
            configureSystem();
        }
      });
    }
    
    // Boot options
    function configureBoot() {
      console.log(colorText('\nBoot Options:\n', 'cyan'));
      console.log(`1. Boot Delay: ${config.bootDelay} seconds`);
      console.log(`2. Show Splash Screen: ${config.splashScreen ? 'Yes' : 'No'}`);
      console.log(`3. Start Desktop Automatically: ${config.startDesktop ? 'Yes' : 'No'}`);
      console.log(`4. Startup Sound: ${config.startupSound ? 'Enabled' : 'Disabled'}`);
      console.log(`5. Boot Priority: ${config.bootPriority.join(', ')}`);
      console.log('6. Back to Main Menu');
      console.log('');
      
      rl.question('Enter option to change (1-6): ', (choice) => {
        switch (choice) {
          case '1':
            rl.question('Enter boot delay (seconds): ', (value) => {
              const delay = parseInt(value);
              config.bootDelay = isNaN(delay) ? 2 : delay;
              configureBoot();
            });
            break;
          case '2':
            config.splashScreen = !config.splashScreen;
            configureBoot();
            break;
          case '3':
            config.startDesktop = !config.startDesktop;
            configureBoot();
            break;
          case '4':
            config.startupSound = !config.startupSound;
            configureBoot();
            break;
          case '5':
            rl.question('Enter boot priority (comma-separated: internal, usb, network): ', (value) => {
              const priorities = value.split(',').map(p => p.trim()).filter(p => ['internal', 'usb', 'network'].includes(p));
              config.bootPriority = priorities.length > 0 ? priorities : ['internal', 'usb', 'network'];
              configureBoot();
            });
            break;
          case '6':
            showMainMenu();
            break;
          default:
            console.log(colorText('Invalid choice. Please try again.', 'red'));
            configureBoot();
        }
      });
    }
    
    // Display settings
    function configureDisplay() {
      console.log(colorText('\nDisplay Settings:\n', 'cyan'));
      console.log(`1. Desktop Theme: ${config.desktopTheme}`);
      console.log('2. Back to Main Menu');
      console.log('');
      
      rl.question('Enter option to change (1-2): ', (choice) => {
        switch (choice) {
          case '1':
            rl.question('Enter theme (dark, light, blue): ', (value) => {
              const theme = value.trim().toLowerCase();
              config.desktopTheme = ['dark', 'light', 'blue'].includes(theme) ? theme : 'dark';
              configureDisplay();
            });
            break;
          case '2':
            showMainMenu();
            break;
          default:
            console.log(colorText('Invalid choice. Please try again.', 'red'));
            configureDisplay();
        }
      });
    }
    
    // Network settings
    function configureNetwork() {
      console.log(colorText('\nNetwork Settings:\n', 'cyan'));
      console.log(`1. Network Enabled: ${config.networkEnabled ? 'Yes' : 'No'}`);
      console.log(`2. Auto Connect: ${config.autoConnect ? 'Yes' : 'No'}`);
      console.log('3. Back to Main Menu');
      console.log('');
      
      rl.question('Enter option to change (1-3): ', (choice) => {
        switch (choice) {
          case '1':
            config.networkEnabled = !config.networkEnabled;
            configureNetwork();
            break;
          case '2':
            config.autoConnect = !config.autoConnect;
            configureNetwork();
            break;
          case '3':
            showMainMenu();
            break;
          default:
            console.log(colorText('Invalid choice. Please try again.', 'red'));
            configureNetwork();
        }
      });
    }
    
    // Start with main menu
    showMainMenu();
  });
}

// Boot sequence with POST (Power-On Self Test)
async function bootSequence() {
  clearScreen();
  
  //  POST
  console.log(colorText('\nIrisOS BIOS v1.0', 'cyan'));
  console.log('Performing system check...\n');
  
  // Memory check
  process.stdout.write('Checking memory... ');
  await new Promise(resolve => setTimeout(resolve, 500));
  console.log(colorText('OK', 'green'));
  
  // CPU check
  process.stdout.write('Checking CPU... ');
  await new Promise(resolve => setTimeout(resolve, 300));
  console.log(colorText('OK', 'green'));
  
  // Hard drive check
  process.stdout.write('Checking storage... ');
  await new Promise(resolve => setTimeout(resolve, 600));
  console.log(colorText('OK', 'green'));
  
  // Network check
  process.stdout.write('Checking network... ');
  await new Promise(resolve => setTimeout(resolve, 400));
  console.log(colorText('OK', 'green'));
  
  console.log('\nAll systems nominal. Continuing boot process...\n');
  
  // Check if this is first boot
  if (isFirstBoot()) {
    console.log(colorText('First boot detected. Entering BIOS setup...\n', 'yellow'));
    await new Promise(resolve => setTimeout(resolve, 1000));
    return setupBIOS();
  }
  
  // Get configuration
  const config = loadConfig();
  
  // Show boot menu if boot delay is set
  if (config.bootDelay > 0) {
    console.log(colorText(`Press F2 to enter setup... (${config.bootDelay}s)`, 'cyan'));
    
    // Wait for key press or timeout
    const keyPressed = await new Promise((resolve) => {
      // Set timeout for auto-boot
      const timeout = setTimeout(() => {
        resolve(false);
      }, config.bootDelay * 1000);
      
      // Listen for key press
      process.stdin.setRawMode(true);
      process.stdin.resume();
      process.stdin.once('data', (data) => {
        const key = data.toString();
        if (key === '\x1B\x4F\x51' || key === '\x1B\x5B\x31\x31\x7E' || key.toLowerCase() === 'f') {
          clearTimeout(timeout);
          process.stdin.setRawMode(false);
          resolve(true);
        } else {
          process.stdin.setRawMode(false);
          resolve(false);
        }
      });
    });
    
    if (keyPressed) {
      // Enter BIOS setup
      process.stdin.setRawMode(false);
      return setupBIOS();
    }
  }
  
  return config;
}

module.exports = {
  loadConfig,
  saveConfig,
  setupBIOS,
  bootSequence,
  isFirstBoot
};