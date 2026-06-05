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
const PRIMARY_HOST = process.env.PRIMARY_DOMAIN || 'coherascentlabs.com';
const LUNE_HOST = process.env.LUNE_SYNTH_DOMAIN || 'lunesynth.com';

function getHost(req) {
  return (req.headers.host || '').split(':')[0].toLowerCase();
}

function isLuneHost(host) {
  return host === LUNE_HOST || host === `www.${LUNE_HOST}`;
}

function isGetLike(req) {
  return req.method === 'GET' || req.method === 'HEAD';
}

function redirect(res, location, statusCode = 301) {
  res.writeHead(statusCode, { Location: location });
  res.end();
}

function getPathname(req) {
  try {
    return new URL(req.url, `http://${req.headers.host || 'localhost'}`).pathname;
  } catch (error) {
    return req.url.split('?')[0] || '/';
  }
}

function getRequestSuffix(req) {
  const queryStart = req.url.indexOf('?');
  return queryStart === -1 ? '' : req.url.slice(queryStart);
}

function getSafeFilePath(publicPath) {
  let decodedPath;

  try {
    decodedPath = decodeURIComponent(publicPath);
  } catch (error) {
    return null;
  }

  const normalizedPath = path.normalize(decodedPath).replace(/^[/\\]+/, '');
  const filePath = path.join(__dirname, normalizedPath);

  if (!filePath.startsWith(__dirname + path.sep) && filePath !== __dirname) {
    return null;
  }

  return filePath;
}

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
    case '.avif': return 'image/avif';
    case '.mp4': return 'video/mp4';
    case '.webm': return 'video/webm';
    case '.pdf': return 'application/pdf';
    default: return 'application/octet-stream';
  }
}

function serveStatic(req, res, publicPath) {
  const filePath = getSafeFilePath(publicPath);

  if (!filePath) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 Not Found</h1><p>The requested file does not exist.</p>');
    return;
  }

  let resolvedPath = filePath;

  fs.stat(resolvedPath, (err, stats) => {
    // If request is a folder, serve index.html inside it (e.g. /research -> /research/index.html)
    if (!err && stats.isDirectory()) {
      resolvedPath = path.join(resolvedPath, 'index.html');
    }

    fs.readFile(resolvedPath, (err, content) => {
      if (err) {
        // Page/file not found
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>404 Not Found</h1><p>The requested file does not exist.</p>');
      } else {
        // Success: serve file
        res.writeHead(200, { 'Content-Type': getContentType(resolvedPath) });
        res.end(req.method === 'HEAD' ? undefined : content);
      }
    });
  });
}

function handleWaitlist(req, res) {
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
}

function serveLuneHost(req, res, pathname) {
  if (pathname === '/' || pathname === '/index.html') {
    serveStatic(req, res, '/lune-synth/index.html');
    return;
  }

  if ((pathname === '/lune-synth' || pathname === '/lune-synth/') && isGetLike(req)) {
    redirect(res, `https://${LUNE_HOST}/${getRequestSuffix(req)}`);
    return;
  }

  if ((pathname === '/research' || pathname === '/research/' || pathname === '/research.html') && isGetLike(req)) {
    redirect(res, `https://${PRIMARY_HOST}/research/${getRequestSuffix(req)}`);
    return;
  }

  if (pathname === '/screenshots' || pathname.startsWith('/screenshots/')) {
    serveStatic(req, res, `/lune-synth${pathname}`);
    return;
  }

  serveStatic(req, res, pathname);
}

function servePrimaryHost(req, res, pathname) {
  if ((pathname === '/lune-synth' || pathname === '/lune-synth/' || pathname === '/applied' || pathname === '/applied/' || pathname === '/applied.html') && isGetLike(req)) {
    redirect(res, `https://${LUNE_HOST}/${getRequestSuffix(req)}`);
    return;
  }

  serveStatic(req, res, pathname === '/' ? '/index.html' : pathname);
}

const server = http.createServer((req, res) => {
  const host = getHost(req);
  const pathname = getPathname(req);

  if (isGetLike(req) && host === `www.${PRIMARY_HOST}`) {
    redirect(res, `https://${PRIMARY_HOST}${pathname}${getRequestSuffix(req)}`);
    return;
  }

  if (isGetLike(req) && host === `www.${LUNE_HOST}`) {
    redirect(res, `https://${LUNE_HOST}${pathname}${getRequestSuffix(req)}`);
    return;
  }

  // 1. Intercept the waitlist API route
  if (pathname === '/api/waitlist') {
    handleWaitlist(req, res);
    return;
  }

  // 2. Route public pages by domain while keeping shared static assets in one deployment
  if (isLuneHost(host)) {
    serveLuneHost(req, res, pathname);
    return;
  }

  servePrimaryHost(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`Server successfully running on port ${PORT}`);
});
