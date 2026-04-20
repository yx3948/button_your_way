// download.js
// Depends on: draw.js, button.js
document.getElementById('downloadBtn').addEventListener('click', () => {
  console.log('clicked', sequence.length, patterns.length, currentCfg, currentColor);
});

document.getElementById('downloadBtn').addEventListener('click', () => {
  const area = document.getElementById('displayArea');
  const W    = area.offsetWidth;
  const H    = area.offsetHeight;

  const finish = (ctx, exp) => {
    const cells  = area.querySelectorAll('.btn-cell');
    const aRect  = area.getBoundingClientRect();

    cells.forEach(cell => {
      const rect = cell.getBoundingClientRect();
      const x    = rect.left - aRect.left;
      const y    = rect.top  - aRect.top;
      const idx  = parseInt(cell.dataset.idx);
      const item = sequence[idx];
      if (!item) return;

      const rot = (item.rotation || 0) * Math.PI / 180;
      const cx  = x + rect.width  / 2;
      const cy  = y + rect.height / 2;

      // re-render fresh canvas to avoid taint
      const tmp    = document.createElement('canvas');
      tmp.width    = RENDER_SIZE;
      tmp.height   = RENDER_SIZE;
      const patImg = patterns.length > 0 ? patterns[item.patIdx] : null;
      renderButton(tmp, item.char, patImg, currentCfg, currentColor);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.drawImage(tmp, -rect.width / 2, -rect.height / 2, rect.width, rect.height);
      ctx.restore();
    });

    const a    = document.createElement('a');
    a.download = `buttonyourway_${Date.now()}.png`;
    a.href     = exp.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // always create fresh canvas
  const exp = document.createElement('canvas');
  exp.width  = W;
  exp.height = H;
  const ctx  = exp.getContext('2d');

  // draw background
  const bgStyle = area.style.backgroundImage;
  const bgUrl   = bgStyle && bgStyle !== 'none'
    ? bgStyle.replace(/^url\(["']?/, '').replace(/["']?\)$/, '')
    : null;

  if (bgUrl) {
    const img      = new Image();
    img.crossOrigin = 'anonymous';
    img.onload  = () => { ctx.drawImage(img, 0, 0, W, H); finish(ctx, exp); };
    img.onerror = () => { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H); finish(ctx, exp); };
    img.src = bgUrl;
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    finish(ctx, exp);
  }
});