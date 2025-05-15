# TextOS

A custom text-based operating system with a command-line interface, desktop environment, integrated browser, and simulated file system.

## Features

- BIOS configuration system with first-boot setup
- Text-based interface with colored output
- Desktop environment with window management
- Command prompt similar to traditional terminals
- Integrated web browser similar to Internet Explorer
- In-memory file system with directories and files
- Command-line interface with 15+ familiar commands
- Web server interface (optional)
- User-friendly help system

## Installation

### Quick Install

Run the installer script:

```bash
node install.js
```

This will:
1. Create a `.textos` directory in your home folder
2. Copy all necessary files
3. Create a symlink in `~/.local/bin` to make it executable from anywhere

### Manual Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `node index.js` to start TextOS

## Usage

After installation, you can start TextOS by running:

```bash
textos
```

If the symlink is not in your PATH, you can run:

```bash
~/.local/bin/textos
```

Or:

```bash
node ~/.textos/index.js
```

## Usage Guide

### First Boot Experience

When you start TextOS for the first time, you'll be presented with the BIOS setup screen. Here you can configure:

- System settings (username, hostname, language)
- Boot options (splash screen, boot delay)
- Display settings (desktop theme)
- Network settings

After completing the BIOS setup, TextOS will boot into either:
- Desktop environment (if enabled in BIOS)
- Terminal mode (command-line interface)

### Desktop Environment

The desktop environment provides a graphical interface with:

- Desktop icons for common applications
- Window management for multiple applications
- Terminal access through the Terminal app
- Web browsing through the Browser app
- File management through the Files app

Desktop commands:
- `open <app>` - Open an application (terminal, browser, files, etc.)
- `close` - Close the active window
- `minimize` - Minimize the active window
- `maximize` - Toggle maximize for the active window
- `switch <num>` - Switch to window by number
- `terminal` - Open command prompt
- `exit` - Exit desktop mode

### Web Browser

The integrated browser provides:
- Navigation to simulated websites
- Bookmarking system
- Browsing history tracking
- Browser settings

Browser commands:
- `go <url>` - Navigate to a URL
- `back` - Go back to previous page
- `forward` - Go forward to next page
- `refresh` - Reload current page
- `home` - Go to browser home
- `bookmarks` - View bookmarks
- `addbookmark` - Add current page to bookmarks
- `exit` - Close the browser

### Available Terminal Commands

- `help` - Display available commands
- `ls` - List directory contents
- `cd` - Change current directory
- `mkdir` - Create a new directory
- `touch` - Create an empty file
- `cat` - Display file contents
- `edit` - Create or edit a text file
- `rm` - Remove a file or directory
- `mv` - Move or rename files and directories
- `cp` - Copy files and directories
- `pwd` - Print working directory
- `echo` - Display a line of text
- `clear` - Clear the terminal screen
- `date` - Display the current date and time
- `whoami` - Display current user
- `sysinfo` - Display system information
- `desktop` - Launch the desktop environment
- `browser` - Launch the web browser
- `bios` - Enter BIOS setup
- `exit` or `shutdown` - Exit TextOS

## Web Interface

To start TextOS with the web interface, set the environment variable `ENABLE_SERVER=true`:

```bash
ENABLE_SERVER=true textos
```

This will start a web server on port 5000, which you can access at http://localhost:5000