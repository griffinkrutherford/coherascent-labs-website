#!/usr/bin/env python3
"""Inventory actual HTML device shells, including non-campaign pages and retired routes."""
import json
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
DEVICE_CLASSES = {'phone-mock__frame', 'feature-phone', 'feature-ipad', 'ipad-mockup',
                  'voice-scene__ipad', 'about-luna-phone', 'hero-highlight-reel__phone',
                  'capture-scene__phone', 'processing-scene__phone', 'feedback-scene__phone',
                  'voice-scene__phone', 'luna-phone--tab', 'quick-missions__phone',
                  'response-carousel__question-phone'}
SHARED_TILT_CLASSES = {'phone-mock__frame', 'feature-phone', 'feature-ipad',
                       'response-carousel__question-phone', 'about-luna-phone'}

class Parser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.devices, self.scripts, self.styles = [], [], []
    def handle_starttag(self, tag, attributes):
        attrs = dict(attributes)
        classes = attrs.get('class', '').split()
        if DEVICE_CLASSES.intersection(classes) or 'data-phone-mock' in attrs:
            self.devices.append({'classes': classes, 'automaticController':
                'shared' if SHARED_TILT_CLASSES.intersection(classes) else 'homepage'})
        if tag == 'script' and attrs.get('src'):
            self.scripts.append(attrs['src'])
        if tag == 'link' and attrs.get('rel') == 'stylesheet':
            self.styles.append(attrs.get('href', ''))

def inventory():
    pages, html_count = [], 0
    for file in sorted((ROOT / 'lune-synth').rglob('*.html')):
        if any(part in {'vendor', 'screenshots', 'neuro-viz'} for part in file.parts):
            continue
        html_count += 1
        parser = Parser()
        parser.feed(file.read_text())
        if not parser.devices:
            continue
        relative = file.relative_to(ROOT).as_posix()
        retired = relative == 'lune-synth/pro/index.html'
        route = '/' + file.relative_to(ROOT / 'lune-synth').as_posix().removesuffix('index.html')
        pages.append({'path': relative, 'route': route, 'active': not retired,
                      'exclusion': 'server redirects Pro to /#pricing' if retired else None,
                      'devices': parser.devices, 'scripts': parser.scripts, 'styles': parser.styles})
    return {'htmlFiles': html_count, 'phonePages': len(pages), 'activePhonePages': sum(p['active'] for p in pages),
            'staticDevices': sum(len(p['devices']) for p in pages), 'pages': pages}

if __name__ == '__main__':
    print(json.dumps(inventory(), indent=2))
