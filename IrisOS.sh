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

# Function to display progress bar
show_progress() {
  local percent=$1
  local width=40
  local filled=$((percent * width / 100))
  local empty=$((width - filled))
  
  printf "["
  for ((i=0; i<filled; i++)); do
    printf "#"
  done
  
  for ((i=0; i<empty; i++)); do
    printf " "
  done
  
  printf "] %d%%\n" $percent
}

# Main program starts here
get_terminal_size
clear_screen

# Text OS Boot Loader
set_color blue
echo ""
center_text "IrisOS Boot Loader v1.0"
center_text "======================"
echo ""
center_text "System rebooting..."
sleep 2

# BIOS POST screen
clear_screen
set_color white
echo ""
echo "IrisOS BIOS v2.0"
echo "==================================="
echo ""
echo "Performing Power-On Self Test (POST)"
echo ""
echo -n "Detecting CPU... "
sleep 1
echo "OK"

echo -n "Initializing RAM... "
sleep 1
echo "OK"

echo -n "Checking storage devices... "
sleep 1
echo "OK"

echo -n "Initializing peripherals... "
sleep 1
echo "OK"

echo ""
echo "All hardware checks passed."
echo ""
echo "Press any key to enter boot menu..."
read -n 1

# Boot Menu
clear_screen
set_color blue
echo ""
echo "============================================="
echo "        IrisOS Boot Menu"
echo "============================================="
echo ""
echo "Select boot option:"
echo ""
echo "[1] IrisOS"
echo "[2] IrisOS (Safe Mode)"
echo "[3] Boot from Hard Drive"
echo "[4] System Recovery"
echo ""
echo "Press 1-4 to select an option..."

# Get user input
read -n 1 choice
case $choice in
  1) 
    clear_screen
    set_color green
    echo ""
    echo "Loading IrisOS..."
    echo ""
    show_progress 40
    sleep 1
    
    clear_screen
    echo ""
    echo "Loading IrisOS..."
    echo ""
    show_progress 80
    sleep 1
    
    clear_screen
    echo ""
    echo "Loading IrisOS..."
    echo ""
    show_progress 100
    sleep 1
    
    echo ""
    echo "Boot successful! Starting IrisOS..."
    sleep 2
    IRISOS_SAFE_MODE=false
    ;;
    
  2)
    clear_screen
    set_color blue
    echo ""
    echo "Loading IrisOS in Safe Mode..."
    echo ""
    show_progress 100
    sleep 2
    
    echo ""
    echo "Boot successful! Starting IrisOS in Safe Mode..."
    sleep 2
    IRISOS_SAFE_MODE=true
    ;;
    
  3)
    clear_screen
    set_color red
    echo ""
    echo "ERROR: No operating system found on hard drive."
    echo "Restart and select a different boot option."
    echo ""
    sleep 3
    exit 1
    ;;
    
  4)
    clear_screen
    set_color blue
    echo ""
    echo "IrisOS System Recovery"
    echo "======================"
    echo ""
    echo "Loading recovery console..."
    sleep 3
    
    echo ""
    echo "Recovery mode not implemented in this version."
    echo ""
    echo "Press any key to exit..."
    read -n 1
    exit 1
    ;;
    
  *)
    echo "Invalid selection. Exiting."
    exit 1
    ;;
esac

# Clear screen and start IrisOS
clear_screen
set_color reset
echo "IrisOS is now starting... Please wait."
sleep 2

# Export environment variables for IrisOS
export IRISOS_BOOTING=true
export IRISOS_VERBOSE=${IRISOS_VERBOSE:-false}
export IRISOS_SAFE_MODE=${IRISOS_SAFE_MODE:-false}

if [ "$IRISOS_SAFE_MODE" = "true" ]; then
  echo "Starting IrisOS in Safe Mode..."
fi

# Launch the actual IrisOS program using Node.js
node index.js

# Exit when IrisOS is closed
exit 0