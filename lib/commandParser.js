// TextOS - Command Parser module
// Handles parsing user input into commands and arguments

/**
 * Parse a command string into command and arguments
 * Handles quoted arguments and special characters
 * 
 * @param {string} commandString - The raw command input
 * @returns {Object} Contains the command name and arguments array
 */
function parseCommand(commandString) {
  // Handle empty input
  if (!commandString || !commandString.trim()) {
    return { command: '', args: [] };
  }

  const trimmedCommand = commandString.trim();
  let args = [];
  let currentArg = '';
  let inQuotes = false;
  let escapeNext = false;
  
  // Parse the command string character by character
  for (let i = 0; i < trimmedCommand.length; i++) {
    const char = trimmedCommand[i];
    
    // Handle escape character
    if (escapeNext) {
      currentArg += char;
      escapeNext = false;
      continue;
    }
    
    // Check for escape character
    if (char === '\\') {
      escapeNext = true;
      continue;
    }
    
    // Handle quotes
    if (char === '"' || char === "'") {
      inQuotes = !inQuotes;
      continue;
    }
    
    // Handle spaces (argument separators)
    if (char === ' ' && !inQuotes) {
      if (currentArg) {
        args.push(currentArg);
        currentArg = '';
      }
      continue;
    }
    
    // Add character to current argument
    currentArg += char;
  }
  
  // Add the last argument if there is one
  if (currentArg) {
    args.push(currentArg);
  }
  
  // Extract command and arguments
  const command = args.shift() || '';
  
  return { command, args };
}

/**
 * Format path arguments based on current path
 * 
 * @param {string} path - The path argument
 * @param {string} currentPath - The current working directory
 * @returns {string} The resolved path
 */
function resolvePath(path, currentPath) {
  // If path is absolute, return it directly
  if (path.startsWith('/')) {
    return path;
  }
  
  // Handle special cases
  if (path === '.') {
    return currentPath;
  }
  
  if (path === '..') {
    // Go up one directory
    if (currentPath === '/') {
      return '/';
    }
    
    const parts = currentPath.split('/').filter(p => p);
    parts.pop();
    return '/' + parts.join('/');
  }
  
  // Handle relative paths
  return currentPath + (currentPath.endsWith('/') ? '' : '/') + path;
}

module.exports = {
  parseCommand,
  resolvePath
};
