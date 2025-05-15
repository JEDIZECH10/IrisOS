#!/usr/bin/env node

// TextOS Uninstaller
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n\x1b[36m');
console.log('  _______        _    ____   _____ ');
console.log(' |__   __|      | |  / __ \\ / ____|');
console.log('    | | _____  _| |_| |  | | (___  ');
console.log('    | |/ _ \\ \\/ / __| |  | |\\___ \\ ');
console.log('    | |  __/>  <| |_| |__| |____) |');
console.log('    |_|\\___/_/\\_\\\\__|\\____/|_____/ ');
console.log('\x1b[0m');

console.log('\x1b[31mTextOS Uninstaller\x1b[0m');
console.log('This script will remove TextOS from your system\n');

// Determine installation directory
const userHome = os.homedir();
const installDir = path.join(userHome, '.textos');
const symlinkPath = path.join(userHome, '.local', 'bin', 'textos');

console.log(`Installation directory: ${installDir}`);
console.log(`Symlink: ${symlinkPath}\n`);

rl.question('Are you sure you want to uninstall TextOS? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('\nUninstalling TextOS...');
    
    // Remove symlink
    if (fs.existsSync(symlinkPath)) {
      fs.unlinkSync(symlinkPath);
      console.log(`Removed symlink: ${symlinkPath}`);
    } else {
      console.log(`Symlink not found: ${symlinkPath}`);
    }
    
    // Remove installation directory
    if (fs.existsSync(installDir)) {
      fs.rmSync(installDir, { recursive: true, force: true });
      console.log(`Removed directory: ${installDir}`);
    } else {
      console.log(`Installation directory not found: ${installDir}`);
    }
    
    console.log('\n\x1b[32mTextOS has been uninstalled successfully!\x1b[0m\n');
  } else {
    console.log('\nUninstallation cancelled.\n');
  }
  
  rl.close();
});