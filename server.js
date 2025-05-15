// IrisOS - System module
// This file is kept for compatibility but no longer starts a web server

const { initializeFileSystem } = require('./lib/filesystem');

// Create a dummy server object
const dummyServer = {
  isIrisOS: true,
  version: '1.0.0'
};

// Log a message
console.log("IrisOS native terminal mode active");

module.exports = dummyServer;
