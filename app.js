/* IronLog — 웨이트 트레이닝 기록 (1단계: 달력 · 하루 기록 · 운동 추가 · 세트 입력) */
'use strict';

const APP_VERSION = '0.5.1';
const STORE_KEY = 'ironlog-v1';
const PARTS = ['가슴', '등', '하체', '어깨', '팔', '코어', '유산소'];
const PART_COLOR = {
  '가슴': '#e8590c', '등': '#2f6fed', '하체': '#2f9e57', '어깨': '#f59f00',
  '팔': '#9c36b5', '코어': '#0c8599', '유산소': '#d6336c', '기타': '#868e96'
};
const EQUIPS = ['바벨', '덤벨', '머신', '케이블', '맨몸', '기타'];
const TYPE_LABEL = { weight_reps: '무게 + 횟수', reps: '횟수만', time: '시간(초)', distance_time: '시간(분) + 거리(km)' };
/* 기록 방식별 입력 칸: [필드 이름, 머리글] */
const FIELDS = {
  weight_reps: [['w', 'kg'], ['r', '회']],
  reps: [['r', '회']],
  time: [['sec', '초']],
  distance_time: [['min', '분'], ['km', 'km']]
};
const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

/* ───────── 날짜 (로컬 YYYY-MM-DD 문자열, UTC 변환 안 함) ───────── */
const pad = n => String(n).padStart(2, '0');
const ymd = d => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
function parseYmd(s) { const p = s.split('-').map(Number); return new Date(p[0], p[1] - 1, p[2]); }
const todayStr = () => ymd(new Date());
function isoWeek(d) {
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  t.setDate(t.getDate() + 3 - ((t.getDay() + 6) % 7));           // 그 주 목요일
  const jan4 = new Date(t.getFullYear(), 0, 4);
  return 1 + Math.round(((t - jan4) / 86400000 - 3 + ((jan4.getDay() + 6) % 7)) / 7);
}
function dateLabel(s) {
  const d = parseYmd(s);
  return (d.getMonth() + 1) + '월 ' + d.getDate() + '일 (' + WEEKDAYS[d.getDay()] + ')';
}

/* ───────── 저장 ───────── */
function emptyDb() { return normalize({}); }
function plainObj(v) { return v && typeof v === 'object' && !Array.isArray(v) ? v : {}; }
function normalize(o) {
  if (!o || typeof o !== 'object') o = {};
  const db = {
    version: 1, days: {}, custom: Array.isArray(o.custom) ? o.custom : [],
    favs: Array.isArray(o.favs) ? o.favs.filter(x => typeof x === 'string') : [],
    unit: o.unit === 'lb' ? 'lb' : 'kg',     // 새 종목의 기본 무게 단위
    units: plainObj(o.units),                 // 종목별 마지막 단위 { exId: 'lb' }
    rest: plainObj(o.rest)                    // 종목별 쉬는 시간(초) { exId: 90 }
  };
  const days = (o.days && typeof o.days === 'object') ? o.days : {};
  Object.keys(days).forEach(k => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) return;
    const d = days[k] || {};
    db.days[k] = {
      minutes: typeof d.minutes === 'number' ? d.minutes : null,
      items: Array.isArray(d.items) ? d.items.filter(it => it && it.ex).map(it => ({
        id: it.id || uid(), ex: it.ex, memo: it.memo || '', unit: it.unit === 'lb' ? 'lb' : 'kg',
        sets: Array.isArray(it.sets) ? it.sets.map(s => Object.assign({}, s, { done: s.done === true })) : []
      })) : []
    };
  });
  return db;
}
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (raw) return normalize(JSON.parse(raw));
  } catch (e) { /* 깨진 데이터면 빈 상태로 시작 */ }
  return emptyDb();
}
function save() {
  Object.keys(db.days).forEach(k => {
    const d = db.days[k];
    if (!d.items.length && d.minutes == null) delete db.days[k];
  });
  try { localStorage.setItem(STORE_KEY, JSON.stringify(db)); }
  catch (e) { toast('저장하지 못했어요. 폰 저장 공간을 확인해 주세요.'); }
}
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }
function ensureDay(date) {
  if (!db.days[date]) db.days[date] = { minutes: null, items: [] };
  return db.days[date];
}

let db = load();

/* ───────── 종목 ───────── */
let exMap = {};
function rebuildExMap() {
  exMap = {};
  (window.IRONLOG_EXERCISES || []).concat(db.custom).forEach(e => { exMap[e.id] = e; });
}
function getEx(id) {
  return exMap[id] || { id: id, name: '(지워진 종목)', part: '기타', equip: '기타', type: 'weight_reps', rest: 90, tips: [], mistake: '', aka: [] };
}
rebuildExMap();

/* ───────── 숫자 · 집계 (✔ 체크한 세트만 센다) ───────── */
function num(v) { const n = Number(v); return isFinite(n) ? n : 0; }
function fmt(n) { return String(Math.round(n * 100) / 100); }
function parseInput(v) {
  v = String(v).trim().replace(',', '.');
  if (v === '') return null;
  const n = Number(v);
  return isFinite(n) && n >= 0 ? n : null;
}
/* 무게 단위: 기록은 입력한 단위 그대로 두고, 볼륨 합계만 kg으로 바꿔 계산 */
const LB = 0.45359237;
function toKg(w, unit) { return unit === 'lb' ? num(w) * LB : num(w); }
function convertWeight(w, from, to) {
  if (w == null || from === to) return w;
  const v = to === 'lb' ? num(w) / LB : num(w) * LB;
  return Math.round(v * 2) / 2;                   // 0.5 단위로 반올림
}
/* 볼륨 배수: 덤벨은 한 손 무게를 적으므로 ×2 (덤벨 하나를 두 손으로 드는 종목은 vmul: 1) */
function volMul(ex) { return typeof ex.vmul === 'number' ? ex.vmul : (ex.equip === '덤벨' ? 2 : 1); }
function setVolume(ex, s, unit) { return ex.type === 'weight_reps' ? toKg(s.w, unit) * num(s.r) * volMul(ex) : 0; }
/* 세트 뒤 휴식: 세트에 따로 정한 값(s.rest)이 있으면 그것, 없으면 종목 기본값 */
function setRest(ex, s) { return s && typeof s.rest === 'number' ? s.rest : getRest(ex); }
function getRest(ex) { const r = db.rest[ex.id]; return typeof r === 'number' ? r : (typeof ex.rest === 'number' ? ex.rest : 90); }

function dayMinutes(day) {
  if (day.minutes != null) return day.minutes;
  const ts = [];
  day.items.forEach(it => it.sets.forEach(s => { if (s.done && s.at) ts.push(s.at); }));
  if (ts.length < 2) return 0;
  return Math.round((Math.max.apply(null, ts) - Math.min.apply(null, ts)) / 60000);
}
function dayStats(date) {
  const st = { sets: 0, planned: 0, vol: 0, minutes: 0, parts: {} };
  const day = db.days[date];
  if (!day) return st;
  day.items.forEach(it => {
    const ex = getEx(it.ex);
    it.sets.forEach(s => {
      if (s.warmup) return;            // 웜업은 세트 수·볼륨·부위에서 뺀다
      st.planned++;
      if (!s.done) return;
      st.sets++;
      st.parts[ex.part] = (st.parts[ex.part] || 0) + 1;
      st.vol += setVolume(ex, s, it.unit);
    });
  });
  st.minutes = dayMinutes(day);
  return st;
}
function topParts(st, n) {
  return Object.keys(st.parts).sort((a, b) => st.parts[b] - st.parts[a]).slice(0, n);
}
function workoutDates() {
  return Object.keys(db.days).filter(k => db.days[k].items.some(it => it.sets.some(s => s.done))).sort();
}
/* 그 종목을 beforeDate 이전 가장 최근에 한 날의 완료 세트 */
function prevSets(exId, beforeDate) {
  const dates = Object.keys(db.days).filter(k => k < beforeDate).sort().reverse();
  for (const k of dates) {
    for (const it of db.days[k].items) {
      if (it.ex !== exId) continue;
      const done = it.sets.filter(s => s.done);
      if (done.length) return { date: k, sets: done, unit: it.unit || 'kg' };
    }
  }
  return null;
}
function fmtSet(type, s, unit) {
  const v = f => (s[f] == null || s[f] === '') ? '-' : fmt(s[f]);
  if (type === 'weight_reps') return v('w') + (unit === 'lb' ? 'lb' : '') + '×' + v('r');
  if (type === 'reps') return v('r') + '회';
  if (type === 'time') return v('sec') + '초';
  return v('min') + '분' + (s.km != null && s.km !== '' ? ' ' + fmt(s.km) + 'km' : '');
}
function cloneSetAsPlan(type, s) {
  const o = { done: false };
  FIELDS[type].forEach(f => { o[f[0]] = s[f[0]] == null ? null : s[f[0]]; });
  if (s.warmup) o.warmup = true;
  if (typeof s.rest === 'number') o.rest = s.rest;   // 세트별 휴식도 함께 복사
  return o;
}

