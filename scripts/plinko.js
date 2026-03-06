document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('plinko-canvas');
  const ctx = canvas ? canvas.getContext('2d') : null;
  const betInput = document.getElementById('plinko-bet');
  const dropBtn = document.getElementById('drop-chip-btn');
  const autoBtn = document.getElementById('auto-drop-btn');
  const logEl = document.getElementById('plinko-log');
  const slotStrip = document.getElementById('plinko-slot-strip');
  const payoutGrid = document.getElementById('plinko-payout-grid');

  if (!canvas || !ctx || !window.vc) return;

  const rows = 24;
  const bins = rows + 1;
  const multipliers = buildRandomMultipliers(bins);
  const startLane = Math.floor(rows / 2);
  const marginX = 48;
  const topY = 64;
  const bottomY = canvas.height - 92;
  const rowGap = (bottomY - topY) / rows;
  const columnGap = (canvas.width - marginX * 2) / rows;
  const pegRadius = 5;
  const ballRadius = 7;

  const activeBalls = [];
  let animationRunning = false;
  let lastFrameTime = 0;
  let autoDropInterval = null;
  let highlightedBin = -1;

  function addLog(text) {
    if (!logEl) return;
    const row = document.createElement('div');
    row.textContent = text;
    logEl.prepend(row);
  }

  function formatMult(mult) {
    if (Number.isInteger(mult)) return mult + 'x';
    return mult.toFixed(1) + 'x';
  }

  function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  function buildRandomMultipliers(totalBins) {
    // Heavy loss skew: most bins are <1x, a handful are mild winners, very few are big hits.
    const losingPool = [0, 0.05, 0.1, 0.15, 0.2, 0.3, 0.4, 0.5, 0.65, 0.8, 0.9, 0.95];
    const smallWinPool = [1.05, 1.1, 1.2, 1.35, 1.5, 1.75, 2, 2.5, 3];
    const bigWinPool = [5, 7, 10, 15, 20, 30];

    const bigCount = Math.max(2, Math.floor(totalBins * 0.08));
    const smallWinCount = Math.max(6, Math.floor(totalBins * 0.34));
    const lossCount = Math.max(0, totalBins - bigCount - smallWinCount);

    const result = [];
    for (let i = 0; i < lossCount; i++) result.push(pickRandom(losingPool));
    for (let i = 0; i < smallWinCount; i++) result.push(pickRandom(smallWinPool));
    for (let i = 0; i < bigCount; i++) result.push(pickRandom(bigWinPool));

    return shuffle(result).slice(0, totalBins);
  }

  function buildMultiplierDisplays() {
    if (slotStrip) {
      slotStrip.innerHTML = '';
      multipliers.forEach((mult, idx) => {
        const chip = document.createElement('div');
        chip.className = 'plinko-slot-chip';
        chip.dataset.idx = String(idx);
        chip.textContent = formatMult(mult);
        slotStrip.appendChild(chip);
      });
    }

    if (payoutGrid) {
      payoutGrid.innerHTML = '';
      multipliers.forEach((mult, idx) => {
        const item = document.createElement('div');
        item.className = 'plinko-payout-item';
        item.textContent = `Bin ${idx + 1}: ${formatMult(mult)}`;
        payoutGrid.appendChild(item);
      });
    }
  }

  function drawBoard() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const grad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    grad.addColorStop(0, '#f1e8ff');
    grad.addColorStop(1, '#d6caef');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let row = 0; row <= rows; row++) {
      const y = topY + row * rowGap;
      const count = row + 1;
      const rowWidth = (count - 1) * columnGap;
      const startX = canvas.width / 2 - rowWidth / 2;
      for (let col = 0; col < count; col++) {
        const x = startX + col * columnGap;
        // Solid peg with 3D shading
        ctx.beginPath();
        ctx.arc(x, y, pegRadius, 0, Math.PI * 2);
        const pegGrad = ctx.createRadialGradient(x - 2, y - 2, 1, x, y, pegRadius);
        pegGrad.addColorStop(0, '#9b6dd7');
        pegGrad.addColorStop(1, '#3b1f5e');
        ctx.fillStyle = pegGrad;
        ctx.fill();
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    }

    const slotWidth = (canvas.width - marginX * 2) / bins;
    for (let i = 0; i < bins; i++) {
      const x = marginX + i * slotWidth;
      ctx.fillStyle = i === highlightedBin ? 'rgba(155,48,255,0.3)' : 'rgba(255,255,255,0.35)';
      ctx.fillRect(x + 2, bottomY + 10, slotWidth - 4, 52);
      ctx.strokeStyle = 'rgba(90, 70, 120, 0.35)';
      ctx.strokeRect(x + 2, bottomY + 10, slotWidth - 4, 52);

      ctx.fillStyle = '#2a1f3a';
      ctx.font = 'bold 11px Georgia, serif';
      ctx.textAlign = 'center';
      ctx.fillText(formatMult(multipliers[i]), x + slotWidth / 2, bottomY + 40);
    }

    for (let i = 0; i < activeBalls.length; i++) {
      const b = activeBalls[i];
      // Soft glow behind each ball
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y + 2, ballRadius + 4, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(155,48,255,0.18)';
      ctx.fill();
      ctx.restore();

      ctx.beginPath();
      ctx.arc(b.x, b.y, ballRadius, 0, Math.PI * 2);
      const ballGrad = ctx.createRadialGradient(
        b.x - 2, b.y - 2, 1,
        b.x, b.y, ballRadius
      );
      ballGrad.addColorStop(0, '#c084fc');
      ballGrad.addColorStop(1, '#7c22ce');
      ctx.fillStyle = ballGrad;
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }
  }

  function finishDrop(binIndex, bet) {
    const multiplier = multipliers[binIndex];
    const payout = Math.floor(bet * multiplier);
    const net = payout - bet;

    const currentBalance = window.vc.readBalance();
    window.vc.writeBalance(currentBalance + payout);

    highlightedBin = binIndex;
    drawBoard();

    const netLabel = net >= 0 ? `+$${net.toLocaleString()}` : `-$${Math.abs(net).toLocaleString()}`;
    addLog(
      `Middle start -> Bin ${binIndex + 1} (${formatMult(multiplier)}) | Payout $${payout.toLocaleString()} | Net ${netLabel}`
    );

    if (multiplier >= 5) {
      window.vc.confetti(30);
      window.vc.showBigMessage(`BIG HIT ${formatMult(multiplier)}!`, 1400);
      window.vc.setBuddyText('That edge bin paid huge. Keep the heater rolling.');
    } else if (multiplier < 1) {
      window.vc.setBuddyText('Ouch. Cold drop. Center lanes can be rough.');
    } else {
      window.vc.setBuddyText('Solid drop. Keep pressing your edge.');
    }

    setTimeout(() => {
      highlightedBin = -1;
      drawBoard();
    }, 900);

  }

  // ---- Build a list of every peg position for collision checks ----
  const pegs = [];
  for (let row = 0; row <= rows; row++) {
    const y = topY + row * rowGap;
    const count = row + 1;
    const rowWidth = (count - 1) * columnGap;
    const sx = canvas.width / 2 - rowWidth / 2;
    for (let col = 0; col < count; col++) {
      pegs.push({ x: sx + col * columnGap, y });
    }
  }

  // ---- Physics constants ----
  const GRAVITY    = 520;   // px/s²
  const RESTITUTION = 0.5;  // bounce energy kept
  const FRICTION   = 0.98;  // slight horizontal damping each frame
  const FLOOR_Y    = bottomY + 36;
  const WALL_LEFT  = marginX;
  const WALL_RIGHT = canvas.width - marginX;
  const SUB_STEPS  = 3;     // physics sub-steps per frame for stability
  const COLLISION_R = pegRadius + ballRadius; // combined radii

  // Bin divider walls (vertical segments between bins)
  const slotWidth = (canvas.width - marginX * 2) / bins;
  const dividerTop = bottomY + 10;

  function physicsTick(ball, dt) {
    // Apply gravity
    ball.vy += GRAVITY * dt;

    // Move
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    // Horizontal friction
    ball.vx *= FRICTION;

    // ---- Peg collisions ----
    for (let i = 0; i < pegs.length; i++) {
      const p = pegs[i];
      const dx = ball.x - p.x;
      const dy = ball.y - p.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < COLLISION_R && dist > 0.001) {
        // Push ball out of peg
        const overlap = COLLISION_R - dist;
        const nx = dx / dist;
        const ny = dy / dist;
        ball.x += nx * overlap;
        ball.y += ny * overlap;

        // Reflect velocity along normal
        const dot = ball.vx * nx + ball.vy * ny;
        if (dot < 0) { // only if moving toward peg
          ball.vx -= (1 + RESTITUTION) * dot * nx;
          ball.vy -= (1 + RESTITUTION) * dot * ny;
          // Tiny random deflection so identical drops vary
          ball.vx += (Math.random() - 0.5) * 15;
        }
      }
    }

    // ---- Wall collisions ----
    if (ball.x - ballRadius < WALL_LEFT) {
      ball.x = WALL_LEFT + ballRadius;
      ball.vx = Math.abs(ball.vx) * RESTITUTION;
    }
    if (ball.x + ballRadius > WALL_RIGHT) {
      ball.x = WALL_RIGHT - ballRadius;
      ball.vx = -Math.abs(ball.vx) * RESTITUTION;
    }

    // ---- Bin divider walls (only once ball is below the last peg row) ----
    if (ball.y > dividerTop) {
      for (let d = 0; d <= bins; d++) {
        const wallX = marginX + d * slotWidth;
        const dx = ball.x - wallX;
        if (Math.abs(dx) < ballRadius) {
          // Push out
          ball.x = wallX + (dx > 0 ? ballRadius : -ballRadius);
          ball.vx = -ball.vx * 0.3;
        }
      }
    }

    // ---- Floor ----
    if (ball.y + ballRadius >= FLOOR_Y) {
      ball.y = FLOOR_Y - ballRadius;
      ball.vy = -Math.abs(ball.vy) * 0.25; // weak floor bounce
      ball.vx *= 0.7;
    }
  }

  function isBallSettled(ball) {
    const speed = Math.sqrt(ball.vx * ball.vx + ball.vy * ball.vy);
    return ball.y + ballRadius >= FLOOR_Y - 2 && speed < 12;
  }

  function getBin(ball) {
    const rel = (ball.x - marginX) / (canvas.width - marginX * 2);
    return Math.max(0, Math.min(bins - 1, Math.floor(rel * bins)));
  }

  function spawnBall(bet) {
    const ball = {
      x: canvas.width / 2 + (Math.random() - 0.5) * 4,
      y: topY - ballRadius - 12,
      vx: (Math.random() - 0.5) * 20,
      vy: 0,
      bet,
      settledFrames: 0
    };
    activeBalls.push(ball);
    ensureAnimationLoop();
  }

  // ---- Drop animation using real-time physics ----
  function runDrop() {
    const bet = Math.floor(Number(betInput.value));
    if (!Number.isFinite(bet) || bet < 1) {
      addLog('Invalid bet amount.');
      return;
    }

    const balance = window.vc.readBalance();
    if (bet > balance) {
      addLog('Not enough balance for that drop.');
      window.vc.setBuddyText('Need more cash before another drop.');
      if (autoDropInterval) {
        clearInterval(autoDropInterval);
        autoDropInterval = null;
        autoBtn.textContent = 'Auto Drop';
        window.vc.setBuddyText('Auto-drop stopped. Not enough money.');
      }
      return;
    }

    window.vc.writeBalance(balance - bet);
    spawnBall(bet);
  }

  function tickAllBalls(dt) {
    const subDt = dt / SUB_STEPS;
    for (let i = activeBalls.length - 1; i >= 0; i--) {
      const ball = activeBalls[i];

      for (let s = 0; s < SUB_STEPS; s++) {
        physicsTick(ball, subDt);
      }

      if (isBallSettled(ball)) {
        ball.settledFrames += 1;
      } else {
        ball.settledFrames = 0;
      }

      if (ball.settledFrames > 10) {
        const finalBin = getBin(ball);
        finishDrop(finalBin, ball.bet);
        activeBalls.splice(i, 1);
      }
    }
  }

  function animationFrame(now) {
    if (!animationRunning) return;
    if (!lastFrameTime) lastFrameTime = now;

    let dt = (now - lastFrameTime) / 1000;
    lastFrameTime = now;
    if (dt > 0.05) dt = 0.05;

    tickAllBalls(dt);
    drawBoard();

    if (activeBalls.length > 0 || autoDropInterval) {
      requestAnimationFrame(animationFrame);
    } else {
      animationRunning = false;
      lastFrameTime = 0;
    }
  }

  function ensureAnimationLoop() {
    if (animationRunning) return;
    animationRunning = true;
    lastFrameTime = 0;
    requestAnimationFrame(animationFrame);
  }

  dropBtn.addEventListener('click', runDrop);

  autoBtn.addEventListener('click', () => {
    if (autoDropInterval) {
      clearInterval(autoDropInterval);
      autoDropInterval = null;
      autoBtn.textContent = 'Auto Drop';
      return;
    }

    autoBtn.textContent = 'Auto On';
    runDrop();
    autoDropInterval = setInterval(() => {
      runDrop();
    }, 500);
    ensureAnimationLoop();
  });

  buildMultiplierDisplays();
  drawBoard();

  if (window.vc.markSlotsVisited) {
    // Reuse an existing "played a game" style achievement hook.
    window.vc.markSlotsVisited();
  }
});
