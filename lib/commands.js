// irisos - Commands module
// Implements the available shell commands

const fs = require('fs');
const path = require('path');
const { resolvePath } = require('./commandParser');
const { formatTable, colorText } = require('./terminal');

// Command definitions and help information
const commandHelp = {
  help: {
    description: 'Display available commands',
    usage: 'help [command]',
    examples: [
      'help',
      'help ls'
    ]
  },
  desktop: {
    description: 'Launch the desktop environment',
    usage: 'desktop',
    examples: [
      'desktop'
    ]
  },
  browser: {
    description: 'Launch the web browser',
    usage: 'browser',
    examples: [
      'browser'
    ]
  },
  bios: {
    description: 'Enter BIOS setup',
    usage: 'bios',
    examples: [
      'bios'
    ]
  },
  db: {
    description: 'Database management',
    usage: 'db [command] [args]',
    options: [
      'init: Initialize the database',
      'user: User management commands',
      'file: File management commands',
      'settings: Settings management',
      'log: System log operations'
    ],
    examples: [
      'db init',
      'db user create username password',
      'db file list /home',
      'db settings get theme',
      'db log view'
    ]
  },
  ls: {
    description: 'List directory contents',
    usage: 'ls [options] [directory]',
    options: [
      '-l: Long format with details',
      '-a: Show hidden files'
    ],
    examples: [
      'ls',
      'ls -l',
      'ls /home'
    ]
  },
  cd: {
    description: 'Change current directory',
    usage: 'cd [directory]',
    examples: [
      'cd /home',
      'cd ..',
      'cd ~'
    ]
  },
  mkdir: {
    description: 'Create a new directory',
    usage: 'mkdir [directory]',
    examples: [
      'mkdir test',
      'mkdir /home/user/docs'
    ]
  },
  touch: {
    description: 'Create an empty file',
    usage: 'touch [filename]',
    examples: [
      'touch test.txt',
      'touch /home/user/file.md'
    ]
  },
  cat: {
    description: 'Display file contents',
    usage: 'cat [filename]',
    examples: [
      'cat README.txt',
      'cat /home/user/notes.md'
    ]
  },
  edit: {
    description: 'Create or edit a text file',
    usage: 'edit [filename]',
    examples: [
      'edit note.txt',
      'edit /home/user/document.md'
    ]
  },
  rm: {
    description: 'Remove a file or directory',
    usage: 'rm [options] [path]',
    options: [
      '-r: Recursive delete (for directories)'
    ],
    examples: [
      'rm file.txt',
      'rm -r /home/user/directory'
    ]
  },
  mv: {
    description: 'Move or rename files and directories',
    usage: 'mv [source] [destination]',
    examples: [
      'mv file.txt newname.txt',
      'mv file.txt /home/user/'
    ]
  },
  cp: {
    description: 'Copy files and directories',
    usage: 'cp [source] [destination]',
    examples: [
      'cp file.txt copy.txt',
      'cp file.txt /home/user/'
    ]
  },
  pwd: {
    description: 'Print working directory',
    usage: 'pwd',
    examples: [
      'pwd'
    ]
  },
  echo: {
    description: 'Display a line of text',
    usage: 'echo [text]',
    examples: [
      'echo Hello World',
      'echo "Text with spaces"'
    ]
  },
  clear: {
    description: 'Clear the terminal screen',
    usage: 'clear',
    examples: [
      'clear'
    ]
  },
  date: {
    description: 'Display the current date and time',
    usage: 'date',
    examples: [
      'date'
    ]
  },
  whoami: {
    description: 'Display current user',
    usage: 'whoami',
    examples: [
      'whoami'
    ]
  },
  sysinfo: {
    description: 'Display system information',
    usage: 'sysinfo',
    examples: [
      'sysinfo'
    ]
  },
  exit: {
    description: 'Exit the irisos shell',
    usage: 'exit',
    examples: [
      'exit',
      'shutdown'
    ]
  }
};

/**
 * Execute a command with given arguments and context
 * 
 * @param {string} command - The command to execute
 * @param {Array} args - Command arguments
 * @param {Object} context - Execution context (filesystem, current path, etc.)
 * @returns {Object} Command result
 */
function executeCommand(command, args, context) {
  // Get the appropriate command handler
  const handlers = {
    help: handleHelp,
    ls: handleLs,
    cd: handleCd,
    mkdir: handleMkdir,
    touch: handleTouch,
    cat: handleCat,
    edit: handleEdit,
    rm: handleRm,
    mv: handleMv,
    cp: handleCp,
    pwd: handlePwd,
    echo: handleEcho,
    clear: handleClear,
    date: handleDate,
    whoami: handleWhoami,
    sysinfo: handleSysinfo
  };
  
  // Execute the handler if it exists, otherwise show error
  if (handlers[command]) {
    return handlers[command](args, context);
  } else if (command) {
    return { success: false, message: `Command not found: ${command}. Type 'help' for available commands.` };
  }
  
  // Empty command, do nothing
  return { success: true };
}

