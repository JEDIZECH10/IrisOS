// IrisOS - Desktop Environment Module
// Handles the graphical desktop interface with a modern look

const readline = require('readline');
const { colorText, clearScreen } = require('./terminal');
const { parseCommand, resolvePath } = require('./commandParser');
const { executeCommand } = require('./commands');
const { loadConfig } = require('./bios');

// Desktop state
let desktopConfig = {
  theme: 'dark',
  icons: [],
  openWindows: [],
  activeWindow: null,
  startMenuOpen: false,
  notificationsOpen: false,
  time: new Date(),
  battery: 85,
  wifi: true,
  volume: 75,
  brightness: 80
};

// Default desktop icons
const defaultIcons = [
  { name: 'Internet', type: 'app', command: 'browser', icon: '🌐' },
  { name: 'Explorer', type: 'app', command: 'files', icon: '📁' },
  { name: 'Terminal', type: 'app', command: 'terminal', icon: '⌨️' },
  { name: 'Settings', type: 'app', command: 'settings', icon: '⚙️' },
  { name: 'Store', type: 'app', command: 'store', icon: '🛒' },
  { name: 'Photos', type: 'app', command: 'photos', icon: '🖼️' },
  { name: 'Mail', type: 'app', command: 'mail', icon: '✉️' },
  { name: 'Calendar', type: 'app', command: 'calendar', icon: '📅' },
  { name: 'Calculator', type: 'app', command: 'calculator', icon: '🧮' },
  { name: 'Notepad', type: 'app', command: 'notepad', icon: '📝' }
];

// Window class for managing application windows with modern styling
class Window {
  constructor(title, app, width = 80, height = 24) {
    this.id = Date.now();
    this.title = title;
    this.app = app;
    this.width = width;
    this.height = height;
    this.position = { x: 0, y: 0 };
    this.content = [];
    this.minimized = false;
    this.maximized = false;
    this.resizable = true;
    this.theme = desktopConfig.theme;
    this.icon = this.getIconForApp(app);
    this.timestamp = new Date();
  }
  
  getIconForApp(appName) {
    const app = defaultIcons.find(icon => icon.command === appName);
    return app ? app.icon : '📄';
  }
  
  focus() {
    desktopConfig.activeWindow = this.id;
  }
  
  minimize() {
    this.minimized = true;
  }
  
  maximize() {
    this.maximized = !this.maximized;
    if (this.maximized) {
      this.previousWidth = this.width;
      this.previousHeight = this.height;
      this.width = 100;
      this.height = 30;
    } else if (this.previousWidth && this.previousHeight) {
      this.width = this.previousWidth;
      this.height = this.previousHeight;
    }
  }
  
  close() {
    desktopConfig.openWindows = desktopConfig.openWindows.filter(w => w.id !== this.id);
    if (desktopConfig.activeWindow === this.id) {
      desktopConfig.activeWindow = desktopConfig.openWindows.length > 0 
        ? desktopConfig.openWindows[desktopConfig.openWindows.length - 1].id 
        : null;
    }
  }
  
  resize(width, height) {
    if (this.resizable) {
      this.width = width;
      this.height = height;
    }
  }
  
  move(x, y) {
    this.position.x = x;
    this.position.y = y;
  }
  
