// draw.js
// Manages the live button row display.
// Depends on: button.js

let sequence     = [];   // [{ char, patIdx }]
let patterns     = [];   // loaded Image objects
let currentCfg   = 'four';
let currentColor = '#111111';

const buttonsRow = document.getElementById('buttonsRow');
const hint       = document.getElementById('hint');

function rebuildAll() {
  buttonsRow.innerHTML = '';
  if (sequence.length === 0) { hint.style.display = 'block'; return; }
  hint.style.display = 'none';
  sequence.forEach(item => buttonsRow.appendChild(_makeCell(item)));
}

function appendCell(item) {
  hint.style.display = 'none';
  buttonsRow.appendChild(_makeCell(item));
}

function removeLastCell() {
  const cells = buttonsRow.children;
  if (cells.length > 0) cells[cells.length - 1].remove();
  if (sequence.length === 0) hint.style.display = 'block';
}

function clearDisplay() {
  buttonsRow.innerHTML = '';
  hint.style.display = 'block';
}

function _makeCell(item) {
  const cell = document.createElement('div');
  if (item.char === ' ') {
    cell.className = 'btn-space';
    return cell;
  }
  cell.className = 'btn-cell';
  const canvas  = document.createElement('canvas');
  canvas.width  = RENDER_SIZE;
  canvas.height = RENDER_SIZE;
  cell.appendChild(canvas);
  const patImg = patterns.length > 0 ? patterns[item.patIdx] : null;
  renderButton(canvas, item.char, patImg, currentCfg, currentColor);
  return cell;
}
