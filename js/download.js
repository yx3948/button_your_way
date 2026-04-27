// download.js
// Depends on: draw.js, button.js

document.getElementById('downloadBtn').addEventListener('click', () => {
  const area = document.getElementById('displayArea');
  const aRect = area.getBoundingClientRect();
  const W = Math.round(aRect.width);
  const H = Math.round(aRect.height);
  const btnSize = BTN_DISPLAY;

  const exp = document.createElement('canvas');
  exp.width = W;
  exp.height = H;
  const ctx = exp.getContext('2d');

  const drawButtons = () => {
    const cells = area.querySelectorAll('.btn-cell');
    cells.forEach(cell => {
      const idx = parseInt(cell.dataset.idx);
      const item = sequence[idx];
      if (!item) return;

      // get center point from screen
      const cRect = cell.getBoundingClientRect();
      const cx = cRect.left + cRect.width / 2 - aRect.left;
      const cy = cRect.top + cRect.height / 2 - aRect.top;
      const rot = (item.rotation || 0) * Math.PI / 180;

      const tmp = document.createElement('canvas');
      tmp.width = RENDER_SIZE;
      tmp.height = RENDER_SIZE;
      const patImg = patterns.length > 0 ? patterns[item.patIdx] : null;
      renderButton(tmp, item.char, patImg, currentCfg, currentColor);

      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.drawImage(tmp, -btnSize / 2, -btnSize / 2, btnSize, btnSize);
      ctx.restore();
    });

    // save
    const now = new Date();
    const date = [
      now.getFullYear(),
      String(now.getMonth() + 1).padStart(2, '0'),
      String(now.getDate()).padStart(2, '0'),
    ].join('-') + '_' + [
      String(now.getHours()).padStart(2, '0'),
      String(now.getMinutes()).padStart(2, '0'),
    ].join('');

    const a = document.createElement('a');
    a.download = `buttonsyourway_${date}.png`;
    a.href = exp.toDataURL('image/png');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const bgStyle = area.style.backgroundImage;
  const bgUrl = bgStyle && bgStyle !== 'none'
    ? bgStyle.replace(/^url\(["']?/, '').replace(/["']?\)$/, '')
    : null;

  if (bgUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const ratio = Math.max(W / img.width, H / img.height);
      const newW = img.width * ratio;
      const newH = img.height * ratio;
      ctx.drawImage(img, (W - newW) / 2, (H - newH) / 2, newW, newH);
      drawButtons();
    };
    img.onerror = () => {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, W, H);
      drawButtons();
    };
    img.src = bgUrl;
  } else {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    drawButtons();
  }
});