  render() {
    if (this.minimized) return '';
    
    const theme = getThemeColors(this.theme);
    const isActive = desktopConfig.activeWindow === this.id;
    const titleBarColor = isActive ? theme.accent : theme.secondary;
    
    // Create window border and title
    const topBorder = colorText('┌' + '─'.repeat(this.width - 2) + '┐', titleBarColor);
    const bottomBorder = colorText('└' + '─'.repeat(this.width - 2) + '┘', titleBarColor);
    const emptyLine = colorText('│', titleBarColor) + ' '.repeat(this.width - 2) + colorText('│', titleBarColor);
    
    // Format title with controls and icon
    const titleText = ` ${this.icon} ${this.title}`;
    const titlePadding = this.width - titleText.length - 12; // Account for controls and spacing
    const titleBar = colorText('│', titleBarColor) + 
      colorText(titleText, isActive ? theme.highlight : theme.text) +
      ' '.repeat(Math.max(0, titlePadding)) + 
      colorText('[−]', theme.text) + ' ' + 
      colorText('[□]', theme.text) + ' ' + 
      colorText('[×]', 'red') + 
      colorText('│', titleBarColor);
    
    // Build window content
    let windowContent = [topBorder, titleBar];
    
    // Add toolbar if applicable
    const hasToolbar = ['browser', 'files', 'mail', 'notepad'].includes(this.app);
    if (hasToolbar) {
      const toolbarLine = colorText('│', titleBarColor) + 
        colorText(' File Edit View Tools Help', theme.text) +
        ' '.repeat(this.width - 29) + 
        colorText('│', titleBarColor);
      windowContent.push(toolbarLine);
    }
    
    // Add empty space for window content area
    const contentHeight = hasToolbar ? this.height - 4 : this.height - 3;
    
    // Generate content based on app type
    const appContent = this.generateAppContent();
    
    // If we have app-specific content, use it
    if (appContent.length > 0) {
      for (let i = 0; i < Math.min(contentHeight, appContent.length); i++) {
        const line = appContent[i] || '';
        const paddedLine = line.padEnd(this.width - 2, ' ');
        windowContent.push(colorText('│', titleBarColor) + paddedLine + colorText('│', titleBarColor));
      }
      
      // Fill remaining space
      for (let i = appContent.length; i < contentHeight; i++) {
        windowContent.push(emptyLine);
      }
    } else {
      // Default empty content
      for (let i = 0; i < contentHeight; i++) {
        windowContent.push(emptyLine);
      }
    }
    
    // Add status bar for certain apps
    if (['browser', 'files', 'terminal'].includes(this.app)) {
      const statusText = this.app === 'browser' ? 'https://irisos.local/' :
                          this.app === 'files' ? 'C:\\Users\\user\\Documents' :
                          'C:\\IrisOS\\System32>';
      
      const statusBar = colorText('│', titleBarColor) + 
        colorText(` ${statusText}`, theme.text) +
        ' '.repeat(this.width - statusText.length - 3) + 
        colorText('│', titleBarColor);
      windowContent.push(statusBar);
    }
    
    windowContent.push(bottomBorder);
    
    return windowContent.join('\n');
  }
  
  generateAppContent() {
    const lines = [];
    
    switch (this.app) {
      case 'browser':
        lines.push('  🔍 Search or enter address');
        lines.push('  ');
        lines.push('  📰 IrisOS News');
        lines.push('  ');
        lines.push('  • Welcome to IrisOS Browser');
        lines.push('  • New features available in the latest update');
        lines.push('  • Discover apps in the IrisOS Store');
        lines.push('  ');
        lines.push('  📌 Pinned Sites');
        lines.push('  ');
        lines.push('  🌐 irisos.home    📧 mail.irisos    📝 docs.irisos');
        break;
        
      case 'files':
        lines.push('  📂 Quick access    📂 This Device    📂 Network');
        lines.push('  ');
        lines.push('  Name             Type      Size     Modified');
        lines.push('  ----------------------------------------------');
        lines.push('  📁 Documents      Folder    -        Today');
        lines.push('  📁 Pictures       Folder    -        Today');
        lines.push('  📁 Music          Folder    -        Today');
        lines.push('  📁 Downloads      Folder    -        Today');
        lines.push('  📄 Readme.txt     Text      2 KB     Today');
        lines.push('  📄 Notes.txt      Text      1 KB     Today');
        break;
        
      case 'terminal':
        lines.push('  IrisOS Command Terminal');
        lines.push('  ');
        lines.push('  Type help for a list of commands');
        lines.push('  ');
        lines.push('  C:\\IrisOS\\System32> _');
        break;
        
      case 'settings':
        lines.push('  ⚙️ IrisOS Settings');
        lines.push('  ');
        lines.push('  🖥️ System        🔊 Sound          🔍 Search');
        lines.push('  🎨 Personalization 🔌 Power          ⌨️ Input');
        lines.push('  🔒 Privacy        ⚡ Network         🕒 Time');
        lines.push('  👤 Accounts       📱 Devices         🔄 Update');
        break;
        
      case 'store':
        lines.push('  📱 IrisOS Store');
        lines.push('  ');
        lines.push('  🎮 Games    🎵 Music    🎬 Movies    📚 Books');
        lines.push('  ');
        lines.push('  Featured Apps:');
        lines.push('  ');
        lines.push('  📝 TextEdit Pro    🖼️ PhotoViewer    🎮 TextQuest');
        lines.push('  📊 DataAnalyzer    🎵 MusicPlayer    🔐 SecureVault');
        break;
        
      case 'notepad':
        lines.push('  Untitled - Notepad');
        lines.push('  ');
        lines.push('  Welcome to IrisOS Notepad!');
        lines.push('  ');
        lines.push('  This is a simple text editor for IrisOS.');
        lines.push('  ');
        lines.push('  Use it to create and edit text documents.');
        break;
        
      case 'calculator':
        lines.push('  ┌───────────────────┐');
        lines.push('  │               0   │');
        lines.push('  ├───┬───┬───┬───┬───┤');
        lines.push('  │ C │ ± │ % │ ÷ │ π │');
        lines.push('  ├───┼───┼───┼───┼───┤');
        lines.push('  │ 7 │ 8 │ 9 │ × │√  │');
        lines.push('  ├───┼───┼───┼───┼───┤');
        lines.push('  │ 4 │ 5 │ 6 │ - │^  │');
        lines.push('  ├───┼───┼───┼───┼───┤');
        lines.push('  │ 1 │ 2 │ 3 │ + │ = │');
        lines.push('  ├───┼───┼───┼───┼───┤');
        lines.push('  │ 0       │ . │   │');
        lines.push('  └───────────────────┘');
        break;
        
      default:
        // Empty content for other apps
        break;
    }
    
    return lines;
  }
}

