const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

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
  const currentPrivacy = page.slug === 'privacy' ? ' aria-current="page"' : '';
  const currentTerms = page.slug === 'terms' ? ' aria-current="page"' : '';

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <meta name="robots" content="noindex,nofollow,noarchive" />
  <title>Draft ${page.title} | Lune Synth</title>
  <meta name="description" content="Draft Lune Synth ${page.title}. Not finalized or published." />
  <link rel="icon" type="image/png" href="/circle_favicon.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700&amp;family=Roboto+Mono:wght@400;500;600;700&amp;display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="/lune-synth/legal.css?v=3" />
</head>
<body>
  <header class="site-header">
    <a class="brand" href="/">
      <img src="/images/lune-synth-icon.png" alt="" />
      <span>Lune Synth</span>
    </a>
    <nav class="site-nav" aria-label="Legal pages">
      <a href="/">Home</a>
      <a href="/privacy/"${currentPrivacy}>Privacy</a>
      <a href="/terms/"${currentTerms}>Terms</a>
    </nav>
  </header>
  <aside class="draft-banner">
    <strong>Draft only.</strong> This document is not finalized or published. Entity, contact, governing-law, and venue details remain unresolved.
  </aside>
  <main class="legal-document">
${content}
    <footer class="site-footer" aria-label="Lune Synth footer">
      <a class="site-footer__identity" href="https://coherascentlabs.com/" aria-label="Coherascent Labs home">
        <img class="site-footer__mark" src="/images/lune-synth-icon-120.png" alt="" width="36" height="36" />
        <span class="site-footer__copy">
          <strong>Lune Synth&trade;</strong>
          <span>A Coherascent Labs product</span>
        </span>
      </a>
      <nav aria-label="Footer">
        <a href="/">Home</a>
        <a href="/blog/">Blog</a>
        <a href="/privacy/">Privacy</a>
        <a href="/terms/">Terms</a>
        <a href="mailto:support@lunesynth.com">Contact</a>
      </nav>
    </footer>
  </main>
</body>
</html>
`;
}

pages.forEach(page => {
  const markdown = fs.readFileSync(page.source, 'utf8');
  const html = pageTemplate(page, renderMarkdown(markdown));
  fs.mkdirSync(path.dirname(page.output), { recursive: true });
  fs.writeFileSync(page.output, html);
  console.log(`Built ${path.relative(ROOT, page.output)}`);
});
