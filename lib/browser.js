// TextOS - Browser Module
// Simulates a basic web browser like Internet Explorer

const readline = require('readline');
const { colorText, clearScreen } = require('./terminal');

// Browser state
const browserState = {
  currentUrl: 'about:home',
  history: ['about:home'],
  historyIndex: 0,
  bookmarks: [],
  cache: {},
  downloadHistory: []
};

// Mock web pages
const websites = {
  'about:home': {
    title: 'TextOS Browser Home',
    content: `
    Welcome to TextOS Browser!
    
    Search or enter web address:
    [                                 ]
    
    Bookmarks:
    - TextOS Help
    - TextOS Web Portal
    
    Quick Links:
    - about:bookmarks
    - about:history
    - about:downloads
    - about:settings
    `
  },
  'about:blank': {
    title: 'New Tab',
    content: `
    This page is intentionally left blank.
    `
  },
  'about:bookmarks': {
    title: 'Bookmarks',
    content: `
    Your Bookmarks:
    
    No bookmarks yet. Add some by pressing CTRL+D while viewing a page.
    `
  },
  'about:history': {
    title: 'Browser History',
    content: `
    Your Browser History:
    
    - about:home
    `
  },
  'about:downloads': {
    title: 'Downloads',
    content: `
    Your Download History:
    
    No downloads yet.
    `
  },
  'about:settings': {
    title: 'Browser Settings',
    content: `
    Browser Settings:
    
    Homepage: about:home
    Search Engine: TextOS Search
    Clear Browsing Data: [Clear Now]
    Version: TextOS Browser 1.0
    `
  },
  'textos.help': {
    title: 'TextOS Help Portal',
    content: `
    TextOS Help Portal
    ------------------
    
    Welcome to the TextOS Help Portal. Here you can find information about
    using your TextOS system.
    
    Table of Contents:
    
    1. Getting Started
    2. Using the Command Line
    3. Desktop Environment
    4. File Management
    5. Browser Usage
    6. System Settings
    7. Troubleshooting
    
    For specific help, type 'help <topic>' in the browser address bar.
    `
  },
  'textos.web': {
    title: 'TextOS Web Portal',
    content: `
    TextOS Web Portal
    ----------------
    
    Welcome to the TextOS Web Portal!
    
    This is your gateway to the virtual internet within TextOS.
    
    Available sites:
    - mail.textos.local (TextOS Mail)
    - chat.textos.local (TextOS Chat)
    - docs.textos.local (TextOS Documents)
    - games.textos.local (TextOS Games)
    
    News:
    - TextOS Browser updated to version 1.0
    - New applications available in the App Store
    - System update available: TextOS 1.1
    `
  },
  'mail.textos.local': {
    title: 'TextOS Mail',
    content: `
    TextOS Mail
    ----------
    
    Inbox (3 messages)
    
    > Welcome to TextOS [System Admin]
    > Your account has been created [System Admin]
    > Getting started with TextOS [Help Team]
    
    Compose New Message:
    [                                 ]
    `
  },
  'chat.textos.local': {
    title: 'TextOS Chat',
    content: `
    TextOS Chat
    ----------
    
    Available Channels:
    - #general
    - #help
    - #development
    
    [Join a channel to begin chatting]
    `
  },
  'docs.textos.local': {
    title: 'TextOS Documents',
    content: `
    TextOS Documents
    --------------
    
    Your Documents:
    
    - Welcome Guide.txt
    - Getting Started.txt
    - TextOS Manual.txt
    
    Create New Document:
    [                                 ]
    `
  },
  'games.textos.local': {
    title: 'TextOS Games',
    content: `
    TextOS Games
    -----------
    
    Available Games:
    
    - TextAdventure
    - Hangman
    - TicTacToe
    - Snake
    
    [Select a game to play]
    `
  },
  'error:404': {
    title: 'Page Not Found',
    content: `
    404 - Page Not Found
    
    The page you requested could not be found.
    Please check the URL and try again.
    
    [Go Back]
    `
  }
};

// Start the browser
function startBrowser() {
  return new Promise((resolve) => {
    clearScreen();
    
    // Show browser UI
    renderBrowser();
    
    // Set up readline interface
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    // Show prompt for browser commands
    function promptUser() {
      rl.question('Browser > ', (input) => {
        if (input.trim().toLowerCase() === 'exit' || input.trim().toLowerCase() === 'quit') {
          console.log('Closing browser...');
          rl.close();
          resolve();
          return;
        }
        
        handleBrowserCommand(input);
        promptUser();
      });
    }
    
    promptUser();
  });
}

