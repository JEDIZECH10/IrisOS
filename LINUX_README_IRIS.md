# IrisOS for Linux

This is IrisOS, a custom text-based operating system that is a real OS with a desktop environment, boot process, and command-line interface.

## Running IrisOS on Linux

### Quick Start (No Installation)

1. Make sure Node.js is installed on your system
2. Open a terminal in the IrisOS directory
3. Run the following command:

```bash
./run-irisos.sh
```

### Installing IrisOS

To install IrisOS on your Linux system:

1. Make sure Node.js is installed on your system
2. Open a terminal in the IrisOS directory
3. Run the installation script:

```bash
./install-linux.sh
```

4. After installation, you can start IrisOS from anywhere by running:

```bash
irisos
```

### System Requirements

- Linux-based operating system
- Node.js (version 14 or higher)
- Bash shell

## Features

- BIOS configuration system with first-boot setup
- Text-based interface with colored output
- Desktop environment with window management
- Command prompt similar to traditional terminals
- Integrated web browser similar to Internet Explorer
- In-memory file system with directories and files
- Command-line interface with 15+ familiar commands
- Multiple themes (dark, light, blue)

## Commands

### Desktop Environment

From the desktop environment, you can use these commands:
- `start` - Open the Start menu
- `open <app>` - Open an application (browser, files, etc.)
- `theme <name>` - Change theme (dark, light, blue)
- `help` - Show all available commands

### Terminal Commands

From the terminal mode, you can use these commands:
- `help` - Display available commands
- `ls` - List directory contents
- `cd` - Change current directory
- `mkdir` - Create a new directory
- `touch` - Create an empty file
- `cat` - Display file contents
- `edit` - Create or edit a text file
- `rm` - Remove a file or directory
- `desktop` - Launch the desktop environment
- `browser` - Launch the web browser
- `bios` - Enter BIOS setup

## Boot Options

When starting IrisOS, you can choose from different boot options:
- Normal Mode - Full desktop environment
- Safe Mode - Terminal only with limited features
- System Recovery - For troubleshooting ( )

## Troubleshooting

If you encounter any issues:

1. Try running in Safe Mode by selecting it from the boot menu
2. Check that Node.js is properly installed
3. Ensure all IrisOS files have proper permissions

## Uninstalling

To uninstall IrisOS:

1. Remove the IrisOS directory:
```bash
rm -rf ~/.irisos
```

2. Remove the launcher:
```bash
rm ~/.local/bin/irisos
```