/* ───────── 도우미 ───────── */
const $ = id => document.getElementById(id);
function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
let toastTimer = null;
function toast(msg, actLabel, actFn) {
  const t = $('toast');
  t.innerHTML = '<span>' + esc(msg) + '</span>' + (actLabel ? '<button type="button">' + esc(actLabel) + '</button>' : '');
  if (actLabel) t.querySelector('button').onclick = () => { t.classList.remove('show'); actFn(); };
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), actLabel ? 4500 : 2500);
}

/* ───────── 화면 쌓기 (안드로이드 뒤로 가기 버튼 지원) ───────── */
const stack = [];
let afterPop = null;
function openLayer(el) {
  el.classList.add('open');
  stack.push(el);
  history.pushState({ depth: stack.length }, '');
}
function swapTop(el) {           // 맨 위 화면을 다른 화면으로 바꿈 (운동 추가 → 세트 입력)
  const old = stack.pop();
  if (old) old.classList.remove('open');
  el.classList.add('open');
  stack.push(el);
  history.replaceState({ depth: stack.length }, '');
}
function goBack() { if (stack.length) history.back(); }
window.addEventListener('popstate', e => {
  // 보통 한 칸, history.go(-n) 이면 n 칸을 닫는다
  const depth = e.state && typeof e.state.depth === 'number' ? e.state.depth : 0;
  let n = Math.max(1, stack.length - depth);
  while (n-- > 0 && stack.length) {
    const el = stack.pop();
    el.classList.remove('open');
    if (el === $('setView')) { renderDay(); renderCalendar(); }
    if (el === $('dayView')) renderCalendar();
  }
  if (afterPop) { const fn = afterPop; afterPop = null; fn(); }
});
document.addEventListener('click', e => { if (e.target.closest('[data-back]')) goBack(); });

/* ───────── 달력 ───────── */
const now = new Date();
let viewY = now.getFullYear(), viewM = now.getMonth();
let selDate = todayStr();
let curDate = selDate;     // 열려 있는 하루
let curItemId = null;      // 열려 있는 종목

function renderCalendar() {
  const today = todayStr();
  $('monthTitle').textContent = viewY + '.' + pad(viewM + 1);
  $('calHead').innerHTML = '<div>주</div>' + WEEKDAYS.map((w, i) =>
    '<div class="' + (i === 0 ? 'sun' : i === 6 ? 'sat' : '') + '">' + w + '</div>').join('');

  const first = new Date(viewY, viewM, 1);
  const days = new Date(viewY, viewM + 1, 0).getDate();
  const weeks = Math.ceil((first.getDay() + days) / 7);
  let html = '';
  for (let w = 0; w < weeks; w++) {
    const cells = [];
    const sum = { min: 0, sets: 0, vol: 0 };
    let weekNo = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(viewY, viewM, 1 - first.getDay() + w * 7 + i);
      if (i === 0) weekNo = isoWeek(d);
      const key = ymd(d);
      const st = dayStats(key);
      sum.min += st.minutes; sum.sets += st.sets; sum.vol += st.vol;
      let bars = '';
      if (st.sets > 0) {
        if (st.minutes > 0) bars += '<div class="bar">' + st.minutes + '분</div>';
        bars += '<div class="bar">' + st.sets + '세트</div>';
        if (st.vol > 0) bars += '<div class="bar">' + (st.vol / 1000).toFixed(1) + 't</div>';
        topParts(st, 2).forEach(p => {
          bars += '<div class="bar part" style="border-left-color:' + (PART_COLOR[p] || PART_COLOR['기타']) + '">' + esc(p) + ' ' + st.parts[p] + '</div>';
        });
      }
      const cls = ['day', i === 0 ? 'sun' : '', i === 6 ? 'sat' : '', d.getMonth() !== viewM ? 'other' : '',
        key === today ? 'today' : '', key === selDate ? 'selected' : ''].join(' ');
      cells.push('<button class="' + cls + '" data-date="' + key + '"><span class="dnum">' + d.getDate() + '</span>' + bars + '</button>');
    }
    html += '<div class="week-cell"><b>' + weekNo + '주</b><span>' + (sum.min / 60).toFixed(1) + 'h</span><span>' +
      sum.sets + 's</span><span>' + (sum.vol / 1000).toFixed(1) + 't</span></div>' + cells.join('');
  }
  $('calGrid').innerHTML = html;
  renderBottomBar();
}

function renderBottomBar() {
  const today = todayStr();
  const st = dayStats(selDate);
  const dates = workoutDates();
  const before = dates.filter(k => k < selDate).length;
  $('bbDate').innerHTML = esc(selDate) + (selDate === today ? '<small>오늘</small>' : '');
  let sub;
  if (st.sets > 0) sub = (before + 1) + '번째 기록 · ' + st.sets + '세트' + (st.vol > 0 ? ' · ' + (st.vol / 1000).toFixed(1) + 't' : '');
  else if (selDate >= today) sub = '운동하면 ' + (before + 1) + '번째 기록';
  else sub = '기록 없음';
  $('bbSub').textContent = sub;
}

function moveMonth(n) {
  viewM += n;
  if (viewM < 0) { viewM = 11; viewY--; }
  if (viewM > 11) { viewM = 0; viewY++; }
  renderCalendar();
}
function goToday() {
  const d = new Date();
  viewY = d.getFullYear(); viewM = d.getMonth(); selDate = todayStr();
  renderCalendar();
}

$('prevMonth').onclick = () => moveMonth(-1);
$('nextMonth').onclick = () => moveMonth(1);
$('monthTitle').onclick = goToday;
$('goToday').onclick = goToday;
$('calGrid').addEventListener('click', e => {
  const b = e.target.closest('.day');
  if (!b) return;
  selDate = b.dataset.date;
  renderCalendar();
  openDay(selDate);
});
$('bottomBar').onclick = () => openDay(selDate);

/* 좌우로 밀어서 달 넘기기 */
let touchX = null, touchY = null;
$('calGrid').addEventListener('touchstart', e => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, { passive: true });
$('calGrid').addEventListener('touchend', e => {
  if (touchX == null) return;
  const dx = e.changedTouches[0].clientX - touchX, dy = e.changedTouches[0].clientY - touchY;
  touchX = null;
  if (Math.abs(dx) > 60 && Math.abs(dy) < 50) moveMonth(dx < 0 ? 1 : -1);
}, { passive: true });

/* ───────── 하루 기록 ───────── */
function openDay(date) {
  curDate = date;
  renderDay();
  openLayer($('dayView'));
  $('dayView').querySelector('.scroll').scrollTop = 0;
}

