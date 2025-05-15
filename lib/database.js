// TextOS - Database Module
// Handles database operations using PostgreSQL

const { Pool } = require('pg');
const { colorText } = require('./terminal');

// Create a connection pool to the PostgreSQL database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Initialize database
async function initializeDatabase() {
  try {
    // Create users table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(100) NOT NULL,
        full_name VARCHAR(100),
        email VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
      )
    `);

    // Create files table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS files (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        content TEXT,
        parent_id INTEGER REFERENCES files(id) ON DELETE CASCADE,
        owner_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        modified_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        permissions VARCHAR(9) DEFAULT 'rwxr--r--'
      )
    `);

    // Create settings table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        key VARCHAR(50) NOT NULL,
        value TEXT,
        UNIQUE(user_id, key)
      )
    `);

    // Create system_logs table if it doesn't exist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS system_logs (
        id SERIAL PRIMARY KEY,
        log_level VARCHAR(10) NOT NULL,
        message TEXT NOT NULL,
        source VARCHAR(50),
        user_id INTEGER REFERENCES users(id),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create a root directory if it doesn't exist
    const rootResult = await pool.query('SELECT id FROM files WHERE name = \'/\' AND parent_id IS NULL');
    if (rootResult.rows.length === 0) {
      await pool.query(`
        INSERT INTO files (name, type, parent_id)
        VALUES ('/', 'directory', NULL)
      `);
    }

    console.log(colorText('Database initialized successfully', 'green'));
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}

// User operations
const userOperations = {
  // Create a new user
  async createUser(username, password, fullName = '', email = '') {
    try {
      const result = await pool.query(
        'INSERT INTO users (username, password, full_name, email) VALUES ($1, $2, $3, $4) RETURNING *',
        [username, password, fullName, email]
      );
      return { success: true, user: result.rows[0] };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get user by ID
  async getUserById(id) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  },

  // Get user by username
  async getUserByUsername(username) {
    try {
      const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  },

  // Update user
  async updateUser(id, userData) {
    try {
      const { username, password, fullName, email } = userData;
      const result = await pool.query(
        'UPDATE users SET username = $1, password = $2, full_name = $3, email = $4, modified_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
        [username, password, fullName, email, id]
      );
      return { success: true, user: result.rows[0] };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Delete user
  async deleteUser(id) {
    try {
      await pool.query('DELETE FROM users WHERE id = $1', [id]);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Update last login time
  async updateLastLogin(id) {
    try {
      await pool.query('UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1', [id]);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// File operations
const fileOperations = {
  // Create a directory
  async createDirectory(name, parentId, ownerId) {
    try {
      const result = await pool.query(
        'INSERT INTO files (name, type, parent_id, owner_id) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, 'directory', parentId, ownerId]
      );
      return { success: true, directory: result.rows[0] };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Create a file
  async createFile(name, content, parentId, ownerId) {
    try {
      const result = await pool.query(
        'INSERT INTO files (name, type, content, parent_id, owner_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, 'file', content, parentId, ownerId]
      );
      return { success: true, file: result.rows[0] };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get a file or directory by ID
  async getFileById(id) {
    try {
      const result = await pool.query('SELECT * FROM files WHERE id = $1', [id]);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error getting file by ID:', error);
      return null;
    }
  },

  // Get files in a directory
  async getFilesInDirectory(directoryId) {
    try {
      const result = await pool.query(
        'SELECT * FROM files WHERE parent_id = $1 ORDER BY type DESC, name ASC',
        [directoryId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting files in directory:', error);
      return [];
    }
  },

  // Update a file
  async updateFile(id, { name, content }) {
    try {
      const result = await pool.query(
        'UPDATE files SET name = $1, content = $2, modified_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
        [name, content, id]
      );
      return { success: true, file: result.rows[0] };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Delete a file or directory
  async deleteFile(id) {
    try {
      await pool.query('DELETE FROM files WHERE id = $1', [id]);
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Find a file or directory by path
  async getFileByPath(path, rootDirectoryId) {
    try {
      if (path === '/') {
        const result = await pool.query('SELECT * FROM files WHERE name = \'/\' AND parent_id IS NULL');
        return result.rows[0] || null;
      }

      const pathParts = path.split('/').filter(part => part !== '');
      let currentDirId = rootDirectoryId;

      for (let i = 0; i < pathParts.length; i++) {
        const part = pathParts[i];
        const result = await pool.query(
          'SELECT * FROM files WHERE name = $1 AND parent_id = $2',
          [part, currentDirId]
        );

        if (result.rows.length === 0) {
          return null; // Path segment not found
        }

        // If this is the last part, return the file/directory
        if (i === pathParts.length - 1) {
          return result.rows[0];
        }

        // If this is a directory, continue traversing
        if (result.rows[0].type === 'directory') {
          currentDirId = result.rows[0].id;
        } else {
          return null; // Found a file in the middle of the path
        }
      }

      return null;
    } catch (error) {
      console.error('Error getting file by path:', error);
      return null;
    }
  }
};

// Settings operations
const settingsOperations = {
  // Get a setting
  async getSetting(userId, key) {
    try {
      const result = await pool.query(
        'SELECT value FROM settings WHERE user_id = $1 AND key = $2',
        [userId, key]
      );
      return result.rows[0]?.value || null;
    } catch (error) {
      console.error('Error getting setting:', error);
      return null;
    }
  },

  // Update or create a setting
  async setSetting(userId, key, value) {
    try {
      // Check if the setting exists
      const existingResult = await pool.query(
        'SELECT id FROM settings WHERE user_id = $1 AND key = $2',
        [userId, key]
      );

      if (existingResult.rows.length > 0) {
        // Update existing setting
        await pool.query(
          'UPDATE settings SET value = $1 WHERE user_id = $2 AND key = $3',
          [value, userId, key]
        );
      } else {
        // Create new setting
        await pool.query(
          'INSERT INTO settings (user_id, key, value) VALUES ($1, $2, $3)',
          [userId, key, value]
        );
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Delete a setting
  async deleteSetting(userId, key) {
    try {
      await pool.query(
        'DELETE FROM settings WHERE user_id = $1 AND key = $2',
        [userId, key]
      );
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Get all settings for a user
  async getAllSettings(userId) {
    try {
      const result = await pool.query(
        'SELECT key, value FROM settings WHERE user_id = $1',
        [userId]
      );
      return result.rows;
    } catch (error) {
      console.error('Error getting all settings:', error);
      return [];
    }
  }
};

// Log operations
const logOperations = {
  // Add a log entry
  async addLog(level, message, source, userId = null) {
    try {
      await pool.query(
        'INSERT INTO system_logs (log_level, message, source, user_id) VALUES ($1, $2, $3, $4)',
        [level, message, source, userId]
      );
      return { success: true };
    } catch (error) {
      console.error('Error adding log:', error);
      return { success: false, message: error.message };
    }
  },

  // Get logs by criteria
  async getLogs(criteria = {}) {
    try {
      let query = 'SELECT * FROM system_logs';
      const params = [];
      const conditions = [];

      if (criteria.level) {
        conditions.push(`log_level = $${params.length + 1}`);
        params.push(criteria.level);
      }

      if (criteria.source) {
        conditions.push(`source = $${params.length + 1}`);
        params.push(criteria.source);
      }

      if (criteria.userId) {
        conditions.push(`user_id = $${params.length + 1}`);
        params.push(criteria.userId);
      }

      if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
      }

      query += ' ORDER BY created_at DESC';

      if (criteria.limit) {
        query += ` LIMIT $${params.length + 1}`;
        params.push(criteria.limit);
      }

      const result = await pool.query(query, params);
      return result.rows;
    } catch (error) {
      console.error('Error getting logs:', error);
      return [];
    }
  },

  // Clear logs
  async clearLogs() {
    try {
      await pool.query('DELETE FROM system_logs');
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

// Database functions
const database = {
  init: initializeDatabase,
  user: userOperations,
  file: fileOperations,
  settings: settingsOperations,
  log: logOperations,

  // Test database connection
  async testConnection() {
    try {
      const result = await pool.query('SELECT NOW()');
      return { success: true, timestamp: result.rows[0].now };
    } catch (error) {
      return { success: false, message: error.message };
    }
  },

  // Close database connection
  async close() {
    try {
      await pool.end();
      return { success: true };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }
};

module.exports = database;