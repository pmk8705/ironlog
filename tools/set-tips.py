"""Fill tips/mistake of existing exercises from a checked JSON list [{id, tips, mistake}].
Usage (project folder):  python tools/set-tips.py <file.json>
Only replaces empty tips (tips: [], mistake: '').  Text must not contain single quotes."""
import io
import json
import os
import re
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'exercises.js')


def q(t):
    if "'" in t or '\n' in t:
        sys.exit('작은따옴표나 줄바꿈이 들어 있어요: ' + t)
    return "'" + t + "'"


items = json.load(io.open(sys.argv[1], encoding='utf-8'))
s = io.open(SRC, encoding='utf-8').read()
done = 0
for e in items:
    m = re.search(r"^  \{ id: '" + re.escape(e['id']) + r"'[^\n]*$", s, re.M)
    if not m:
        sys.exit('not found (or multi-line entry): ' + e['id'])
    line = m.group(0)
    if "tips: [], mistake: ''" not in line:
        print('skip (already has tips):', e['id'])
        continue
    new = line.replace("tips: [], mistake: ''",
                       'tips: [' + ', '.join(q(t) for t in e['tips']) + '], mistake: ' + q(e['mistake']))
    s = s.replace(line, new)
    done += 1
io.open(SRC, 'w', encoding='utf-8', newline='\n').write(s)
print('filled', done)
