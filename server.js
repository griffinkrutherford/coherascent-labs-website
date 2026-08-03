/**
 * Pure Node.js Web Server for Railway
 * Serves static assets and runs the secure Resend waitlist API.
 * Zero external dependencies.
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
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

function isLocalPreviewHost(host) {
  return host === 'localhost' || host === '127.0.0.1';
}

function isLuneCampaignPath(pathname) {
  return (
    pathname === '/campaign' || pathname.startsWith('/campaign/') ||
    pathname === '/study' || pathname.startsWith('/study/') ||
    pathname === '/test-prep' || pathname.startsWith('/test-prep/') ||
    pathname === '/for-parents' || pathname.startsWith('/for-parents/') ||
    pathname === '/for-students' || pathname.startsWith('/for-students/') ||
    pathname === '/for-families' || pathname.startsWith('/for-families/')
  );
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
    case '.webp': return 'image/webp';
    case '.mp4': return 'video/mp4';
    case '.webm': return 'video/webm';
    case '.pdf': return 'application/pdf';
    default: return 'application/octet-stream';
  }
}

function isCompressible(filePath) {
  return ['.html', '.css', '.js', '.json', '.svg'].includes(path.extname(filePath));
}

function isVideo(filePath) {
  return ['.mp4', '.webm'].includes(path.extname(filePath));
}

function getCacheControl(filePath) {
  const extname = path.extname(filePath);

  if (extname === '.html') {
    return 'no-cache';
  }

  if (['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.json', '.avif', '.webp', '.mp4', '.webm', '.pdf'].includes(extname)) {
    return 'public, max-age=31536000, immutable';
  }

  return 'public, max-age=3600';
}

function makeWeakEtag(stats) {
  return `W/"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;
}

function getCompression(req, filePath, size) {
  if (!isCompressible(filePath) || size < 1024 || req.headers.range) {
    return null;
  }

  const accepted = req.headers['accept-encoding'] || '';
  if (accepted.includes('br') && zlib.createBrotliCompress) {
    return {
      encoding: 'br',
      stream: zlib.createBrotliCompress({
        params: {
          [zlib.constants.BROTLI_PARAM_QUALITY]: 5,
        },
      }),
    };
  }

  if (accepted.includes('gzip')) {
    return {
      encoding: 'gzip',
      stream: zlib.createGzip({ level: 6 }),
    };
  }

  return null;
}

function parseRange(rangeHeader, size) {
  const match = /^bytes=(\d*)-(\d*)$/.exec(rangeHeader || '');
  if (!match) return null;

  let start = match[1] === '' ? null : Number(match[1]);
  let end = match[2] === '' ? null : Number(match[2]);

  if (start === null && end === null) return null;

  if (start === null) {
    const suffixLength = Math.max(0, end || 0);
    start = Math.max(size - suffixLength, 0);
    end = size - 1;
  } else {
    end = end === null ? size - 1 : Math.min(end, size - 1);
  }

  if (!Number.isFinite(start) || !Number.isFinite(end) || start < 0 || start > end || start >= size) {
    return null;
  }

  return { start, end };
}

function sendNotFound(res) {
  res.writeHead(404, {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'no-cache',
  });
  res.end('<h1>404 Not Found</h1><p>The requested file does not exist.</p>');
}

function serveFile(req, res, filePath, stats) {
  const etag = makeWeakEtag(stats);
  const lastModified = stats.mtime.toUTCString();
  const baseHeaders = {
    'Content-Type': getContentType(filePath),
    'Cache-Control': getCacheControl(filePath),
    'ETag': etag,
    'Last-Modified': lastModified,
  };

  if (isCompressible(filePath)) {
    baseHeaders.Vary = 'Accept-Encoding';
  }

  if (isVideo(filePath)) {
    baseHeaders['Accept-Ranges'] = 'bytes';
  }

  if (req.headers['if-none-match'] === etag || req.headers['if-modified-since'] === lastModified) {
    res.writeHead(304, baseHeaders);
    res.end();
    return;
  }

  if (isVideo(filePath) && req.headers.range) {
    const range = parseRange(req.headers.range, stats.size);

    if (!range) {
      res.writeHead(416, {
        ...baseHeaders,
        'Content-Range': `bytes */${stats.size}`,
      });
      res.end();
      return;
    }

    res.writeHead(206, {
      ...baseHeaders,
      'Content-Length': range.end - range.start + 1,
      'Content-Range': `bytes ${range.start}-${range.end}/${stats.size}`,
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    fs.createReadStream(filePath, range).pipe(res);
    return;
  }

  const compression = getCompression(req, filePath, stats.size);
  if (compression) {
    res.writeHead(200, {
      ...baseHeaders,
      'Content-Encoding': compression.encoding,
    });

    if (req.method === 'HEAD') {
      res.end();
      return;
    }

    fs.createReadStream(filePath).pipe(compression.stream).pipe(res);
    return;
  }

  res.writeHead(200, {
    ...baseHeaders,
    'Content-Length': stats.size,
  });

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  fs.createReadStream(filePath).pipe(res);
}

function serveStatic(req, res, publicPath) {
  const filePath = getSafeFilePath(publicPath);

  if (!filePath) {
    sendNotFound(res);
    return;
  }

  let resolvedPath = filePath;

  fs.stat(resolvedPath, (err, stats) => {
    // If request is a folder, serve index.html inside it (e.g. /research -> /research/index.html)
    if (!err && stats.isDirectory()) {
      resolvedPath = path.join(resolvedPath, 'index.html');
    }

    fs.stat(resolvedPath, (err, resolvedStats) => {
      if (err) {
        sendNotFound(res);
        return;
      }

      if (!resolvedStats.isFile()) {
        sendNotFound(res);
        return;
      }

      serveFile(req, res, resolvedPath, resolvedStats);
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

  if (pathname === '/privacy' || pathname === '/privacy/') {
    serveStatic(req, res, '/lune-synth/privacy/index.html');
    return;
  }

  if (pathname === '/terms' || pathname === '/terms/') {
    serveStatic(req, res, '/lune-synth/terms/index.html');
    return;
  }

  if (pathname === '/blog' || pathname.startsWith('/blog/')) {
    serveStatic(req, res, `/lune-synth${pathname}`);
    return;
  }

  if (isLuneCampaignPath(pathname)) {
    serveStatic(req, res, `/lune-synth${pathname}`);
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

  if (pathname === '/docs' || pathname.startsWith('/docs/') || pathname === '/scripts' || pathname.startsWith('/scripts/')) {
    res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end('<h1>404 Not Found</h1><p>The requested file does not exist.</p>');
    return;
  }

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

  if (isLocalPreviewHost(host) && isLuneCampaignPath(pathname)) {
    serveLuneHost(req, res, pathname);
    return;
  }

  servePrimaryHost(req, res, pathname);
});

server.listen(PORT, () => {
  console.log(`Server successfully running on port ${PORT}`);
});