function renderDay() {
  const date = curDate, today = todayStr();
  const day = db.days[date];
  const items = day ? day.items : [];
  const st = dayStats(date);
  const isPast = date < today;

  let html = '<header class="viewbar"><button class="icon-btn back" data-back aria-label="뒤로">←</button>' +
    '<h2>' + dateLabel(date) + (date === today ? '<span class="tag">오늘</span>' : '') + '</h2></header>' +
    '<div class="scroll">' +
    '<div class="summary">' +
    '<button data-act="minutes"><span class="k">운동시간</span><span class="v">' + (st.minutes || '-') + '<small>분</small></span></button>' +
    '<div><span class="k">완료 세트</span><span class="v">' + st.sets + '<small> / ' + st.planned + '</small></span></div>' +
    '<div><span class="k">볼륨</span><span class="v">' + (st.vol / 1000).toFixed(1) + '<small>t</small></span></div>' +
    '</div>';

  const parts = topParts(st, 7);
  if (parts.length) {
    html += '<div class="parts-line">' + parts.map(p =>
      '<span class="pill" style="--pc:' + (PART_COLOR[p] || PART_COLOR['기타']) + '">' + esc(p) + ' ' + st.parts[p] + '</span>').join('') + '</div>';
  }

  if (!items.length) {
    html += '<div class="empty"><b>아직 기록이 없어요</b>오른쪽 아래 + 버튼으로 운동을 추가하세요.' +
      (date === today ? '<br>지난날을 열어 [오늘로 복사]를 눌러도 돼요.' : '') + '</div>';
  }
  items.forEach(it => {
    const ex = getEx(it.ex);
    const work = it.sets.filter(s => !s.warmup);
    const done = work.filter(s => s.done).length;
    const setsTxt = it.sets.map(s => '<span class="' + (s.warmup ? 'warm' : s.done ? '' : 'plan') + '">' + (s.warmup ? 'W ' : '') + esc(fmtSet(ex.type, s, it.unit)) + '</span>').join(' · ');
    html += '<div class="card" style="--pc:' + (PART_COLOR[ex.part] || PART_COLOR['기타']) + '">' +
      '<button class="card-main" data-act="open" data-id="' + it.id + '">' +
      '<div class="card-title">' + esc(ex.name) + '</div>' +
      '<div class="card-meta"><span class="badge">' + esc(ex.part) + '</span><span class="badge">' + esc(ex.equip) + '</span>' +
      '<span class="progress' + (done ? '' : ' zero') + '">✔ ' + done + ' / ' + work.length + ' 세트</span>' +
      (it.sets.length > work.length ? '<span class="badge warm">웜업 ' + (it.sets.length - work.length) + '</span>' : '') + '</div>' +
      (it.sets.length ? '<div class="card-sets">' + setsTxt + '</div>' : '') +
      (it.memo ? '<div class="card-meta">📝 ' + esc(it.memo) + '</div>' : '') +
      '</button><div class="card-side">' +
      (date !== today ? '<button class="mini-btn copy" data-act="copyOne" data-id="' + it.id + '">＋오늘</button>' : '') +
      '<button class="mini-btn del" data-act="del" data-id="' + it.id + '" aria-label="삭제">삭제</button>' +
      '</div></div>';
  });

  if (date !== today && items.length) {
    html += '<button class="big-btn" data-act="copyAll">전체 오늘로 복사</button>';
  }
  html += '</div><button class="fab" data-act="add" aria-label="운동 추가">+</button>';
  if (isPast) { /* 지난날도 기록 추가 가능 */ }

  const scroll = $('dayView').querySelector('.scroll');
  const top = scroll ? scroll.scrollTop : 0;
  $('dayView').innerHTML = html;
  $('dayView').querySelector('.scroll').scrollTop = top;
}

function findItem(id) {
  const day = db.days[curDate];
  return day ? day.items.find(it => it.id === id) : null;
}

function copyToToday(items) {
  const today = todayStr();
  const tday = ensureDay(today);
  items.forEach(it => {
    const ex = getEx(it.ex);
    const doneSets = it.sets.filter(s => s.done);
    const src = doneSets.length ? doneSets : it.sets;
    tday.items.push({ id: uid(), ex: it.ex, memo: '', unit: it.unit || 'kg', sets: src.map(s => cloneSetAsPlan(ex.type, s)) });
  });
  save();
  renderCalendar();
  toast(items.length === 1 ? getEx(items[0].ex).name + ' 을(를) 오늘로 복사했어요' : items.length + '개 운동을 오늘로 복사했어요',
    '오늘 보기', () => { selDate = today; curDate = today; renderDay(); renderCalendar(); });
}

$('dayView').addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  if (!b) return;
  const act = b.dataset.act;
  if (act === 'add') return openPicker();
  if (act === 'open') return openSet(b.dataset.id);
  if (act === 'minutes') {
    const day = db.days[curDate];
    const cur = day && day.minutes != null ? day.minutes : '';
    const v = prompt('운동시간(분)을 입력하세요.\n비워 두면 세트 체크 시각으로 자동 계산해요.', cur);
    if (v === null) return;
    const n = parseInput(v);
    const d = ensureDay(curDate);
    d.minutes = n == null ? null : Math.round(n);
    save(); renderDay(); renderCalendar();
    return;
  }
  if (act === 'del') {
    const it = findItem(b.dataset.id);
    if (!it || !confirm(getEx(it.ex).name + ' 기록을 지울까요?')) return;
    const day = db.days[curDate];
    day.items = day.items.filter(x => x !== it);
    save(); renderDay(); renderCalendar();
    return;
  }
  if (act === 'copyOne') {
    const it = findItem(b.dataset.id);
    if (it) copyToToday([it]);
    return;
  }
  if (act === 'copyAll') {
    const day = db.days[curDate];
    if (!day || !day.items.length) return;
    if (!confirm(dateLabel(curDate) + ' 운동 ' + day.items.length + '개를 오늘로 복사할까요?\n(복사된 세트는 ✔ 안 된 계획 상태로 들어가요)')) return;
    copyToToday(day.items);
  }
});

/* ───────── 운동 추가 (분류·부위 칸 → 목록, 여러 개 담아 한 번에 추가) ───────── */
/* 세부 부위는 고르는 화면에서만 쓴다. 달력·통계는 part(7개) 그대로. key = 근육 그림 파일 이름(icons/muscles/key.png) */
const SUBS = [
  { name: '가슴', key: 'chest', part: '가슴' },
  { name: '등', key: 'back', part: '등' },
  { name: '승모근', key: 'traps', part: '등' },
  { name: '허리', key: 'lowerback', part: '등' },
  { name: '어깨', key: 'shoulders', part: '어깨' },
  { name: '이두', key: 'biceps', part: '팔' },
  { name: '삼두', key: 'triceps', part: '팔' },
  { name: '전완', key: 'forearms', part: '팔' },
  { name: '복부', key: 'abs', part: '코어' },
  { name: '허벅지', key: 'thighs', part: '하체' },
  { name: '엉덩이', key: 'glutes', part: '하체' },
  { name: '종아리', key: 'calves', part: '하체' }
];
const DEFAULT_SUB = { '가슴': '가슴', '등': '등', '어깨': '어깨', '팔': '이두', '코어': '복부', '하체': '허벅지' };
function getSub(ex) { return ex.part === '유산소' ? '' : (ex.sub || DEFAULT_SUB[ex.part] || ''); }
function allExercises() { return (window.IRONLOG_EXERCISES || []).concat(db.custom); }

const PICK_CATS = [
  { kind: 'all', label: '전체' },
  { kind: 'recent', label: '최근 30일' },
  { kind: 'fav', label: '즐겨찾기' },
  { kind: 'custom', label: '내 종목' },
  { kind: 'cardio', label: '유산소' }
];
let pickerFilter = null;   // null = 분류 화면 / { kind, sub }
let pickerSel = [];        // 담은 종목 id (누른 순서)
/* 목록 화면도 뒤로 가기 한 칸으로 다룬다: 뒤로 가면 분류 화면으로 */
const pickerListLayer = { classList: { add() {}, remove() { pickerFilter = null; renderPicker(); } } };

