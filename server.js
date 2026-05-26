/**
 * Pure Node.js Web Server for Railway
 * Serves static assets and runs the secure Resend waitlist API.
 * Zero external dependencies.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const waitlistHandler = require('./api/waitlist.js');

const PORT = process.env.PORT || 3000;

// Helper to determine HTTP Content-Type header
function getContentType(filePath) {
  const extname = path.extname(filePath);
  switch (extname) {
    case '.html': return 'text/html; charset=utf-8';
    case '.css': return 'text/css; charset=utf-8';
    case '.js': return 'application/javascript; charset=utf-8';
    case '.png': return 'image/png';
    case '.jpg': return 'image/jpeg';
    case '.gif': return 'image/gif';
    case '.svg': return 'image/svg+xml';
    case '.ico': return 'image/x-icon';
    case '.json': return 'application/json; charset=utf-8';
    default: return 'application/octet-stream';
  }
}

const server = http.createServer((req, res) => {
  // 1. Intercept the waitlist API route
  if (req.url === '/api/waitlist') {
    let body = '';
    
    req.on('data', chunk => {
      body += chunk.toString();
    });
    
    req.on('end', () => {
      try {
        req.body = body ? JSON.parse(body) : {};
      } catch (e) {
        req.body = {};
      }
      
      // Inject Express-like response helpers to match Vercel's API signature in waitlist.js
      res.status = (statusCode) => {
        res.statusCode = statusCode;
        return res;
      };
      
      res.json = (data) => {
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.end(JSON.stringify(data));
        return res;
      };

      // Call our secure backend handler
      waitlistHandler(req, res);
    });
    return;
  }

  // 2. Serve static files
  let safeUrl = req.url.split('?')[0];
  
  // Default to index.html at root
  if (safeUrl === '/') {
    safeUrl = '/index.html';
  }

  let filePath = path.join(__dirname, safeUrl);

  fs.stat(filePath, (err, stats) => {
    // If request is a folder, serve index.html inside it (e.g. /lune-synth -> /lune-synth/index.html)
    if (!err && stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
    }

    fs.readFile(filePath, (err, content) => {
      if (err) {
        // Page/file not found
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 Not Found</h1><p>The requested file does not exist.</p>');
      } else {
        // Success: serve file
        res.writeHead(200, { 'Content-Type': getContentType(filePath) });
        res.end(content);
      }
    });
  });
});

server.listen(PORT, () => {
  console.log(`Server successfully running on port ${PORT}`);
});
