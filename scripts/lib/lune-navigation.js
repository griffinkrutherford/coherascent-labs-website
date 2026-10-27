'use strict';

const LEARN_YOUR_WAY_LINK = '<a class="nav-link" href="/#language-accessibility">Learn Your Way</a>';

function withLearnYourWayNavigation(html) {
  let found = false;
  const result = html.replace(/(<nav\b[^>]*\bid=["']primary-nav["'][^>]*>)([\s\S]*?)(<\/nav>)/, (all, start, body, end) => {
    found = true;
    if (/href=["']\/?#language-accessibility["']/.test(body)) return all;
    const luna = /(^[\t ]*)(<a\b[^>]*href=["']\/?#luna-title["'][^>]*>)/m;
    const updated = luna.test(body)
      ? body.replace(luna, (_, indent, anchor) => indent + LEARN_YOUR_WAY_LINK + '\n' + indent + anchor)
      : body.replace(/\s*$/, '\n        ' + LEARN_YOUR_WAY_LINK + '\n      ');
    return start + updated + end;
  });
  if (!found) throw new Error('Missing primary-nav; cannot insert Learn Your Way safely');
  return result;
}

module.exports = { LEARN_YOUR_WAY_LINK, withLearnYourWayNavigation };