function openPicker() {
  pickerFilter = null;
  pickerSel = [];
  $('pickerSearch').value = '';
  renderPicker();
  openLayer($('pickerView'));
  $('pickerList').scrollTop = 0;
}
function lastByExercise() {
  const map = {};
  Object.keys(db.days).sort().forEach(k => {
    db.days[k].items.forEach(it => {
      const done = it.sets.filter(s => s.done && !s.warmup);
      if (done.length) map[it.ex] = { date: k, set: done[done.length - 1], unit: it.unit };
    });
  });
  return map;
}
function recentIds(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const from = ymd(d);
  const ids = [];
  Object.keys(db.days).filter(k => k >= from).sort().reverse().forEach(k => {
    db.days[k].items.forEach(it => {
      if (it.sets.some(s => s.done) && ids.indexOf(it.ex) < 0) ids.push(it.ex);
    });
  });
  return ids;
}
function filterList(f) {
  if (f.kind === 'recent') return recentIds(30).map(id => exMap[id]).filter(Boolean);
  if (f.kind === 'fav') return db.favs.map(id => exMap[id]).filter(Boolean);
  if (f.kind === 'custom') return db.custom.slice();
  if (f.kind === 'cardio') return allExercises().filter(e => e.part === '유산소');
  if (f.kind === 'sub') return allExercises().filter(e => getSub(e) === f.sub);
  return allExercises();
}
function filterTitle(f) {
  if (f.kind === 'sub') return f.sub;
  const c = PICK_CATS.find(x => x.kind === f.kind);
  return c ? c.label : '';
}

function renderPicker() {
  const q = $('pickerSearch').value.trim().toLowerCase().replace(/\s+/g, '');
  const last = lastByExercise();
  const row = e => {
    const l = last[e.id];
    const fav = db.favs.indexOf(e.id) >= 0;
    const k = pickerSel.indexOf(e.id);
    const sub = getSub(e);
    return '<div class="ex-row' + (k >= 0 ? ' sel' : '') + '" style="--pc:' + (PART_COLOR[e.part] || PART_COLOR['기타']) + '">' +
      '<button class="ex-main" data-ex="' + esc(e.id) + '">' +
      '<span class="ex-check">' + (k >= 0 ? (k + 1) : '') + '</span><span class="ex-name">' + esc(e.name) +
      '<small>' + esc(sub || e.part) + ' · ' + esc(e.equip) + (e.custom ? ' · 내 종목' : '') + '</small></span>' +
      (l ? '<span class="ex-last">' + esc(fmtSet(e.type, l.set, l.unit)) + '</span>' : '') + '</button>' +
      '<button class="star' + (fav ? ' on' : '') + '" data-fav="' + esc(e.id) + '" aria-label="즐겨찾기">' + (fav ? '★' : '☆') + '</button></div>';
  };
  const addBtn = '<button class="ex-row add" data-act="custom">＋ 종목 직접 추가</button>';
  let html = '';
  let title = '';

  if (q) {
    const hay = e => [e.name, e.en].concat(e.aka || []).join('|').toLowerCase().replace(/\s+/g, '');
    const list = allExercises().filter(e => hay(e).indexOf(q) >= 0);
    title = '검색 결과 ' + list.length + '개';
    html = list.length ? list.map(row).join('') : '<div class="empty">찾는 종목이 없어요.<br>아래에서 직접 추가해 주세요.</div>';
    html += addBtn;
  } else if (pickerFilter) {
    const list = filterList(pickerFilter);
    title = filterTitle(pickerFilter) + ' ' + list.length + '개';
    if (!list.length) {
      const msg = { recent: '최근 30일 동안 ✔ 한 운동이 없어요.', fav: '즐겨찾기한 종목이 없어요.<br>종목 오른쪽 ☆ 를 누르면 여기에 모여요.', custom: '직접 추가한 종목이 없어요.' };
      html = '<div class="empty">' + (msg[pickerFilter.kind] || '종목이 없어요.') + '</div>';
    } else html = list.map(row).join('');
    html += addBtn;
  } else {
    const cnt = { all: allExercises().length, recent: recentIds(30).length, fav: db.favs.filter(id => exMap[id]).length,
      custom: db.custom.length, cardio: allExercises().filter(e => e.part === '유산소').length };
    html = '<div class="pk-home"><div class="pk-cats">' +
      PICK_CATS.map(c => '<button class="pk-cat" data-kind="' + c.kind + '">' + c.label + ' <b>' + cnt[c.kind] + '</b></button>').join('') +
      '<button class="pk-cat add" data-act="custom">＋ 직접 추가</button></div>' +
      '<div class="pk-grid">' + SUBS.map(s => {
        const n = allExercises().filter(e => getSub(e) === s.name).length;
        return '<button class="pk-tile" data-sub="' + s.name + '" style="--pc:' + PART_COLOR[s.part] + '">' +
          '<span class="pk-img"><i>' + s.name.charAt(0) + '</i><img src="icons/muscles/' + s.key + '.png" alt="" onerror="this.remove()"></span>' +
          '<span class="pk-name">' + s.name + ' <b>' + n + '</b></span></button>';
      }).join('') + '</div></div>';
  }
  $('pickerSubbar').textContent = title;
  $('pickerSubbar').hidden = !title;
  $('pickerList').innerHTML = html;
  renderTray();
}

function renderTray() {
  const n = pickerSel.length;
  $('pickerSelList').innerHTML = n
    ? pickerSel.map(id => '<button class="pk-chip" data-unsel="' + esc(id) + '">' + esc(getEx(id).name) + ' ✕</button>').join('')
    : '<span class="pk-empty">운동을 누르면 여기에 담겨요</span>';
  $('pickerDone').disabled = !n;
  $('pickerDone').textContent = n ? '완료 (' + n + ')' : '완료';
}

function keepScroll(fn) {
  const top = $('pickerList').scrollTop;
  fn();
  $('pickerList').scrollTop = top;
}

$('pickerSearch').addEventListener('input', renderPicker);
$('pickerList').addEventListener('click', e => {
  if (e.target.closest('[data-act="custom"]')) return openCustomForm();
  const cat = e.target.closest('[data-kind]');
  const tile = e.target.closest('[data-sub]');
  if (cat || tile) {
    pickerFilter = cat ? { kind: cat.dataset.kind } : { kind: 'sub', sub: tile.dataset.sub };
    renderPicker();
    openLayer(pickerListLayer);
    $('pickerList').scrollTop = 0;
    return;
  }
  const star = e.target.closest('[data-fav]');
  if (star) {
    const id = star.dataset.fav, k = db.favs.indexOf(id);
    if (k >= 0) db.favs.splice(k, 1); else db.favs.push(id);
    save();
    keepScroll(renderPicker);
    toast(k >= 0 ? '즐겨찾기에서 뺐어요' : '즐겨찾기에 넣었어요');
    return;
  }
  const r = e.target.closest('.ex-main[data-ex]');
  if (r) {
    const id = r.dataset.ex, k = pickerSel.indexOf(id);
    if (k >= 0) pickerSel.splice(k, 1); else pickerSel.push(id);
    keepScroll(renderPicker);
  }
});
$('pickerSelList').addEventListener('click', e => {
  const c = e.target.closest('[data-unsel]');
  if (!c) return;
  pickerSel = pickerSel.filter(id => id !== c.dataset.unsel);
  keepScroll(renderPicker);
});
$('pickerDone').addEventListener('click', () => {
  if (!pickerSel.length) return;
  const added = pickerSel.map(id => addExerciseItem(id));
  save();
  renderDay();
  pickerSel = [];
  const depth = stack.indexOf($('pickerView'));            // 운동 추가 아래 화면(하루 기록)까지 한 번에 돌아감
  afterPop = () => {
    if (added.length === 1) openSet(added[0].id);
    else toast(added.length + '개 운동을 추가했어요');
  };
  history.go(-(stack.length - depth));
});

