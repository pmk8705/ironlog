"""Insert checked exercises (JSON list) into exercises.js, each after an anchor exercise id.
Usage (project folder):  python tools/add-exercises.py <file.json>
JSON item = exercise fields + "after": "<existing id>" (where to insert).  Skips ids that already exist."""
import io
import json
import os
import re
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'exercises.js')
KEYS = ['id', 'name', 'en', 'aka', 'part', 'sub', 'equip', 'type', 'rest', 'vmul', 'tips', 'mistake']


def js(v):
    if isinstance(v, str):
        if "'" in v or '\n' in v:
            sys.exit('작은따옴표나 줄바꿈이 들어 있어요: ' + v)
        return "'" + v + "'"
    if isinstance(v, list):
        return '[' + ', '.join(js(x) for x in v) + ']'
    return json.dumps(v)


def line(e):
    parts = []
    for k in KEYS:
        if k not in e or (k == 'sub' and not e[k]):
            continue
        parts.append('%s: %s' % (k, js(e[k])))
    return '  { ' + ', '.join(parts) + ' },'


items = json.load(io.open(sys.argv[1], encoding='utf-8'))
s = io.open(SRC, encoding='utf-8').read()
added = 0
for e in items:
    if re.search(r"id: '" + re.escape(e['id']) + "'", s):
        print('skip (exists):', e['id'])
        continue
    # one-line entry first, then a multi-line entry ("  {\n    id: ...\n  },")
    m = (re.search(r"\n  \{ id: '" + re.escape(e['after']) + r"'[^\n]*", s)
         or re.search(r"\n  \{\n +id: '" + re.escape(e['after']) + r"'.*?\n  \},?(?=\n)", s, re.S))
    if not m:
        sys.exit('anchor not found: ' + e['after'])
    end = m.end()
    if not s[m.start():end].rstrip().endswith(','):
        s = s[:end] + ',' + s[end:]
        end += 1
    s = s[:end] + '\n' + line(e) + s[end:]
    added += 1
io.open(SRC, 'w', encoding='utf-8', newline='\n').write(s)
print('added', added)
