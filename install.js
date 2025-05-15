#!/usr/bin/env node

// TextOS Installer
const fs = require('fs');
const path = require('path');
const os = require('os');
const child_process = require('child_process');

console.log('\n\x1b[36m');
console.log('  _______        _    ____   _____ ');
console.log(' |__   __|      | |  / __ \\ / ____|');
console.log('    | | _____  _| |_| |  | | (___  ');
console.log('    | |/ _ \\ \\/ / __| |  | |\\___ \\ ');
console.log('    | |  __/>  <| |_| |__| |____) |');
console.log('    |_|\\___/_/\\_\\\\__|\\____/|_____/ ');
console.log('\x1b[0m');

console.log('\x1b[32m\nTextOS Installer\x1b[0m');
console.log('This script will install TextOS on your system\n');

// Determine installation directory
const userHome = os.homedir();
const installDir = path.join(userHome, '.textos');

console.log(`Installing to: ${installDir}`);

// Create installation directory if it doesn't exist
if (!fs.existsSync(installDir)) {
  fs.mkdirSync(installDir, { recursive: true });
  console.log('Created installation directory');
}

// Copy files to installation directory
const sourceDir = __dirname;
const filesToCopy = [
  'index.js',
  'server.js',
  'bin/textos'
];

// Copy lib directory
const libDir = path.join(installDir, 'lib');
if (!fs.existsSync(libDir)) {
  fs.mkdirSync(libDir, { recursive: true });
}

// Copy lib files
const libFiles = fs.readdirSync(path.join(sourceDir, 'lib'));
libFiles.forEach(file => {
  const sourcePath = path.join(sourceDir, 'lib', file);
  const destPath = path.join(libDir, file);
  fs.copyFileSync(sourcePath, destPath);
  console.log(`Copied: lib/${file}`);
});

// Copy main files
filesToCopy.forEach(file => {
  const sourcePath = path.join(sourceDir, file);
  const destPath = path.join(installDir, file);
  
  // Create directories for destination if needed
  const destDir = path.dirname(destPath);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  
  fs.copyFileSync(sourcePath, destPath);
  console.log(`Copied: ${file}`);
});

// Make bin file executable
fs.chmodSync(path.join(installDir, 'bin', 'textos'), '755');
console.log('Made binary executable');

// Create symlink in user's bin directory
const userBinDir = path.join(userHome, '.local', 'bin');
const symlinkPath = path.join(userBinDir, 'textos');

try {
  // Create user bin directory if it doesn't exist
  if (!fs.existsSync(userBinDir)) {
    fs.mkdirSync(userBinDir, { recursive: true });
    console.log(`Created directory: ${userBinDir}`);
  }
  
  // Remove existing symlink if it exists
  if (fs.existsSync(symlinkPath)) {
    fs.unlinkSync(symlinkPath);
  }
  
  // Create symlink
  fs.symlinkSync(path.join(installDir, 'bin', 'textos'), symlinkPath);
  console.log(`Created symlink: ${symlinkPath}`);
  
  console.log('\n\x1b[32mTextOS installed successfully!\x1b[0m');
  console.log(`\nTo start TextOS, run:\n\x1b[33m${symlinkPath}\x1b[0m`);
  console.log('\nMake sure your ~/.local/bin directory is in your PATH.');
  console.log('\nIf not, add this line to your ~/.bashrc or ~/.zshrc:');
  console.log('\x1b[33mexport PATH="$HOME/.local/bin:$PATH"\x1b[0m\n');
} catch (error) {
  console.error('\x1b[31mError creating symlink:\x1b[0m', error.message);
  console.log('\nTo start TextOS, you can run:');
  console.log(`\x1b[33mnode ${path.join(installDir, 'index.js')}\x1b[0m\n`);
}