// Application definitions with modern UI
const apps = {
  terminal: {
    name: 'Terminal',
    open: (fs, currentPath) => {
      const win = new Window('Command Prompt', 'terminal', 80, 24);
      desktopConfig.openWindows.push(win);
      win.focus();
      return win;
    }
  },
  
  files: {
    name: 'File Explorer',
    open: (fs, currentPath) => {
      const win = new Window('File Explorer', 'files', 90, 25);
      desktopConfig.openWindows.push(win);
      win.focus();
      return win;
    }
  },
  
  browser: {
    name: 'Internet',
    open: (fs, currentPath) => {
      const win = new Window('Internet', 'browser', 90, 30);
      desktopConfig.openWindows.push(win);
      win.focus();
      return win;
    }
  },
  
  settings: {
    name: 'Settings',
    open: (fs, currentPath) => {
      const win = new Window('Settings', 'settings', 80, 25);
      desktopConfig.openWindows.push(win);
      win.focus();
      return win;
    }
  },
  
  help: {
    name: 'Help Center',
    open: (fs, currentPath) => {
      const win = new Window('Help Center', 'help', 70, 22);
      desktopConfig.openWindows.push(win);
      win.focus();
      return win;
    }
  },
  
  notepad: {
    name: 'Notepad',
    open: (fs, currentPath) => {
      const win = new Window('Untitled - Notepad', 'notepad', 70, 22);
      desktopConfig.openWindows.push(win);
      win.focus();
      return win;
    }
  },
  
  calculator: {
    name: 'Calculator',
    open: (fs, currentPath) => {
      const win = new Window('Calculator', 'calculator', 35, 18);
      desktopConfig.openWindows.push(win);
      win.focus();
      return win;
    }
  },
  
  store: {
    name: 'Store',
    open: (fs, currentPath) => {
      const win = new Window('Store', 'store', 90, 28);
      desktopConfig.openWindows.push(win);
      win.focus();
      return win;
    }
  },
  
  mail: {
    name: 'Mail',
    open: (fs, currentPath) => {
      const win = new Window('Mail', 'mail', 85, 26);
      desktopConfig.openWindows.push(win);
      win.focus();
      return win;
    }
  },
  
  calendar: {
    name: 'Calendar',
    open: (fs, currentPath) => {
      const win = new Window('Calendar', 'calendar', 80, 25);
      desktopConfig.openWindows.push(win);
      win.focus();
      return win;
    }
  },
  
  photos: {
    name: 'Photos',
    open: (fs, currentPath) => {
      const win = new Window('Photos', 'photos', 80, 25);
      desktopConfig.openWindows.push(win);
      win.focus();
      return win;
    }
  }
};

