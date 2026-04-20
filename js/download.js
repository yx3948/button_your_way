// download.js
// Depends on: draw.js, button.js

document.getElementById('downloadBtn').addEventListener('click', () => {
    const area = document.getElementById('displayArea');
    const W = area.offsetWidth;
    const H = area.offsetHeight;
    const exp = document.createElement('canvas');
    exp.width = W;
    exp.height = H;
    const ctx = exp.getContext('2d');

    const finish = () => {
        const cells = area.querySelectorAll('.btn-cell');
        cells.forEach(cell => {
            const canvas = cell.querySelector('canvas');
            const rect = cell.getBoundingClientRect();
            const aRect = area.getBoundingClientRect();
            const x = rect.left - aRect.left;
            const y = rect.top - aRect.top;
            const idx = parseInt(cell.dataset.idx);
            const rot = (sequence[idx]?.rotation || 0) * Math.PI / 180;
            const cx = x + rect.width / 2;
            const cy = y + rect.height / 2;
            ctx.save();
            ctx.translate(cx, cy);
            ctx.rotate(rot);
            ctx.drawImage(canvas, -rect.width / 2, -rect.height / 2, rect.width, rect.height);
            ctx.restore();
        });

        const a = document.createElement('a');
        a.download = `buttonyourway_${Date.now()}.png`;
        a.href = exp.toDataURL('image/png');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // draw background if set
    const bgStyle = area.style.backgroundImage;
    const bgUrl = bgStyle && bgStyle !== 'none'
        ? bgStyle.replace(/^url\(["']?/, '').replace(/["']?\)$/, '')
        : null;

    if (bgUrl) {
        const img = new Image();
        img.onload = () => { ctx.drawImage(img, 0, 0, W, H); finish(); };
        img.onerror = () => { ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, W, H); finish(); };
        img.src = bgUrl;
    } else {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, W, H);
        finish();
    }
    document.getElementById('downloadBtn').addEventListener('click', () => {
  console.log('download clicked');
  // ... 其余代码
});