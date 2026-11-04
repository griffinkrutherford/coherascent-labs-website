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
const unsubscribeHandler = require('./api/unsubscribe.js');

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

/**
 * Public static surface, allowlist-by-default.
 *
 * server.js used to serve everything under the repo root except /docs and
 * /scripts, which meant server.js, api/*.js, every *.md, package.json, the
 * LaTeX build artifacts, .vscode/, tmp/ and the rest of the repo's working
 * files were all reachable at their literal path (confirmed live: GET
 * /server.js, /AGENTS.md, /api/waitlist.js all returned 200). This replaces
 * that denylist with an allowlist built by grepping every page's src/href
 * for the paths it actually loads (see the 2026-11-02 security-hardening
 * work): anything not named here 404s, including new files added later.
 *
 * The check runs against the already-normalized, already-collapsed path (no
 * "..", no leading slash), so an allowed prefix cannot be walked out of it
 * with a traversal sequence -- path.normalize resolves those before this
 * ever sees the string.
 */
const ALLOWED_EXTENSIONS = new Set([
  'html', 'css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp', 'avif', 'woff2', 'mp4', 'webm',
]);

// Root-level files pages reference directly (grepped from every *.html's
// src/href). Everything else at the repo root -- server.js, package.json,
// the LaTeX build artifacts, the unused logo/favicon drafts -- is denied by
// omission.
const ALLOWED_ROOT_FILES = new Set([
  'index.html',
  'applied.html',
  'research.html',
  'circle_favicon.png',
  'coherascent-labs-logo-march-16-2026.webp',
  'coherascent-labs-streamlined-light-2.webp',
  'liquid-glass-cards.js',
  'liquid-glass-cards.css',
  'applied-response-slides.js',
  'applied-response-slideshow.js',
  'applied-handwriting-demo.js',
  'applied-phone-screenshots.js',
  'applied-phone-intro.js',
  'applied-carousel-intros.js',
]);

// Conventional fixed paths a browser, crawler, or store reviewer may request.
// None of these exist in the repo today; allowing the name costs nothing and
// means adding the file later needs no server.js change. Until then they 404
// exactly like any other unmatched path.
const ALLOWED_FIXED_PATHS = new Set([
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'app-ads.txt',
  '.well-known/apple-app-site-association',
  '.well-known/assetlinks.json',
]);

// Directory subtrees that may serve their own files, gated by extension.
const ALLOWED_DIR_PREFIXES = ['images/', 'lune-synth/', 'applied/', 'research/'];

// Narrower than the prefixes above: only the screenshots themselves, never
// the README/tokens/authoring source material that lives beside them in
// mobile-app-assets/.
const ALLOWED_IMAGE_SUBTREES = ['mobile-app-assets/screenshots/'];
const IMAGE_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'avif']);

// The handwriting carousel's phone intro clips (applied-phone-intro.js) sit
// beside the stills they end on; only MP4 is added, and only there.
const ALLOWED_VIDEO_SUBTREES = ['mobile-app-assets/screenshots/applied/question-prompts/carousel-v7/'];
const VIDEO_EXTENSIONS = new Set(['mp4']);