// Initialize desktop
function initializeDesktop() {
  // Load config
  const biosConfig = loadConfig();
  desktopConfig.theme = biosConfig.desktopTheme || 'dark';
  
  // Set icons
  desktopConfig.icons = [...defaultIcons];
  
  return desktopConfig;
}

// Start the desktop environment
function startDesktop(fileSystem, currentPath) {
  // Initialize
  const desktop = initializeDesktop();
  
  // Clear screen
  clearScreen();
  
  // Show desktop
  renderDesktop();
  
  // Listen for input
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  function promptUser() {
    rl.question('IrisOS Desktop > ', (input) => {
      const command = input.trim().toLowerCase();
      if (command === 'exit' || command === 'shutdown') {
        console.log('Shutting down IrisOS. Goodbye!');
        rl.close();
        process.exit(0); // Properly exit to Windows
        return;
      }
      
      handleDesktopCommand(input, fileSystem, currentPath);
      promptUser();
    });
  }
  
  promptUser();
}

// Render the desktop with modern look including desktop, taskbar, and start menu
function renderDesktop() {
  const theme = getThemeColors(desktopConfig.theme);
  
  // Clear screen
  clearScreen();
  
  // Update time
  desktopConfig.time = new Date();
  
  // Show desktop wallpaper and background
  const desktopWidth = 100;
  
  // Draw desktop background
  if (desktopConfig.theme === 'dark') {
    console.log(colorText(' '.repeat(desktopWidth), 'blue', true)); // Blue desktop background for dark theme
  } else if (desktopConfig.theme === 'light') {
    console.log(colorText(' '.repeat(desktopWidth), 'cyan', true)); // Light blue desktop background for light theme
  } else {
    console.log(colorText(' '.repeat(desktopWidth), 'blue', true)); // Default blue background
  }
  
  // Show desktop watermark/logo
  console.log('');
  console.log(colorText('      IrisOS', theme.highlight) + '   ' + 
              colorText(`Build ${Math.floor(Math.random() * 9000) + 1000}`, theme.text));
  console.log('');
  
  // Show desktop icons in a grid layout
  const iconsPerRow = 5;
  const rows = Math.ceil(desktopConfig.icons.length / iconsPerRow);
  
  for (let row = 0; row < rows; row++) {
    let iconRow = '';
    
    for (let col = 0; col < iconsPerRow; col++) {
      const iconIndex = row * iconsPerRow + col;
      
      if (iconIndex < desktopConfig.icons.length) {
        const icon = desktopConfig.icons[iconIndex];
        const iconText = `${icon.icon} ${icon.name}`;
        iconRow += colorText(iconText.padEnd(20), theme.text) + ' ';
      }
    }
    
    console.log(iconRow);
    console.log(''); // Add space between icon rows
  }
  
  // Show open windows
  if (desktopConfig.openWindows.length > 0) {
    console.log('');
    
    // Render active window
    const activeWindow = desktopConfig.openWindows.find(w => w.id === desktopConfig.activeWindow);
    if (activeWindow && !activeWindow.minimized) {
      console.log(activeWindow.render());
    }
  }
  
  // Show start menu if open
  if (desktopConfig.startMenuOpen) {
    renderStartMenu(theme);
  }
  
  // Show notifications panel if open
  if (desktopConfig.notificationsOpen) {
    renderNotificationsPanel(theme);
  }
  
  // Draw taskbar (always at the bottom)
  console.log('');
  renderTaskbar(theme);
  
  // Show command prompt
  console.log('');
  console.log(colorText('Commands: start, taskview, open <app>, close, minimize, maximize, switch <number>, terminal, exit', theme.text));
  console.log('');
}