/**
 * Display help information
 */
function handleHelp(args, context) {
  if (args.length === 0) {
    // Show all available commands
    console.log(colorText('\nirisos Available Commands:\n', 'cyan'));
    
    const commandList = Object.keys(commandHelp).map(cmd => {
      return {
        Command: colorText(cmd, 'green'),
        Description: commandHelp[cmd].description
      };
    });
    
    console.log(formatTable(commandList));
    console.log(`\nType ${colorText('help [command]', 'yellow')} for more information on a specific command.\n`);
    
    return { success: true };
  } else {
    // Show help for specific command
    const commandName = args[0];
    const helpInfo = commandHelp[commandName];
    
    if (!helpInfo) {
      return { success: false, message: `No help available for '${commandName}'. Type 'help' for a list of commands.` };
    }
    
    console.log(`\n${colorText(commandName.toUpperCase(), 'green')}`);
    console.log(`${colorText('Description:', 'cyan')} ${helpInfo.description}`);
    console.log(`${colorText('Usage:', 'cyan')} ${helpInfo.usage}`);
    
    if (helpInfo.options) {
      console.log(`${colorText('Options:', 'cyan')}`);
      helpInfo.options.forEach(option => {
        console.log(`  ${option}`);
      });
    }
    
    console.log(`${colorText('Examples:', 'cyan')}`);
    helpInfo.examples.forEach(example => {
      console.log(`  ${example}`);
    });
    
    console.log('');
    
    return { success: true };
  }
}

/**
 * List directory contents
 */
function handleLs(args, context) {
  let showDetails = false;
  let showHidden = false;
  let targetPath = context.currentPath;
  
  // Parse options
  args.forEach(arg => {
    if (arg.startsWith('-')) {
      if (arg.includes('l')) showDetails = true;
      if (arg.includes('a')) showHidden = true;
    } else {
      // It's a path
      targetPath = resolvePath(arg, context.currentPath);
    }
  });
  
  const result = context.fileSystem.listDirectory(targetPath);
  
  if (!result.success) {
    return result;
  }
  
  // Filter hidden files if not showing them
  let items = result.items;
  if (!showHidden) {
    items = items.filter(item => !item.name.startsWith('.'));
  }
  
  if (items.length === 0) {
    console.log("<empty directory>");
    return { success: true };
  }
  
  // Display in table format if detailed view
  if (showDetails) {
    const tableData = items.map(item => ({
      Type: item.type === 'directory' ? 'd' : '-',
      Name: item.type === 'directory' ? colorText(item.name, 'blue') : item.name,
      Size: item.size,
      Modified: new Date(item.modified).toLocaleString()
    }));
    
    console.log(formatTable(tableData));
  } else {
    // Simple format - just names with colors
    const output = items.map(item => {
      return item.type === 'directory' 
        ? colorText(item.name, 'blue')
        : item.name;
    }).join('\t');
    
    console.log(output);
  }
  
  return { success: true };
}

/**
 * Change current directory
 */
function handleCd(args, context) {
  let targetPath;
  
  if (args.length === 0 || args[0] === '~') {
    // Default to home directory
    targetPath = '/home/user';
  } else {
    targetPath = resolvePath(args[0], context.currentPath);
  }
  
  const { node, exists } = context.fileSystem.resolvePath(targetPath);
  
  if (!exists) {
    return { success: false, message: `Directory not found: ${targetPath}` };
  }
  
  if (node.type !== 'directory') {
    return { success: false, message: `Not a directory: ${targetPath}` };
  }
  
  context.updatePath(targetPath === '/' ? '/' : targetPath);
  return { success: true };
}

/**
 * Create a new directory
 */
function handleMkdir(args, context) {
  if (args.length === 0) {
    return { success: false, message: 'mkdir: missing operand. Try "help mkdir" for more information.' };
  }
  
  return context.fileSystem.mkdir(args[0], context.currentPath);
}

/**
 * Create an empty file
 */
function handleTouch(args, context) {
  if (args.length === 0) {
    return { success: false, message: 'touch: missing file operand. Try "help touch" for more information.' };
  }
  
  return context.fileSystem.writeFile(args[0], '', context.currentPath);
}

/**
 * Display file contents
 */
