// TextOS - A custom text-based operating system
// Entry point for the application

const readline = require('readline');
const { parseCommand } = require('./lib/commandParser');
const { executeCommand } = require('./lib/commands');
const { initializeFileSystem } = require('./lib/filesystem');
const { formatPrompt, clearScreen, printWelcome, colorText } = require('./lib/terminal');
const { bootSequence } = require('./lib/bios');
const { startDesktop, initializeDesktop } = require('./lib/desktop');
const { startBrowser } = require('./lib/browser');

// Initialize the in-memory file system
const fileSystem = initializeFileSystem();

// Current working directory tracker
let currentPath = '/';

// Initialize system variables
let systemConfig = null;
let desktopEnabled = true;

// Main entry point
async function main() {
  // Boot the system with BIOS
  console.log(colorText('Starting TextOS...', 'cyan'));
  
  try {
    // Run boot sequence and get system configuration
    systemConfig = await bootSequence();
    
    // Check if desktop is enabled in BIOS
    desktopEnabled = systemConfig.startDesktop;
    
    // Start the system
    if (desktopEnabled) {
      // Start desktop environment
      await startDesktopMode();
    } else {
      // Start terminal-only mode
      startTerminalMode();
    }
  } catch (error) {
    console.error('Error during boot:', error);
    console.log('Starting in safe mode (terminal only)...');
    startTerminalMode();
  }
  
  // Start web server if enabled
  if (process.env.ENABLE_SERVER === 'true') {
    console.log(colorText("\nStarting TextOS Web Interface...", 'yellow'));
    const server = require('./server');
    console.log(colorText("TextOS Web Interface is running at http://localhost:5000", 'green'));
    console.log(colorText("You can continue using the interface here.\n", 'yellow'));
  }
}

// Handle desktop mode
async function startDesktopMode() {
  clearScreen();
  console.log(colorText('Starting TextOS Desktop Environment...', 'cyan'));
  await startDesktop(fileSystem, currentPath);
  
  // If user exits desktop, fall back to terminal mode
  startTerminalMode();
}

// Handle terminal mode
function startTerminalMode() {
  // Create interface for reading from and writing to the terminal
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  // Boot the terminal interface
  clearScreen();
  printWelcome();
  promptUser(rl);
}

// Handle user input in terminal mode
function promptUser(rl) {
  rl.question(formatPrompt(currentPath), async (input) => {
    if (input.trim().toLowerCase() === 'exit' || input.trim().toLowerCase() === 'shutdown') {
      console.log('Shutting down TextOS. Goodbye!');
      rl.close();
      return;
    }
    
    // Special commands
    if (input.trim().toLowerCase() === 'desktop') {
      rl.close();
      await startDesktopMode();
      return;
    }
    
    if (input.trim().toLowerCase() === 'browser') {
      console.log('Starting TextOS Browser...');
      await startBrowser();
      promptUser(rl);
      return;
    }
    
    if (input.trim().toLowerCase() === 'bios') {
      rl.close();
      main(); // Restart with BIOS configuration
      return;
    }

    const { command, args } = parseCommand(input);
    
    // Execute the command and get result
    try {
      const result = executeCommand(command, args, {
        fileSystem,
        currentPath,
        updatePath: (newPath) => { currentPath = newPath; }
      });

      // Display feedback if there's a message
      if (result && result.message) {
        console.log(result.message);
      }
    } catch (error) {
      console.error(`Error executing command: ${error.message}`);
    }

    // Continue prompting
    promptUser(rl);
  });
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down TextOS. Goodbye!');
  process.exit(0);
});

// Start the system
main();

module.exports = {
  main
};