// Render the taskbar
function renderTaskbar(theme) {
  const taskbarWidth = 100;
  
  // Taskbar background
  const taskbarBg = desktopConfig.theme === 'dark' ? 'blue' : desktopConfig.theme === 'light' ? 'cyan' : 'blue';
  const taskbar = colorText('█'.repeat(taskbarWidth), taskbarBg);
  
  // Start button
  const startIcon = desktopConfig.startMenuOpen ? colorText('■', 'green') : colorText('■', 'green');
  
  // Task view button
  const taskViewIcon = colorText('☰', 'white');
  
  // Taskbar icons (up to 8 from open windows and pinned items)
  let taskbarIcons = '';
  const pinnedApps = ['browser', 'files', 'terminal', 'mail'];
  
  // First add open windows
  const openApps = desktopConfig.openWindows.map(w => w.app);
  
  // Then add pinned apps that aren't already open
  const allApps = [...new Set([...openApps, ...pinnedApps])].slice(0, 8);
  
  allApps.forEach(app => {
    const isOpen = openApps.includes(app);
    const icon = defaultIcons.find(i => i.command === app)?.icon || '📄';
    
    if (isOpen) {
      // App is open, highlight it
      taskbarIcons += colorText(` ${icon} `, 'white', true) + ' ';
    } else {
      // App is pinned but not open
      taskbarIcons += colorText(` ${icon} `, 'white') + ' ';
    }
  });
  
  // System tray icons
  const time = desktopConfig.time.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  const date = desktopConfig.time.toLocaleDateString([], {month: 'short', day: 'numeric'});
  const systemTray = colorText(` ${desktopConfig.wifi ? '📶' : '🚫'} `, 'white') +
                     colorText(` ${desktopConfig.volume}% 🔊 `, 'white') +
                     colorText(` ${desktopConfig.battery}% 🔋 `, 'white') +
                     colorText(` ${time} `, 'white') +
                     colorText(` ${date} `, 'white');
  
  // Calculate remaining space
  const usedSpace = 3 + 3 + taskbarIcons.length + systemTray.length;
  const padding = Math.max(0, taskbarWidth - usedSpace);
  
  // Construct taskbar
  console.log(startIcon + ' ' + taskViewIcon + ' ' + taskbarIcons + ' '.repeat(padding) + systemTray);
}

// Render the start menu
function renderStartMenu(theme) {
  const menuWidth = 60;
  const menuHeight = 25;
  
  console.log(colorText('┌' + '─'.repeat(menuWidth - 2) + '┐', theme.primary));
  
  // User profile section
  console.log(colorText('│', theme.primary) + 
              colorText(' 👤 User', theme.text) +
              ' '.repeat(menuWidth - 9) + 
              colorText('│', theme.primary));
  
  console.log(colorText('│', theme.primary) + 
              ' '.repeat(menuWidth - 2) + 
              colorText('│', theme.primary));
  
  // Most used apps
  console.log(colorText('│', theme.primary) + 
              colorText(' Most used', theme.accent) +
              ' '.repeat(menuWidth - 12) + 
              colorText('│', theme.primary));
              
  // Alphabetical sections
  console.log(colorText('│', theme.primary) + 
              colorText(` ${defaultIcons[0].icon} ${defaultIcons[0].name}`, theme.text) +
              ' '.repeat(menuWidth - defaultIcons[0].name.length - 5) + 
              colorText('│', theme.primary));
              
  console.log(colorText('│', theme.primary) + 
              colorText(` ${defaultIcons[1].icon} ${defaultIcons[1].name}`, theme.text) +
              ' '.repeat(menuWidth - defaultIcons[1].name.length - 5) + 
              colorText('│', theme.primary));
              
  console.log(colorText('│', theme.primary) + 
              colorText(` ${defaultIcons[2].icon} ${defaultIcons[2].name}`, theme.text) +
              ' '.repeat(menuWidth - defaultIcons[2].name.length - 5) + 
              colorText('│', theme.primary));
  
  console.log(colorText('│', theme.primary) + 
              ' '.repeat(menuWidth - 2) + 
              colorText('│', theme.primary));
  
  // All apps header
  console.log(colorText('│', theme.primary) + 
              colorText(' All apps', theme.accent) +
              ' '.repeat(menuWidth - 11) + 
              colorText('│', theme.primary));
  
  // Generate alphabetical list of apps
  const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
  
  for (const letter of letters) {
    // Header for each letter
    console.log(colorText('│', theme.primary) + 
                colorText(` ${letter}`, theme.highlight) +
                ' '.repeat(menuWidth - 5) + 
                colorText('│', theme.primary));
    
    // Apps for each letter (just examples)
    if (letter === 'C') {
      console.log(colorText('│', theme.primary) + 
                  colorText('  🧮 Calculator', theme.text) +
                  ' '.repeat(menuWidth - 15) + 
                  colorText('│', theme.primary));
      
      console.log(colorText('│', theme.primary) + 
                  colorText('  📅 Calendar', theme.text) +
                  ' '.repeat(menuWidth - 13) + 
                  colorText('│', theme.primary));
    } else if (letter === 'E') {
      console.log(colorText('│', theme.primary) + 
                  colorText('  📁 Explorer', theme.text) +
                  ' '.repeat(menuWidth - 13) + 
                  colorText('│', theme.primary));
    } else if (letter === 'I') {
      console.log(colorText('│', theme.primary) + 
                  colorText('  🌐 Internet', theme.text) +
                  ' '.repeat(menuWidth - 13) + 
                  colorText('│', theme.primary));
    } else {
      // Empty letter section
      console.log(colorText('│', theme.primary) + 
                  ' '.repeat(menuWidth - 2) + 
                  colorText('│', theme.primary));
    }
  }
  
  // Power options at the bottom
  console.log(colorText('│', theme.primary) + 
              ' '.repeat(menuWidth - 2) + 
              colorText('│', theme.primary));
              
  console.log(colorText('│', theme.primary) + 
              colorText(' ⚙️ Settings     ', theme.text) +
              colorText('⏻ Power      ', theme.text) +
              ' '.repeat(menuWidth - 27) + 
              colorText('│', theme.primary));
  
  // Bottom border
  console.log(colorText('└' + '─'.repeat(menuWidth - 2) + '┘', theme.primary));
}

