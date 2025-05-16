#!/usr/bin/env node

// IrisOS Uninstaller
const fs = require('fs');
const path = require('path');
const os = require('os');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n\x1b[36m');
console.log ('.                                        ')
console.log ('  _____          _         ____   _____  ')
console.log (' |_   _|        (_)       / __ \ / ____| ')
console.log ('   | |    ___    _   ___  ||  | | (___   ')
console.log ('   | |   | __\  | | / __| ||  | | \___ \ ')
console.log ('  _| |_  | |    | | \__ \ ||__| |.____ | ')
console.log (' |_____| |_|    |_| |___/ \____/ |_____/ ')
console.log ('.                                        ')
console.log('\x1b[0m');

console.log('\x1b[31mIrisOS Uninstaller\x1b[0m');
console.log('This script will remove IrisOS from your system\n');

// Determine installation directory
const userHome = os.homedir();
const installDir = path.join(userHome, '.irisos');
const symlinkPath = path.join(userHome, '.local', 'bin', 'irisos');

console.log(`Installation directory: ${installDir}`);
console.log(`Symlink: ${symlinkPath}\n`);

rl.question('Are you sure you want to uninstall irisos? (y/n): ', (answer) => {
  if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
    console.log('\nUninstalling irisos...');
    
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
    
    console.log('\n\x1b[32mirisos has been uninstalled successfully!\x1b[0m\n');
  } else {
    console.log('\nUninstallation cancelled.\n');
  }
  
  rl.close();
});