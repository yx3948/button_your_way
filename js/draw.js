// draw.js
// Manages the live button display with drag support.
// Depends on: button.js

let sequence     = [];
let patterns     = [];
let currentCfg   = 'nine';
let currentColor = '#111111';

const buttonsRow = document.getElementById('buttonsRow');
const hint       = document.getElementById('hint');

const BTN_DISPLAY = 100; // px — must match CSS width/height of canvas
const GAP         = 8;

// drag state
let dragEl    = null;
let dragOffX  = 0;
let dragOffY  = 0;
let dragIdx   = -1;

// ── layout helper — places buttons in a row initially ────────────
function getInitialPosition(index) {
  const container = buttonsRow.getBoundingClientRect();
  const perRow    = Math.floor((container.width || window.innerWidth * 0.9) / (BTN_DISPLAY + GAP));
  const col       = index % perRow;
  const row       = Math.floor(index / perRow);
  return {
    x: col * (BTN_DISPLAY + GAP),
    y: row * (BTN_DISPLAY + GAP),
  };
}

function rebuildAll() {
  buttonsRow.innerHTML = '';
  if (sequence.length === 0) { hint.style.display = 'block'; return; }
  hint.style.display = 'none';
  sequence.forEach((item, i) => {
    if (!item.x && !item.y) {
      const pos = getInitialPosition(i);
      item.x = pos.x;
      item.y = pos.y;
    }
    buttonsRow.appendChild(_makeCell(item, i));
  });
}

function appendCell(item) {
  hint.style.display = 'none';
  const i   = sequence.length - 1;
  const pos = getInitialPosition(i);
  item.x    = pos.x;
  item.y    = pos.y;
  buttonsRow.appendChild(_makeCell(item, i));
}

function removeLastCell() {
  const cells = buttonsRow.querySelectorAll('.btn-cell');
  if (cells.length > 0) cells[cells.length - 1].remove();
  if (sequence.length === 0) hint.style.display = 'block';
}

function clearDisplay() {
  buttonsRow.innerHTML = '';
  hint.style.display = 'block';
}

// ── create one button cell ────────────────────────────────────────
function _makeCell(item, idx) {
  if (item.char === ' ') return document.createElement('div'); // skip spaces visually

  const cell          = document.createElement('div');
  cell.className      = 'btn-cell';
  cell.style.left     = item.x + 'px';
  cell.style.top      = item.y + 'px';
  cell.dataset.idx    = idx;

  const canvas   = document.createElement('canvas');
  canvas.width   = RENDER_SIZE;
  canvas.height  = RENDER_SIZE;
  cell.appendChild(canvas);

  const patImg = patterns.length > 0 ? patterns[item.patIdx] : null;
  renderButton(canvas, item.char, patImg, currentCfg, currentColor);

  // drag events
  cell.addEventListener('mousedown', onMouseDown);
  cell.addEventListener('touchstart', onTouchStart, { passive: false });

  return cell;
}

// ── drag — mouse ──────────────────────────────────────────────────
function onMouseDown(e) {
  e.preventDefault();
  startDrag(e.currentTarget, e.clientX, e.clientY);
}

document.addEventListener('mousemove', e => {
  if (!dragEl) return;
  moveDrag(e.clientX, e.clientY);
});

document.addEventListener('mouseup', () => endDrag());

// ── drag — touch ──────────────────────────────────────────────────
function onTouchStart(e) {
  e.preventDefault();
  const t = e.touches[0];
  startDrag(e.currentTarget, t.clientX, t.clientY);
}

document.addEventListener('touchmove', e => {
  if (!dragEl) return;
  e.preventDefault();
  const t = e.touches[0];
  moveDrag(t.clientX, t.clientY);
}, { passive: false });

document.addEventListener('touchend', () => endDrag());

// ── drag logic ────────────────────────────────────────────────────
function startDrag(el, clientX, clientY) {
  dragEl  = el;
  dragIdx = parseInt(el.dataset.idx);
  const rect = el.getBoundingClientRect();
  dragOffX = clientX - rect.left;
  dragOffY = clientY - rect.top;
  el.style.zIndex = 999;
  el.style.opacity = '0.85';
}

function moveDrag(clientX, clientY) {
  const containerRect = buttonsRow.getBoundingClientRect();
  const x = clientX - containerRect.left - dragOffX;
  const y = clientY - containerRect.top  - dragOffY;
  dragEl.style.left = x + 'px';
  dragEl.style.top  = y + 'px';
  // update stored position
  sequence[dragIdx].x = x;
  sequence[dragIdx].y = y;
}

function endDrag() {
  if (!dragEl) return;
  dragEl.style.zIndex = '';
  dragEl.style.opacity = '1';
  dragEl  = null;
  dragIdx = -1;
}