function addExerciseItem(exId) {
  const ex = getEx(exId);
  const prev = prevSets(exId, curDate);
  const unit = db.units[exId] || (prev && prev.unit) || db.unit;
  const sets = prev ? prev.sets.map(s => {
    const c = cloneSetAsPlan(ex.type, s);
    if (c.w != null) c.w = convertWeight(c.w, prev.unit, unit);
    return c;
  }) : [cloneSetAsPlan(ex.type, {})];
  const item = { id: uid(), ex: exId, memo: '', unit: unit, sets: sets };
  ensureDay(curDate).items.push(item);
  return item;
}

/* 종목 직접 추가 */
function openModal(html) {
  $('modalBox').innerHTML = html;
  openLayer($('modal'));
}
$('modal').addEventListener('click', e => { if (e.target === $('modal')) goBack(); });

function openCustomForm() {
  const q = $('pickerSearch').value.trim();
  const opt = (arr, sel) => arr.map(v => '<option' + (v === sel ? ' selected' : '') + '>' + v + '</option>').join('');
  const f = pickerFilter;
  const fSub = f && f.kind === 'sub' ? SUBS.find(x => x.name === f.sub) : null;
  const defPart = fSub ? fSub.part : (f && f.kind === 'cardio' ? '유산소' : '가슴');
  openModal('<h3>종목 직접 추가</h3>' +
    '<label class="field">이름<input id="cxName" maxlength="30" value="' + esc(q) + '" placeholder="예: 스미스 머신 스쿼트"></label>' +
    '<div class="row2"><label class="field">부위<select id="cxPart">' + opt(PARTS, defPart) + '</select></label>' +
    '<label class="field" id="cxSubLine">세부 부위<select id="cxSub"></select></label></div>' +
    '<div class="row2"><label class="field">장비<select id="cxEquip">' + opt(EQUIPS, '머신') + '</select></label>' +
    '<label class="field">쉬는 시간(초)<input id="cxRest" inputmode="numeric" value="90"></label></div>' +
    '<label class="field">기록 방식<select id="cxType">' +
    Object.keys(TYPE_LABEL).map(k => '<option value="' + k + '">' + TYPE_LABEL[k] + '</option>').join('') + '</select></label>' +
    '<label class="check-line" id="cxHandLine"><input type="checkbox" id="cxHand" checked> 덤벨 한 손 무게로 적기 (볼륨 ×2)</label>' +
    '<div class="modal-foot"><button data-back>취소</button><button class="ok" id="cxSave">추가</button></div>');
  const syncSub = () => {
    const part = $('cxPart').value;
    const subs = SUBS.filter(x => x.part === part).map(x => x.name);
    $('cxSubLine').style.visibility = subs.length > 1 ? 'visible' : 'hidden';
    $('cxSub').innerHTML = opt(subs, fSub && subs.indexOf(fSub.name) >= 0 ? fSub.name : subs[0]);
    if (part === '유산소') $('cxType').value = 'distance_time';
  };
  $('cxPart').onchange = syncSub;
  syncSub();
  const syncHand = () => { $('cxHandLine').style.display = $('cxEquip').value === '덤벨' ? '' : 'none'; };
  $('cxEquip').onchange = syncHand;
  syncHand();
  $('cxSave').onclick = () => {
    const name = $('cxName').value.trim();
    if (!name) { $('cxName').focus(); return; }
    const ex = {
      id: 'custom_' + uid(), name: name, en: '', aka: [], part: $('cxPart').value, sub: $('cxSub').value || undefined, equip: $('cxEquip').value,
      type: $('cxType').value, rest: Math.round(parseInput($('cxRest').value) || 90), tips: [], mistake: '', custom: true
    };
    if (ex.equip === '덤벨' && !$('cxHand').checked) ex.vmul = 1;
    db.custom.push(ex);
    rebuildExMap();
    save();
    pickerSel.push(ex.id);
    afterPop = () => { keepScroll(renderPicker); toast(ex.name + ' 을(를) 만들어 담았어요'); };
    goBack();
  };
}

/* ───────── 세트 입력 ───────── */
function openSet(itemId) {
  curItemId = itemId;
  renderSet();
  openLayer($('setView'));
}
function curItem() { return findItem(curItemId); }

function renderSet() {
  const it = curItem();
  if (!it) return;
  const ex = getEx(it.ex);
  const fields = FIELDS[ex.type] || FIELDS.weight_reps;
  const prev = prevSets(it.ex, curDate);

  let rows = '<div class="set-row th"><span>세트</span><span>이전</span>' +
    fields.map(f => f[0] === 'w'
      ? '<span><button class="unit-btn" data-act="unit" aria-label="무게 단위 바꾸기">' + (it.unit === 'lb' ? 'lb' : 'kg') + ' ⇄</button></span>'
      : '<span>' + f[1] + '</span>').join('') + '<span>✔</span></div>';
  it.sets.forEach((s, i) => {
    const p = prevMatch(it, prev, i);
    rows += '<div class="set-row' + (s.done ? ' done' : '') + '" data-i="' + i + '">' +
      '<button class="set-no' + (s.warmup ? ' warm' : '') + '" data-act="warm" aria-label="웜업으로 바꾸기">' + setLabel(it, i) + '</button>' +
      '<button class="prev-btn" data-act="prev"' + (p ? '' : ' disabled') + '>' + (p ? esc(fmtSet(ex.type, p, prev.unit)) : '-') + '</button>' +
      fields.map(f => '<input data-f="' + f[0] + '" inputmode="decimal" enterkeyhint="next" value="' +
        (s[f[0]] == null ? '' : esc(s[f[0]])) + '" placeholder="' + esc(placeholderFor(it, prev, i, f[0])) + '">').join('') +
      '<button class="check" data-act="check" aria-label="' + (i + 1) + '세트 완료">✔</button></div>';
    if (ex.type !== 'distance_time') {
      const r = setRest(ex, s);
      rows += '<button class="rest-line' + (typeof s.rest === 'number' ? ' own' : '') + '" data-act="setRest" data-i="' + i + '" aria-label="' + (i + 1) + '세트 뒤 쉬는 시간">' +
        '<span>⏱ ' + (r ? mmss(r) : '쉬지 않음') + '</span></button>';
    }
  });

  $('setView').innerHTML =
    '<header class="viewbar"><button class="icon-btn back" data-back aria-label="뒤로">←</button><h2>' + esc(ex.name) + '</h2>' +
    ((ex.tips && ex.tips.length) || ex.mistake ? '<button class="icon-btn tip-btn" data-act="tips" aria-label="자세 팁">💡</button>' : '') +
    '<button class="head-btn" data-act="history">지난 기록</button></header>' +
    '<div class="scroll">' +
    '<div class="set-head"><span class="badge">' + esc(ex.part) + '</span><span class="badge">' + esc(ex.equip) + '</span>' +
    (ex.type === 'weight_reps' && volMul(ex) === 2 ? '<span class="badge hand">한 손 무게 · 볼륨 ×2</span>' : '') +
    '<button class="rest-btn" data-act="rest">⏱ ' + (getRest(ex) ? '쉬는 시간 ' + restText(getRest(ex)) : '타이머 없음') + '</button>' +
    '<span class="set-stat" id="setStat"></span></div>' +
    '<div class="set-table" style="--cols:' + fields.length + '">' + rows + '</div>' +
    '<div class="set-actions"><button data-act="addSet">＋ 세트</button><button data-act="dupSet">직전 세트 복사</button>' +
    '<button class="del" data-act="removeSet">− 마지막</button></div>' +
    '<input class="memo" id="setMemo" maxlength="80" placeholder="메모 (예: 그립 넓게, 어깨 살짝 불편)" value="' + esc(it.memo) + '">' +
    '<p class="hint">' + (prev ? '이전 기록: ' + dateLabel(prev.date) + '. ' : '') +
    '“이전” 칸을 누르면 그 기록이 그대로 들어가요. 빈 칸으로 ✔ 를 누르면 흐린 숫자가 들어가요.<br>세트 번호를 누르면 웜업(W)으로 바뀌어요. 웜업은 세트 수·볼륨에서 빠져요.<br>✔ 누른 본세트만 달력과 통계에 반영돼요.</p>' +
    '</div>';
  updateSetStat();
}

