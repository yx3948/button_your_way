// input.js
const textInput = document.getElementById('textInput');

const PATTERN_COUNT = 26;

(async () => {
  const results = await Promise.all(
    Array.from({ length: PATTERN_COUNT }, (_, i) =>
      new Promise(resolve => {
        const img = new Image();
        img.onload  = () => resolve(img);
        img.onerror = () => resolve(null);
        img.src = `assets/${i + 1}.jpg`;
      })
    )
  );
  patterns = results.filter(img => img !== null);
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

// ── preset backgrounds ────────────────────
document.getElementById('bgTabs').addEventListener('click', e => {
  const btn = e.target.closest('[data-bg]');
  if (!btn) return;
  document.querySelectorAll('#bgTabs .toggle').forEach(b => b.classList.remove('on'));
  btn.classList.add('on');
  const val  = btn.dataset.bg;
  const area = document.getElementById('displayArea');
  if (val === 'none') {
    area.style.backgroundImage = 'none';
  } else {
    area.style.backgroundImage    = `url(${val})`;
    area.style.backgroundSize     = 'cover';
    area.style.backgroundPosition = 'center';
  }
});

// ── upload background ─────────────────────
let uploadCount = 0;
const MAX_UPLOADS = 5;

document.getElementById('bgUpload').addEventListener('change', e => {
  const file = e.target.files[0];
  if (!file || uploadCount >= MAX_UPLOADS) return;

  const url  = URL.createObjectURL(file);
  const area = document.getElementById('displayArea');
  area.style.backgroundImage    = `url(${url})`;
  area.style.backgroundSize     = 'cover';
  area.style.backgroundPosition = 'center';
  document.querySelectorAll('#bgTabs .toggle').forEach(b => b.classList.remove('on'));

  // insert new thumbnail before the + label
  const uploadLabel = document.querySelector('label[for="bgUpload"]');
  const newBtn      = document.createElement('button');
  newBtn.className  = 'toggle thumb-btn on';
  newBtn.dataset.bg = url;
  newBtn.style.backgroundImage    = `url(${url})`;
  newBtn.style.backgroundSize     = 'cover';
  newBtn.style.backgroundPosition = 'center';
  document.getElementById('bgTabs').insertBefore(newBtn, uploadLabel);

  // clicking thumbnail switches background
  newBtn.addEventListener('click', () => {
    document.querySelectorAll('#bgTabs .toggle').forEach(b => b.classList.remove('on'));
    newBtn.classList.add('on');
    area.style.backgroundImage    = `url(${url})`;
    area.style.backgroundSize     = 'cover';
    area.style.backgroundPosition = 'center';
  });

  uploadCount++;
  if (uploadCount >= MAX_UPLOADS) {
    uploadLabel.style.display = 'none';
  }

  // reset so same file can be re-uploaded
  e.target.value = '';
});

// ── click display → focus input ───────────
document.getElementById('displayArea').addEventListener('click', () => textInput.focus());
textInput.focus();