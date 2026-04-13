// input.js
// Text input, hole/colour toggles.
// Auto-loads patterns from assets
// Depends on: draw.js

const textInput = document.getElementById('textInput');
// const patStatus = document.getElementById('patStatus');

const PATTERN_COUNT = 26;

(async () => {
  const results = await Promise.all(
    Array.from({ length: PATTERN_COUNT }, (_, i) =>
      new Promise(resolve => {
        const img = new Image();
        img.onload  = () => resolve(img);
        img.onerror = () => resolve(null);  // skip missing files
        img.src = `assets/${i + 1}.jpg`;
      })
    )
  );

  patterns = results.filter(img => img !== null);
  // patStatus.textContent = patterns.length > 0
  //   ? `${patterns.length} patterns`
  //   : 'no patterns found';

  textInput.focus();
})();

// ── typing ────────────────────────────────
textInput.addEventListener('input', () => {
  const newText = textInput.value;
  const diff    = newText.length - sequence.length;

  if (diff > 0) {
    for (let i = sequence.length; i < newText.length; i++) {
      const item = {
        char:   newText[i],
        patIdx: patterns.length > 0 ? Math.floor(Math.random() * patterns.length) : 0,
      };
      sequence.push(item);
      appendCell(item);
    }
  } else if (diff < 0) {
    for (let i = 0; i < -diff; i++) {
      sequence.pop();
      removeLastCell();
    }
  }
});

// document.getElementById('clearBtn').addEventListener('click', () => {
//   textInput.value = '';
//   sequence = [];
//   clearDisplay();
// });

// ── hole config ───────────────────────────
document.getElementById('holeTabs').addEventListener('click', e => {
  const btn = e.target.closest('[data-cfg]');
  if (!btn) return;
  document.querySelectorAll('#holeTabs .toggle').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  currentCfg = btn.dataset.cfg;
  rebuildAll();
});

// ── thread colour ─────────────────────────
document.getElementById('colorWheel').addEventListener('input', e => {
  currentColor = e.target.value;
  document.getElementById('colorSwatch').style.background = e.target.value;
  rebuildAll();
});

// click display → focus input
document.getElementById('displayArea').addEventListener('click', () => textInput.focus());
