// button.js
// Hole position configs + renderButton()

const HOLES = {
  four: {
    r: 0.10,
    pts: [{ x: .32, y: .36 }, { x: .68, y: .36 }, { x: .32, y: .64 }, { x: .68, y: .64 }],
  },
  six: {
    r: 0.09,
    pts: [{ x: .33, y: .22 }, { x: .67, y: .22 }, { x: .33, y: .50 }, { x: .67, y: .50 }, { x: .33, y: .78 }, { x: .67, y: .78 }],
  },
  nine: {
    r: 0.07,
    pts: [
      { x: .2, y: .2 }, { x: .5, y: .2 }, { x: .8, y: .2 },
      { x: .2, y: .5 }, { x: .5, y: .5 }, { x: .8, y: .5 },
      { x: .2, y: .8 }, { x: .5, y: .8 }, { x: .8, y: .8 },
    ],
  },
};

const RENDER_SIZE = 120; // larger canvas = room for shadow to bleed
const silhouetteBg = new Image();
silhouetteBg.src = 'assets/grey.jpeg';  // 换成你的图片路径




function renderButton(canvas, char, patImg, cfgKey, threadCol) {
  const W = RENDER_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, W);

  const cx = W / 2;
  const cy = W / 2;
  const R = W * 0.46; // scales with W so visual size stays same
  const cfg = HOLES[cfgKey];
  const hR = R * cfg.r;
  const pts = cfg.pts.map(h => ({
    x: cx + (h.x - 0.5) * R * 1.62,
    y: cy + (h.y - 0.5) * R * 1.62,
  }));

  const key = char.toUpperCase();
  const segs = THREADS[cfgKey][key] || [];
  const tW = W * 0.085;

  // ── clip and draw everything inside ──────
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();


  // 1. pattern or plain fill
  if (patImg) {
    ctx.filter = 'brightness(1.3)';
    const iw = patImg.naturalWidth;
    const ih = patImg.naturalHeight;
    const sc = Math.max((R * 2) / iw, (R * 2) / ih) * 1.1;
    ctx.drawImage(patImg, cx - (iw * sc) / 2, cy - (ih * sc) / 2, iw * sc, ih * sc);
    ctx.filter = 'none';
  } else {
    ctx.fillStyle = '#c8bfb0';
    ctx.fillRect(0, 0, W, W);
  }

  // 2. edge ring
  ctx.beginPath();
  ctx.arc(cx, cy, R - tW * 0.5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(213, 213, 213, 0.15)';
  ctx.lineWidth = tW * 0.65;
  ctx.stroke();

  // 3. threads
  ctx.lineCap = 'round';
  segs.forEach(([a, b], i) => {
    if (a === b) return;
    const p1 = pts[a];
    const p2 = pts[b];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const t = ((a * 7 + b * 11 + i * 5) % 13 - 6) * (W * 0.008);
    const cpx = (p1.x + p2.x) / 2 + (-dy / len) * t;
    const cpy = (p1.y + p2.y) / 2 + (dx / len) * t;

    // shadow
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(cpx, cpy, p2.x, p2.y);
    ctx.strokeStyle = 'rgb(166, 166, 166)';
    ctx.lineWidth = tW * 1.4;
    ctx.stroke();

    // body
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(cpx, cpy, p2.x, p2.y);
    ctx.strokeStyle = threadCol;
    ctx.lineWidth = tW;
    ctx.stroke();

    // highlight
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(cpx + 0.4, cpy - 0.4, p2.x, p2.y);
    ctx.strokeStyle = 'rgba(216, 216, 216, 0.9)';
    ctx.lineWidth = tW * 0.35;
    ctx.stroke();
  });

  // 4. dot anchors [n, n]
  segs.forEach(([a, b]) => {
    if (a !== b) return;
    const h = pts[a];
    ctx.beginPath();
    ctx.arc(h.x, h.y, hR * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = threadCol;
    ctx.fill();
  });

  // 5. punch holes
  ctx.globalCompositeOperation = 'destination-out';
  pts.forEach(h => {
    ctx.beginPath();
    ctx.arc(h.x, h.y, hR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fill();
  });

  // // 6. vignette
  // ctx.globalCompositeOperation = 'source-over';
  // const vig = ctx.createRadialGradient(cx, cy, R * 0.6, cx, cy, R);
  // vig.addColorStop(0, 'rgba(0,0,0,0)');
  // vig.addColorStop(1, 'rgba(0,0,0,0.18)');
  // ctx.fillStyle = vig;
  // ctx.fillRect(0, 0, W, W);

  ctx.restore();
  ctx.restore();

  ctx.globalCompositeOperation = 'destination-over';
  ctx.shadowColor = 'rgba(255, 255, 255, 0.83)';
  ctx.shadowBlur = 10;
  ctx.shadowOffsetX = 2;
  ctx.shadowOffsetY = 2;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.globalCompositeOperation = 'source-over';
}

// ════════════════════════════════════════════════════════════════
//  STYLE 2
// ════════════════════════════════════════════════════════════════
function renderButtonSilhouette(canvas, char, patImg, cfgKey, threadCol) {
  const W = RENDER_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, W);

  const cx = W / 2;
  const cy = W / 2;
  const R = W * 0.46;
  const cfg = HOLES[cfgKey];
  const hR = R * cfg.r;
  const pts = cfg.pts.map(h => ({
    x: cx + (h.x - 0.5) * R * 1.62,
    y: cy + (h.y - 0.5) * R * 1.62,
  }));

  const key = char.toUpperCase();
  const segs = THREADS[cfgKey][key] || [];

  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  // 1. silhouette background image
  if (silhouetteBg.complete && silhouetteBg.naturalWidth > 0) {
    const iw = silhouetteBg.naturalWidth;
    const ih = silhouetteBg.naturalHeight;
    const sc = Math.max((R * 2) / iw, (R * 2) / ih) * 1.1;
    ctx.drawImage(silhouetteBg, cx - (iw * sc) / 2, cy - (ih * sc) / 2, iw * sc, ih * sc);
  } else {
    ctx.fillStyle = '#cdc6ba';
    ctx.fillRect(0, 0, W, W);
  }

  // 3. threads — clean single-weight lines
  ctx.lineCap = 'round';
  const tW = W * 0.045;
  segs.forEach(([a, b], i) => {
    if (a === b) return;
    const p1 = pts[a];
    const p2 = pts[b];
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const t = ((a * 7 + b * 11 + i * 5) % 13 - 6) * (W * 0.005);
    const cpx = (p1.x + p2.x) / 2 + (-dy / len) * t;
    const cpy = (p1.y + p2.y) / 2 + (dx / len) * t;

    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(cpx, cpy, p2.x, p2.y);
    ctx.strokeStyle = threadCol;
    ctx.lineWidth = tW;
    ctx.stroke();
  });

  // 4. holes — solid dark dots
  pts.forEach(h => {
    ctx.beginPath();
    ctx.arc(h.x, h.y, hR * 0.85, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a';
    ctx.fill();
  });

  ctx.restore();

  // 5. bold dark outline
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.strokeStyle = '#1a1a1a';
  ctx.lineWidth = 1;
  ctx.stroke();

  // 6. subtle shadow
  ctx.globalCompositeOperation = 'destination-over';
  ctx.shadowColor = 'rgba(0, 0, 0, 0.12)';
  ctx.shadowBlur = 5;
  ctx.shadowOffsetX = 1.5;
  ctx.shadowOffsetY = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0,0,0,0)';
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.globalCompositeOperation = 'source-over';
}

// ════════════════════════════════════════════════════════════════
//  DISPATCHER
// ════════════════════════════════════════════════════════════════
function renderCurrentStyle(canvas, char, patImg, cfgKey, threadCol, style) {
  if (style === 'silhouette') {
    renderButtonSilhouette(canvas, char, patImg, cfgKey, threadCol);
  } else {
    renderButton(canvas, char, patImg, cfgKey, threadCol);
  }
}