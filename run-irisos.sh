#!/bin/bash

# Simple launcher script for IrisOS

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "Error: Node.js is not installed."
    echo "Please install Node.js to run IrisOS."
    exit 1
fi

# Check if the required files exist
if [ ! -f "IrisOS.sh" ] || [ ! -f "index.js" ] || [ ! -d "lib" ]; then
    echo "Error: Required IrisOS files not found."
    echo "Make sure you're running this script from the IrisOS directory."
    exit 1
fi

# Make sure the scripts are executable
chmod +x IrisOS.sh RebootToIrisOS.sh 2>/dev/null

# Launch IrisOS
echo "Starting IrisOS..."
./RebootToIrisOS.sh

exit 0