// Render the browser interface
function renderBrowser() {
  // Clear screen
  clearScreen();
  
  // Get current page
  const page = websites[browserState.currentUrl] || websites['error:404'];
  
  // Draw browser UI
  console.log(colorText('╔════════════════════════════════════════════════════════════════╗', 'blue'));
  console.log(colorText('║ TextOS Browser                                      [_] [□] [X]║', 'blue'));
  console.log(colorText('╠════════════════════════════════════════════════════════════════╣', 'blue'));
  
  // Address bar
  console.log(colorText(`║ ${browserState.currentUrl.padEnd(72, ' ')}║`, 'cyan'));
  
  // Navigation buttons
  console.log(colorText('╠════════════════════════════════════════════════════════════════╣', 'blue'));
  console.log(colorText('║ [←] [→] [↻] [⌂] [☆]                                           ║', 'blue'));
  console.log(colorText('╠════════════════════════════════════════════════════════════════╣', 'blue'));
  
  // Page title
  console.log(colorText(`║ ${page.title.padEnd(72, ' ')}║`, 'yellow'));
  console.log(colorText('╠════════════════════════════════════════════════════════════════╣', 'blue'));
  
  // Page content
  const contentLines = page.content.split('\n');
  contentLines.forEach(line => {
    console.log(colorText(`║ ${line.padEnd(72, ' ')}║`, 'white'));
  });
  
  // Fill remaining space to make the window complete
  const remainingLines = 20 - contentLines.length;
  for (let i = 0; i < remainingLines; i++) {
    console.log(colorText('║                                                                ║', 'blue'));
  }
  
  // Status bar
  console.log(colorText('╠════════════════════════════════════════════════════════════════╣', 'blue'));
  console.log(colorText(`║ Status: ${page.title === 'Page Not Found' ? 'Error' : 'Done'}                                               ║`, 'green'));
  console.log(colorText('╚════════════════════════════════════════════════════════════════╝', 'blue'));
  
  // Help text
  console.log('\nCommands: go <url>, back, forward, refresh, home, bookmarks, exit');
  console.log('');
}

// Handle browser commands
function handleBrowserCommand(input) {
  const parts = input.trim().split(' ');
  const command = parts[0].toLowerCase();
  const args = parts.slice(1).join(' ');
  
  switch (command) {
    case 'go':
      navigateTo(args);
      break;
    case 'back':
      navigateBack();
      break;
    case 'forward':
      navigateForward();
      break;
    case 'refresh':
      refreshPage();
      break;
    case 'home':
      navigateTo('about:home');
      break;
    case 'bookmarks':
      navigateTo('about:bookmarks');
      break;
    case 'addbookmark':
      addBookmark();
      break;
    case 'history':
      navigateTo('about:history');
      break;
    case 'downloads':
      navigateTo('about:downloads');
      break;
    case 'settings':
      navigateTo('about:settings');
      break;
    case 'help':
      showBrowserHelp();
      break;
    default:
      // If just a URL is entered without a command
      if (input.includes('.') || input.startsWith('about:')) {
        navigateTo(input);
      } else {
        console.log(`Unknown command: ${command}`);
      }
  }
  
  // Update the display
  renderBrowser();
}

// Navigate to a URL
function navigateTo(url) {
  if (!url) {
    console.log('Please specify a URL.');
    return;
  }
  
  // Simple URL normalization
  let normalizedUrl = url.trim();
  
  // Add protocol if missing and it's not an about: URL
  if (!normalizedUrl.startsWith('about:') && !normalizedUrl.includes('://')) {
    // For simplicity, let's assume anything with a dot is a website
    if (normalizedUrl.includes('.')) {
      normalizedUrl = 'http://' + normalizedUrl;
    } else {
      normalizedUrl = 'about:' + normalizedUrl;
    }
  }
  
  // Extract domain from URL with protocol
  if (normalizedUrl.includes('://')) {
    const parts = normalizedUrl.split('://');
    normalizedUrl = parts[1] || parts[0];
  }
  
  // Check if the page exists in our simulated web
  const pageExists = Object.keys(websites).some(domain => normalizedUrl.includes(domain));
  
  if (pageExists) {
    const domain = Object.keys(websites).find(domain => normalizedUrl.includes(domain));
    browserState.currentUrl = domain;
    
    // Update history
    if (browserState.historyIndex < browserState.history.length - 1) {
      browserState.history = browserState.history.slice(0, browserState.historyIndex + 1);
    }
    browserState.history.push(domain);
    browserState.historyIndex = browserState.history.length - 1;
    
    console.log(`Navigated to: ${domain}`);
  } else {
    // Page doesn't exist, show 404
    browserState.currentUrl = 'error:404';
    
    // Update history
    if (browserState.historyIndex < browserState.history.length - 1) {
      browserState.history = browserState.history.slice(0, browserState.historyIndex + 1);
    }
    browserState.history.push('error:404');
    browserState.historyIndex = browserState.history.length - 1;
    
    console.log(`Page not found: ${normalizedUrl}`);
  }
  
  // Update the about:history page content dynamically
  updateHistoryPage();
}

