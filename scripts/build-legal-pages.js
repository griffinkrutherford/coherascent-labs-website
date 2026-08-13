const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// Set to false once Tano Holdings LLC is registered and every [[TOKEN]] in
// docs/legal/*.md is filled in. Controls the draft banner, the noindex robots
// tag, and the canonical link. The build refuses to publish with tokens left.
const DRAFT = false;

const pages = [
  {
    source: path.join(ROOT, 'docs/legal/privacy-policy.md'),
    output: path.join(ROOT, 'lune-synth/privacy/index.html'),
    slug: 'privacy',
    title: 'Privacy Policy',
  },
  {
    source: path.join(ROOT, 'docs/legal/terms-of-service.md'),
    output: path.join(ROOT, 'lune-synth/terms/index.html'),
    slug: 'terms',
    title: 'Terms of Service',
  },
  // Apple requires a Support URL on the app record and reviewers open it; a
  // placeholder page is a rejection, so this has to be recognisably about the
  // app. Google only requires a support email but checks the URL if provided.
  {
    source: path.join(ROOT, 'docs/legal/support.md'),
    output: path.join(ROOT, 'lune-synth/support/index.html'),
    slug: 'support',
    title: 'Support',
  },
  // Google requires a deletion URL reachable without installing the app, so
  // this one must stay publicly accessible once published.
  {
    source: path.join(ROOT, 'docs/legal/delete-account.md'),
    output: path.join(ROOT, 'lune-synth/delete-account/index.html'),
    slug: 'delete-account',
    title: 'Delete Your Account',
  },
];

