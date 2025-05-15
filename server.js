// TextOS - Server module
// Provides a web interface to the OS (optional)

const express = require('express');
const http = require('http');
const { initializeFileSystem } = require('./lib/filesystem');
const { executeCommand } = require('./lib/commands');

// Initialize the file system
const fileSystem = initializeFileSystem();

// Create Express app
const app = express();
const server = http.createServer(app);

// Current path for the web session
let currentPath = '/';

// Serve static assets
app.use(express.json());
app.use(express.static('public'));

// API endpoints

// Execute a command
app.post('/api/command', (req, res) => {
  const { command, args } = req.body;
  
  if (!command) {
    return res.status(400).json({ success: false, message: 'Command is required' });
  }
  
  try {
    const result = executeCommand(command, args || [], {
      fileSystem,
      currentPath,
      updatePath: (newPath) => { currentPath = newPath; }
    });
    
    res.json({
      success: true,
      result,
      currentPath
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error executing command: ${error.message}`
    });
  }
});

// Get file system info
app.get('/api/fs', (req, res) => {
  const path = req.query.path || currentPath;
  
  try {
    const result = fileSystem.listDirectory(path);
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }
    
    res.json({
      success: true,
      path,
      items: result.items
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error getting file system info: ${error.message}`
    });
  }
});

// Get file content
app.get('/api/file', (req, res) => {
  if (!req.query.path) {
    return res.status(400).json({ success: false, message: 'Path is required' });
  }
  
  try {
    const result = fileSystem.readFile(req.query.path, '/');
    
    if (!result.success) {
      return res.status(404).json({
        success: false,
        message: result.message
      });
    }
    
    res.json({
      success: true,
      path: req.query.path,
      content: result.content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: `Error reading file: ${error.message}`
    });
  }
});

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`TextOS Web Server running on http://0.0.0.0:${PORT}`);
});

module.exports = server;
