/* IronLog — 웨이트 트레이닝 기록 (1단계: 달력 · 하루 기록 · 운동 추가 · 세트 입력) */
'use strict';

const APP_VERSION = '0.1.0';
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
function emptyDb() { return { version: 1, days: {}, custom: [] }; }
function normalize(o) {
  if (!o || typeof o !== 'object') o = {};
  const db = { version: 1, days: {}, custom: Array.isArray(o.custom) ? o.custom : [] };
  const days = (o.days && typeof o.days === 'object') ? o.days : {};
  Object.keys(days).forEach(k => {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k)) return;
    const d = days[k] || {};
    db.days[k] = {
      minutes: typeof d.minutes === 'number' ? d.minutes : null,
      items: Array.isArray(d.items) ? d.items.filter(it => it && it.ex).map(it => ({
        id: it.id || uid(), ex: it.ex, memo: it.memo || '',
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
function setVolume(ex, s) { return ex.type === 'weight_reps' ? num(s.w) * num(s.r) : 0; }

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
      st.planned++;
      if (!s.done) return;
      st.sets++;
      st.parts[ex.part] = (st.parts[ex.part] || 0) + 1;
      st.vol += setVolume(ex, s);
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
      if (done.length) return { date: k, sets: done };
    }
  }
  return null;
}
function fmtSet(type, s) {
  const v = f => (s[f] == null || s[f] === '') ? '-' : fmt(s[f]);
  if (type === 'weight_reps') return v('w') + '×' + v('r');
  if (type === 'reps') return v('r') + '회';
  if (type === 'time') return v('sec') + '초';
  return v('min') + '분' + (s.km != null && s.km !== '' ? ' ' + fmt(s.km) + 'km' : '');
}
function cloneSetAsPlan(type, s) {
  const o = { done: false };
  FIELDS[type].forEach(f => { o[f[0]] = s[f[0]] == null ? null : s[f[0]]; });
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
window.addEventListener('popstate', () => {
  const el = stack.pop();
  if (el) {
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
    const done = it.sets.filter(s => s.done).length;
    const setsTxt = it.sets.map(s => '<span class="' + (s.done ? '' : 'plan') + '">' + esc(fmtSet(ex.type, s)) + '</span>').join(' · ');
    html += '<div class="card" style="--pc:' + (PART_COLOR[ex.part] || PART_COLOR['기타']) + '">' +
      '<button class="card-main" data-act="open" data-id="' + it.id + '">' +
      '<div class="card-title">' + esc(ex.name) + '</div>' +
      '<div class="card-meta"><span class="badge">' + esc(ex.part) + '</span><span class="badge">' + esc(ex.equip) + '</span>' +
      '<span class="progress' + (done ? '' : ' zero') + '">✔ ' + done + ' / ' + it.sets.length + ' 세트</span></div>' +
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
    tday.items.push({ id: uid(), ex: it.ex, memo: '', sets: src.map(s => cloneSetAsPlan(ex.type, s)) });
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

/* ───────── 운동 추가 ───────── */
let pickerPart = '전체';
function openPicker() {
  pickerPart = '전체';
  $('pickerSearch').value = '';
  renderPicker();
  openLayer($('pickerView'));
  $('pickerList').scrollTop = 0;
}
function lastByExercise() {
  const map = {};
  Object.keys(db.days).sort().forEach(k => {
    db.days[k].items.forEach(it => {
      const done = it.sets.filter(s => s.done);
      if (done.length) map[it.ex] = { date: k, set: done[done.length - 1] };
    });
  });
  return map;
}
function renderPicker() {
  $('pickerChips').innerHTML = ['전체'].concat(PARTS).map(p =>
    '<button class="chip' + (p === pickerPart ? ' on' : '') + '" data-part="' + p + '">' + p + '</button>').join('');

  const q = $('pickerSearch').value.trim().toLowerCase().replace(/\s+/g, '');
  const all = (window.IRONLOG_EXERCISES || []).concat(db.custom);
  const match = e => {
    if (pickerPart !== '전체' && e.part !== pickerPart) return false;
    if (!q) return true;
    const hay = [e.name, e.en].concat(e.aka || []).join('|').toLowerCase().replace(/\s+/g, '');
    return hay.indexOf(q) >= 0;
  };
  const last = lastByExercise();
  const row = e => {
    const l = last[e.id];
    return '<button class="ex-row" data-ex="' + esc(e.id) + '" style="--pc:' + (PART_COLOR[e.part] || PART_COLOR['기타']) + '">' +
      '<span class="ex-dot"></span><span class="ex-name">' + esc(e.name) +
      '<small>' + esc(e.part) + ' · ' + esc(e.equip) + (e.custom ? ' · 내 종목' : '') + '</small></span>' +
      (l ? '<span class="ex-last">' + esc(fmtSet(e.type, l.set)) + '</span>' : '') + '</button>';
  };

  let html = '';
  if (!q && pickerPart === '전체') {
    const recent = Object.keys(last).sort((a, b) => last[b].date.localeCompare(last[a].date)).slice(0, 8)
      .map(id => exMap[id]).filter(Boolean);
    if (recent.length) html += '<div class="group-title">최근 한 운동</div>' + recent.map(row).join('');
  }
  const parts = pickerPart === '전체' ? PARTS : [pickerPart];
  parts.forEach(p => {
    const list = all.filter(e => e.part === p && match(e));
    if (list.length) html += '<div class="group-title">' + p + '</div>' + list.map(row).join('');
  });
  if (!html) html = '<div class="empty">찾는 종목이 없어요.<br>아래에서 직접 추가해 주세요.</div>';
  html += '<button class="ex-row add" data-act="custom">＋ 종목 직접 추가</button>';
  $('pickerList').innerHTML = html;
}
$('pickerSearch').addEventListener('input', renderPicker);
$('pickerChips').addEventListener('click', e => {
  const c = e.target.closest('.chip');
  if (!c) return;
  pickerPart = c.dataset.part;
  renderPicker();
});
$('pickerList').addEventListener('click', e => {
  if (e.target.closest('[data-act="custom"]')) return openCustomForm();
  const r = e.target.closest('.ex-row[data-ex]');
  if (r) addExercise(r.dataset.ex);
});

function addExercise(exId) {
  const ex = getEx(exId);
  const prev = prevSets(exId, curDate);
  const sets = prev ? prev.sets.map(s => cloneSetAsPlan(ex.type, s)) : [cloneSetAsPlan(ex.type, {})];
  const item = { id: uid(), ex: exId, memo: '', sets: sets };
  ensureDay(curDate).items.push(item);
  save();
  renderDay();
  curItemId = item.id;
  renderSet();
  swapTop($('setView'));
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
  openModal('<h3>종목 직접 추가</h3>' +
    '<label class="field">이름<input id="cxName" maxlength="30" value="' + esc(q) + '" placeholder="예: 스미스 머신 스쿼트"></label>' +
    '<div class="row2"><label class="field">부위<select id="cxPart">' + opt(PARTS, pickerPart === '전체' ? '가슴' : pickerPart) + '</select></label>' +
    '<label class="field">장비<select id="cxEquip">' + opt(EQUIPS, '머신') + '</select></label></div>' +
    '<div class="row2"><label class="field">기록 방식<select id="cxType">' +
    Object.keys(TYPE_LABEL).map(k => '<option value="' + k + '">' + TYPE_LABEL[k] + '</option>').join('') + '</select></label>' +
    '<label class="field">쉬는 시간(초)<input id="cxRest" inputmode="numeric" value="90"></label></div>' +
    '<div class="modal-foot"><button data-back>취소</button><button class="ok" id="cxSave">추가</button></div>');
  $('cxSave').onclick = () => {
    const name = $('cxName').value.trim();
    if (!name) { $('cxName').focus(); return; }
    const ex = {
      id: 'custom_' + uid(), name: name, en: '', aka: [], part: $('cxPart').value, equip: $('cxEquip').value,
      type: $('cxType').value, rest: Math.round(parseInput($('cxRest').value) || 90), tips: [], mistake: '', custom: true
    };
    db.custom.push(ex);
    rebuildExMap();
    save();
    afterPop = () => addExercise(ex.id);
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
    fields.map(f => '<span>' + f[1] + '</span>').join('') + '<span>✔</span></div>';
  it.sets.forEach((s, i) => {
    const p = prev && prev.sets[i];
    rows += '<div class="set-row' + (s.done ? ' done' : '') + '" data-i="' + i + '">' +
      '<span class="set-no">' + (i + 1) + '</span>' +
      '<button class="prev-btn" data-act="prev"' + (p ? '' : ' disabled') + '>' + (p ? esc(fmtSet(ex.type, p)) : '-') + '</button>' +
      fields.map(f => '<input data-f="' + f[0] + '" inputmode="decimal" enterkeyhint="next" value="' +
        (s[f[0]] == null ? '' : esc(s[f[0]])) + '" placeholder="' + esc(placeholderFor(it, prev, i, f[0])) + '">').join('') +
      '<button class="check" data-act="check" aria-label="' + (i + 1) + '세트 완료">✔</button></div>';
  });

  $('setView').innerHTML =
    '<header class="viewbar"><button class="icon-btn back" data-back aria-label="뒤로">←</button><h2>' + esc(ex.name) + '</h2></header>' +
    '<div class="scroll">' +
    '<div class="set-head"><span class="badge">' + esc(ex.part) + '</span><span class="badge">' + esc(ex.equip) + '</span>' +
    '<span class="set-stat" id="setStat"></span></div>' +
    '<div class="set-table" style="--cols:' + fields.length + '">' + rows + '</div>' +
    '<div class="set-actions"><button data-act="addSet">＋ 세트</button><button data-act="dupSet">직전 세트 복사</button>' +
    '<button class="del" data-act="removeSet">− 마지막</button></div>' +
    '<input class="memo" id="setMemo" maxlength="80" placeholder="메모 (예: 그립 넓게, 어깨 살짝 불편)" value="' + esc(it.memo) + '">' +
    '<p class="hint">' + (prev ? '이전 기록: ' + dateLabel(prev.date) + '. ' : '') +
    '“이전” 칸을 누르면 그 기록이 그대로 들어가요. 빈 칸으로 ✔ 를 누르면 흐린 숫자가 들어가요.<br>✔ 누른 세트만 달력과 통계에 반영돼요.</p>' +
    '</div>';
  updateSetStat();
}

function placeholderFor(it, prev, i, f) {
  if (i > 0 && it.sets[i - 1][f] != null) return fmt(it.sets[i - 1][f]);
  if (prev && prev.sets[i] && prev.sets[i][f] != null) return fmt(prev.sets[i][f]);
  return '';
}

function updateSetStat() {
  const it = curItem();
  if (!it || !$('setStat')) return;
  const ex = getEx(it.ex);
  const done = it.sets.filter(s => s.done);
  const vol = done.reduce((a, s) => a + setVolume(ex, s), 0);
  $('setStat').textContent = (ex.type === 'weight_reps' ? vol.toLocaleString() + 'kg · ' : '') + '✔ ' + done.length + ' / ' + it.sets.length + ' 세트';
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
  const i = rowEl ? Number(rowEl.dataset.i) : -1;
  const act = b.dataset.act;

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
    const p = prev && prev.sets[i];
    if (!p) return;
    fields.forEach(f => {
      it.sets[i][f[0]] = p[f[0]] == null ? null : p[f[0]];
      rowEl.querySelector('input[data-f="' + f[0] + '"]').value = p[f[0]] == null ? '' : fmt(p[f[0]]);
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

/* ───────── 설정 · 백업 ───────── */
$('openSettings').onclick = () => {
  const n = workoutDates().length;
  openModal('<h3>설정</h3>' +
    '<button class="menu-btn" id="exportBtn">백업 파일 내보내기<small>모든 기록을 JSON 파일로 저장해요. 가끔 해 두세요.</small></button>' +
    '<button class="menu-btn" id="importBtn">백업 파일 가져오기<small>지금 기록을 백업 파일 내용으로 바꿔요.</small></button>' +
    '<p class="hint">IronLog ' + APP_VERSION + ' · 운동한 날 ' + n + '일 · 내 종목 ' + db.custom.length + '개<br>기록은 이 폰(브라우저)에만 저장돼요.</p>' +
    '<div class="modal-foot"><button data-back>닫기</button></div>');
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
    const next = normalize(src);
    if (!confirm('백업의 운동한 날 ' + Object.keys(next.days).length + '일로 지금 기록을 바꿀까요?')) return;
    db = next;
    rebuildExMap();
    save();
    if (stack.length) goBack();
    renderCalendar();
    toast('백업을 불러왔어요');
  };
  r.readAsText(f);
});

/* ───────── 시작 ───────── */
history.replaceState({ depth: 0 }, '');
renderCalendar();
document.addEventListener('visibilitychange', () => { if (!document.hidden && !stack.length) renderCalendar(); });

if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
