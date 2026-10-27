'use strict';

const DEVICE_ASSETS = [
  { path: '/campaign/device-tilt.css', version: 9, kind: 'style' },
  { path: '/campaign/device-tilt.js', version: 9, kind: 'script' },
  { path: '/campaign/device-rotation.css', version: 3, kind: 'style' },
  { path: '/campaign/device-rotation.js', version: 4, kind: 'script' },
];
const escape = value => value.split('.').join('\\.');

function withLandingDeviceWiring(html) {
  const end = html.indexOf('</head>');
  if (end < 0) throw new Error('Missing closing head; cannot wire device scripts safely');
  let head = html.slice(0, end);
  DEVICE_ASSETS.forEach((asset, index) => {
    const tagName = asset.kind === 'script' ? 'script' : 'link';
    const attribute = asset.kind === 'script' ? 'src' : 'href';
    const tag = new RegExp('<' + tagName + '\\b[^>]*\\b' + attribute + '=["\']' + escape(asset.path) + '(?:\\?[^"\']*)?["\'][^>]*>', 'g');
    const matches = head.match(tag) || [];
    if (matches.length > 1) throw new Error('Duplicate device asset: ' + asset.path);
    if (matches.length) {
      head = head.replace(tag, value => {
        let updated = value.replace(new RegExp(escape(asset.path) + '(?:\\?[^"\']*)?'), asset.path + '?v=' + asset.version);
        if (asset.kind === 'script') {
          updated = updated.replace(/\sasync(?:=(?:"[^"]*"|'[^']*'|[^\s>]+))?/g, '');
          if (!/\sdefer(?:\s|=|>)/.test(updated)) updated = updated.replace(/>$/, ' defer>');
        }
        return updated;
      });
      return;
    }
    const rendered = asset.kind === 'script'
      ? '<script src="' + asset.path + '?v=' + asset.version + '" defer></script>'
      : '<link rel="stylesheet" href="' + asset.path + '?v=' + asset.version + '" />';
    const next = DEVICE_ASSETS.slice(index + 1).map(candidate => head.indexOf(candidate.path)).filter(position => position >= 0).sort((a, b) => a - b)[0];
    if (next !== undefined) {
      const tagStart = head.lastIndexOf('<', next);
      const lineStart = head.lastIndexOf('\n', tagStart) + 1;
      const indent = head.slice(lineStart, tagStart);
      const insertion = /^\s*$/.test(indent) ? lineStart : tagStart;
      head = head.slice(0, insertion) + '  ' + rendered + '\n' + head.slice(insertion);
    } else head += '  ' + rendered + '\n';
  });
  return head + html.slice(end);
}

module.exports = { DEVICE_ASSETS, withLandingDeviceWiring };