// Render the notifications panel
function renderNotificationsPanel(theme) {
  const panelWidth = 40;
  const panelHeight = 20;
  
  console.log(colorText('┌' + '─'.repeat(panelWidth - 2) + '┐', theme.secondary));
  
  // Header
  console.log(colorText('│', theme.secondary) + 
              colorText(' Notifications', theme.accent) +
              ' '.repeat(panelWidth - 16) + 
              colorText('│', theme.secondary));
  
  console.log(colorText('│', theme.secondary) + 
              ' '.repeat(panelWidth - 2) + 
              colorText('│', theme.secondary));
  
  // No notifications message
  console.log(colorText('│', theme.secondary) + 
              colorText(' No new notifications', theme.text) +
              ' '.repeat(panelWidth - 23) + 
              colorText('│', theme.secondary));
  
  // Quick actions title
  console.log(colorText('│', theme.secondary) + 
              ' '.repeat(panelWidth - 2) + 
              colorText('│', theme.secondary));
              
  console.log(colorText('│', theme.secondary) + 
              colorText(' Quick actions', theme.accent) +
              ' '.repeat(panelWidth - 16) + 
              colorText('│', theme.secondary));
  
  console.log(colorText('│', theme.secondary) + 
              ' '.repeat(panelWidth - 2) + 
              colorText('│', theme.secondary));
  
  // Quick action buttons in a grid
  console.log(colorText('│', theme.secondary) + 
              colorText(' 📶 Wifi: ON ', theme.text) + 
              colorText(' 🔊 Sound: ON', theme.text) +
              ' '.repeat(panelWidth - 26) + 
              colorText('│', theme.secondary));
              
  console.log(colorText('│', theme.secondary) + 
              colorText(' 🔆 Bright: 80%', theme.text) + 
              colorText(' 🌙 Night: OFF', theme.text) +
              ' '.repeat(panelWidth - 28) + 
              colorText('│', theme.secondary));
  
  console.log(colorText('│', theme.secondary) + 
              colorText(' ✈️ Airplane: OFF', theme.text) + 
              colorText(' 📱 Mobile: OFF', theme.text) +
              ' '.repeat(panelWidth - 31) + 
              colorText('│', theme.secondary));
  
  // Fill remaining space
  for (let i = 0; i < 10; i++) {
    console.log(colorText('│', theme.secondary) + 
                ' '.repeat(panelWidth - 2) + 
                colorText('│', theme.secondary));
  }
  
  // Bottom border
  console.log(colorText('└' + '─'.repeat(panelWidth - 2) + '┘', theme.secondary));
}

