// Shared utilities: balance handling and small helpers
(()=>{
  
  function readBalance(){
    const raw = localStorage.getItem('vc_balance');
    return raw ? Number(raw) : 0;
  }
  function writeBalance(v){ 
    localStorage.setItem('vc_balance', String(v)); 
    updateBalance(); 
    // Check for platinum conversion
    checkPlatinumConversion();
  }
  
  function updateBalance(){ 
    const els = document.querySelectorAll('#balance-value'); 
    els.forEach(e=>{ 
      const v = readBalance(); 
      const platinum = readPlatinumCredits();
      if(platinum > 0) {
        e.textContent = v.toLocaleString() + ' + ' + platinum.toLocaleString() + ' 💎';
      } else {
        e.textContent = v.toLocaleString();
      }
    }); 
  }

  // Platinum Credits system for ultra-high balances
  const PLATINUM_CONVERSION_THRESHOLD = 100000000000; // 100 billion - prompt user
  const PLATINUM_CONVERSION_RATE = 10000000000; // 10 billion = 1 platinum
  
  function readPlatinumCredits(){
    const raw = localStorage.getItem('vc_platinum');
    return raw ? Number(raw) : 0;
  }
  
  function writePlatinumCredits(v){ 
    localStorage.setItem('vc_platinum', String(v)); 
    updateBalance();
    checkRedDiamondConversion();
  }

  // Red Diamond currency — ultra-premium tier
  const RED_DIAMOND_THRESHOLD = 1000; // At 1000 diamonds, forced conversion
  const RED_DIAMOND_CONVERSION_RATE = 150; // 150 diamonds = 1 red diamond
  const RED_DIAMOND_CONVERSION_PERCENT = 0.6; // Convert 60% of diamonds

  function readRedDiamonds(){
    const raw = localStorage.getItem('vc_red_diamonds');
    return raw ? Number(raw) : 0;
  }

  function writeRedDiamonds(v){
    localStorage.setItem('vc_red_diamonds', String(v));
    updateRedDiamondDisplays();
  }

  function updateRedDiamondDisplays(){
    const els = document.querySelectorAll('.red-diamond-value');
    els.forEach(e => { e.textContent = readRedDiamonds().toLocaleString(); });
  }

  function checkRedDiamondConversion(){
    const diamonds = readPlatinumCredits();
    if(diamonds >= RED_DIAMOND_THRESHOLD){
      const toConvert = Math.floor(diamonds * RED_DIAMOND_CONVERSION_PERCENT);
      const redEarned = Math.floor(toConvert / RED_DIAMOND_CONVERSION_RATE);
      const diamondsSpent = redEarned * RED_DIAMOND_CONVERSION_RATE;

      if(redEarned < 1) return false;

      const message = `💎 You hit ${diamonds.toLocaleString()} Diamonds!\n\nForced Conversion: 60% of your diamonds → Red Diamonds\n(150 💎 = 1 ❤️‍🔥)\n\nConverting ${diamondsSpent.toLocaleString()} 💎 → ${redEarned} ❤️‍🔥\nRemaining: ${(diamonds - diamondsSpent).toLocaleString()} 💎`;

      alert(message);

      const currentRed = readRedDiamonds();
      writeRedDiamonds(currentRed + redEarned);
      // Write directly to avoid re-triggering conversion
      localStorage.setItem('vc_platinum', String(diamonds - diamondsSpent));
      updateBalance();

      if(typeof showBigMessage === 'function'){
        showBigMessage(`❤️‍🔥 CONVERTED TO ${redEarned} RED DIAMONDS! ❤️‍🔥`, 3000);
      }
      if(typeof confetti === 'function'){
        confetti(50);
      }
      return true;
    }
    return false;
  }
  
  function checkPlatinumConversion(){
    const balance = readBalance();
    if(balance >= PLATINUM_CONVERSION_THRESHOLD){
      // Prompt user for conversion
      const maxConvertible = Math.floor(balance / PLATINUM_CONVERSION_RATE);
      const minConversion = Math.ceil(maxConvertible * 0.8); // Minimum 80%
      
      const message = `You have $${balance.toLocaleString()}!\n\nConvert to Platinum Credits?\n(1 💎 = $10 billion)\n\nMaximum: ${maxConvertible} 💎\nMinimum: ${minConversion} 💎 (80%)\n\nEnter amount to convert:`;
      
      const userInput = prompt(message, maxConvertible);
      
      if(userInput === null) return false; // User cancelled
      
      const amountToConvert = parseInt(userInput);
      
      if(isNaN(amountToConvert) || amountToConvert < minConversion || amountToConvert > maxConvertible){
        if(typeof setBuddyText === 'function'){
          setBuddyText(`Invalid amount! Must convert between ${minConversion} and ${maxConvertible} platinum credits.`);
        }
        // Ask again
        setTimeout(() => checkPlatinumConversion(), 100);
        return false;
      }
      
      const cashToConvert = amountToConvert * PLATINUM_CONVERSION_RATE;
      const remainingBalance = balance - cashToConvert;
      
      const currentPlatinum = readPlatinumCredits();
      writePlatinumCredits(currentPlatinum + amountToConvert);
      localStorage.setItem('vc_balance', String(remainingBalance));
      
      if(typeof showBigMessage === 'function'){
        showBigMessage(`💎 CONVERTED TO ${amountToConvert.toLocaleString()} PLATINUM CREDITS! 💎`, 3000);
      }
      if(typeof confetti === 'function'){
        confetti(50);
      }
      updateBalance();
      return true;
    }
    return false;
  }
  
  function purchaseWithPlatinum(itemName, cost, effect){
    const platinum = readPlatinumCredits();
    if(platinum >= cost){
      writePlatinumCredits(platinum - cost);
      if(typeof showBigMessage === 'function'){
        showBigMessage(`💎 PURCHASED ${itemName}! 💎`, 2000);
      }
      if(typeof confetti === 'function'){
        confetti(30);
      }
      // Apply the effect
      if(effect) effect();
      return true;
    }
    return false;
  }

  // Debt handling (stubs kept for compatibility)
  function readDebt(){ return 0; }
  function writeDebt(v){}
  function updateDebt(){}

  // Progressive Jackpot system
  function readJackpot(){ const raw = localStorage.getItem('vc_jackpot'); return raw ? Number(raw) : 5000; }
  function writeJackpot(v){ 
    localStorage.setItem('vc_jackpot', String(v)); 
    updateJackpot(); 
  }
  function updateJackpot(){ const els = document.querySelectorAll('#jackpot-amount'); els.forEach(e=>{ const v = readJackpot(); e.textContent = String(v.toLocaleString()); }); }
  
  function addToJackpot(betAmount) {
    const contribution = Math.floor(betAmount * 0.1); // 10% of bet goes to jackpot
    const currentJackpot = readJackpot();
    writeJackpot(currentJackpot + contribution);
    return contribution;
  }
  
  function winJackpot() {
    const jackpotAmount = readJackpot();
    const balance = readBalance();
    writeBalance(balance + jackpotAmount);
    writeJackpot(5000); // Reset to base amount
    return jackpotAmount;
  }



  function loan100(){ setBuddyText('Loans have been removed. Go earn money at Min Wage Grind!'); }
  function paybackLoan(){ }

  // Buddy and overlay helpers
  function setBuddyText(s){ const b = document.getElementById('buddy-text'); if(b) b.textContent = s; }
  function showBigMessage(text, ms=1000){ const ov = document.getElementById('big-overlay'); const msg = document.getElementById('big-message'); if(!ov||!msg) return; msg.textContent = text; ov.classList.add('show'); setTimeout(()=> ov.classList.remove('show'), ms); }

  // Confetti: spawn simple colored divs and animate down
  function confetti(amount=40){
    const root = document.getElementById('confetti-root');
    if(!root) return;
    for(let i=0;i<amount;i++){
      const el = document.createElement('div');
      el.className = 'confetti-piece';
      el.style.left = (Math.random()*100) + '%';
      el.style.background = (Math.random()>0.5? 'var(--accent)':'#ffd966');
      el.style.opacity = '1';
      el.style.transform = `translateY(-20px) rotate(${Math.random()*360}deg)`;
      root.appendChild(el);
      setTimeout(()=>{
        el.style.transition='transform 1200ms linear, opacity 1200ms linear';
        el.style.transform = `translateY(${window.innerHeight + 100}px) rotate(${Math.random()*720}deg)`;
        el.style.opacity='0';
      }, 20);
      setTimeout(()=> root.removeChild(el), 1400);
    }
  }

  // Global blood debt timer functionality
  let globalBloodDebtTimer = null;
  let globalTimeRemaining = 300; // 5 minutes
  
  function startGlobalBloodDebtTimer() {
    if (globalBloodDebtTimer) return; // Don't start if already running
    
    // Create blood debt timer element if it doesn't exist
    let timerElement = document.getElementById('global-blood-debt-timer');
    if (!timerElement) {
      timerElement = document.createElement('div');
      timerElement.id = 'global-blood-debt-timer';
      timerElement.innerHTML = `
        <div style="position: fixed; top: 10px; left: 50%; transform: translateX(-50%); 
                    background: rgba(255, 0, 0, 0.9); border: 2px solid #ff0000; 
                    color: white; padding: 10px 20px; border-radius: 10px; 
                    z-index: 10000; text-align: center; font-weight: bold;
                    box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
                    animation: dangerPulse 2s infinite;">
          <div style="font-size: 0.9em;">🩸 BLOOD DEBT COUNTDOWN 🩸</div>
          <div id="global-timer-display" style="font-size: 1.5em; font-family: 'Courier New', monospace;">05:00</div>
          <div style="font-size: 0.8em;">Pay your debt or face surgery!</div>
        </div>
      `;
      document.body.appendChild(timerElement);
    }
    
    timerElement.style.display = 'block';
    globalTimeRemaining = 300; // Reset to 5 minutes
    
    globalBloodDebtTimer = setInterval(() => {
      globalTimeRemaining--;
      
      const minutes = Math.floor(globalTimeRemaining / 60);
      const seconds = globalTimeRemaining % 60;
      const displayElement = document.getElementById('global-timer-display');
      if (displayElement) {
        displayElement.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
      }
      
      if (globalTimeRemaining <= 0) {
        clearInterval(globalBloodDebtTimer);
        globalBloodDebtTimer = null;
        
        // Trigger surgery consequences
        localStorage.setItem('vc_robot_legs', 'true');
        localStorage.removeItem('vc_last_blood_loan');
        
        if (timerElement) {
          timerElement.style.display = 'none';
        }
        
        if (typeof setBuddyText === 'function') {
          setBuddyText("Time's up! Your legs are now robot wheels. Hope you like the upgrade.");
        }
        
        // Redirect to underground if not already there
        if (!window.location.href.includes('underground')) {
          window.location.href = 'underground.html';
        }
      }
    }, 1000);
  }
  
  function stopGlobalBloodDebtTimer() {
    if (globalBloodDebtTimer) {
      clearInterval(globalBloodDebtTimer);
      globalBloodDebtTimer = null;
    }
    
    const timerElement = document.getElementById('global-blood-debt-timer');
    if (timerElement) {
      timerElement.style.display = 'none';
    }
    
    localStorage.removeItem('vc_last_blood_loan');
  }
  
  // Global organ effects system
  function applyGlobalOrganEffects() {
    const soldOrgans = JSON.parse(localStorage.getItem('vc_sold_organs') || '[]');
    
    // Apply visual effects based on sold organs
    soldOrgans.forEach(organ => {
      switch(organ) {
        case 'eye':
          document.body.style.filter += ' blur(1px)';
          break;
        case 'liver':
          // Alcohol effects - slight color distortion
          document.body.style.filter += ' saturate(0.7)';
          break;
        case 'lung':
          // Breathing issues - slight shake effect
          document.body.style.animation = 'shake 3s infinite';
          break;
        case 'kidney':
          // Functional effect tracked in localStorage
          localStorage.setItem('vc_kidney_sold', 'true');
          break;
        case 'finger':
          // Functional effect tracked in localStorage
          localStorage.setItem('vc_finger_sold', 'true');
          break;
        // Tooth and hair are aesthetic only, no permanent visual effects
      }
    });
  }
  
  // Function to add organ effect (called when organ is sold)
  function addOrganEffect(organ) {
    const soldOrgans = JSON.parse(localStorage.getItem('vc_sold_organs') || '[]');
    if (!soldOrgans.includes(organ)) {
      soldOrgans.push(organ);
      localStorage.setItem('vc_sold_organs', JSON.stringify(soldOrgans));
    }
    
    // Apply the effect immediately
    switch(organ) {
      case 'eye':
        document.body.style.filter += ' blur(1px)';
        break;
      case 'liver':
        document.body.style.filter += ' saturate(0.7)';
        break;
      case 'lung':
        document.body.style.animation = 'shake 3s infinite';
        break;
      case 'kidney':
        localStorage.setItem('vc_kidney_sold', 'true');
        break;
      case 'finger':
        localStorage.setItem('vc_finger_sold', 'true');
        break;
    }
  }
  
  // Function to reset all organ effects (for the "free" code)
  function resetAllOrganEffects() {
    localStorage.removeItem('vc_sold_organs');
    localStorage.removeItem('vc_kidney_sold');
    localStorage.removeItem('vc_finger_sold');
    
    // Reset visual effects
    const currentFilter = document.body.style.filter;
    document.body.style.filter = currentFilter
      .replace(/blur\([^)]*\)/g, '')
      .replace(/saturate\([^)]*\)/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    document.body.style.animation = '';
  }

  // Donny Boy scrolling functionality
  function initDonnyBoyScrolling() {
    const buddy = document.getElementById('buddy');
    if (!buddy) return;
    
    let ticking = false;
    
    function updateDonnyBoyPosition() {
      const scrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Calculate Donny Boy's position based on scroll percentage
      const scrollPercent = scrollY / (documentHeight - windowHeight);
      const maxMovement = 50; // Maximum pixels Donny Boy can move
      const movement = Math.sin(scrollPercent * Math.PI * 2) * maxMovement;
      
      buddy.style.transform = `translateY(${movement}px)`;
      buddy.style.transition = 'transform 0.3s ease-out';
      
      ticking = false;
    }
    
    function requestDonnyBoyUpdate() {
      if (!ticking) {
        requestAnimationFrame(updateDonnyBoyPosition);
        ticking = true;
      }
    }
    
    window.addEventListener('scroll', requestDonnyBoyUpdate);
  }
  
  // Fix background color changes on scroll
  function fixBackgroundScroll() {
    document.documentElement.style.background = 'inherit';
    document.body.style.backgroundAttachment = 'fixed';
  }

    // Ghost Code functionality - now handled per page

  // Money laundering function for underground to main money conversion
  function launderMoney() {
    let undergroundBalance = Number(localStorage.getItem('underground_balance') || 500);
    
    if (undergroundBalance < 510) { // Need at least 510 to launder 10 and keep 500
      setBuddyText('Not enough underground money! You need at least $510 to launder $10.');
      return;
    }
    
    // Remove $10 from underground balance
    undergroundBalance -= 10;
    localStorage.setItem('underground_balance', String(undergroundBalance));
    
    // Add $100 to main balance
    const currentBalance = readBalance();
    writeBalance(currentBalance + 100);
    
    setBuddyText('Money laundered successfully! $10 underground → $100 clean money.');
    showBigMessage('MONEY LAUNDERED! +$100', 1500);
    confetti(20);
  }

  // Ads Toggle System - Enhanced
  function initAdsToggle() {
    const adsToggle = document.getElementById('ads-toggle');
    if (!adsToggle) return;
    
    // Load saved state
    const adsHidden = localStorage.getItem('ads_hidden') === 'true';
    updateAdsVisibility(adsHidden);
    
    // Toggle functionality with smooth animation
    adsToggle.addEventListener('click', () => {
      const currentlyHidden = document.body.classList.contains('ads-hidden');
      const newState = !currentlyHidden;
      
      // Add loading state briefly
      adsToggle.style.transform = 'scale(0.95)';
      adsToggle.style.opacity = '0.7';
      
      setTimeout(() => {
        updateAdsVisibility(newState);
        localStorage.setItem('ads_hidden', newState.toString());
        
        // Reset button animation
        adsToggle.style.transform = '';
        adsToggle.style.opacity = '';
        
        // Show feedback message
        if (window.vc && window.vc.setBuddyText) {
          const message = newState ? 
            "🎯 Ads hidden! Clean gaming experience activated!" : 
            "📺 Ads restored! Supporting the casino experience!";
          window.vc.setBuddyText(message);
        }
        
        // Show feedback popup
        if (window.vc && window.vc.showBigMessage) {
          const popupMessage = newState ? "ADS HIDDEN 🚫" : "ADS RESTORED 📺";
          window.vc.showBigMessage(popupMessage, 1200);
        }
        
        // Small confetti burst for satisfaction
        if (window.vc && window.vc.confetti) {
          window.vc.confetti(8);
        }
      }, 100);
    });
  }
  
  function updateAdsVisibility(hidden) {
    const adsToggle = document.getElementById('ads-toggle');
    if (!adsToggle) return;
    
    // Clear all state classes first
    adsToggle.classList.remove('hide-state', 'show-state');
    
    if (hidden) {
      document.body.classList.add('ads-hidden');
      adsToggle.innerHTML = '<span class="icon">👁️</span>Show Ads';
      adsToggle.title = 'Click to show advertisements and support the casino';
      adsToggle.classList.add('show-state');
    } else {
      document.body.classList.remove('ads-hidden');
      adsToggle.innerHTML = '<span class="icon">🚫</span>Hide Ads';
      adsToggle.title = 'Click to hide advertisements for cleaner experience';
      adsToggle.classList.add('hide-state');
    }
  }

  // Buddy Toggle System
  function initBuddyToggle() {
    const buddy = document.getElementById('buddy');
    const buddyToggle = document.getElementById('buddy-toggle');
    
    if (!buddy || !buddyToggle) return;
    
    // Load saved state
    const isCollapsed = localStorage.getItem('buddy_collapsed') === 'true';
    if (isCollapsed) {
      buddy.classList.add('collapsed');
      buddyToggle.textContent = '+';
    }
    
    // Toggle functionality
    function toggleBuddy(e) {
      e.stopPropagation();
      const wasCollapsed = buddy.classList.contains('collapsed');
      
      if (wasCollapsed) {
        // Expand
        buddy.classList.remove('collapsed');
        buddyToggle.textContent = '−';
        localStorage.setItem('buddy_collapsed', 'false');
        if (window.vc && window.vc.setBuddyText) {
          setTimeout(() => window.vc.setBuddyText("I'm back! Ready to help you win big!"), 300);
        }
      } else {
        // Collapse
        buddy.classList.add('collapsed');
        buddyToggle.textContent = '+';
        localStorage.setItem('buddy_collapsed', 'true');
        if (window.vc && window.vc.setBuddyText) {
          window.vc.setBuddyText("Click + to bring me back!");
        }
      }
    }
    
    // Add event listeners
    buddyToggle.addEventListener('click', toggleBuddy);
    
    // Double-click anywhere on buddy (except toggle) to expand if collapsed
    buddy.addEventListener('dblclick', (e) => {
      if (e.target !== buddyToggle && buddy.classList.contains('collapsed')) {
        toggleBuddy(e);
      }
    });
  }

  window.vc = { readBalance, writeBalance, updateBalance, readDebt, writeDebt, updateDebt, loan100, paybackLoan, setBuddyText, showBigMessage, confetti, readJackpot, writeJackpot, updateJackpot, addToJackpot, winJackpot, startGlobalBloodDebtTimer, stopGlobalBloodDebtTimer, addOrganEffect, resetAllOrganEffects, launderMoney, readPlatinumCredits, writePlatinumCredits, purchaseWithPlatinum, checkPlatinumConversion, readRedDiamonds, writeRedDiamonds, updateRedDiamondDisplays, checkRedDiamondConversion };
  document.addEventListener('DOMContentLoaded', ()=>{ 
    vc.updateBalance(); 
    vc.updateDebt(); 
    vc.updateJackpot();
    const brand = document.querySelector('.brand'); 
    if(brand) brand.textContent = 'HOLLYWOOD CASINO'; 
    
    // Apply any existing organ effects globally on every page
    applyGlobalOrganEffects();
    
    // Initialize Donny Boy scrolling and background fix
    initDonnyBoyScrolling();
    fixBackgroundScroll();
    
    // Initialize Donny Boy toggle functionality
    initBuddyToggle();
    
    // Initialize ads toggle functionality
    initAdsToggle();
  });
})();
