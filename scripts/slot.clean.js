document.addEventListener('DOMContentLoaded', ()=>{
  // Clean slot logic: 5x3 grid, evaluate contiguous row runs and full-column matches.
  const symbols = ['🍒','🍋','7️⃣','🍇','🏦','🍉'];
  const spinBtn = document.getElementById('spin');
  const maxBtn = document.getElementById('max');
  const reels = Array.from(document.querySelectorAll('.reel'));
  const log = document.getElementById('slot-log');
  const betInput = document.getElementById('bet');

  function rand(n){ return Math.floor(Math.random()*n); }
  function appendLog(s){ if(!log) return; const p=document.createElement('div'); p.textContent=s; log.prepend(p); }

  function showLossUI(){ vc.setBuddyText(window.TODD_DIALOGUE?.slots?.loss || "Don't be down — double down next time!"); vc.showBigMessage('YOU LOST', 1000); }
  function showWinUI(amount){ vc.setBuddyText(window.TODD_DIALOGUE?.slots?.win || "Hell yes! Keep it up!"); vc.confetti(40); vc.showBigMessage(`You won $${amount}!!`, 1400); }

  function rowIndices(row){ const base = row*5; return [base, base+1, base+2, base+3, base+4]; }
  function colIndices(col){ return [col, col+5, col+10]; }

  function evaluatePatterns(result){
    // We'll build non-overlapping patterns and prefer higher-value patterns first.
    const used = new Set();
    const results = [];

    // 1) columns (highest value) - check each column for 3-of-a-kind
    for(let c=0;c<5;c++){
      const idxs = colIndices(c);
      const s0 = result[idxs[0]];
      if(s0 && result[idxs[1]]===s0 && result[idxs[2]]===s0){
        // ensure indices not already used
        if(!idxs.some(i=> used.has(i))){ idxs.forEach(i=> used.add(i)); results.push({type:'col', indices: idxs.slice(), symbol: s0}); }
      }
    }

    // 2) full rows (5 in a row)
    for(let r=0;r<3;r++){
      const idxs = rowIndices(r);
      const s0 = result[idxs[0]];
      if(s0 && idxs.every(i=> result[i]===s0) && !idxs.some(i=> used.has(i))){ idxs.forEach(i=> used.add(i)); results.push({type:'row', indices: idxs.slice(), symbol: s0}); }
    }

    // 3) 4-in-row contiguous
    for(let r=0;r<3;r++){
      const idxs = rowIndices(r);
      for(let start=0; start<=1; start++){
        const seg = idxs.slice(start,start+4);
        const s0 = result[seg[0]];
        if(s0 && seg.every(i=> result[i]===s0) && !seg.some(i=> used.has(i))){ seg.forEach(i=> used.add(i)); results.push({type:'row', indices: seg.slice(), symbol: s0}); }
      }
    }

    // 4) 3-in-row contiguous
    for(let r=0;r<3;r++){
      const idxs = rowIndices(r);
      for(let start=0; start<=2; start++){
        const seg = idxs.slice(start,start+3);
        const s0 = result[seg[0]];
        if(s0 && seg.every(i=> result[i]===s0) && !seg.some(i=> used.has(i))){ seg.forEach(i=> used.add(i)); results.push({type:'row', indices: seg.slice(), symbol: s0}); }
      }
    }

    return results;
  }

  function computePayout(bet, patterns){
    let total = 0;
    // deterministic multipliers
    patterns.forEach(p=>{
      let basePayout = 0;
      if(p.type === 'col'){
        basePayout = bet * 5; // column of 3 pays 5x
      } else if(p.type === 'row'){
        const len = p.indices.length;
        if(len === 3) basePayout = bet * 2;    // 2x for a 3-run
        else if(len === 4) basePayout = bet * 4; // 4x for 4-run
        else if(len >= 5) basePayout = bet * 8; // 8x for full row
      }
      
      // Symbol bonuses: 🏦 adds x1, 7️⃣ adds x2
      if(p.symbol === '🏦'){
        basePayout += bet * 1; // extra x1 for bank
      } else if(p.symbol === '7️⃣'){
        basePayout += bet * 2; // extra x2 for seven
      }
      
      total += basePayout;
    });
    return total;
  }

  // prevent re-entrant spins
  let spinning = false;

  function spin(bet){
    if(spinning){ appendLog('Spin already in progress.'); return; }
    spinning = true;
    if(spinBtn) spinBtn.disabled = true;
    if(maxBtn) maxBtn.disabled = true;
    let balance = vc.readBalance();
    if(bet <= 0){ appendLog('Invalid bet.'); spinning = false; if(spinBtn) spinBtn.disabled = false; if(maxBtn) maxBtn.disabled = false; return; }
    if(bet > balance){ appendLog('Insufficient funds for that bet.'); vc.setBuddyText(window.TODD_DIALOGUE?.slots?.insufficientFunds || 'Not enough funds — try a smaller bet or take a loan.'); spinning = false; if(spinBtn) spinBtn.disabled = false; if(maxBtn) maxBtn.disabled = false; return; }
    balance -= bet; vc.writeBalance(balance);
    
    // Add to jackpot (10% of bet)
    const jackpotContribution = vc.addToJackpot(bet);

    try{ if(window.vc && typeof window.vc.incrementSlotSpins === 'function') window.vc.incrementSlotSpins(1); }catch(e){}
    
    // Generate random result with natural chance for patterns
    const result = new Array(reels.length).fill(null).map(()=> symbols[rand(symbols.length)]);

    // Occasionally create winning patterns to make the game more fun
    if(Math.random() < 0.25){ // 25% chance for intentional patterns
      if(Math.random() < 0.7){
        // Create a contiguous row run (3, 4, or 5 in a row)
        const s = symbols[rand(symbols.length)];
        const row = rand(3);
        // More likely to create 3-in-row, less likely for longer runs
        let runLen = 3;
        if(Math.random() < 0.3) runLen = 4; // 30% chance for 4-in-row
        if(Math.random() < 0.15) runLen = 5; // 15% chance for full row
        
        const idxs = rowIndices(row);
        const maxStart = 5 - runLen;
        const startInRow = Math.floor(Math.random()*(maxStart+1));
        for(let k=0;k<runLen;k++){ result[idxs[startInRow+k]] = s; }
      } else {
        // Create a full column (3 matching vertically)
        const s = symbols[rand(symbols.length)]; 
        const col = rand(5); 
        const idxs = colIndices(col); 
        idxs.forEach(i=> result[i]=s);
      }
    }

    // JACKPOT CHANCE: Very rare chance for 5 in a row (jackpot trigger)
    if(Math.random() < 0.001) { // 0.1% chance
      const row = rand(3);
      const idxs = rowIndices(row);
      const jackpotSymbol = symbols[rand(symbols.length)];
      idxs.forEach(i => result[i] = jackpotSymbol);
    }

    // Create scrolling animation for each reel
    reels.forEach((r,i)=>{
      const stopDelay = 400 + (i%5)*200 + Math.floor(i/5)*100; // stagger stops by column then row
      const spinDuration = 2000; // how long before starting to stop
      
      // Create wrapper for scrolling effect
      r.innerHTML = '';
      r.style.overflow = 'hidden';
      r.style.position = 'relative';
      
      const scrollContainer = document.createElement('div');
      scrollContainer.className = 'reel-scroll';
      scrollContainer.style.position = 'absolute';
      scrollContainer.style.top = '0';
      scrollContainer.style.left = '0';
      scrollContainer.style.width = '100%';
      scrollContainer.style.display = 'flex';
      scrollContainer.style.flexDirection = 'column';
      scrollContainer.style.alignItems = 'center';
      
      // Create many symbols to scroll through (20 random + final result)
      const scrollSymbols = [];
      for(let j=0; j<20; j++){
        scrollSymbols.push(symbols[rand(symbols.length)]);
      }
      scrollSymbols.push(result[i]); // final symbol at the end
      
      scrollSymbols.forEach(sym => {
        const symEl = document.createElement('div');
        symEl.className = 'reel-symbol';
        symEl.textContent = sym;
        symEl.style.height = r.offsetHeight + 'px';
        symEl.style.display = 'flex';
        symEl.style.alignItems = 'center';
        symEl.style.justifyContent = 'center';
        symEl.style.fontSize = '28px';
        scrollContainer.appendChild(symEl);
      });
      
      r.appendChild(scrollContainer);
      
      // Animate the scroll
      const symbolHeight = r.offsetHeight;
      const totalScroll = scrollSymbols.length * symbolHeight;
      const finalPosition = -(scrollSymbols.length - 1) * symbolHeight;
      
      // Start spinning animation
      let currentPos = 0;
      const spinSpeed = 30; // pixels per frame
      const frameTime = 16; // ~60fps
      
      const spinInterval = setInterval(() => {
        currentPos -= spinSpeed;
        if(currentPos <= -totalScroll) {
          currentPos = 0; // loop back to start
        }
        scrollContainer.style.transform = `translateY(${currentPos}px)`;
      }, frameTime);
      
      // Stop at the right time with easing
      setTimeout(() => {
        clearInterval(spinInterval);
        
        // Calculate position to show final symbol (centered)
        const finalPos = finalPosition;
        
        // Smooth deceleration to final position
        const startPos = currentPos;
        const distance = finalPos - startPos;
        const duration = 500; // deceleration time
        const startTime = Date.now();
        
        const decelerate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease-out cubic for smooth stop
          const easeProgress = 1 - Math.pow(1 - progress, 3);
          const newPos = startPos + (distance * easeProgress);
          scrollContainer.style.transform = `translateY(${newPos}px)`;
          
          if(progress < 1) {
            requestAnimationFrame(decelerate);
          }
        };
        
        requestAnimationFrame(decelerate);
      }, stopDelay);
    });

    setTimeout(()=>{
      try{
        const patterns = evaluatePatterns(result);
        let payout = computePayout(bet, patterns);
        
        // Check for JACKPOT WIN: Any 5 in a row
        const jackpotWin = patterns.some(p => 
          p.indices.length === 5 && p.type === 'row'
        );
        
        if(jackpotWin) {
          const jackpotAmount = vc.winJackpot();
          const totalWin = bet + payout + jackpotAmount; // bet back + regular winnings + jackpot
          balance += totalWin;
          vc.writeBalance(balance);
          
          appendLog(`🎉 JACKPOT WINNER! 🎉 Total win: $${totalWin} (Bet back: $${bet} + Pattern wins: $${payout} + Jackpot: $${jackpotAmount})`);
          vc.confetti(100);
          vc.showBigMessage(`JACKPOT! $${totalWin.toLocaleString()}!`, 3000);
          vc.setBuddyText('HOLY MOLY! YOU HIT THE JACKPOT! YOU\'RE RICH!');
        } else if(payout > 0){
          const totalWin = bet + payout; // bet back + winnings
          balance += totalWin; 
          vc.writeBalance(balance);
          
          // Build detailed pattern description
          let patternDesc = patterns.map(p=> {
            const symbol = p.symbol;
            if(p.type === 'col') return `${symbol}${symbol}${symbol} column`;
            else if(p.indices.length === 5) return `${symbol}${symbol}${symbol}${symbol}${symbol} full row`;
            else if(p.indices.length === 4) return `${symbol}${symbol}${symbol}${symbol} 4-in-row`;
            else return `${symbol}${symbol}${symbol} 3-in-row`;
          }).join(', ');
          
          appendLog(`You won $${totalWin}! (Bet back: $${bet} + Pattern wins: $${payout}) - ${patternDesc}`);
          showWinUI(totalWin);
        }
        else { 
          appendLog(`No winning patterns — ${result.join(' ')}`); 
          showLossUI(); 
        }
      }catch(err){
        appendLog('Spin error: ' + (err && err.message ? err.message : String(err)));
        console.error(err);
      }finally{
        // re-enable controls shortly after overlay/animations
        setTimeout(()=>{
          spinning = false;
          if(spinBtn) spinBtn.disabled = false;
          if(maxBtn) maxBtn.disabled = false;
        }, 400);
      }
    }, 2800); // Wait for all reels to finish spinning (max stopDelay 400+4*200+2*100=1600 + deceleration 500 + buffer)
  }

  if(spinBtn) spinBtn.addEventListener('click', ()=> spin(Number(betInput.value||10)));
  if(maxBtn) maxBtn.addEventListener('click', ()=>{ const max = Math.max(1, Math.floor(vc.readBalance()||0)); betInput.value = max; spin(max); });
});