function escapeHtml(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderInline(source) {
  const tokens = [];
  let text = source.replace(/`([^`]+)`/g, (_, value) => {
    const token = `\u0000${tokens.length}\u0000`;
    tokens.push(`<code>${escapeHtml(value)}</code>`);
    return token;
  });

  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, label, href) => {
    const target = href === 'privacy-policy.md' ? '/privacy/' : href;
    const token = `\u0000${tokens.length}\u0000`;
    tokens.push(`<a href="${escapeHtml(target)}">${escapeHtml(label)}</a>`);
    return token;
  });

  text = text.replace(/<((?:https?:\/\/|mailto:)[^>]+)>/g, (_, href) => {
    const token = `\u0000${tokens.length}\u0000`;
    tokens.push(`<a href="${escapeHtml(href)}">${escapeHtml(href)}</a>`);
    return token;
  });

  text = escapeHtml(text)
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

  return text.replace(/\u0000(\d+)\u0000/g, (_, index) => tokens[Number(index)]);
}

function isTableDivider(line) {
  return /^\s*\|?(?:\s*:?-{3,}:?\s*\|)+\s*:?-{3,}:?\s*\|?\s*$/.test(line);
}

function parseTableRow(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());
}

function isStructuralLine(lines, index) {
  const line = lines[index] || '';
  const next = lines[index + 1] || '';

  return !line.trim()
    || /^#{1,3}\s/.test(line)
    || /^[-*]\s+/.test(line)
    || /^\d+\.\s+/.test(line)
    || /^>\s?/.test(line)
    || (line.includes('|') && isTableDivider(next));
}

function renderMarkdown(markdown) {
  const cleaned = markdown
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/^<!-- markdownlint-disable MD013 -->\s*/m, '')
    .trim();
  const lines = cleaned.split(/\r?\n/);
  const output = [];

  for (let index = 0; index < lines.length;) {
    const line = lines[index];

    if (!line.trim()) {
      index += 1;
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const level = heading[1].length;
      output.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
      index += 1;
      continue;
    }

    if (line.includes('|') && isTableDivider(lines[index + 1] || '')) {
      const headers = parseTableRow(line);
      const rows = [];
      index += 2;

      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        rows.push(parseTableRow(lines[index]));
        index += 1;
      }

      output.push('<div class="table-wrap"><table><thead><tr>');
      headers.forEach(cell => output.push(`<th>${renderInline(cell)}</th>`));
      output.push('</tr></thead><tbody>');
      rows.forEach(row => {
        output.push('<tr>');
        headers.forEach((_, cellIndex) => {
          output.push(`<td>${renderInline(row[cellIndex] || '')}</td>`);
        });
        output.push('</tr>');
      });
      output.push('</tbody></table></div>');
      continue;
    }

    const listMatch = line.match(/^([-*]|\d+\.)\s+(.+)$/);
    if (listMatch) {
      const ordered = /\d+\./.test(listMatch[1]);
      const tag = ordered ? 'ol' : 'ul';
      output.push(`<${tag}>`);

      while (index < lines.length) {
        const item = lines[index].match(/^([-*]|\d+\.)\s+(.+)$/);
        if (!item || /\d+\./.test(item[1]) !== ordered) break;

        let content = item[2].trim();
        index += 1;
        while (
          index < lines.length
          && lines[index].trim()
          && !/^([-*]|\d+\.)\s+/.test(lines[index])
          && !/^#{1,3}\s+/.test(lines[index])
        ) {
          content += ` ${lines[index].trim()}`;
          index += 1;
        }
        output.push(`<li>${renderInline(content)}</li>`);
      }

      output.push(`</${tag}>`);
      continue;
    }

    if (/^>\s?/.test(line)) {
      const quote = [];
      while (index < lines.length && /^>\s?/.test(lines[index])) {
        quote.push(lines[index].replace(/^>\s?/, '').trim());
        index += 1;
      }
      output.push(`<blockquote>${renderInline(quote.join(' '))}</blockquote>`);
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && !isStructuralLine(lines, index)) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    output.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
  }

  return output.join('\n');
}

function pageTemplate(page, content) {
  return `<!doctype html>
<html lang="en" data-theme="dark">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
${DRAFT ? '  <meta name="robots" content="noindex,nofollow,noarchive" />\n' : ''}  <title>${DRAFT ? 'Draft ' : ''}${page.title} | Lune Synth</title>
  <meta name="description" content="${DRAFT ? `Draft Lune Synth ${page.title}. Not finalized or published.` : `The Lune Synth ${page.title}.`}" />
${DRAFT ? '' : `  <link rel="canonical" href="https://lunesynth.com/${page.slug}/" />\n`}  <link rel="icon" type="image/png" href="/circle_favicon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&amp;family=Roboto+Mono:wght@400;500;600;700&amp;display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/lune-synth/legal.css?v=4" />
</head>
<body>
  <main class="legal-shell">
    <header class="site-header">
      <div class="brand-dropdown">
        <div class="brand" role="button" aria-haspopup="true" aria-expanded="false" tabindex="0" aria-label="Coherascent Labs navigation menu">
          <img
            class="brand-logo"
            src="/coherascent-labs-logo-march-16-2026.webp"
            data-logo-dark="/coherascent-labs-logo-march-16-2026.webp"
            data-logo-light="/coherascent-labs-streamlined-light-2.webp"
            alt="Coherascent Labs logo"
          />
          <h1>Coherascent Labs <span class="brand-chevron" aria-hidden="true">▼</span></h1>
        </div>
        <div class="brand-dropdown-content">
          <div class="brand-popup-header">
            <div class="brand" aria-hidden="true">
              <img
                class="brand-logo"
                src="/coherascent-labs-logo-march-16-2026.webp"
                data-logo-dark="/coherascent-labs-logo-march-16-2026.webp"
                data-logo-light="/coherascent-labs-streamlined-light-2.webp"
                alt="Coherascent Labs logo"
              />
              <h1>Coherascent Labs</h1>
            </div>
          </div>
          <a href="https://coherascentlabs.com/">Home</a>
          <a href="https://coherascentlabs.com/research/">Research</a>
          <a href="/">Lune Synth&trade;</a>
        </div>
      </div>
      <nav class="nav-links" id="primary-nav" aria-label="Primary">
        <a class="nav-link" href="/#lost-cosmos-title">The Crisis</a>
        <a class="nav-link" href="/#platform-title">Handwriting</a>
        <a class="nav-link" href="/#luna-title">Luna</a>
        <a class="nav-link" href="/#processing-title">Grading</a>
        <a class="nav-link" href="/#voice-title">Input Methods</a>
        <a class="nav-link" href="/#quick-missions-title">Quick Missions</a>
        <a class="nav-link" href="/#constellations-title">Constellations</a>
        <a class="nav-link" href="/#medals-title">Medals</a>
        <a class="nav-link" href="/#engine-title">Engine</a>
        <a class="nav-link nav-link--blog" href="/blog/">Blog</a>
      </nav>
      <button class="nav-toggle" type="button" data-nav-toggle aria-label="Open menu" aria-expanded="false" aria-controls="primary-nav">
        <span class="nav-toggle__bars" aria-hidden="true"></span>
      </button>
    </header>
${DRAFT ? `    <aside class="draft-banner">
      <strong>Draft only.</strong> This document is not finalized or published. Entity, governing-law, and venue details remain unresolved.
    </aside>
` : ''}    <article class="legal-document">
${content}
    <footer class="site-footer" aria-label="Lune Synth footer">
      <a class="site-footer__identity" href="/" aria-label="Lune Synth home">
        <img class="site-footer__mark" src="/images/lune-synth-icon-120.png" alt="" width="36" height="36" />
        <span class="site-footer__copy">
          <strong>Lune Synth&trade;</strong>
          <span>The anti-slop learning app</span>
        </span>
      </a>
      <nav aria-label="Footer">
        <a href="/">Home</a>
        <a href="/blog/">Blog</a>
        <a href="/support/">Support</a>
        <a href="/privacy/">Privacy</a>
        <a href="/terms/">Terms</a>
        <a href="mailto:griffin@lunesynth.com">Contact</a>
      </nav>
    </footer>
    </article>
  </main>
  <script src="/blog/blog.js?v=2"></script>
</body>
</html>
`;
}

pages.forEach(page => {
  const markdown = fs.readFileSync(page.source, 'utf8');
  const content = renderMarkdown(markdown);

  const tokens = [...new Set(content.match(/\[\[[^\]]+\]\]/g) || [])];
  if (tokens.length && !DRAFT) {
    console.error(`\nRefusing to publish ${path.relative(ROOT, page.source)} with unresolved tokens:`);
    tokens.forEach(token => console.error(`  ${token}`));
    console.error('\nFill them in, or set DRAFT = true in this script.\n');
    process.exit(1);
  }

  fs.mkdirSync(path.dirname(page.output), { recursive: true });
  fs.writeFileSync(page.output, pageTemplate(page, content));
  console.log(`Built ${path.relative(ROOT, page.output)}${tokens.length ? ` (draft — ${tokens.length} unresolved token${tokens.length === 1 ? '' : 's'})` : ''}`);
});
