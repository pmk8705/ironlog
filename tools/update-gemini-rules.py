"""Refresh sections 4 (exercises by part) and 5 (exercises without tips) of the Gemini rule file
from exercises.js.  Usage (project folder):  python tools/update-gemini-rules.py [version]
The rule file (운동데이터규칙.md, same name as in the Gemini skill) is PC-only (git-excluded)."""
import io
import os
import re
import sys

ROOT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..')
SRC = os.path.join(ROOT, 'exercises.js')
RULES = os.path.join(ROOT, '운동데이터규칙.md')
ORDER = [('가슴', ['가슴']), ('등', ['등', '승모근', '허리']), ('어깨', ['어깨']), ('팔', ['이두', '삼두', '전완']),
         ('코어', ['복부']), ('하체', ['허벅지', '엉덩이', '종아리']), ('유산소', [''])]

src = io.open(SRC, encoding='utf-8').read()
body = src[src.index('['):src.rindex(']')]
ents = []
for c in re.split(r"\n  \{", body)[1:]:
    def g(k):
        m = re.search(k + r": '([^']*)'", c)
        return m.group(1) if m else ''
    ents.append(dict(id=g('id'), name=g('name'), part=g('part'), sub=g('sub'), equip=g('equip'),
                     tips=not re.search(r"tips: \[\]", c)))

n = len(ents)
sec4 = ['## 4. 이미 있는 종목 — 부위별 (%d개)' % n, '',
        '"팁" 칸: ✔ = 자세 팁 있음, · = 아직 비어 있음(5번 목록). 새 종목은 **종목이 적은 세부 부위**(승모근·허리·전완·종아리·엉덩이·삼두 등)부터 채우면 좋다.', '',
        '| 부위(part) | 세부(sub) | 수 | 종목 (id) — 장비 | 팁 |', '|---|---|---|---|---|']
total = 0
for part, subs in ORDER:
    for sb in subs:
        rows = [e for e in ents if e['part'] == part and e['sub'] == sb]
        total += len(rows)
        names = '<br>'.join('%s (`%s`) — %s' % (e['name'], e['id'], e['equip']) for e in rows)
        tips = '<br>'.join('✔' if e['tips'] else '·' for e in rows)
        sec4.append('| %s | %s | %d | %s | %s |' % (part, sb or '-', len(rows), names, tips))
if total != n:
    sys.exit('part/sub 분류가 안 된 종목이 있어요: %d / %d' % (total, n))

empty = [e['id'] for e in ents if not e['tips']]
sec5 = ['## 5. 자세 팁이 아직 비어 있는 종목 (%d개)' % len(empty), '',
        '이 종목들은 `tips`·`mistake`만 채우면 된다. 이 작업을 부탁받으면 아래 모양으로 답한다 (다른 칸은 빼고):', '',
        '```json', '[', '  { "id": "leg_press", "tips": ["...", "..."], "mistake": "..." }', ']', '```', '',
        ', '.join(empty) if empty else '(없음 — 모든 종목에 팁이 있다)', '',
        '(유산소는 tips 2개, mistake 1문장이면 충분하다. 한 번에 너무 길면 15개씩 나눠서 답해도 된다.)', '']

md = io.open(RULES, encoding='utf-8').read()
a = md.index('## 4. ')
md = md[:a] + '\n'.join(sec4) + '\n\n' + '\n'.join(sec5)
if len(sys.argv) > 1:
    md = re.sub(r'^# ironlog-trainer 규칙 파일 v[\d.]+', '# ironlog-trainer 규칙 파일 v' + sys.argv[1], md, flags=re.M)
io.open(RULES, 'w', encoding='utf-8', newline='\n').write(md)
print('exercises %d, without tips %d' % (n, len(empty)))