/* 이전 기록에서 i번째 세트의 짝: 웜업은 웜업끼리, 본세트는 본세트끼리 순서대로 */
function prevMatch(it, prev, i) {
  if (!prev) return null;
  const warm = !!it.sets[i].warmup;
  let k = 0;
  for (let j = 0; j < i; j++) if (!!it.sets[j].warmup === warm) k++;
  return prev.sets.filter(s => !!s.warmup === warm)[k] || null;
}

/* 세트 번호: 웜업은 W, 본세트는 웜업을 빼고 1, 2, 3… */
function setLabel(it, i) {
  if (it.sets[i].warmup) return 'W';
  let n = 0;
  for (let k = 0; k <= i; k++) if (!it.sets[k].warmup) n++;
  return String(n);
}

function placeholderFor(it, prev, i, f) {
  if (i > 0 && it.sets[i - 1][f] != null) return fmt(it.sets[i - 1][f]);
  const pm = prevMatch(it, prev, i);
  if (pm && pm[f] != null) {
    const v = pm[f];
    return fmt(f === 'w' ? convertWeight(v, prev.unit, it.unit) : v);
  }
  return '';
}

function updateSetStat() {
  const it = curItem();
  if (!it || !$('setStat')) return;
  const ex = getEx(it.ex);
  const work = it.sets.filter(s => !s.warmup);
  const done = work.filter(s => s.done);
  const vol = done.reduce((a, s) => a + setVolume(ex, s, it.unit), 0);
  $('setStat').textContent = (ex.type === 'weight_reps' ? Math.round(vol).toLocaleString() + 'kg · ' : '') + '✔ ' + done.length + ' / ' + work.length + ' 세트';
}

$('setView').addEventListener('input', e => {
  const it = curItem();
  if (!it) return;
  if (e.target.id === 'setMemo') { it.memo = e.target.value; save(); return; }
  const inp = e.target.closest('input[data-f]');
  if (!inp) return;
  const i = Number(inp.closest('.set-row').dataset.i);
  it.sets[i][inp.dataset.f] = parseInput(inp.value);
  save();
  updateSetStat();
});

$('setView').addEventListener('click', e => {
  const b = e.target.closest('[data-act]');
  const it = curItem();
  if (!b || !it) return;
  const ex = getEx(it.ex);
  const fields = FIELDS[ex.type] || FIELDS.weight_reps;
  const rowEl = b.closest('.set-row');
  const i = rowEl ? Number(rowEl.dataset.i) : (b.dataset.i != null ? Number(b.dataset.i) : -1);
  const act = b.dataset.act;

  if (act === 'history') return openHistory(it.ex);
  if (act === 'warm') {
    const s = it.sets[i];
    if (s.warmup) delete s.warmup; else s.warmup = true;
    save();
    const sc = $('setView').querySelector('.scroll').scrollTop;
    renderSet();
    $('setView').querySelector('.scroll').scrollTop = sc;
    toast(s.warmup ? (i + 1) + '번째 줄을 웜업으로 바꿨어요 (볼륨·세트 수에서 빠져요)' : '본세트로 바꿨어요');
    return;
  }
  if (act === 'tips') return openTips(ex);
  if (act === 'unit') {
    it.unit = it.unit === 'lb' ? 'kg' : 'lb';
    db.units[it.ex] = it.unit;
    save(); renderSet();
    toast('무게 단위를 ' + it.unit + '(으)로 바꿨어요. 적어 둔 숫자는 그대로예요.');
    return;
  }
  if (act === 'rest') return openRestModal('default', ex);
  if (act === 'setRest') return openRestModal('set', ex, { item: it, i: i });
  if (act === 'check') {
    const s = it.sets[i];
    if (!s.done) {
      // 빈 칸이면 흐린 숫자(위 세트 또는 이전 기록)로 채움
      fields.forEach(f => {
        if (s[f[0]] == null) {
          const inp = rowEl.querySelector('input[data-f="' + f[0] + '"]');
          const v = parseInput(inp.placeholder);
          if (v != null) { s[f[0]] = v; inp.value = fmt(v); }
        }
      });
      s.done = true;
      s.at = Date.now();
      startRest(setRest(ex, s), (i + 1) + '세트 후 휴식 · ' + ex.name, ex.id);
    } else {
      s.done = false;
    }
    rowEl.classList.toggle('done', s.done);
    save();
    updateSetStat();
    refreshPlaceholders(it);
    return;
  }
  if (act === 'prev') {
    const prev = prevSets(it.ex, curDate);
    const p = prevMatch(it, prev, i);
    if (!p) return;
    fields.forEach(f => {
      let v = p[f[0]] == null ? null : p[f[0]];
      if (f[0] === 'w') v = convertWeight(v, prev.unit, it.unit);
      it.sets[i][f[0]] = v;
      rowEl.querySelector('input[data-f="' + f[0] + '"]').value = v == null ? '' : fmt(v);
    });
    save(); updateSetStat(); refreshPlaceholders(it);
    return;
  }
  if (act === 'addSet') {
    it.sets.push(cloneSetAsPlan(ex.type, {}));
  } else if (act === 'dupSet') {
    const last = it.sets[it.sets.length - 1] || {};
    it.sets.push(cloneSetAsPlan(ex.type, last));
  } else if (act === 'removeSet') {
    if (!it.sets.length) return;
    const last = it.sets[it.sets.length - 1];
    if (last.done && !confirm('완료(✔)한 마지막 세트를 지울까요?')) return;
    it.sets.pop();
  } else return;
  save();
  const sc = $('setView').querySelector('.scroll').scrollTop;
  renderSet();
  $('setView').querySelector('.scroll').scrollTop = sc;
});

function refreshPlaceholders(it) {
  const prev = prevSets(it.ex, curDate);
  $('setView').querySelectorAll('.set-row[data-i] input[data-f]').forEach(inp => {
    const i = Number(inp.closest('.set-row').dataset.i);
    inp.placeholder = placeholderFor(it, prev, i, inp.dataset.f);
  });
}