// Navigate back in history
function navigateBack() {
  if (browserState.historyIndex > 0) {
    browserState.historyIndex--;
    browserState.currentUrl = browserState.history[browserState.historyIndex];
    console.log(`Navigated back to: ${browserState.currentUrl}`);
  } else {
    console.log('No previous page in history.');
  }
}

// Navigate forward in history
function navigateForward() {
  if (browserState.historyIndex < browserState.history.length - 1) {
    browserState.historyIndex++;
    browserState.currentUrl = browserState.history[browserState.historyIndex];
    console.log(`Navigated forward to: ${browserState.currentUrl}`);
  } else {
    console.log('No next page in history.');
  }
}

// Refresh the current page
function refreshPage() {
  console.log(`Refreshed: ${browserState.currentUrl}`);
}

// Add the current page to bookmarks
function addBookmark() {
  const page = websites[browserState.currentUrl];
  
  if (page) {
    const bookmark = {
      url: browserState.currentUrl,
      title: page.title,
      dateAdded: new Date()
    };
    
    // Check if it's already bookmarked
    const exists = browserState.bookmarks.some(b => b.url === bookmark.url);
    
    if (!exists) {
      browserState.bookmarks.push(bookmark);
      console.log(`Bookmarked: ${page.title}`);
      
      // Update the bookmarks page
      updateBookmarksPage();
    } else {
      console.log('This page is already bookmarked.');
    }
  }
}

// Update the history page content
function updateHistoryPage() {
  let historyContent = `
    Your Browser History:
    
`;
  
  // Add each history item
  browserState.history.forEach((url, index) => {
    const page = websites[url];
    if (page) {
      historyContent += `    - ${url} (${page.title})\n`;
    } else {
      historyContent += `    - ${url}\n`;
    }
  });
  
  // Update the website content
  websites['about:history'].content = historyContent;
}

// Update the bookmarks page content
function updateBookmarksPage() {
  let bookmarksContent = `
    Your Bookmarks:
    
`;
  
  if (browserState.bookmarks.length === 0) {
    bookmarksContent += '    No bookmarks yet. Add some by using the "addbookmark" command.\n';
  } else {
    // Add each bookmark
    browserState.bookmarks.forEach((bookmark, index) => {
      bookmarksContent += `    - ${bookmark.url} (${bookmark.title})\n`;
    });
  }
  
  // Update the website content
  websites['about:bookmarks'].content = bookmarksContent;
}

// Show browser help
function showBrowserHelp() {
  console.log(colorText('\nTextOS Browser Help\n', 'cyan'));
  console.log('Available commands:');
  console.log('  go <url>       - Navigate to the specified URL');
  console.log('  back           - Go back to the previous page');
  console.log('  forward        - Go forward to the next page');
  console.log('  refresh        - Refresh the current page');
  console.log('  home           - Go to the browser home page');
  console.log('  bookmarks      - View your bookmarks');
  console.log('  addbookmark    - Add the current page to bookmarks');
  console.log('  history        - View your browsing history');
  console.log('  downloads      - View your download history');
  console.log('  settings       - Open browser settings');
  console.log('  help           - Show this help message');
  console.log('  exit           - Close the browser');
  console.log('');
  console.log('Special URLs:');
  console.log('  about:home     - Browser home page');
  console.log('  about:blank    - Blank page');
  console.log('  about:bookmarks - Your bookmarks');
  console.log('  about:history  - Your browsing history');
  console.log('  about:downloads - Your downloads');
  console.log('  about:settings - Browser settings');
  console.log('');
  console.log('Sample websites:');
  console.log('  textos.help    - TextOS Help Portal');
  console.log('  textos.web     - TextOS Web Portal');
  console.log('  mail.textos.local - TextOS Mail');
  console.log('  chat.textos.local - TextOS Chat');
  console.log('  docs.textos.local - TextOS Documents');
  console.log('  games.textos.local - TextOS Games');
  console.log('');
}

module.exports = {
  startBrowser
};