function handleCat(args, context) {
  if (args.length === 0) {
    return { success: false, message: 'cat: missing file operand. Try "help cat" for more information.' };
  }
  
  const result = context.fileSystem.readFile(args[0], context.currentPath);
  
  if (!result.success) {
    return result;
  }
  
  console.log(result.content);
  return { success: true };
}

/**
 * Simple text editor
 */
function handleEdit(args, context) {
  if (args.length === 0) {
    return { success: false, message: 'edit: missing file operand. Try "help edit" for more information.' };
  }
  
  const filePath = args[0];
  const absolutePath = filePath.startsWith('/') 
    ? filePath 
    : `${context.currentPath}/${filePath}`.replace('//', '/');
  
  // Check if file exists
  const existingFile = context.fileSystem.readFile(absolutePath, '/');
  let initialContent = '';
  
  if (existingFile.success) {
    initialContent = existingFile.content;
    console.log(`Editing existing file: ${absolutePath}`);
  } else {
    console.log(`Creating new file: ${absolutePath}`);
  }
  
  console.log('\nEnter text (type :wq on a new line to save and exit, or :q to quit without saving):');
  console.log('------------------------------------------------------------------');
  
  if (initialContent) {
    console.log(initialContent);
  }
  
  // Store the content lines
  let content = initialContent ? initialContent.split('\n') : [];
  let currentLine = '';
  
  // Create a temporary readline interface for editor mode
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: ''
  });
  
  // Enter editor mode
  return new Promise((resolve) => {
    rl.on('line', (line) => {
      if (line === ':wq') {
        // Save and exit
        const saveResult = context.fileSystem.writeFile(
          absolutePath,
          content.join('\n'),
          '/'
        );
        rl.close();
        resolve(saveResult);
      } else if (line === ':q') {
        // Quit without saving
        rl.close();
        resolve({ success: true, message: 'File not saved.' });
      } else {
        // Add the line to content
        content.push(line);
      }
    });
  });
}

/**
 * Remove a file or directory
 */
function handleRm(args, context) {
  if (args.length === 0) {
    return { success: false, message: 'rm: missing operand. Try "help rm" for more information.' };
  }
  
  let recursive = false;
  let pathArg = '';
  
  // Parse options
  args.forEach(arg => {
    if (arg.startsWith('-')) {
      if (arg.includes('r')) recursive = true;
    } else {
      pathArg = arg;
    }
  });
  
  if (!pathArg) {
    return { success: false, message: 'rm: missing file operand' };
  }
  
  return context.fileSystem.delete(pathArg, context.currentPath);
}

/**
 * Move or rename a file or directory
 */
function handleMv(args, context) {
  if (args.length < 2) {
    return { success: false, message: 'mv: missing operand. Try "help mv" for more information.' };
  }
  
  const source = args[0];
  const destination = args[1];
  
  return context.fileSystem.move(source, destination, context.currentPath);
}

/**
 * Copy a file or directory
 */
function handleCp(args, context) {
  if (args.length < 2) {
    return { success: false, message: 'cp: missing operand. Try "help cp" for more information.' };
  }
  
  const source = args[0];
  const destination = args[1];
  
  return context.fileSystem.copy(source, destination, context.currentPath);
}

/**
 * Print working directory
 */
function handlePwd(args, context) {
  console.log(context.currentPath);
  return { success: true };
}

/**
 * Echo text to the console
 */
function handleEcho(args, context) {
  console.log(args.join(' '));
  return { success: true };
}

/**
 * Clear the terminal screen
 */
function handleClear(args, context) {
  console.clear();
  return { success: true };
}

/**
 * Display current date and time
 */
function handleDate(args, context) {
  console.log(new Date().toString());
  return { success: true };
}

/**
 * Display current user
 */
function handleWhoami(args, context) {
  console.log('user@irisos');
  return { success: true };
}

/**
 * Display system information
 */
function handleSysinfo(args, context) {
  console.log(colorText('\nirisos System Information\n', 'cyan'));
  console.log(`${colorText('System:', 'green')} irisos v1.0`);
  console.log(`${colorText('Platform:', 'green')} Node.js ${process.version}`);
  console.log(`${colorText('Runtime:', 'green')} ${process.platform}`);
  console.log(`${colorText('Uptime:', 'green')} ${Math.floor(process.uptime())} seconds`);
  console.log(`${colorText('Memory:', 'green')} ${Math.round(process.memoryUsage().heapUsed / 1024 / 1024)} MB / ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`);
  console.log('');
  return { success: true };
}

module.exports = {
  executeCommand,
  commandHelp
};