/* ───────── 쉬는 시간 타이머 (끝나는 시각 기준이라 화면이 꺼졌다 켜져도 맞음) ───────── */
const rest = { end: 0, total: 0, iv: null, hideT: null, exId: null };
let audioCtx = null;
const mmss = sec => Math.floor(sec / 60) + ':' + pad(sec % 60);
function startRest(sec, label, exId) {
  if (!sec) return;
  rest.exId = exId || null;
  try {                                   // 소리는 사용자가 누른 순간에 준비해야 나중에 울림
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();
  } catch (e) { audioCtx = null; }
  clearInterval(rest.iv);
  clearTimeout(rest.hideT);
  rest.total = sec;
  rest.end = Date.now() + sec * 1000;
  $('restLabel').textContent = label;
  $('restBar').classList.remove('finished');
  document.body.classList.add('timer-on');
  rest.iv = setInterval(tickRest, 250);
  tickRest();
}
function tickRest() {
  const left = Math.ceil((rest.end - Date.now()) / 1000);
  if (left <= 0) return finishRest();
  $('restTime').textContent = mmss(left);
  $('restFill').style.width = Math.min(100, left / rest.total * 100) + '%';
}
function finishRest() {
  clearInterval(rest.iv);
  rest.iv = null;
  $('restTime').textContent = '0:00';
  $('restFill').style.width = '0%';
  $('restLabel').textContent = '쉬는 시간 끝! 다음 세트 가요';
  $('restBar').classList.add('finished');
  beep();
  if (navigator.vibrate) navigator.vibrate([300, 150, 300]);
  rest.hideT = setTimeout(stopRest, 5000);
}
function stopRest() {
  clearInterval(rest.iv);
  clearTimeout(rest.hideT);
  rest.iv = null;
  document.body.classList.remove('timer-on');
}
function beep() {
  if (!audioCtx) return;
  try {
    [0, 0.35, 0.7].forEach(t => {
      const o = audioCtx.createOscillator(), g = audioCtx.createGain();
      o.frequency.value = 880;
      o.connect(g); g.connect(audioCtx.destination);
      const s = audioCtx.currentTime + t;
      g.gain.setValueAtTime(0.0001, s);
      g.gain.exponentialRampToValueAtTime(0.4, s + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, s + 0.25);
      o.start(s); o.stop(s + 0.3);
    });
  } catch (e) { /* 소리 실패는 무시 */ }
}
$('restBar').addEventListener('click', e => {
  const b = e.target.closest('[data-rest]');
  if (!b) return;
  const v = b.dataset.rest;
  if (v === 'edit') return openRestModal('running', rest.exId ? getEx(rest.exId) : null);
  if (v === 'skip' || !rest.iv) return stopRest();
  const d = Number(v);
  rest.end = Math.max(Date.now() + 1000, rest.end + d * 1000);
  rest.total = Math.max(rest.total + d, Math.ceil((rest.end - Date.now()) / 1000));
  tickRest();
});
document.addEventListener('visibilitychange', () => { if (!document.hidden && rest.iv) tickRest(); });

/* 쉬는 시간 입력 창
 *  default: 세트 입력 화면 ⏱ 버튼 → 이 종목 기본값 저장 / 지금 시작
 *  running: 타이머 숫자 누름 → 남은 시간 바꾸기 (+ 기본값으로도 저장) */
const REST_PRESETS = [30, 60, 90, 120, 150, 180, 240];
const restText = sec => sec < 60 ? sec + '초' : Math.floor(sec / 60) + '분' + (sec % 60 ? ' ' + (sec % 60) + '초' : '');
function openRestModal(mode, ex, ctx) {
  const setObj = mode === 'set' ? ctx.item.sets[ctx.i] : null;
  const cur = mode === 'running' && rest.iv ? Math.max(0, Math.ceil((rest.end - Date.now()) / 1000))
    : mode === 'set' ? setRest(ex, setObj) : (ex ? getRest(ex) : 90);
  const title = mode === 'running' ? '남은 쉬는 시간 바꾸기'
    : mode === 'set' ? (ctx.i + 1) + '세트 뒤 쉬는 시간' : esc(ex.name) + ' 기본 쉬는 시간';
  let html = '<h3>' + title + '</h3>' +
    '<div class="chips rest-chips">' + REST_PRESETS.map(v => '<button class="chip" data-sec="' + v + '">' + restText(v) + '</button>').join('') + '</div>' +
    '<div class="row2"><label class="field">분<input id="rmMin" inputmode="numeric" maxlength="2" value="' + Math.floor(cur / 60) + '"></label>' +
    '<label class="field">초<input id="rmSec" inputmode="numeric" maxlength="2" value="' + (cur % 60) + '"></label></div>';
  if (mode === 'set') {
    html += '<p class="hint">이 세트 뒤에만 적용돼요. 종목 기본값은 ' + (getRest(ex) ? restText(getRest(ex)) : '타이머 없음') + '이에요.</p>' +
      '<div class="modal-foot"><button data-back>취소</button><button id="rmReset">기본값으로</button><button class="ok" id="rmSetSave">저장</button></div>';
  } else if (mode === 'running') {
    html += (ex ? '<label class="check-line"><input type="checkbox" id="rmKeep"> ' + esc(ex.name) + ' 기본 쉬는 시간으로도 저장</label>' : '') +
      '<div class="modal-foot"><button data-back>취소</button><button class="ok" id="rmApply">적용</button></div>';
  } else {
    html += '<p class="hint">0분 0초로 저장하면 이 종목은 ✔ 해도 타이머가 켜지지 않아요.</p>' +
      '<div class="modal-foot"><button data-back>취소</button><button id="rmStart">지금 시작</button><button class="ok" id="rmSave">저장</button></div>';
  }
  openModal(html);
  const box = $('modalBox');
  const readSec = () => {
    const m = parseInput($('rmMin').value) || 0, sc = parseInput($('rmSec').value) || 0;
    return Math.min(Math.round(m * 60 + sc), 3600);
  };
  box.querySelector('.rest-chips').onclick = e => {
    const c = e.target.closest('[data-sec]');
    if (!c) return;
    const v = Number(c.dataset.sec);
    $('rmMin').value = Math.floor(v / 60);
    $('rmSec').value = v % 60;
    box.querySelectorAll('.rest-chips .chip').forEach(x => x.classList.toggle('on', x === c));
  };
  const saveDefault = sec => {
    if (!ex) return;
    db.rest[ex.id] = sec;
    save();
  };
  const refreshSet = () => {
    if (!$('setView').classList.contains('open')) return;
    const sc = $('setView').querySelector('.scroll');
    const top = sc ? sc.scrollTop : 0;
    renderSet();
    $('setView').querySelector('.scroll').scrollTop = top;
  };
  if (mode === 'set') {
    $('rmSetSave').onclick = () => {
      setObj.rest = readSec();
      save();
      afterPop = refreshSet;
      goBack();
    };
    $('rmReset').onclick = () => {
      delete setObj.rest;
      save();
      afterPop = refreshSet;
      goBack();
    };
  } else if (mode === 'running') {
    $('rmApply').onclick = () => {
      const sec = readSec();
      if ($('rmKeep') && $('rmKeep').checked) saveDefault(sec);
      afterPop = () => {
        if (!sec) return stopRest();
        if (rest.iv) {
          rest.end = Date.now() + sec * 1000;
          rest.total = sec;
          tickRest();
        } else startRest(sec, ex ? '휴식 · ' + ex.name : '휴식', ex && ex.id);
        refreshSet();
      };
      goBack();
    };
  } else {
    $('rmSave').onclick = () => {
      const sec = readSec();
      saveDefault(sec);
      afterPop = () => { refreshSet(); toast(ex.name + ' 쉬는 시간: ' + (sec ? restText(sec) : '타이머 없음')); };
      goBack();
    };
    $('rmStart').onclick = () => {
      const sec = readSec();
      if (!sec) return;
      startRest(sec, '휴식 · ' + ex.name, ex.id);   // 누른 순간 소리 준비
      goBack();
    };
  }
}

/* ───────── 자세 팁 창 ───────── */
function openTips(ex) {
  const tips = ex.tips || [];
  openModal('<h3>💡 ' + esc(ex.name) + '</h3>' +
    (ex.en ? '<p class="tip-en">' + esc(ex.en) + '</p>' : '') +
    (tips.length ? '<ol class="tip-list">' + tips.map(t => '<li>' + esc(t) + '</li>').join('') + '</ol>' : '') +
    (ex.mistake ? '<div class="tip-warn"><b>⚠ 주의</b>' + esc(ex.mistake) + '</div>' : '') +
    '<div class="modal-foot"><button class="ok" data-back>닫기</button></div>');
}