function isAllowedPublicPath(normalizedPath) {
  const rel = normalizedPath.split(path.sep).join('/');

  if (rel === '') return true; // repo root -> index.html
  if (ALLOWED_ROOT_FILES.has(rel)) return true;
  if (ALLOWED_FIXED_PATHS.has(rel)) return true;

  const ext = path.extname(rel).slice(1).toLowerCase();

  for (const subtree of ALLOWED_VIDEO_SUBTREES) {
    if (rel.startsWith(subtree) && VIDEO_EXTENSIONS.has(ext)) return true;
  }

  for (const subtree of ALLOWED_IMAGE_SUBTREES) {
    const dirName = subtree.slice(0, -1);
    if (rel === dirName) return true; // directory listing request; 404s on fs.stat
    if (rel.startsWith(subtree)) return IMAGE_EXTENSIONS.has(ext);
  }

  for (const prefix of ALLOWED_DIR_PREFIXES) {
    const dirName = prefix.slice(0, -1);
    if (rel === dirName || rel.startsWith(prefix)) {
      if (!ext) return true; // directory-style path; resolved by fs.stat below
      return ALLOWED_EXTENSIONS.has(ext);
    }
  }

  return false;
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

  if (!isAllowedPublicPath(normalizedPath)) {
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
    case '.woff2': return 'font/woff2';
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

  if (['.css', '.js', '.png', '.jpg', '.jpeg', '.gif', '.svg', '.ico', '.json', '.avif', '.webp', '.woff2', '.mp4', '.webm', '.pdf'].includes(extname)) {
    return 'public, max-age=31536000, immutable';
  }

  return 'public, max-age=3600';
}

function makeWeakEtag(stats) {
  return `W/"${stats.size.toString(16)}-${Math.floor(stats.mtimeMs).toString(16)}"`;
}

// Text assets are compressed once and held in memory, keyed by path+encoding
// and invalidated by the file's ETag. Because the cost is paid once rather than
// per request, we can afford maximum-quality Brotli: the Lune Synth homepage
// goes from 97 KB at quality 5 to 79 KB at quality 11. HTML is served
// `no-cache`, so every visit pays that difference.
const MAX_CACHE_ENTRIES = 128;
const MAX_COMPRESSIBLE_BYTES = 4 * 1024 * 1024;
const compressedCache = new Map();

function pickEncoding(req, filePath, size) {
  if (!isCompressible(filePath) || size < 1024 || req.headers.range) {
    return null;
  }

  const accepted = req.headers['accept-encoding'] || '';
  if (accepted.includes('br') && zlib.brotliCompressSync) return 'br';
  if (accepted.includes('gzip')) return 'gzip';
  return null;
}

function compress(buffer, encoding) {
  if (encoding === 'br') {
    return zlib.brotliCompressSync(buffer, {
      params: {
        [zlib.constants.BROTLI_PARAM_QUALITY]: zlib.constants.BROTLI_MAX_QUALITY,
        [zlib.constants.BROTLI_PARAM_SIZE_HINT]: buffer.length,
      },
    });
  }
  return zlib.gzipSync(buffer, { level: zlib.constants.Z_BEST_COMPRESSION });
}

// Returns the compressed body, or null if it should be streamed uncompressed.
function getCompressed(filePath, encoding, etag, size) {
  if (size > MAX_COMPRESSIBLE_BYTES) return null;

  const key = `${filePath}|${encoding}`;
  const hit = compressedCache.get(key);
  if (hit && hit.etag === etag) {
    // Refresh recency so the cap evicts the least recently used entry.
    compressedCache.delete(key);
    compressedCache.set(key, hit);
    return hit.body;
  }

  let body;
  try {
    body = compress(fs.readFileSync(filePath), encoding);
  } catch (error) {
    return null;
  }

  compressedCache.set(key, { etag, body });
  if (compressedCache.size > MAX_CACHE_ENTRIES) {
    compressedCache.delete(compressedCache.keys().next().value);
  }
  return body;
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

  const encoding = pickEncoding(req, filePath, stats.size);
  if (encoding) {
    const body = getCompressed(filePath, encoding, etag, stats.size);

    if (body) {
      res.writeHead(200, {
        ...baseHeaders,
        'Content-Encoding': encoding,
        'Content-Length': body.length,
      });

      if (req.method === 'HEAD') {
        res.end();
        return;
      }

      res.end(body);
      return;
    }
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

// Nothing legitimate posted to /api/waitlist (an email plus a couple of short
// fields) approaches this. Without a cap, `body += chunk` buffers an
// unbounded request body in memory -- a trivial DoS against a single-process
// Node server with no reverse-proxy body limit in front of it. The cap is
// enforced against bytes actually received on `data`, never against a
// declared Content-Length -- a request is free to lie about that header, so
// trusting it would let an attacker's real body sail through uncounted.
const MAX_API_BODY_BYTES = 16 * 1024;

// A body sent a few bytes at a time, just under the size cap, can hold a
// connection (and the memory backing it) open indefinitely without ever
// tripping MAX_API_BODY_BYTES. This bounds how long server.js will wait for
// the body to finish arriving at all. Overridable so a test can exercise it
// in milliseconds instead of actually waiting 10 real seconds; production
// has no reason to ever set this env var, so the default is what ships.
const API_BODY_READ_TIMEOUT_MS = Number(process.env.API_BODY_READ_TIMEOUT_MS) > 0
  ? Number(process.env.API_BODY_READ_TIMEOUT_MS)
  : 10 * 1000;

function handleWaitlist(req, res) {
    let body = '';
    let bytes = 0;
    // Guards every terminal path (oversized, timed out, completed, errored)
    // so the response is sent at most once and the timer is always cleared,
    // regardless of which path gets there first.
    let settled = false;

    function respondOnce(statusCode, payload) {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutTimer);
      res.statusCode = statusCode;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.end(JSON.stringify(payload));
      // Stop reading and release the socket rather than let a slow or
      // oversized client keep draining into a request nothing will use.
      req.destroy();
    }

    const timeoutTimer = setTimeout(() => {
      respondOnce(408, { error: 'Request body took too long to arrive.' });
    }, API_BODY_READ_TIMEOUT_MS);

    // A client that disconnects mid-body (or a socket error) emits 'error'
    // on the request stream; with no listener, Node treats that as an
    // uncaught exception and crashes the process. There is nothing useful to
    // respond with (the connection is already gone), so this only needs to
    // stop the timer and mark the request settled.
    req.on('error', () => {
      settled = true;
      clearTimeout(timeoutTimer);
    });

    req.on('data', chunk => {
      if (settled) return;
      bytes += chunk.length;
      if (bytes > MAX_API_BODY_BYTES) {
        respondOnce(413, { error: 'Payload too large.' });
        return;
      }
      body += chunk.toString();
    });

    req.on('end', () => {
      if (settled) return;
      settled = true;
      clearTimeout(timeoutTimer);

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
  if (pathname === '/favicon.ico') {
    serveStatic(req, res, '/lune-synth/favicon-luna.ico');
    return;
  }

  if ((pathname === '/beta-offer' || pathname === '/beta-offer/') && isGetLike(req)) {
    redirect(res, `https://${LUNE_HOST}/${getRequestSuffix(req)}`, 302);
    return;
  }

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

  // Apple requires a Support URL on the app record, and reviewers open it.
  if (pathname === '/support' || pathname === '/support/') {
    serveStatic(req, res, '/lune-synth/support/index.html');
    return;
  }

  // Google requires this URL to be reachable without installing the app.
  if (pathname === '/delete-account' || pathname === '/delete-account/') {
    serveStatic(req, res, '/lune-synth/delete-account/index.html');
    return;
  }

  // The separate Pro page is retired (owner, 2026-10-24): Pro info lives
  // only in the home page's pricing section. Old links land there.
  if (pathname === '/pro' || pathname === '/pro/' || pathname.startsWith('/lune-synth/pro')) {
    res.writeHead(302, { Location: '/#pricing', 'Cache-Control': 'no-cache' });
    res.end();
    return;
  }

  if (pathname === '/about' || pathname.startsWith('/about/')) {
    serveStatic(req, res, `/lune-synth${pathname}`);
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

/**
 * CSP is Report-Only, not enforced. The site is 198 HTML pages built over
 * many months, several with inline <script>/<style> (JSON-LD blocks, inline
 * handlers) that a `script-src`/`style-src` without 'unsafe-inline' would
 * break outright, and getting that accurate for every page was out of scope
 * for this pass. This still gets violation reports (where supported) without
 * risking breaking a page that "nothing the site uses breaks" requires.
 * Domains below come from grepping every page for cross-origin src/href.
 */
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data: https://images.unsplash.com",
  "media-src 'self'",
  "connect-src 'self' https://api.resend.com https://coherascent-labs-app-production.up.railway.app",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

function applySecurityHeaders(res) {
  // No includeSubDomains: that would also apply HSTS to every subdomain of
  // lunesynth.com/coherascentlabs.com, and not all of them are confirmed to
  // be HTTPS-ready. Scope it to the domains this header is actually served
  // from until the rest are checked.
  res.setHeader('Strict-Transport-Security', 'max-age=31536000');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  res.setHeader('Content-Security-Policy-Report-Only', CSP_REPORT_ONLY);
}

const server = http.createServer((req, res) => {
  applySecurityHeaders(res);

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

  // 1b. Unsubscribe. GET is the link in the email footer; POST is
  // List-Unsubscribe-Post (RFC 8058), which Gmail and Apple Mail call directly.
  if (pathname === '/unsubscribe' || pathname === '/unsubscribe/') {
    if (req.method === 'GET' || req.method === 'POST' || req.method === 'HEAD') {
      const query = new URL(req.url, `http://${req.headers.host || 'localhost'}`).searchParams;
      unsubscribeHandler(req, res, query);
    } else {
      res.statusCode = 405;
      res.end('Method Not Allowed');
    }
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
