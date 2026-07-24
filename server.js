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
const MAX_JSON_BODY_BYTES = 16 * 1024;
const PUBLIC_ROOT_FILES = new Set([
  'index.html',
  'research.html',
  'applied.html',
  'applied-handwriting-demo.js',
  'applied-phone-screenshots.js',
  'applied-response-slideshow.js',
  'circle_favicon.png',
  'coherascent-labs-logo-march-16-2026.webp',
  'coherascent-labs-streamlined-light-2.webp',
  'liquid-glass-cards.css',
  'liquid-glass-cards.js',
]);

const CONTENT_SECURITY_POLICY = [
  "default-src 'self'",
  "base-uri 'self'",
  "connect-src 'self'",
  "font-src 'self' https://fonts.gstatic.com data:",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data:",
  "media-src 'self'",
  "object-src 'none'",
  "script-src 'self' 'unsafe-inline' https://unpkg.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
].join('; ');

function setSecurityHeaders(req, res) {
  res.setHeader('Content-Security-Policy', CONTENT_SECURITY_POLICY);
  res.setHeader('Permissions-Policy', 'accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');

  if ((req.headers['x-forwarded-proto'] || '').split(',')[0].trim() === 'https') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  }
}

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

function sendText(req, res, statusCode, contentType, body, cacheControl = 'no-cache') {
  const payload = Buffer.from(body, 'utf8');
  res.writeHead(statusCode, {
    'Content-Type': contentType,
    'Content-Length': payload.length,
    'Cache-Control': cacheControl,
  });

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  res.end(payload);
}

function serveRobots(req, res, host) {
  const origin = isLuneHost(host) ? `https://${LUNE_HOST}` : `https://${PRIMARY_HOST}`;
  sendText(
    req,
    res,
    200,
    'text/plain; charset=utf-8',
    `User-agent: *\nAllow: /\nSitemap: ${origin}/sitemap.xml\n`,
    'public, max-age=3600'
  );
}