// Handle desktop commands
function handleDesktopCommand(input, fileSystem, currentPath) {
  const parts = input.trim().split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1);
  
  switch (command) {
    case 'start':
      // Toggle start menu
      desktopConfig.startMenuOpen = !desktopConfig.startMenuOpen;
      
      // Close notifications panel if open
      if (desktopConfig.startMenuOpen) {
        desktopConfig.notificationsOpen = false;
      }
      break;
      
    case 'taskview':
      // Show all windows in task view
      console.log("Task View mode showing all open windows");
      // This would show all open windows in a grid
      break;
      
    case 'notifications':
      // Toggle notifications panel
      desktopConfig.notificationsOpen = !desktopConfig.notificationsOpen;
      
      // Close start menu if open
      if (desktopConfig.notificationsOpen) {
        desktopConfig.startMenuOpen = false;
      }
      break;
      
    case 'settings':
      openApplication('settings', fileSystem, currentPath);
      break;
      
    case 'power':
      console.log(colorText('Power options: shutdown, restart, sleep', 'yellow'));
      
      // Ask for power option choice
      const powerChoice = args[0] ? args[0].toLowerCase() : '';
      if (powerChoice === 'shutdown') {
        console.log(colorText('Shutting down IrisOS. Goodbye!', 'green'));
        setTimeout(() => {
          process.exit(0); // Exit to Windows
        }, 1500); // Slight delay for visual feedback
      } else if (powerChoice === 'restart') {
        console.log(colorText('Restarting IrisOS...', 'cyan'));
        // In a real implementation, we would restart the system
      } else if (powerChoice === 'sleep') {
        console.log(colorText('System going to sleep mode...', 'blue'));
        // In a real implementation, we would put the system to sleep
      }
      break;
      
    case 'open':
      openApplication(args[0], fileSystem, currentPath);
      
      // Close start menu if open
      desktopConfig.startMenuOpen = false;
      break;
      
    case 'close':
      closeActiveWindow();
      break;
      
    case 'minimize':
      minimizeActiveWindow();
      break;
      
    case 'maximize':
      maximizeActiveWindow();
      break;
      
    case 'switch':
      switchWindow(parseInt(args[0]) - 1);
      break;
      
    case 'terminal':
      // Open command prompt
      clearScreen();
      console.log(colorText('IrisOS Terminal\nType "desktop" to return to desktop mode.\n', 'cyan'));
      
      const terminalRL = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      function promptTerminal() {
        terminalRL.question(`${currentPath}> `, (cmd) => {
          if (cmd.trim().toLowerCase() === 'desktop') {
            terminalRL.close();
            renderDesktop();
            return;
          }
          
          const { command, args } = parseCommand(cmd);
          const result = executeCommand(command, args, {
            fileSystem,
            currentPath,
            updatePath: (newPath) => { currentPath = newPath; }
          });
          
          if (result && result.message) {
            console.log(result.message);
          }
          
          promptTerminal();
        });
      }
      
      promptTerminal();
      break;
      
    case 'browser':
      openApplication('browser', fileSystem, currentPath);
      break;
      
    case 'files':
      openApplication('files', fileSystem, currentPath);
      break;
      
    case 'notepad':
      openApplication('notepad', fileSystem, currentPath);
      break;
      
    case 'calculator':
      openApplication('calculator', fileSystem, currentPath);
      break;
      
    case 'store':
      openApplication('store', fileSystem, currentPath);
      break;
      
    case 'mail':
      openApplication('mail', fileSystem, currentPath);
      break;
      
    case 'calendar':
      openApplication('calendar', fileSystem, currentPath);
      break;
      
    case 'photos':
      openApplication('photos', fileSystem, currentPath);
      break;
      
    case 'theme':
      // Change the theme
      if (args.length > 0) {
        const newTheme = args[0].toLowerCase();
        if (['dark', 'light', 'blue'].includes(newTheme)) {
          desktopConfig.theme = newTheme;
          console.log(`Changed theme to ${newTheme}`);
        } else {
          console.log(`Unknown theme: ${args[0]}. Available themes: dark, light, blue`);
        }
      } else {
        console.log(`Current theme: ${desktopConfig.theme}`);
      }
      break;
      
    case 'help':
      showDesktopHelp();
      break;
      
    default:
      console.log(`Unknown command: ${command}`);
  }
  
  // Update display after command (except for terminal)
  if (command !== 'terminal') {
    renderDesktop();
  }
}

