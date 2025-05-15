// IrisOS - Boot Animation Module
// Provides realistic boot sequence animations

const { colorText, clearScreen } = require('./terminal');

// ASCII art for the IrisOS logo
const irisOSLogo = [
  "  _____       _        ____   _____ ",
  " |_   _|     (_)      / __ \\ / ____|",
  "   | |  _ __  _ ___  | |  | | (___  ",
  "   | | | '_ \\| / __| | |  | |\\___ \\ ",
  "  _| |_| | | | \\__ \\ | |__| |____) |",
  " |_____|_| |_|_|___/  \\____/|_____/ "
];

// Boot messages
const bootMessages = [
  "Initializing kernel...",
  "Loading system drivers...",
  "Mounting file systems...",
  "Starting system services...",
  "Initializing network interfaces...",
  "Loading desktop environment...",
  "Starting IrisOS services..."
];

// System startup services
const systemServices = [
  "[ OK ] Started System Logger Service",
  "[ OK ] Started User Manager Service",
  "[ OK ] Started File System Service",
  "[ OK ] Started Network Time Synchronization",
  "[ OK ] Started Job Scheduling Service",
  "[ OK ] Started Network Management Service",
  "[ OK ] Reached Target Network",
  "[ OK ] Reached Target Basic System",
  "[ OK ] Started Graphical Interface"
];

// Function to display progress bar
function showProgressBar(percent, width = 50) {
  const filled = Math.floor(width * percent / 100);
  const empty = width - filled;
  
  process.stdout.write('\r[');
  process.stdout.write('#'.repeat(filled));
  process.stdout.write(' '.repeat(empty));
  process.stdout.write(`] ${percent}%`);
}

// Function to show boot splash screen
function showBootSplash() {
  clearScreen();
  console.log('\n\n');
  
  // Display IrisOS logo in blue
  irisOSLogo.forEach(line => {
    console.log(colorText(line, 'blue'));
  });
  
  console.log('\n\n');
  
  // Show "Booting IrisOS..." text
  console.log(colorText('               Booting IrisOS...', 'cyan'));
  
  // Show animated progress bar
  return new Promise(resolve => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += 2;
      showProgressBar(progress);
      
      if (progress >= 100) {
        clearInterval(interval);
        console.log('\n\n');
        resolve();
      }
    }, 50);
  });
}

// Function to show verbose boot
function showVerboseBoot() {
  clearScreen();
  console.log(colorText('IrisOS Boot Sequence - Verbose Mode\n', 'white'));
  
  return new Promise(resolve => {
    // Show boot messages with a delay
    bootMessages.forEach((message, i) => {
      setTimeout(() => {
        console.log(colorText(`[${i+1}/${bootMessages.length}] `, 'green') + message);
        
        // When all messages are shown, resolve promise
        if (i === bootMessages.length - 1) {
          setTimeout(resolve, 500);
        }
      }, i * 400);
    });
  });
}

// Function to show system services starting
function showSystemServices() {
  console.log(colorText('\nStarting system services...\n', 'white'));
  
  return new Promise(resolve => {
    // Show services starting with a delay
    systemServices.forEach((service, i) => {
      setTimeout(() => {
        console.log(service);
        
        // When all services are shown, resolve promise
        if (i === systemServices.length - 1) {
          setTimeout(resolve, 500);
        }
      }, i * 200);
    });
  });
}

// Function to show a kernel panic (for testing)
function showKernelPanic(error) {
  clearScreen();
  console.log(colorText('\n*** KERNEL PANIC ***', 'red'));
  console.log(colorText('System halted due to unexpected error', 'red'));
  console.log('\n');
  console.log(colorText('Technical information:', 'white'));
  console.log(colorText('-------------------------', 'white'));
  console.log(colorText(error.toString(), 'yellow'));
  console.log('\n');
  console.log(colorText('Press any key to restart...', 'white'));
}

// Complete boot sequence (splash + verbose)
async function performBootSequence(verboseMode = false) {
  if (!verboseMode) {
    await showBootSplash();
  } else {
    await showVerboseBoot();
    await showSystemServices();
  }
  
  console.log(colorText('\nIrisOS boot complete.', 'green'));
  console.log(colorText('Welcome to IrisOS!\n', 'green'));
  return true;
}

module.exports = {
  performBootSequence,
  showBootSplash,
  showVerboseBoot,
  showSystemServices,
  showKernelPanic
};