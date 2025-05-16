// irisos - Filesystem module
// Handles the in-memory file system operations

/**
 * File System Node representing a file or directory
 */
class FSNode {
  constructor(name, type, content = '', parent = null) {
    this.name = name;
    this.type = type; // 'file' or 'directory'
    this.content = content;
    this.parent = parent;
    this.children = {}; // For directories
    this.createdAt = new Date();
    this.modifiedAt = new Date();
    this.permissions = 'rwx'; // Default permissions
  }
}

/**
 * Initialize the file system with root directory
 */
function initializeFileSystem() {
  const root = new FSNode('/', 'directory');
  
  // Create some default directories in root
  root.children['home'] = new FSNode('home', 'directory', '', root);
  root.children['bin'] = new FSNode('bin', 'directory', '', root);
  root.children['etc'] = new FSNode('etc', 'directory', '', root);
  
  // Create a user home directory
  root.children['home'].children['user'] = new FSNode('user', 'directory', '', root.children['home']);
  
  // Create a readme file
  root.children['README.txt'] = new FSNode('README.txt', 'file', 
    'Welcome to irisos!\n\nThis is a  text-based operating system.\n' +
    'Type "help" to see available commands.\n', root);
  
  return {
    root,
    currentNode: root,
    
    /**
     * Resolve a path to a node in the filesystem
     */
    resolvePath(path, startNode = null) {
      // Handle absolute vs relative paths
      let currentNode = startNode || this.root;
      
      if (path === '/') {
        return { node: this.root, exists: true };
      }
      
      // Normalize the path
      const parts = path.split('/').filter(p => p !== '');
      
      if (path.startsWith('/')) {
        currentNode = this.root;
      }
      
      // Navigate through path parts
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        
        if (part === '.') {
          continue;
        } else if (part === '..') {
          if (currentNode.parent) {
            currentNode = currentNode.parent;
          }
          continue;
        }
        
        if (!currentNode.children[part]) {
          // Path doesn't exist
          return { 
            node: currentNode, 
            exists: false, 
            remainingPath: parts.slice(i).join('/') 
          };
        }
        
        currentNode = currentNode.children[part];
      }
      
      return { node: currentNode, exists: true };
    },
    
    /**
     * Get the absolute path of a node
     */
    getNodePath(node) {
      const pathParts = [];
      let current = node;
      
      while (current !== null) {
        if (current.name === '/') {
          break;
        }
        pathParts.unshift(current.name);
        current = current.parent;
      }
      
      return '/' + pathParts.join('/');
    },
    
    /**
     * Create a new directory
     */
    mkdir(path, basePath) {
      const absolutePath = path.startsWith('/') ? path : `${basePath}/${path}`.replace('//', '/');
      const dirName = absolutePath.split('/').filter(p => p !== '').pop();
      const parentPath = absolutePath.substring(0, absolutePath.lastIndexOf('/')) || '/';
      
      const { node: parentNode, exists } = this.resolvePath(parentPath);
      
      if (!exists) {
        return { success: false, message: `Parent directory does not exist: ${parentPath}` };
      }
      
      if (parentNode.type !== 'directory') {
        return { success: false, message: `${parentPath} is not a directory` };
      }
      
      if (parentNode.children[dirName]) {
        return { success: false, message: `${absolutePath} already exists` };
      }
      
      parentNode.children[dirName] = new FSNode(dirName, 'directory', '', parentNode);
      return { success: true, message: `Directory created: ${absolutePath}` };
    },
    
    /**
     * Create or update a file
     */
    writeFile(path, content, basePath) {
      const absolutePath = path.startsWith('/') ? path : `${basePath}/${path}`.replace('//', '/');
      const fileName = absolutePath.split('/').filter(p => p !== '').pop();
      const parentPath = absolutePath.substring(0, absolutePath.lastIndexOf('/')) || '/';
      
      const { node: parentNode, exists } = this.resolvePath(parentPath);
      
      if (!exists) {
        return { success: false, message: `Parent directory does not exist: ${parentPath}` };
      }
      
      if (parentNode.type !== 'directory') {
        return { success: false, message: `${parentPath} is not a directory` };
      }
      
      if (parentNode.children[fileName] && parentNode.children[fileName].type === 'directory') {
        return { success: false, message: `Cannot overwrite directory with file: ${absolutePath}` };
      }
      
      if (parentNode.children[fileName]) {
        // Update existing file
        parentNode.children[fileName].content = content;
        parentNode.children[fileName].modifiedAt = new Date();
      } else {
        // Create new file
        parentNode.children[fileName] = new FSNode(fileName, 'file', content, parentNode);
      }
      
      return { success: true, message: `File written: ${absolutePath}` };
    },
    
    /**
     * Read a file's content
     */
    readFile(path, basePath) {
      const absolutePath = path.startsWith('/') ? path : `${basePath}/${path}`.replace('//', '/');
      const { node, exists } = this.resolvePath(absolutePath);
      
      if (!exists) {
        return { success: false, message: `File not found: ${absolutePath}` };
      }
      
      if (node.type !== 'file') {
        return { success: false, message: `${absolutePath} is not a file` };
      }
      
      return { success: true, content: node.content };
    },
    
    /**
     * List contents of a directory
     */
    listDirectory(path) {
      const { node, exists } = this.resolvePath(path);
      
      if (!exists) {
        return { success: false, message: `Directory not found: ${path}` };
      }
      
      if (node.type !== 'directory') {
        return { success: false, message: `${path} is not a directory` };
      }
      
      const items = Object.values(node.children).map(child => ({
        name: child.name,
        type: child.type,
        size: child.type === 'file' ? child.content.length : '-',
        modified: child.modifiedAt.toISOString()
      }));
      
      return { success: true, items };
    },
    
    /**
     * Delete a file or directory
     */
    delete(path, basePath) {
      const absolutePath = path.startsWith('/') ? path : `${basePath}/${path}`.replace('//', '/');
      
      // Can't delete root
      if (absolutePath === '/') {
        return { success: false, message: 'Cannot delete root directory' };
      }
      
      const { node, exists } = this.resolvePath(absolutePath);
      
      if (!exists) {
        return { success: false, message: `Path not found: ${absolutePath}` };
      }
      
      // Check if directory is empty when deleting
      if (node.type === 'directory' && Object.keys(node.children).length > 0) {
        return { success: false, message: `Directory not empty: ${absolutePath}` };
      }
      
      // Get parent directory and delete the node
      const name = node.name;
      const parent = node.parent;
      
      if (parent) {
        delete parent.children[name];
        return { success: true, message: `Deleted: ${absolutePath}` };
      }
      
      return { success: false, message: `Failed to delete: ${absolutePath}` };
    },
    
    /**
     * Move/rename a file or directory
     */
    move(sourcePath, destPath, basePath) {
      // Resolve source path
      const sourceAbsPath = sourcePath.startsWith('/') ? sourcePath : `${basePath}/${sourcePath}`.replace('//', '/');
      const destAbsPath = destPath.startsWith('/') ? destPath : `${basePath}/${destPath}`.replace('//', '/');
      
      const { node: sourceNode, exists: sourceExists } = this.resolvePath(sourceAbsPath);
      
      if (!sourceExists) {
        return { success: false, message: `Source not found: ${sourceAbsPath}` };
      }
      
      // Get destination parent path and name
      const destName = destAbsPath.split('/').filter(p => p !== '').pop();
      const destParentPath = destAbsPath.substring(0, destAbsPath.lastIndexOf('/')) || '/';
      
      const { node: destParentNode, exists: destParentExists } = this.resolvePath(destParentPath);
      
      if (!destParentExists) {
        return { success: false, message: `Destination parent directory not found: ${destParentPath}` };
      }
      
      if (destParentNode.type !== 'directory') {
        return { success: false, message: `Destination is not a directory: ${destParentPath}` };
      }
      
      // Check if destination already exists
      if (destParentNode.children[destName]) {
        return { success: false, message: `Destination already exists: ${destAbsPath}` };
      }
      
      // Move the node
      const sourceParent = sourceNode.parent;
      const sourceName = sourceNode.name;
      
      // Update the node
      sourceNode.name = destName;
      sourceNode.parent = destParentNode;
      sourceNode.modifiedAt = new Date();
      
      // Update parent references
      destParentNode.children[destName] = sourceNode;
      delete sourceParent.children[sourceName];
      
      return { success: true, message: `Moved ${sourceAbsPath} to ${destAbsPath}` };
    },
    
    /**
     * Copy a file or directory
     */
    copy(sourcePath, destPath, basePath) {
      // Resolve source path
      const sourceAbsPath = sourcePath.startsWith('/') ? sourcePath : `${basePath}/${sourcePath}`.replace('//', '/');
      const destAbsPath = destPath.startsWith('/') ? destPath : `${basePath}/${destPath}`.replace('//', '/');
      
      const { node: sourceNode, exists: sourceExists } = this.resolvePath(sourceAbsPath);
      
      if (!sourceExists) {
        return { success: false, message: `Source not found: ${sourceAbsPath}` };
      }
      
      // Get destination parent path and name
      const destName = destAbsPath.split('/').filter(p => p !== '').pop();
      const destParentPath = destAbsPath.substring(0, destAbsPath.lastIndexOf('/')) || '/';
      
      const { node: destParentNode, exists: destParentExists } = this.resolvePath(destParentPath);
      
      if (!destParentExists) {
        return { success: false, message: `Destination parent directory not found: ${destParentPath}` };
      }
      
      if (destParentNode.type !== 'directory') {
        return { success: false, message: `Destination is not a directory: ${destParentPath}` };
      }
      
      // Check if destination already exists
      if (destParentNode.children[destName]) {
        return { success: false, message: `Destination already exists: ${destAbsPath}` };
      }
      
      // Copy the node
      if (sourceNode.type === 'file') {
        destParentNode.children[destName] = new FSNode(
          destName,
          'file',
          sourceNode.content,
          destParentNode
        );
        return { success: true, message: `Copied ${sourceAbsPath} to ${destAbsPath}` };
      } else {
        // For directories, we'd need recursive copying
        // This is a simplified version that only copies the directory itself
        destParentNode.children[destName] = new FSNode(
          destName,
          'directory',
          '',
          destParentNode
        );
        return { success: true, message: `Copied directory ${sourceAbsPath} to ${destAbsPath}` };
      }
    }
  };
}

module.exports = {
  initializeFileSystem
};