function serveSitemap(req, res, host) {
  const urls = isLuneHost(host)
    ? [
        `https://${LUNE_HOST}/`,
        `https://${LUNE_HOST}/blog/`,
        `https://${LUNE_HOST}/blog/why-handwriting-still-wins/`,
        `https://${LUNE_HOST}/blog/ai-is-breaking-how-we-learn/`,
        `https://${LUNE_HOST}/blog/welcome-to-lune-synth/`,
      ]
    : [
        `https://${PRIMARY_HOST}/`,
        `https://${PRIMARY_HOST}/research/`,
      ];
  const entries = urls.map(url => `  <url><loc>${url}</loc></url>`).join('\n');
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries}\n</urlset>\n`;
  sendText(req, res, 200, 'application/xml; charset=utf-8', sitemap, 'public, max-age=3600');
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
  if (!isPublicFilePath(normalizedPath)) return null;

  const filePath = path.join(__dirname, normalizedPath);

  if (!filePath.startsWith(__dirname + path.sep) && filePath !== __dirname) {
    return null;
  }

  return filePath;
}

function isPublicFilePath(relativePath) {
  const normalized = relativePath.split(path.sep).join('/').replace(/\/$/, '');
  if (!normalized || normalized.split('/').some(segment => segment.startsWith('.'))) return false;
  if (PUBLIC_ROOT_FILES.has(normalized)) return true;

  if (normalized === 'research' || normalized === 'research/index.html') return true;
  if (normalized === 'applied' || normalized === 'applied/index.html') return true;
  if (/^images\/[a-z0-9._-]+\.(?:png|jpe?g|webp|avif|svg)$/i.test(normalized)) return true;
  if (/^mobile-app-assets\/screenshots\/[a-z0-9_./-]+\.(?:png|jpe?g|webp|avif)$/i.test(normalized)) return true;

  if (normalized === 'lune-synth/index.html' || normalized === 'lune-synth/legal.css') return true;
  if (normalized === 'lune-synth/privacy/index.html' || normalized === 'lune-synth/terms/index.html') return true;
  if (normalized === 'lune-synth/blog' || /^lune-synth\/blog\/[a-z0-9-]+$/i.test(normalized)) return true;
  if (/^lune-synth\/blog\/(?:index\.html|blog\.(?:css|js))$/i.test(normalized)) return true;
  if (/^lune-synth\/blog\/images\/[a-z0-9._-]+\.(?:png|jpe?g|webp|avif)$/i.test(normalized)) return true;
  if (/^lune-synth\/blog\/[a-z0-9-]+\/index\.html$/i.test(normalized)) return true;
  if (/^lune-synth\/screenshots\/applied\/[a-z0-9._-]+\.(?:png|jpe?g|webp|mp4|webm)$/i.test(normalized)) return true;

  return false;
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

function getCacheControl(filePath, requestUrl = '') {
  const extname = path.extname(filePath);

  if (extname === '.html') {
    return 'no-cache';
  }

  if (['.css', '.js'].includes(extname)) {
    const query = requestUrl.includes('?') ? requestUrl.slice(requestUrl.indexOf('?') + 1) : '';
    if (new URLSearchParams(query).has('v')) {
      return 'public, max-age=31536000, immutable';
    }
    return 'no-cache';
  }

  if (['.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.json', '.avif', '.webp', '.mp4', '.webm', '.pdf'].includes(extname)) {
    return 'public, max-age=86400, stale-while-revalidate=604800';
  }

  if (extname) {
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
    'Cache-Control': getCacheControl(filePath, req.url),
    'ETag': etag,
    'Last-Modified': lastModified,
  };

  if (isCompressible(filePath)) {
    baseHeaders.Vary = 'Accept-Encoding';
  }

  if (isVideo(filePath)) {
    baseHeaders['Accept-Ranges'] = 'bytes';
  }

  const ifNoneMatch = req.headers['if-none-match'];
  const isNotModified = ifNoneMatch
    ? ifNoneMatch.split(',').map(value => value.trim()).includes(etag)
    : req.headers['if-modified-since'] === lastModified;

  if (isNotModified) {
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

    fs.realpath(resolvedPath, (realPathError, realPath) => {
      if (realPathError) {
        sendNotFound(res);
        return;
      }

      const realRelativePath = path.relative(__dirname, realPath);
      if (!isPublicFilePath(realRelativePath)) {
        sendNotFound(res);
        return;
      }

      fs.stat(realPath, (resolvedError, resolvedStats) => {
        if (resolvedError || !resolvedStats.isFile()) {
          sendNotFound(res);
          return;
        }

        serveFile(req, res, realPath, resolvedStats);
      });
    });
  });
}

function handleWaitlist(req, res) {
    res.status = (statusCode) => {
      res.statusCode = statusCode;
      return res;
    };

    res.json = (data) => {
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(data));
      return res;
    };

    if (req.method !== 'POST') {
      req.body = {};
      waitlistHandler(req, res);
      return;
    }

    if (!(req.headers['content-type'] || '').toLowerCase().startsWith('application/json')) {
      res.status(415).json({ error: 'Content-Type must be application/json.' });
      return;
    }

    const declaredLength = Number(req.headers['content-length'] || 0);
    if (Number.isFinite(declaredLength) && declaredLength > MAX_JSON_BODY_BYTES) {
      res.status(413).json({ error: 'Request body is too large.' });
      return;
    }

    let body = '';
    let bodyBytes = 0;
    let rejected = false;

    req.on('data', chunk => {
      if (rejected) return;
      bodyBytes += chunk.length;
      if (bodyBytes > MAX_JSON_BODY_BYTES) {
        rejected = true;
        res.status(413).json({ error: 'Request body is too large.' });
        return;
      }
      body += chunk.toString();
    });

    req.on('end', () => {
      if (rejected || res.writableEnded) return;

      try {
        req.body = body ? JSON.parse(body) : {};
      } catch (e) {
        res.status(400).json({ error: 'Request body must be valid JSON.' });
        return;
      }

      waitlistHandler(req, res);
    });

    req.on('error', error => {
      console.error('Waitlist request stream error:', error.message);
      if (!res.writableEnded) {
        res.status(400).json({ error: 'Could not read request body.' });
      }
    });
}

function serveLuneHost(req, res, pathname) {
  if (pathname === '/index.html') {
    redirect(res, `/${getRequestSuffix(req)}`);
    return;
  }

  if (pathname === '/') {
    serveStatic(req, res, '/lune-synth/index.html');
    return;
  }

  if (pathname === '/privacy') {
    redirect(res, `/privacy/${getRequestSuffix(req)}`);
    return;
  }

  if (pathname === '/privacy/') {
    serveStatic(req, res, '/lune-synth/privacy/index.html');
    return;
  }

  if (pathname === '/terms') {
    redirect(res, `/terms/${getRequestSuffix(req)}`);
    return;
  }

  if (pathname === '/terms/') {
    serveStatic(req, res, '/lune-synth/terms/index.html');
    return;
  }

  if (pathname === '/blog') {
    redirect(res, `/blog/${getRequestSuffix(req)}`);
    return;
  }

  if (pathname.startsWith('/blog/') && !pathname.endsWith('/') && !path.extname(pathname)) {
    redirect(res, `${pathname}/${getRequestSuffix(req)}`);
    return;
  }

  if (pathname.startsWith('/blog/')) {
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

  if (pathname === '/index.html') {
    redirect(res, `/${getRequestSuffix(req)}`);
    return;
  }

  if ((pathname === '/research' || pathname === '/research.html') && isGetLike(req)) {
    redirect(res, `/research/${getRequestSuffix(req)}`);
    return;
  }

  serveStatic(req, res, pathname === '/' ? '/index.html' : pathname);
}

const server = http.createServer((req, res) => {
  const requestStartedAt = Date.now();
  setSecurityHeaders(req, res);

  const host = getHost(req);
  const pathname = getPathname(req);

  res.on('finish', () => {
    if (res.statusCode < 400) return;
    console.warn(JSON.stringify({
      event: 'http_response',
      method: req.method,
      host,
      path: pathname,
      status: res.statusCode,
      durationMs: Date.now() - requestStartedAt,
    }));
  });

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

  if (isGetLike(req) && pathname === '/healthz') {
    sendText(req, res, 200, 'application/json; charset=utf-8', '{"status":"ok"}\n', 'no-store');
    return;
  }

  if (isGetLike(req) && pathname === '/readyz') {
    const ready = Boolean(process.env.RESEND_API_KEY);
    sendText(
      req,
      res,
      ready ? 200 : 503,
      'application/json; charset=utf-8',
      ready ? '{"status":"ready"}\n' : '{"status":"not_ready"}\n',
      'no-store'
    );
    return;
  }

  if (isGetLike(req) && pathname === '/robots.txt') {
    serveRobots(req, res, host);
    return;
  }

  if (isGetLike(req) && pathname === '/sitemap.xml') {
    serveSitemap(req, res, host);
    return;
  }

  // 1. Intercept the waitlist API route
  if (pathname === '/api/waitlist') {
    if (!isLuneHost(host)) {
      sendNotFound(res);
      return;
    }
    handleWaitlist(req, res);
    return;
  }

  if (!isGetLike(req)) {
    res.writeHead(405, {
      'Allow': 'GET, HEAD',
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify({ error: 'Method Not Allowed' }));
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

server.requestTimeout = 15_000;
server.headersTimeout = 10_000;
server.keepAliveTimeout = 5_000;

function shutdown(signal) {
  console.log(`${signal} received; closing HTTP server.`);
  server.close(error => {
    if (error) {
      console.error('HTTP server shutdown failed:', error.message);
      process.exitCode = 1;
    }
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
