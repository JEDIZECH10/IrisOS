#!/bin/bash

# Function to clear the screen
clear_screen() {
  clear
}

# Function to set text color
set_color() {
  case $1 in
    blue) tput setaf 4 ;;
    green) tput setaf 2 ;;
    red) tput setaf 1 ;;
    white) tput setaf 7 ;;
    yellow) tput setaf 3 ;;
    reset) tput sgr0 ;;
  esac
}

# Function to get terminal size
get_terminal_size() {
  if [ -x "$(command -v tput)" ]; then
    LINES=$(tput lines)
    COLUMNS=$(tput cols)
  else
    LINES=24
    COLUMNS=80
  fi
}

# Function to display centered text
center_text() {
  local text="$1"
  local width=$((COLUMNS - 2))
  local padding=$(((width - ${#text}) / 2))
  
  printf "%${padding}s%s%${padding}s\n" "" "$text" ""
}

# Main program starts here
get_terminal_size
clear_screen

# Show warning message
set_color blue
echo ""
echo "  SYSTEM REBOOTING..."
echo "  ======================="
echo ""
set_color white
echo "  WARNING: This will initiate a system reboot and launch IrisOS."
echo "  Your computer will be restarted."
echo ""
echo "  Press any key to continue or Ctrl+C to cancel..."
read -n 1

# Begin shutdown
clear_screen
set_color blue
echo ""
echo ""
echo "   Shutting down system services..."
sleep 2
echo "   Stopping background processes..."
sleep 2
echo "   Saving system state..."
sleep 2
echo ""
echo "   Your computer will restart in a moment."
echo ""
echo "   Do not turn off your computer."
sleep 3

# Black screen to shutdown
clear_screen
sleep 3

# BIOS
clear_screen
set_color blue
echo ""
echo "System BIOS"
echo "==========================================="
echo ""
echo "Performing POST..."
sleep 1
echo "CPU: Intel Core i7 @ 3.40GHz"
sleep 1
echo "Memory: 16384MB (16GB)"
sleep 1
echo "Storage: 1TB SSD"
sleep 1
echo ""
echo "All hardware checks passed."
echo ""
echo "Scanning boot devices..."
sleep 2
echo "IrisOS Boot Loader detected."
sleep 1
echo ""
echo "Press F12 for boot menu or wait to continue..."
sleep 3

# Start IrisOS boot loader
clear_screen
bash ./IrisOS.sh

# Exit when IrisOS is closed
exit 0