/* ───────── 종목별 지난 기록 (✔ 한 세트만) ───────── */
function exHistory(exId) {
  return Object.keys(db.days).sort().reverse().map(k => {
    const sets = [];
    db.days[k].items.forEach(it => { if (it.ex === exId) it.sets.forEach(s => { if (s.done) sets.push(Object.assign({}, s, { u: it.unit || 'kg' })); }); });
    return { date: k, sets: sets };
  }).filter(h => h.sets.length);
}
/* 기록 방식별 “최고” 기준 값 */
function bestKey(type, s) {
  if (type === 'weight_reps') return toKg(s.w, s.u) * 1000 + num(s.r);   // 무게 우선, 같으면 횟수
  if (type === 'reps') return num(s.r);
  if (type === 'time') return num(s.sec);
  return num(s.km) * 1000 + num(s.min);
}
const BEST_LABEL = { weight_reps: '최고 무게', reps: '최고 횟수', time: '최장 시간', distance_time: '최장 거리' };

function openHistory(exId) {
  const ex = getEx(exId);
  const hist = exHistory(exId);
  const today = todayStr();
  let best = null;
  hist.forEach(h => h.sets.forEach(s => { if (!s.warmup && (!best || bestKey(ex.type, s) > bestKey(ex.type, best))) best = s; }));
  const bestK = best ? bestKey(ex.type, best) : -1;

  let html = '<header class="viewbar"><button class="icon-btn back" data-back aria-label="뒤로">←</button>' +
    '<h2>' + esc(ex.name) + ' 기록</h2></header><div class="scroll">' +
    '<div class="summary">' +
    '<div><span class="k">기록한 날</span><span class="v">' + hist.length + '<small>일</small></span></div>' +
    '<div><span class="k">' + BEST_LABEL[ex.type] + '</span><span class="v" style="font-size:17px">' + (best ? esc(fmtSet(ex.type, best, best.u)) : '-') + '</span></div>' +
    '<div><span class="k">마지막</span><span class="v" style="font-size:17px">' + (hist.length ? hist[0].date.slice(5).replace('-', '/') : '-') + '</span></div>' +
    '</div>';

  if (!hist.length) html += '<div class="empty"><b>아직 기록이 없어요</b>✔ 한 세트가 있는 날만 여기에 나와요.</div>';
  hist.forEach(h => {
    const work = h.sets.filter(s => !s.warmup);
    const vol = work.reduce((a, s) => a + setVolume(ex, s, s.u), 0);
    const hasBest = work.some(s => bestKey(ex.type, s) === bestK);
    const d = parseYmd(h.date);
    html += '<div class="hist-row"><div class="hist-top">' +
      '<span class="hist-date' + (h.date === today ? ' today-mark' : '') + '">' + h.date.replace(/-/g, '.') + ' (' + WEEKDAYS[d.getDay()] + ')</span>' +
      (hasBest ? '<span class="pr">최고</span>' : '') +
      '<span class="hist-sum">' + work.length + '세트' + (vol > 0 ? ' · ' + vol.toLocaleString() + 'kg' : '') + '</span></div>' +
      '<div class="hist-sets">' + h.sets.map(s => '<span class="' + (s.warmup ? 'warm' : bestKey(ex.type, s) === bestK ? 'best' : '') + '">' + (s.warmup ? 'W ' : '') + esc(fmtSet(ex.type, s, s.u)) + '</span>').join(' · ') + '</div></div>';
  });
  html += '</div>';
  $('histView').innerHTML = html;
  openLayer($('histView'));
  $('histView').querySelector('.scroll').scrollTop = 0;
}

/* ───────── 설정 · 백업 ───────── */
$('openSettings').onclick = () => {
  const n = workoutDates().length;
  openModal('<h3>설정</h3>' +
    '<button class="menu-btn" id="unitBtn">새 종목 기본 무게 단위: <b>' + db.unit + '</b><small>누르면 kg ⇄ lb. 종목마다 세트 입력 화면의 단위 버튼으로 따로 바꿀 수 있어요.</small></button>' +
    '<button class="menu-btn" id="exportBtn">백업 파일 내보내기<small>모든 기록을 JSON 파일로 저장해요. 가끔 해 두세요.</small></button>' +
    '<button class="menu-btn" id="importBtn">백업 파일 가져오기<small>지금 기록을 백업 파일 내용으로 바꿔요.</small></button>' +
    '<p class="hint">IronLog ' + APP_VERSION + ' · 운동한 날 ' + n + '일 · 내 종목 ' + db.custom.length + '개<br>기록은 이 폰(브라우저)에만 저장돼요.</p>' +
    '<div class="modal-foot"><button data-back>닫기</button></div>');
  $('unitBtn').onclick = () => {
    db.unit = db.unit === 'lb' ? 'kg' : 'lb';
    save();
    $('unitBtn').querySelector('b').textContent = db.unit;
  };
  $('exportBtn').onclick = exportBackup;
  $('importBtn').onclick = () => $('importFile').click();
};

function exportBackup() {
  const data = { app: 'IronLog', version: 1, exportedAt: new Date().toISOString(), data: db };
  const blob = new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'ironlog-backup-' + todayStr() + '.json';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  toast('백업 파일을 저장했어요');
}

$('importFile').addEventListener('change', e => {
  const f = e.target.files && e.target.files[0];
  e.target.value = '';
  if (!f) return;
  const r = new FileReader();
  r.onload = () => {
    let o;
    try { o = JSON.parse(r.result); } catch (err) { toast('백업 파일을 읽을 수 없어요'); return; }
    const src = o && o.data ? o.data : o;
    if (!src || typeof src.days !== 'object') { toast('IronLog 백업 파일이 아니에요'); return; }
    askImport(normalize(src));
  };
  r.readAsText(f);
});

/* 가져오기 방법 고르기: 합치기(지금 기록은 그대로, 없는 날만 더함) / 전부 바꾸기 */
function askImport(next) {
  const nDays = Object.keys(next.days).length;
  const clash = Object.keys(next.days).filter(k => db.days[k]).length;
  const html = '<h3>백업 가져오기</h3>' +
    '<p class="hint" style="margin-top:0">백업 파일에 운동한 날 <b>' + nDays + '일</b>이 있어요.' +
    (clash ? ' 그중 <b>' + clash + '일</b>은 지금 앱에도 기록이 있어요.' : '') + '</p>' +
    '<button class="menu-btn" id="impMerge">기존 기록에 합치기<small>지금 기록은 그대로 두고, 없는 날만 더해요.' +
    (clash ? ' 겹치는 ' + clash + '일은 지금 기록을 남겨요.' : '') + '</small></button>' +
    '<button class="menu-btn" id="impReplace">전부 바꾸기<small>지금 기록을 지우고 백업 내용으로 바꿔요.</small></button>' +
    '<div class="modal-foot"><button data-back>취소</button></div>';
  if ($('modal').classList.contains('open')) $('modalBox').innerHTML = html;
  else openModal(html);
  const finish = msg => {
    rebuildExMap();
    save();
    afterPop = () => { renderCalendar(); toast(msg); };
    goBack();
  };
  $('impMerge').onclick = () => {
    let added = 0;
    Object.keys(next.days).forEach(k => { if (!db.days[k]) { db.days[k] = next.days[k]; added++; } });
    next.custom.forEach(c => { if (!db.custom.some(x => x.id === c.id)) db.custom.push(c); });
    next.favs.forEach(id => { if (db.favs.indexOf(id) < 0) db.favs.push(id); });
    Object.keys(next.units).forEach(k => { if (!(k in db.units)) db.units[k] = next.units[k]; });
    Object.keys(next.rest).forEach(k => { if (!(k in db.rest)) db.rest[k] = next.rest[k]; });
    finish(added + '일 기록을 더했어요' + (nDays - added ? ' (겹친 ' + (nDays - added) + '일은 그대로)' : ''));
  };
  $('impReplace').onclick = () => {
    if (!confirm('지금 기록을 모두 지우고 백업으로 바꿀까요? 되돌릴 수 없어요.')) return;
    db = next;
    finish('백업으로 바꿨어요');
  };
}

/* ───────── 시작 ───────── */
history.replaceState({ depth: 0 }, '');
renderCalendar();
document.addEventListener('visibilitychange', () => { if (!document.hidden && !stack.length) renderCalendar(); });

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
