// download.js
// Depends on: draw.js, button.js

document.getElementById('downloadBtn').addEventListener('click', () => {
  const area = document.getElementById('displayArea');
  const row  = document.getElementById('buttonsRow');
  const W    = area.offsetWidth;
  const H    = area.offsetHeight;
  const exp  = document.createElement('canvas');
  exp.width  = W;
  exp.height = H;
  const ctx  = exp.getContext('2d');

  const btnSize = 100; // must match CSS width/height of .btn-cell

  const finish = () => {
    // offset of buttonsRow within displayArea
    const aRect = area.getBoundingClientRect();
    const rRect = row.getBoundingClientRect();
    const offX  = rRect.left - aRect.left;
    const offY  = rRect.top  - aRect.top;

    const cells = area.querySelectorAll('.btn-cell');
    cells.forEach(cell => {
      const idx  = parseInt(cell.dataset.idx);
      const item = sequence[idx];
      if (!item) return;

      // item.x/y is relative to buttonsRow, add offset for displayArea
      const x   = item.x + offX;
      const y   = item.y + offY;
      const rot = (item.rotation || 0) * Math.PI / 180;
      const cx  = x + btnSize / 2;
      const cy  = y + btnSize / 2;

      // re-render fresh canvas to avoid taint
      const tmp    = document.createElement('canvas');
      tmp.width    = RENDER_SIZE;
      tmp.height   = RENDER_SIZE;
      const patImg = patterns.length > 0 ? patterns[item.patIdx] : null;
      renderButton(tmp, item.char, patImg, currentCfg, currentColor);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.drawImage(tmp, -btnSize / 2, -btnSize / 2, btnSize, btnSize);
      ctx.restore();
    });

    // readable date filename
    const now  = new Date();
    const date = now.getFullYear() + '-'
      + String(now.getMonth() + 1).padStart(2, '0') + '-'
      + String(now.getDate()).padStart(2, '0') + '_'
      + String(now.getHours()).padStart(2, '0')
      + String(now.getMinutes()).padStart(2, '0');

    const a    = document.createElement('a');
    a.download = `buttonyourway_${date}.png`;
    a.href     = exp.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // draw background using "cover" logic (matches CSS background-size: cover)
  const bgStyle = area.style.backgroundImage;
  const bgUrl   = bgStyle && bgStyle !== 'none'
    ? bgStyle.replace(/^url\(["']?/, '').replace(/["']?\)$/, '')
    : null;

  if (bgUrl) {
    const img       = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const iw    = img.naturalWidth;
      const ih    = img.naturalHeight;
      const scale = Math.max(W / iw, H / ih);
      const dw    = iw * scale;
      const dh    = ih * scale;
      const dx    = (W - dw) / 2;
      const dy    = (H - dh) / 2;
      ctx.drawImage(img, dx, dy, dw, dh);
      finish();
    };
    img.onerror = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      finish();
    };
    img.src = bgUrl;
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    finish();
  }
});