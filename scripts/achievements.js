document.addEventListener('DOMContentLoaded', ()=>{
  const ACH_KEY = 'vc_achievements';

  // Helper: safely read JSON array from localStorage
  function readArr(key){ try{ return JSON.parse(localStorage.getItem(key) || '[]'); }catch(e){ return []; }}
  function readObj(key){ try{ return JSON.parse(localStorage.getItem(key) || '{}'); }catch(e){ return {}; }}
  function readNum(key){ return Number(localStorage.getItem(key) || 0); }
  function readBool(key, trueVal){ return localStorage.getItem(key) === (trueVal || '1'); }

  const defs = [
    // ===================== BALANCE MILESTONES =====================
    {id:'first_dollar', title:'💰 First Dollar', desc:'Have more than $1,000', reward: 10,
      check:()=> (vc.readBalance() >= 1001)},
    {id:'earn_2k', title:'💵 Small Fortune', desc:'Accumulate $2,000', reward: 100,
      check:()=> (vc.readBalance() >= 2000)},
    {id:'earn_5k', title:'💸 Getting Serious', desc:'Reach $5,000', reward: 250,
      check:()=> (vc.readBalance() >= 5000)},
    {id:'earn_10k', title:'💰 Five Figures', desc:'Earn $10,000', reward: 500,
      check:()=> (vc.readBalance() >= 10000)},
    {id:'earn_25k', title:'🏦 Big Money', desc:'Accumulate $25,000', reward: 1000,
      check:()=> (vc.readBalance() >= 25000)},
    {id:'earn_50k', title:'💎 High Roller', desc:'Reach $50,000', reward: 2000,
      check:()=> (vc.readBalance() >= 50000)},
    {id:'earn_100k', title:'🤑 Six Figures', desc:'Earn $100,000', reward: 3000,
      check:()=> (vc.readBalance() >= 100000)},
    {id:'earn_250k', title:'👑 Quarter Million', desc:'Accumulate $250,000', reward: 4000,
      check:()=> (vc.readBalance() >= 250000)},
    {id:'earn_500k', title:'💰 Half Million', desc:'Reach $500,000', reward: 4500,
      check:()=> (vc.readBalance() >= 500000)},
    {id:'earn_1m', title:'🏆 Millionaire', desc:'Become a millionaire!', reward: 4999,
      check:()=> (vc.readBalance() >= 1000000)},
    {id:'earn_5m', title:'💎 Multi-Millionaire', desc:'Reach $5,000,000', reward: 10000,
      check:()=> (vc.readBalance() >= 5000000)},
    {id:'earn_10m', title:'🤴 Eight Figures', desc:'Reach $10,000,000', reward: 25000,
      check:()=> (vc.readBalance() >= 10000000)},
    {id:'earn_100m', title:'🦈 Hundred Million', desc:'Reach $100,000,000', reward: 100000,
      check:()=> (vc.readBalance() >= 100000000)},
    {id:'earn_1b', title:'🌍 Billionaire', desc:'Reach $1,000,000,000', reward: 500000,
      check:()=> (vc.readBalance() >= 1000000000)},

    // ===================== DEBT =====================
    {id:'first_debt', title:'💳 Credit Card', desc:'Owe your first $100', reward: 25,
      check:()=> (vc.readDebt() >= 100)},
    {id:'debt_1k', title:'📉 In The Red', desc:'Accumulate $1,000 in debt', reward: 50,
      check:()=> (vc.readDebt() >= 1000)},
    {id:'debt_3k', title:'📊 Rising Debt', desc:'Owe $3,000', reward: 150,
      check:()=> (vc.readDebt() >= 3000)},
    {id:'debt_5k', title:'🔴 Danger Zone', desc:'Owe $5,000', reward: 200,
      check:()=> (vc.readDebt() >= 5000)},
    {id:'debt_max', title:'💀 Financial Ruin', desc:'Max out debt at $5,500+', reward: 500,
      check:()=> (vc.readDebt() >= 5500)},
    {id:'debt_free', title:'🤑 Big Spender', desc:'Spend $10,000 total across all games', reward: 1000,
      check:()=> readNum('vc_total_wagered') >= 10000},

    // ===================== DIAMOND CURRENCY =====================
    {id:'first_diamond', title:'💎 First Diamond', desc:'Earn your first diamond', reward: 500,
      check:()=> (readNum('vc_platinum') >= 1)},
    {id:'diamond_10', title:'💎 Diamond Collector', desc:'Have 10 diamonds', reward: 2000,
      check:()=> (readNum('vc_platinum') >= 10)},
    {id:'diamond_50', title:'💎 Diamond Hoarder', desc:'Have 50 diamonds', reward: 5000,
      check:()=> (readNum('vc_platinum') >= 50)},
    {id:'diamond_100', title:'💎 Diamond Mine', desc:'Have 100 diamonds', reward: 10000,
      check:()=> (readNum('vc_platinum') >= 100)},
    {id:'diamond_500', title:'💎 Diamond Dynasty', desc:'Have 500 diamonds', reward: 50000,
      check:()=> (readNum('vc_platinum') >= 500)},
    {id:'first_red', title:'❤️‍🔥 Red Diamond', desc:'Earn your first red diamond', reward: 25000,
      check:()=> (readNum('vc_red_diamonds') >= 1)},
    {id:'red_5', title:'❤️‍🔥 Red Collection', desc:'Have 5 red diamonds', reward: 100000,
      check:()=> (readNum('vc_red_diamonds') >= 5)},
    {id:'red_10', title:'❤️‍🔥 Red Royalty', desc:'Have 10 red diamonds', reward: 500000,
      check:()=> (readNum('vc_red_diamonds') >= 10)},

    // ===================== GAME VISITS =====================
    {id:'slot_visitor', title:'🎰 Slot Virgin', desc:'Play the slot machine', reward: 50,
      check:()=> readBool('ach_visited_slots')},
    {id:'blackjack_visitor', title:'🃏 Card Counter', desc:'Play blackjack', reward: 50,
      check:()=> readBool('ach_visited_blackjack')},
    {id:'poker_visitor', title:'♠️ Poker Face', desc:'Play poker', reward: 50,
      check:()=> readBool('ach_visited_poker')},
    {id:'scratch_visitor', title:'🎫 Scratcher', desc:'Try scratch-off tickets', reward: 50,
      check:()=> readBool('ach_visited_scratch')},
    {id:'all_games', title:'🎮 Game Tourist', desc:'Visit all 4 main casino games', reward: 500,
      check:()=> readBool('ach_visited_slots') && readBool('ach_visited_blackjack') && readBool('ach_visited_poker') && readBool('ach_visited_scratch')},

    // ===================== BLACKJACK =====================
    {id:'bj_first_hand', title:'🃏 First Hand', desc:'Play your first blackjack hand', reward: 50,
      check:()=> { const s = readObj('bj_stats'); return (s.handsPlayed || 0) >= 1; }},
    {id:'bj_10_hands', title:'🃏 Card Shark', desc:'Play 10 blackjack hands', reward: 200,
      check:()=> { const s = readObj('bj_stats'); return (s.handsPlayed || 0) >= 10; }},
    {id:'bj_25_hands', title:'🃏 Blackjack Addict', desc:'Play 25 blackjack hands', reward: 500,
      check:()=> { const s = readObj('bj_stats'); return (s.handsPlayed || 0) >= 25; }},
    {id:'bj_50_hands', title:'🃏 Table Regular', desc:'Play 50 blackjack hands', reward: 1000,
      check:()=> { const s = readObj('bj_stats'); return (s.handsPlayed || 0) >= 50; }},
    {id:'bj_first_win', title:'🏆 Winner Winner', desc:'Win a blackjack hand', reward: 100,
      check:()=> { const s = readObj('bj_stats'); return (s.handsWon || 0) >= 1; }},
    {id:'bj_10_wins', title:'🏆 On a Roll', desc:'Win 10 blackjack hands', reward: 500,
      check:()=> { const s = readObj('bj_stats'); return (s.handsWon || 0) >= 10; }},
    {id:'bj_streak_3', title:'🔥 Hot Streak', desc:'Win 3 blackjack hands in a row', reward: 300,
      check:()=> { const s = readObj('bj_stats'); return (s.bestStreak || 0) >= 3; }},
    {id:'bj_streak_5', title:'🔥 Unstoppable', desc:'Win 5 in a row at blackjack', reward: 1000,
      check:()=> { const s = readObj('bj_stats'); return (s.bestStreak || 0) >= 5; }},
    {id:'bj_streak_10', title:'🔥 Legendary Streak', desc:'Win 10 in a row at blackjack', reward: 5000,
      check:()=> { const s = readObj('bj_stats'); return (s.bestStreak || 0) >= 10; }},

    // ===================== SCRATCH-OFFS =====================
    {id:'scratch_5', title:'🎫 Ticket Buyer', desc:'Buy 5 scratch-off tickets', reward: 100,
      check:()=> readNum('vc_scratch_tickets_bought') >= 5},
    {id:'scratch_25', title:'🎫 Scratch Fanatic', desc:'Buy 25 scratch-off tickets', reward: 500,
      check:()=> readNum('vc_scratch_tickets_bought') >= 25},
    {id:'scratch_50', title:'🎫 Scratch Addict', desc:'Buy 50 tickets', reward: 1000,
      check:()=> readNum('vc_scratch_tickets_bought') >= 50},
    {id:'scratch_winner', title:'🎉 Lucky Scratcher', desc:'Win $1,000+ total from scratch-offs', reward: 500,
      check:()=> readNum('vc_scratch_total_won') >= 1000},
    {id:'scratch_big_winner', title:'🎉 Scratch Millionaire', desc:'Win $10,000+ total from scratch-offs', reward: 2000,
      check:()=> readNum('vc_scratch_total_won') >= 10000},
    {id:'scratch_whale', title:'🐋 Scratch Whale', desc:'Spend $5,000+ on scratch-offs', reward: 1500,
      check:()=> readNum('vc_scratch_total_spent') >= 5000},

    // ===================== VIP / PLATINUM =====================
    {id:'vip_access', title:'👑 VIP Member', desc:'Get access to the VIP Casino', reward: 1000,
      check:()=> localStorage.getItem('vc_vip_access') === 'true'},
    {id:'vip_bar_visit', title:'🍸 First Drink', desc:'Order a drink at the VIP Bar', reward: 200,
      check:()=> readBool('ach_first_drink')},
    {id:'bar_regular', title:'🍸 Bar Regular', desc:'Order 5 drinks at the VIP Bar', reward: 500,
      check:()=> readNum('ach_drinks_ordered') >= 5},
    {id:'bar_connoisseur', title:'🍹 Mixologist', desc:'Order 10 drinks', reward: 1000,
      check:()=> readNum('ach_drinks_ordered') >= 10},
    {id:'bar_legend', title:'🥃 Bar Legend', desc:'Order 25 drinks', reward: 2500,
      check:()=> readNum('ach_drinks_ordered') >= 25},
    {id:'red_drink', title:'❤️‍🔥 Premium Taste', desc:'Order a red diamond drink', reward: 5000,
      check:()=> readBool('ach_red_drink_ordered')},

    // ===================== PLATINUM GAMES =====================
    {id:'crash_player', title:'🚀 Rocket Man', desc:'Play Rocket Crash', reward: 200,
      check:()=> readBool('ach_crash_played')},
    {id:'crash_5x', title:'🚀 To The Moon', desc:'Cash out at 5x+ in Rocket Crash', reward: 1000,
      check:()=> readBool('ach_crash_5x')},
    {id:'crash_10x', title:'🚀 Stratosphere', desc:'Cash out at 10x+ in Rocket Crash', reward: 5000,
      check:()=> readBool('ach_crash_10x')},
    {id:'wheel_player', title:'🎡 Wheel Spinner', desc:'Spin the Fortune Wheel', reward: 200,
      check:()=> readBool('ach_wheel_played')},
    {id:'wheel_jackpot', title:'🎡 Jackpot!', desc:'Hit the jackpot on the Fortune Wheel', reward: 5000,
      check:()=> readBool('ach_wheel_jackpot')},

    // ===================== SHOPPING =====================
    {id:'first_purchase', title:'🛍️ First Purchase', desc:'Buy your first item from the Shop', reward: 200,
      check:()=> readArr('vc_inventory').length >= 1},
    {id:'shopaholic', title:'🛍️ Shopaholic', desc:'Own 5 items', reward: 1000,
      check:()=> readArr('vc_inventory').length >= 5},
    {id:'collector', title:'🛍️ Collector', desc:'Own 10 items', reward: 3000,
      check:()=> readArr('vc_inventory').length >= 10},
    {id:'hoarder', title:'🛍️ Hoarder', desc:'Own 15 items', reward: 5000,
      check:()=> readArr('vc_inventory').length >= 15},
    {id:'own_everything', title:'🛍️ Buy Everything', desc:'Own 20+ items', reward: 25000,
      check:()=> readArr('vc_inventory').length >= 20},

    // ===================== SOCIAL =====================
    {id:'first_post', title:'📱 First Post', desc:'Make your first social post', reward: 100,
      check:()=> readArr('vc_social_posts').length >= 1},
    {id:'content_creator', title:'📱 Content Creator', desc:'Make 10 social posts', reward: 500,
      check:()=> readArr('vc_social_posts').length >= 10},
    {id:'influencer', title:'📱 Influencer', desc:'Make 25 social posts', reward: 2000,
      check:()=> readArr('vc_social_posts').length >= 25},
    {id:'viral', title:'📱 Going Viral', desc:'Make 50 social posts', reward: 5000,
      check:()=> readArr('vc_social_posts').length >= 50},

    // ===================== SURGERY / BODY =====================
    {id:'surgery_visitor', title:'🏥 Emergency Medicine', desc:'Visit the surgery center', reward: 200,
      check:()=> readBool('ach_surgery_visited')},
    {id:'surgery_repeat', title:'🏥 Repeat Customer', desc:'Have surgery twice', reward: 500,
      check:()=> readNum('vc_surgery_uses') >= 2},
    {id:'surgery_addict', title:'🏥 Surgery Addict', desc:'Have surgery 5 times', reward: 1500,
      check:()=> readNum('vc_surgery_uses') >= 5},
    {id:'surgery_veteran', title:'🏥 Surgery Veteran', desc:'Have surgery 10 times', reward: 500,
      check:()=> readNum('vc_surgery_uses') >= 10},
    {id:'scratch_100', title:'🎫 Scratch Maniac', desc:'Buy 100 scratch-off tickets', reward: 300,
      check:()=> readNum('vc_scratch_tickets_bought') >= 100},
    {id:'bj_100_hands', title:'🃏 Blackjack Master', desc:'Play 100 blackjack hands', reward: 2000,
      check:()=> { const s = readObj('bj_stats'); return (s.handsPlayed || 0) >= 100; }},

    // ===================== HIGH ROLLER =====================
    {id:'high_roller_1', title:'🎲 Lucky Streak', desc:'Win 3 games in a row', reward: 200,
      check:()=> readNum('vc_win_streak') >= 3},
    {id:'high_roller_2', title:'🎲 Hot Hand', desc:'Win 5 games in a row', reward: 500,
      check:()=> readNum('vc_win_streak') >= 5},
    {id:'high_roller_3', title:'🎲 Unstoppable', desc:'Win 10 games in a row', reward: 2000,
      check:()=> readNum('vc_win_streak') >= 10},
    {id:'high_roller_4', title:'🎲 Casino Legend', desc:'Win 20 games in a row', reward: 5000,
      check:()=> readNum('vc_win_streak') >= 20},

    // ===================== SPECIAL LOCATIONS =====================
    {id:'coal_escape', title:'🔑 Great Escape', desc:'Escape the coal mine', reward: 1000,
      check:()=> readBool('vc_coal_mine_escaped')},
    {id:'net_profit_1k', title:'📈 In The Green', desc:'Have a net profit of $1,000+', reward: 300,
      check:()=> (vc.readCredits() - 500) >= 1000},
    {id:'net_profit_10k', title:'📈 Profit King', desc:'Have a net profit of $10,000+', reward: 1000,
      check:()=> (vc.readCredits() - 500) >= 10000},

    // ===================== CHAD'S COURSE =====================
    {id:'buy_course', title:'🎓 Student of Success', desc:"Buy Chad Moneybags' Course", reward: 1000000,
      check:()=> readBool('vc_chads_course_owned')},
    {id:'passive_1k', title:'💰 Passive Income', desc:"Earn $1,000 from Chad's course", reward: 300,
      check:()=> readNum('vc_chads_course_total_earned') >= 1000},
    {id:'passive_10k', title:'💰 Cash Cow', desc:"Earn $10,000 from course", reward: 2000,
      check:()=> readNum('vc_chads_course_total_earned') >= 10000},

    // ===================== MILESTONES =====================
    {id:'achievement_10', title:'🏆 Achievement Hunter', desc:'Unlock 10 achievements', reward: 1000,
      check:()=> Object.keys(readObj(ACH_KEY)).length >= 10},
    {id:'achievement_25', title:'🏆 Completionist', desc:'Unlock 25 achievements', reward: 5000,
      check:()=> Object.keys(readObj(ACH_KEY)).length >= 25},
    {id:'achievement_50', title:'🏆 Half Way There', desc:'Unlock 50 achievements', reward: 25000,
      check:()=> Object.keys(readObj(ACH_KEY)).length >= 50},
    {id:'achievement_75', title:'🏆 Almost Perfect', desc:'Unlock 75 achievements', reward: 100000,
      check:()=> Object.keys(readObj(ACH_KEY)).length >= 75},
    {id:'achievement_all', title:'👑 True Master', desc:'Unlock ALL achievements', reward: 10000000,
      check:()=> {
        const state = readObj(ACH_KEY);
        // -1 because this achievement itself can't be unlocked when checking
        return Object.keys(state).length >= defs.length - 1;
      }},

    // ===================== HIDDEN / SECRET =====================
    {id:'help_seeker', title:'❓ Help Seeker', desc:'Watch the help video', reward: 100,
      check:()=> readBool('ach_help_watched')},
    {id:'ad_clicker', title:'📺 Ad Viewer', desc:'Click on an advertisement', reward: 50,
      check:()=> readBool('ach_ad_clicked')},
    {id:'popup_survivor', title:'🚫 Popup Survivor', desc:'Survive popup hell', reward: 200,
      check:()=> readBool('ach_popup_survived')},
    {id:'night_owl', title:'🌙 Night Owl', desc:'Play between midnight and 5am', reward: 500,
      check:()=> { const h = new Date().getHours(); return h >= 0 && h < 5; }},
    {id:'patience', title:'⏳ Patience', desc:'Have the page open for 10+ minutes', reward: 300,
      check:()=> readBool('ach_patient')},
  ];

  // === STATE MANAGEMENT ===
  function readState(){ try{ return JSON.parse(localStorage.getItem(ACH_KEY) || '{}'); }catch(e){ return {}; }}
  function writeState(s){ localStorage.setItem(ACH_KEY, JSON.stringify(s)); }

  function notifyUnlocked(def){
    try{
      if(def.reward && def.reward > 0 && window.vc && typeof window.vc.readBalance === 'function' && typeof window.vc.writeBalance === 'function') {
        window.vc.writeBalance(window.vc.readBalance() + def.reward);
      }
      const rewardText = def.reward ? ` +$${def.reward.toLocaleString()}` : '';
      if(window.vc && typeof window.vc.showBigMessage === 'function'){
        window.vc.showBigMessage(`${def.title} unlocked!${rewardText}`, 2500);
      }
      if(window.vc && typeof window.vc.confetti === 'function') window.vc.confetti(36);
      if(window.vc && typeof window.vc.setBuddyText === 'function'){
        window.vc.setBuddyText(`Achievement unlocked: ${def.title}${rewardText}`);
      }
    }catch(e){}
    console.log('Achievement unlocked:', def.id, def.title, 'Reward: $' + (def.reward || 0));
  }

  function checkAll(){
    const prev = readState();
    const state = Object.assign({}, prev);
    const newly = [];
    defs.forEach(d=>{
      if(!state[d.id]){
        try{ if(d.check()){ state[d.id] = Date.now(); newly.push(d); } }catch(e){}
      }
    });
    if(newly.length > 0) writeState(state);
    return {state, newly};
  }

  function render(){
    const container = document.getElementById('achievements');
    if(!container){
      // Not on achievements page — just check and notify
      const res = checkAll();
      res.newly.forEach(d => notifyUnlocked(d));
      return;
    }
    const res = checkAll();
    const state = res.state;
    const newly = res.newly || [];

    container.innerHTML = '';
    defs.forEach(d=>{
      const el = document.createElement('div');
      el.className = 'achievement';
      const unlocked = !!state[d.id];
      const rewardText = d.reward ? ` (+$${d.reward.toLocaleString()})` : '';
      el.innerHTML = `
        <div class="ach-title">${d.title}${rewardText}</div>
        <div class="ach-desc">${d.desc || ''}</div>
        <div class="ach-status">${unlocked ? '<span class="done">✅ Unlocked</span>' : '<span class="locked">🔒 Locked</span>'}</div>
      `;
      if(unlocked) el.classList.add('unlocked');
      container.appendChild(el);

      const foundNew = newly.find(x=>x.id===d.id);
      if(foundNew){
        setTimeout(()=>{
          el.classList.add('fresh');
          setTimeout(()=> el.classList.remove('fresh'), 2000);
        }, 40);
        notifyUnlocked(d);
      }
    });

    const counterEl = document.getElementById('achievement-counter');
    if(counterEl) counterEl.textContent = `${Object.keys(state).length}/${defs.length} Achievements Unlocked`;
  }

  // === TRACKING FUNCTIONS ===
  window.vc = window.vc || {};

  // Game Visit Tracking
  window.vc.markSlotsVisited = function(){ localStorage.setItem('ach_visited_slots', '1'); render(); };
  window.vc.markBlackjackVisited = function(){ localStorage.setItem('ach_visited_blackjack', '1'); render(); };
  window.vc.markPokerVisited = function(){ localStorage.setItem('ach_visited_poker', '1'); render(); };
  window.vc.markScratchVisited = function(){ localStorage.setItem('ach_visited_scratch', '1'); render(); };

  // VIP Bar Tracking
  window.vc.markDrinkOrdered = function(isRed){
    localStorage.setItem('ach_first_drink', '1');
    const count = readNum('ach_drinks_ordered') + 1;
    localStorage.setItem('ach_drinks_ordered', String(count));
    if(isRed) localStorage.setItem('ach_red_drink_ordered', '1');
    render();
  };

  // Platinum Games Tracking
  window.vc.markCrashPlayed = function(){ localStorage.setItem('ach_crash_played', '1'); render(); };
  window.vc.markCrash5x = function(){ localStorage.setItem('ach_crash_5x', '1'); render(); };
  window.vc.markCrash10x = function(){ localStorage.setItem('ach_crash_10x', '1'); render(); };
  window.vc.markWheelPlayed = function(){ localStorage.setItem('ach_wheel_played', '1'); render(); };
  window.vc.markWheelJackpot = function(){ localStorage.setItem('ach_wheel_jackpot', '1'); render(); };

  // Roulette Tracking
  window.vc.markRouletteEntered = function(){ localStorage.setItem('ach_roulette_entered', '1'); render(); };
  window.vc.markRoulettePlay = function(){ localStorage.setItem('ach_roulette_survivor', '1'); render(); };

  // Special Location Tracking
  window.vc.markCoalMineEscaped = function(){ localStorage.setItem('vc_coal_mine_escaped', '1'); render(); };
  window.vc.markHellsVisited = function(){ localStorage.setItem('ach_hells_visited', '1'); render(); };
  window.vc.markHellsEscaped = function(){ localStorage.setItem('ach_hells_escaped', '1'); render(); };

  // Medical Tracking
  window.vc.markSurgeryVisited = function(){ localStorage.setItem('ach_surgery_visited', '1'); render(); };
  window.vc.markSurgeryUsed = function(){
    const count = readNum('vc_surgery_uses') + 1;
    localStorage.setItem('vc_surgery_uses', String(count));
    render();
  };

  // Business Tracking
  window.vc.markCoursePurchased = function(){ localStorage.setItem('vc_chads_course_owned', '1'); render(); };

  // Debt cleared tracking
  window.vc.markDebtCleared = function(){ localStorage.setItem('ach_debt_cleared', '1'); render(); };

  // Misc Tracking
  window.vc.markHelpWatched = function(){ localStorage.setItem('ach_help_watched', '1'); render(); };
  window.vc.markAdClicked = function(){ localStorage.setItem('ach_ad_clicked', '1'); render(); };
  window.vc.markPopupSurvived = function(){ localStorage.setItem('ach_popup_survived', '1'); render(); };
  window.vc.markShopVisited = function(){ render(); }; // shop achievements are data-driven
  window.vc.markUndergroundVisited = function(){ render(); }; // compat stub

  // Patience achievement — set after 10 minutes
  setTimeout(()=>{
    localStorage.setItem('ach_patient', '1');
    render();
  }, 600000);

  // Make checks reactive: override vc.updateBalance/updateDebt to re-render
  if(window.vc && typeof window.vc.updateBalance === 'function' && typeof window.vc.updateDebt === 'function') {
    const origBal = vc.updateBalance;
    const origDebt = vc.updateDebt;
    vc.updateBalance = function(){ origBal(); render(); };
    vc.updateDebt = function(){
      // Check if debt was just cleared
      const debtBefore = Number(localStorage.getItem('vc_debt') || 0);
      origDebt();
      const debtAfter = Number(localStorage.getItem('vc_debt') || 0);
      if(debtBefore > 0 && debtAfter <= 0) {
        localStorage.setItem('ach_debt_cleared', '1');
      }
      render();
    };
  }

  // Periodic re-check every 5 seconds to catch data-driven achievements
  setInterval(()=>{ render(); }, 5000);

  // === CUSTOM MODAL (for achievements page) ===
  function showCustomModal(title, message, callback) {
    const modal = document.getElementById('custom-modal');
    if(!modal) return;
    const modalTitle = document.getElementById('modal-title');
    const modalMessage = document.getElementById('modal-message');
    const modalConfirm = document.getElementById('modal-confirm');
    const modalCancel = document.getElementById('modal-cancel');

    modalTitle.textContent = title;
    modalMessage.innerHTML = message;
    modal.style.display = 'flex';

    const handleConfirm = () => {
      modal.style.display = 'none';
      modalConfirm.removeEventListener('click', handleConfirm);
      modalCancel.removeEventListener('click', handleCancel);
      callback(true);
    };
    const handleCancel = () => {
      modal.style.display = 'none';
      modalConfirm.removeEventListener('click', handleConfirm);
      modalCancel.removeEventListener('click', handleCancel);
      callback(false);
    };
    modalConfirm.addEventListener('click', handleConfirm);
    modalCancel.addEventListener('click', handleCancel);
  }

  document.getElementById('reset-achievements')?.addEventListener('click', ()=>{
    const message = `
      <div style="text-align: center; margin: 20px 0;">
        <div style="font-size: 3em; margin-bottom: 16px;">⚠️</div>
        <div style="font-size: 1.2em; font-weight: bold; color: #fca5a5; margin-bottom: 12px;">COMPLETE RESET WARNING</div>
        <div style="line-height: 1.6; margin-bottom: 16px;">
          This will reset <strong>EVERYTHING</strong> including:
        </div>
        <div style="text-align: left; display: inline-block; margin-bottom: 16px;">
          • All achievements and progress<br>
          • Balance (back to $1,000)<br>
          • Debt (back to $0)<br>
          • Diamonds & Red Diamonds<br>
          • All promo codes<br>
          • VIP status and perks<br>
          • Inventory & Social posts<br>
          • All game history<br>
        </div>
        <div style="font-weight: bold; color: #fbbf24;">
          This action cannot be undone!
        </div>
      </div>
    `;

    showCustomModal('🔄 Reset Everything?', message, (confirmed) => {
      if (!confirmed) return;
      localStorage.clear();
      render();
      if (window.vc) {
        if (typeof window.vc.updateBalance === 'function') window.vc.updateBalance();
        if (typeof window.vc.updateDebt === 'function') window.vc.updateDebt();
        if (typeof window.vc.showBigMessage === 'function') window.vc.showBigMessage('🔄 Complete reset!', 3000);
        if (typeof window.vc.setBuddyText === 'function') window.vc.setBuddyText('Fresh start! All data reset.');
      }
      setTimeout(() => window.location.reload(), 1500);
    });
  });

  window.vc.render = render;
  render();
});
