// button.js
// Hole position configs + renderButton()

const HOLES = {
  four: {
    r: 0.10,
    pts: [{x:.32,y:.36},{x:.68,y:.36},{x:.32,y:.64},{x:.68,y:.64}],
  },
  six: {
    r: 0.09,
    pts: [{x:.33,y:.22},{x:.67,y:.22},{x:.33,y:.50},{x:.67,y:.50},{x:.33,y:.78},{x:.67,y:.78}],
  },
  nine: {
    r: 0.07,
    pts: [
      {x:.2,y:.2},{x:.5,y:.2},{x:.8,y:.2},
      {x:.2,y:.5},{x:.5,y:.5},{x:.8,y:.5},
      {x:.2,y:.8},{x:.5,y:.8},{x:.8,y:.8},
    ],
  },
};

const RENDER_SIZE = 80;

function renderButton(canvas, char, patImg, cfgKey, threadCol) {
  const W   = RENDER_SIZE;
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, W);

  const cx  = W / 2;
  const cy  = W / 2;
  const R   = W * 0.46;
  const cfg = HOLES[cfgKey];
  const hR  = R * cfg.r;
  const pts = cfg.pts.map(h => ({
    x: cx + (h.x - 0.5) * R * 1.62,
    y: cy + (h.y - 0.5) * R * 1.62,
  }));

  const key  = char.toUpperCase();
  const segs = THREADS[cfgKey][key] || [];
  const tW   = W * 0.085;

  // clip everything to circle
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.clip();

  // 1. pattern or plain fill
  if (patImg) {
    const iw = patImg.naturalWidth;
    const ih = patImg.naturalHeight;
    const sc = Math.max((R * 2) / iw, (R * 2) / ih) * 1.1;
    ctx.drawImage(patImg, cx - (iw * sc) / 2, cy - (ih * sc) / 2, iw * sc, ih * sc);
  } else {
    ctx.fillStyle = '#c8bfb0';
    ctx.fillRect(0, 0, W, W);
  }

  // // 2. vignette overlay
  // const vig = ctx.createRadialGradient(cx, cy - R * 0.1, R * 0.1, cx, cy, R);
  // vig.addColorStop(0,    'rgba(255,255,255,0.06)');
  // vig.addColorStop(0.65, 'rgba(0,0,0,0)');
  // vig.addColorStop(1,    'rgba(0,0,0,0.28)');
  // ctx.fillStyle = vig;
  // ctx.fillRect(0, 0, W, W);

  // 3. edge ring
  ctx.beginPath();
  ctx.arc(cx, cy, R - tW * 0.5, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(213, 213, 213, 0.35)';
  ctx.lineWidth   = tW * 0.65;
  ctx.stroke();

  // 4. threads
  ctx.lineCap = 'round';
  segs.forEach(([a, b], i) => {
    if (a === b) return; // dots handled below
    const p1  = pts[a];
    const p2  = pts[b];
    const dx  = p2.x - p1.x;
    const dy  = p2.y - p1.y;
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const t   = ((a * 7 + b * 11 + i * 5) % 13 - 6) * (W * 0.025);
    const cpx = (p1.x + p2.x) / 2 + (-dy / len) * t;
    const cpy = (p1.y + p2.y) / 2 + ( dx / len) * t;

    // shadow
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(cpx, cpy, p2.x, p2.y);
    ctx.strokeStyle = 'rgb(166, 166, 166)';
    ctx.lineWidth   = tW * 1.4;
    ctx.stroke();

    // body
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(cpx, cpy, p2.x, p2.y);
    ctx.strokeStyle = threadCol;
    ctx.lineWidth   = tW;
    ctx.stroke();

  //    highlight
    ctx.beginPath(); ctx.moveTo(p1.x, p1.y);
    ctx.quadraticCurveTo(cpx + 0.4, cpy - 0.4, p2.x, p2.y);
    ctx.strokeStyle = 'rgba(216, 216, 216, 0.9)';
    ctx.lineWidth   = tW * 0.35;
    ctx.stroke();
  });

  // 5. dot anchors [n, n]
  segs.forEach(([a, b]) => {
    if (a !== b) return;
    const h = pts[a];
    ctx.beginPath();
    ctx.arc(h.x, h.y, hR * 0.42, 0, Math.PI * 2);
    ctx.fillStyle = threadCol;
    ctx.fill();
  });

  // 6. punch holes — transparent cut-out
  ctx.globalCompositeOperation = 'destination-out';
  pts.forEach(h => {
    ctx.beginPath();
    ctx.arc(h.x, h.y, hR, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.fill();
  });

  ctx.restore();
}
