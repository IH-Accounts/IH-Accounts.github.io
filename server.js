/**
 * Simple HTTP server for Idle Heroes Account Viewer
 * Used for local testing and development
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

// Server configuration
const PORT = 8080;

// MIME types for different file extensions
const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.txt': 'text/plain'
};

// Create the server
const server = http.createServer((req, res) => {
    console.log(`Request received: ${req.method} ${req.url}`);
    
    // Get the file path
    let filePath = '.' + req.url;
    
    // Default to landing.html if path is '/'
    if (filePath === './') {
        filePath = './landing.html';
    }
    
    // Determine the content type based on the file extension
    const extname = String(path.extname(filePath)).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // Read the file
    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File not found
                fs.readFile('./404.html', (error, content) => {
                    res.writeHead(404, { 'Content-Type': 'text/html' });
                    res.end(content, 'utf-8');
                });
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
                console.error(`Server Error: ${error.code}`);
            }
        } else {
            // Success - return the file
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Start the server
server.listen(PORT, '127.0.0.1', () => {
    console.log(`Server running at http://127.0.0.1:${PORT}/`);
    console.log(`Åbn denne adresse i en browser: http://127.0.0.1:${PORT}/`);
});