// Open an application
function openApplication(appName, fileSystem, currentPath) {
  if (!appName) {
    console.log('Please specify an application to open.');
    return;
  }
  
  // Find app by name (case insensitive)
  const app = Object.keys(apps).find(key => 
    key.toLowerCase() === appName.toLowerCase() || 
    apps[key].name.toLowerCase() === appName.toLowerCase()
  );
  
  if (app) {
    const window = apps[app].open(fileSystem, currentPath);
    console.log(`Opened ${apps[app].name}`);
  } else {
    console.log(`Application not found: ${appName}`);
  }
}

// Close the active window
function closeActiveWindow() {
  const activeWindow = desktopConfig.openWindows.find(w => w.id === desktopConfig.activeWindow);
  if (activeWindow) {
    activeWindow.close();
    console.log(`Closed: ${activeWindow.title}`);
  } else {
    console.log('No active window to close.');
  }
}

// Minimize the active window
function minimizeActiveWindow() {
  const activeWindow = desktopConfig.openWindows.find(w => w.id === desktopConfig.activeWindow);
  if (activeWindow) {
    activeWindow.minimize();
    console.log(`Minimized: ${activeWindow.title}`);
  } else {
    console.log('No active window to minimize.');
  }
}

// Maximize the active window
function maximizeActiveWindow() {
  const activeWindow = desktopConfig.openWindows.find(w => w.id === desktopConfig.activeWindow);
  if (activeWindow) {
    activeWindow.maximize();
    console.log(`Toggled maximize: ${activeWindow.title}`);
  } else {
    console.log('No active window to maximize.');
  }
}

// Switch between windows
function switchWindow(index) {
  if (index >= 0 && index < desktopConfig.openWindows.length) {
    desktopConfig.activeWindow = desktopConfig.openWindows[index].id;
    console.log(`Switched to: ${desktopConfig.openWindows[index].title}`);
  } else {
    console.log('Invalid window number.');
  }
}

// Show desktop help
function showDesktopHelp() {
  console.log(colorText('\nIrisOS Desktop Help\n', 'cyan'));
  console.log('Available commands:');
  
  // Start menu and taskbar
  console.log(colorText('System Navigation:', 'yellow'));
  console.log('  start          - Toggle the Start menu');
  console.log('  taskview       - Show all open windows in Task View');
  console.log('  notifications  - Toggle the notifications panel');
  console.log('  power          - Show power options (shutdown, restart, sleep)');
  console.log('  theme [name]   - Change or show current theme (dark, light, blue)');
  
  // Window management
  console.log(colorText('\nWindow Management:', 'yellow'));
  console.log('  open <app>     - Open an application');
  console.log('  close          - Close the active window');
  console.log('  minimize       - Minimize the active window');
  console.log('  maximize       - Toggle maximize for the active window');
  console.log('  switch <num>   - Switch to window by number');
  
  // Applications
  console.log(colorText('\nAvailable Applications:', 'yellow'));
  console.log('  terminal       - Command Prompt');
  console.log('  browser        - Internet browser');
  console.log('  files          - File Explorer');
  console.log('  notepad        - Text editor');
  console.log('  calculator     - Calculator app');
  console.log('  settings       - System Settings');
  console.log('  store          - App Store');
  console.log('  mail           - Email client');
  console.log('  calendar       - Calendar app');
  console.log('  photos         - Photo viewer');
  
  // System
  console.log(colorText('\nSystem Commands:', 'yellow'));
  console.log('  help           - Show this help message');
  console.log('  exit           - Exit desktop mode');
  console.log('');
}

// Get theme colors
function getThemeColors(theme) {
  const themes = {
    dark: {
      primary: 'blue',
      secondary: 'cyan',
      accent: 'magenta',
      text: 'white',
      highlight: 'green'
    },
    light: {
      primary: 'blue',
      secondary: 'cyan',
      accent: 'magenta',
      text: 'black',
      highlight: 'green'
    },
    blue: {
      primary: 'blue',
      secondary: 'cyan',
      accent: 'white',
      text: 'white',
      highlight: 'yellow'
    }
  };
  
  return themes[theme] || themes.dark;
}

module.exports = {
  startDesktop,
  initializeDesktop
};