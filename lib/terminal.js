// IrisOS - Terminal module
// Handles terminal UI and formatting

/**
 * Format and colorize the prompt string
 * 
 * @param {string} currentPath - Current working directory
 * @returns {string} Formatted prompt string
 */
function formatPrompt(currentPath) {
  const username = colorText('user', 'green');
  const hostname = colorText('irisos', 'green');
  const path = colorText(currentPath, 'blue');
  
  return `${username}@${hostname}:${path}$ `;
}

/**
 * Apply ANSI color to a text string
 * 
 * @param {string} text - Text to colorize
 * @param {string} color - Color name
 * @returns {string} Colorized text
 */
function colorText(text, color) {
  const colors = {
    black: '\x1b[30m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
    reset: '\x1b[0m'
  };
  
  return `${colors[color] || ''}${text}${colors.reset}`;
}

/**
 * Clear the terminal screen
 */
function clearScreen() {
  console.clear();
}

/**
 * Format tabular data for display
 * 
 * @param {Array} data - Array of objects to display as table
 * @returns {string} Formatted table string
 */
function formatTable(data) {
  if (!data || data.length === 0) {
    return '';
  }
  
  // Get all columns from first row
  const columns = Object.keys(data[0]);
  
  // Find maximum width for each column
  const columnWidths = {};
  
  columns.forEach(col => {
    // Start with the column header length
    columnWidths[col] = col.length;
    
    // Check each row
    data.forEach(row => {
      const cellValue = row[col] !== undefined ? String(row[col]) : '';
      // Remove ANSI color codes for width calculation
      const plainText = cellValue.replace(/\x1B\[\d+m/g, '');
      columnWidths[col] = Math.max(columnWidths[col], plainText.length);
    });
  });
  
  // Build the header row
  let table = '';
  
  // Header row
  columns.forEach((col, i) => {
    table += colorText(col.padEnd(columnWidths[col] + 2), 'cyan');
  });
  
  table += '\n';
  
  // Separator row
  columns.forEach(col => {
    table += '-'.repeat(columnWidths[col] + 2);
  });
  
  table += '\n';
  
  // Data rows
  data.forEach(row => {
    columns.forEach((col, i) => {
      const cellValue = row[col] !== undefined ? String(row[col]) : '';
      // For non-colored cells, pad them. For colored ones, we need special handling
      if (cellValue.includes('\x1b[')) {
        // This cell has color codes
        const plainText = cellValue.replace(/\x1B\[\d+m/g, '');
        const padding = ' '.repeat(columnWidths[col] - plainText.length);
        table += cellValue + padding + '  ';
      } else {
        table += cellValue.padEnd(columnWidths[col] + 2);
      }
    });
    table += '\n';
  });
  
  return table;
}

/**
 * Display the welcome message
 */
function printWelcome() {
  const logo = [
    "  _____       _       ____   _____ ",
    " |_   _|     (_)     / __ \\ / ____|",
    "   | |  _ __  _ ___ | |  | | (___  ",
    "   | | | '_ \\| / __|| |  | |\\___ \\ ",
    "  _| |_| | | | \\__ \\| |__| |____) |",
    " |_____|_| |_|_|___/ \\____/|_____/ "
  ];
  
  console.log(colorText('\n' + logo.join('\n'), 'cyan'));
  console.log(colorText('\nWelcome to IrisOS - A Custom Text-Based Operating System\n', 'green'));
  console.log('Type "help" to see available commands.\n');
}

module.exports = {
  formatPrompt,
  colorText,
  clearScreen,
  formatTable,
  printWelcome
};
