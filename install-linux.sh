#!/bin/bash

# IrisOS Linux Installer Script
# This script will set up IrisOS on a Linux system

# Color definitions
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

echo -e "${BLUE}"
echo " _____          _         ____   _____  "
echo "|_   _|        (_)       / __ \ / ____| "
echo "  | |    _ __   _   ___  | |  | | (___  "
echo "  | |   | '__\ | | / __| | |  | |\___ \ "
echo " _| |_  | |    | | \__ \ | |__| |____) |"
echo "|_____| |_|    |_|  ___/ \____/ |_____/ "
echo -e "${NC}"
echo -e "${GREEN}IrisOS Linux Installer${NC}"
echo "========================================"
echo ""

# Check for Node.js
echo -e "Checking for Node.js... "
if command_exists node; then
  NODE_VERSION=$(node -v)
  echo -e "${GREEN}Found Node.js $NODE_VERSION${NC}"
else
  echo -e "${RED}Node.js not found!${NC}"
  echo "IrisOS requires Node.js to run. Please install Node.js and try again."
  echo "You can install Node.js from https://nodejs.org/ or through your package manager."
  exit 1
fi

# Create installation directory
INSTALL_DIR="$HOME/.irisos"
echo -e "\nInstalling IrisOS to: ${BLUE}$INSTALL_DIR${NC}"

if [ -d "$INSTALL_DIR" ]; then
  echo -e "${YELLOW}Installation directory already exists.${NC}"
  read -p "Do you want to overwrite the existing installation? (y/n): " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Installation cancelled.${NC}"
    exit 1
  fi
  echo "Removing old installation..."
  rm -rf "$INSTALL_DIR"
fi

# Create directories
mkdir -p "$INSTALL_DIR"
mkdir -p "$INSTALL_DIR/lib"
mkdir -p "$HOME/.local/bin" 2>/dev/null || true

echo "Copying files..."
# Copy all necessary files
cp -r lib/* "$INSTALL_DIR/lib/"
cp index.js server.js "$INSTALL_DIR/"
cp IrisOS.sh RebootToIrisOS.sh "$INSTALL_DIR/"

# Make scripts executable
chmod +x "$INSTALL_DIR/IrisOS.sh" "$INSTALL_DIR/RebootToIrisOS.sh"

# Create launcher script in ~/.local/bin
LAUNCHER="$HOME/.local/bin/irisos"
echo "Creating launcher script at $LAUNCHER"

cat > "$LAUNCHER" << 'EOF'
#!/bin/bash
cd $HOME/.irisos
./RebootToIrisOS.sh
EOF

chmod +x "$LAUNCHER"

echo -e "\n${GREEN}IrisOS has been successfully installed!${NC}"
echo -e "\nYou can start IrisOS by running:"
echo -e "${BLUE}irisos${NC}"

# Check if ~/.local/bin is in PATH
if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
  echo -e "\n${YELLOW}NOTE:${NC} It appears that $HOME/.local/bin is not in your PATH."
  echo "You may need to add it by adding the following line to your .bashrc or .zshrc file:"
  echo -e "${BLUE}export PATH=\"\$HOME/.local/bin:\$PATH\"${NC}"
  echo "Then restart your terminal or run: source ~/.bashrc"
  echo -e "\nAlternatively, you can run IrisOS using the full path:"
  echo -e "${BLUE}$HOME/.irisos/RebootToIrisOS.sh${NC}"
fi

echo -e "\n${GREEN}Installation complete!${NC}"