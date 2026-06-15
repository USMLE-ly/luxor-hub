// ==UserScript==
// @name         Ω Omega Million Bot
// @namespace    http://shannon-omega.io/
// @version      3.0
// @description  SHANNON-Ω Million Follower Engine — anti-ban safe growth
// @author       SHANNON-Ω
// @match        https://www.instagram.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=instagram.com
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_log
// @grant        GM_addStyle
// @grant        GM_deleteValue
// @grant        GM_listValues
// @grant        unsafeWindow
// ==/UserScript==

(function() {
    'use strict';

    // ═══════════════════════════════════════════════
    //  ANTI-BAN CONFIG (from million_bot research)
    // ═══════════════════════════════════════════════
    const CONFIG = {
        // Daily limits (Instagram's "follow cliff" at ~150)
        dailyFollowLimit: parseInt(GM_getValue('dfl', '100')),
        dailyLikeLimit: parseInt(GM_getValue('dll', '300')),
        dailyUnfollowLimit: parseInt(GM_getValue('dul', '60')),
        
        // Hourly limits
        hourlyFollowLimit: 30,
        hourlyLikeLimit: 100,
        
        // Delays (human-like)
        minDelay: 8,      // seconds
        maxDelay: 14,
        pauseChance: 0.08, // 8% chance of extended pause
        pauseMin: 5,
        pauseMax: 12,
        
        // Scrolling
        scrollMin: 150,  // px
        scrollMax: 350,
        
        // Action window (8AM - 11PM)
        actionStartHour: 8,
        actionEndHour: 23,
        
        // Growth targets
        likesPerTarget: 3,
        followsPerTarget: 5,
        
        // Competitors (luxury watch niche)
        competitors: [
            'rolex', 'audemarspiguet', 'patekphilippe', 'hublot', 'richardmille',
            'omegawatches', 'tagheuer', 'iwc', 'panerai', 'breitling',
            'zenithwatches', 'grandseiko', 'tissot', 'seikowatches', 'citizenwatch'
        ],
        
        // Hashtags
        hashtags: [
            'watches', 'luxury', 'watchfam', 'style', 'timepiece',
            'watchcollector', 'horology', 'swissmade', 'luxurywatches'
        ],
        
        // Session tracking
        sessionFile: '/root/Documents/Codex/2026-06-08/make-the-deepseek-v4-flash-free/omega/session_cookies.json',
        
        // Shared GM keys
        keys: {
            state: 'omega_state',
            cookies: 'omega_cookies',
            stats: 'omega_stats',
        }
    };

    // ═══════════════════════════════════════════════
    //  STATE MANAGEMENT
    // ═══════════════════════════════════════════════

    function getState() {
        try { return JSON.parse(GM_getValue(CONFIG.keys.state, '{}')); }
        catch(e) { return {}; }
    }

    function setState(obj) {
        const current = getState();
        Object.assign(current, obj);
        current.updated = Date.now();
        GM_setValue(CONFIG.keys.state, JSON.stringify(current));
    }

    function getStats() {
        try { return JSON.parse(GM_getValue(CONFIG.keys.stats, '{}')); }
        catch(e) { return {}; }
    }

    function saveStats(stats) {
        GM_setValue(CONFIG.keys.stats, JSON.stringify(stats));
    }

    // ═══════════════════════════════════════════════
    //  ANTI-BAN ENGINE
    // ═══════════════════════════════════════════════

    const stats = getStats();
    if (!stats.date || stats.date !== today()) {
        stats.date = today();
        stats.follows = 0;
        stats.likes = 0;
        stats.unfollows = 0;
        stats.hourlyLikes = 0;
        stats.hourlyFollows = 0;
        stats.hourReset = Date.now();
        stats.sessionCount = (stats.sessionCount || 0) + 1;
    }
    // Reset hourly counters every hour
    if (Date.now() - (stats.hourReset || 0) > 3600000) {
        stats.hourlyLikes = 0;
        stats.hourlyFollows = 0;
        stats.hourReset = Date.now();
    }
    saveStats(stats);

    function today() {
        return new Date().toISOString().split('T')[0];
    }

    function inActionWindow() {
        const h = new Date().getHours();
        return h >= CONFIG.actionStartHour && h < CONFIG.actionEndHour;
    }

    function canLike() {
        return stats.likes < CONFIG.dailyLikeLimit &&
               stats.hourlyLikes < CONFIG.hourlyLikeLimit &&
               inActionWindow();
    }

    function canFollow() {
        return stats.follows < CONFIG.dailyFollowLimit &&
               stats.hourlyFollows < CONFIG.hourlyFollowLimit &&
               inActionWindow();
    }

    function humanDelay() {
        let ms = (CONFIG.minDelay + Math.random() * (CONFIG.maxDelay - CONFIG.minDelay)) * 1000;
        if (Math.random() < CONFIG.pauseChance) {
            ms += (CONFIG.pauseMin + Math.random() * (CONFIG.pauseMax - CONFIG.pauseMin)) * 1000;
        }
        return new Promise(r => setTimeout(r, ms));
    }

    function humanScroll() {
        const steps = 1 + Math.floor(Math.random() * 4);
        let total = 0;
        for (let i = 0; i < steps; i++) {
            const px = CONFIG.scrollMin + Math.random() * (CONFIG.scrollMax - CONFIG.scrollMin);
            window.scrollBy(0, px);
            total += px;
        }
        return total;
    }

    function randomTarget() {
        const all = [...CONFIG.competitors, ...CONFIG.hashtags];
        return all[Math.floor(Math.random() * all.length)];
    }

    function log(msg) {
        GM_log('[Ω] ' + msg);
        const el = document.getElementById('omega-log');
        if (el) {
            const d = document.createElement('div');
            d.style.cssText = 'color:#888;font-size:10px;margin:1px 0;';
            d.textContent = '> ' + msg;
            el.appendChild(d);
            el.scrollTop = el.scrollHeight;
            if (el.children.length > 50) el.removeChild(el.firstChild);
        }
    }

    // ═══════════════════════════════════════════════
    //  UI — Control Panel
    // ═══════════════════════════════════════════════

    GM_addStyle(`
        #omega-panel {
            position:fixed; bottom:20px; right:20px; z-index:99999;
            background:#1a1a2e; color:#fff; padding:16px; border-radius:12px;
            font-family:monospace; font-size:12px; min-width:240px;
            box-shadow:0 0 30px rgba(0,255,0,0.2); border:1px solid #00ff88;
            backdrop-filter:blur(8px); user-select:none;
        }
        #omega-panel .title {
            font-weight:bold; margin-bottom:8px; color:#00ff88;
            font-size:14px; letter-spacing:1px; cursor:move;
        }
        #omega-panel label { display:block; margin-bottom:4px; color:#aaa; font-size:10px; }
        #omega-panel input, #omega-panel select {
            width:100%; background:#16213e; color:#fff; border:1px solid #333;
            padding:4px 8px; border-radius:4px; box-sizing:border-box;
            font-family:monospace; font-size:11px;
        }
        #omega-panel .row { display:flex; gap:4px; margin:6px 0; }
        #omega-panel button {
            flex:1; border:none; padding:6px 8px; border-radius:6px;
            cursor:pointer; font-size:11px; font-weight:bold; transition:0.15s;
        }
        #omega-panel button:hover { transform:scale(1.03); }
        #omega-panel button:disabled { opacity:0.4; cursor:not-allowed; transform:none; }
        #omega-panel .g { background:#00ff88; color:#000; }
        #omega-panel .r { background:#ff6b6b; color:#fff; }
        #omega-panel .b { background:#4a4a6a; color:#fff; }
        #omega-panel .y { background:#ffd93d; color:#000; }
        #omega-panel .p { background:#a855f7; color:#fff; }
        #omega-panel .limits { font-size:10px; color:#666; margin:4px 0; }
        #omega-panel .limits span { color:#00ff88; }
        #omega-panel .limits .rspan { color:#ff6b6b; }
        #omega-panel .logbox { 
            font-size:10px; color:#666; margin-top:4px; max-height:80px;
            overflow-y:auto; background:#0d0d1a; border-radius:4px; padding:4px;
        }
        #omega-panel .close-btn { background:none; color:#555; border:none; cursor:pointer; font-size:10px; }
        @keyframes pulse { 0%{opacity:1} 50%{opacity:0.5} 100%{opacity:1} }
        #omega-panel .running { animation:pulse 1.5s infinite; color:#ffd93d; }
    `);

    function showLimits() {
        const remaining = CONFIG.dailyFollowLimit - stats.follows;
        const remainingL = CONFIG.dailyLikeLimit - stats.likes;
        const pctF = Math.round((stats.follows / CONFIG.dailyFollowLimit) * 100);
        const pctL = Math.round((stats.likes / CONFIG.dailyLikeLimit) * 100);
        const h = new Date().getHours();
        const active = (h >= CONFIG.actionStartHour && h < CONFIG.actionEndHour) ? '🟢' : '🔴';
        return `Today: follows ${stats.follows}/${CONFIG.dailyFollowLimit} (${pctF}%) | likes ${stats.likes}/${CONFIG.dailyLikeLimit} (${pctL}%) | ${active} ${h}:00`;
    }

    function buildPanel() {
        const p = document.getElementById('omega-panel');
        if (p) return p;

        const panel = document.createElement('div');
        panel.id = 'omega-panel';
        panel.innerHTML = `
            <div class="title">Ω MILLION BOT <span style="font-size:9px;color:#666;">v3</span></div>
            
            <label>Target / Hashtag
            <input id="omega-target" value="${GM_getValue('last_target', 'vaulex_watches')}" placeholder="username or #hashtag">
            </label>

            <div class="row">
                <button class="g" id="btn-like">❤ Like</button>
                <button class="r" id="btn-follow">➕ Follow</button>
                <button class="y" id="btn-unfollow">➖ Unfollow</button>
            </div>
            <div class="row">
                <button class="b" id="btn-cycle">🔄 Growth Cycle</button>
                <button class="p" id="btn-cookies">🍪 Export</button>
                <button class="b" id="btn-status">📊 Status</button>
            </div>

            <div class="limits">${showLimits()}</div>
            <div style="font-size:10px;color:#555;" id="omega-action-msg">Ready</div>
            <div class="logbox" id="omega-log"></div>

            <div style="display:flex;justify-content:space-between;margin-top:4px;">
                <button class="close-btn" id="btn-close">✕ hide</button>
                <span style="font-size:8px;color:#333;">Ctrl+F12</span>
            </div>
        `;
        document.body.appendChild(panel);

        // Make draggable
        let isDragging = false, startX, startY, origX, origY;
        const title = panel.querySelector('.title');
        title.onmousedown = (e) => {
            isDragging = true; startX = e.clientX; startY = e.clientY;
            origX = panel.offsetLeft; origY = panel.offsetTop;
        };
        document.onmousemove = (e) => {
            if (!isDragging) return;
            panel.style.left = (origX + e.clientX - startX) + 'px';
            panel.style.top = (origY + e.clientY - startY) + 'px';
            panel.style.right = 'auto';
            panel.style.bottom = 'auto';
        };
        document.onmouseup = () => { isDragging = false; };

        return panel;
    }

    // ═══════════════════════════════════════════════
    //  ACTIONS
    // ═══════════════════════════════════════════════

    function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

    async function goToProfile(username) {
        const clean = username.replace(/^#/, '');
        if (!window.location.href.includes('/' + clean + '/')) {
            window.location.href = 'https://www.instagram.com/' + clean + '/';
            await wait(3000);
        }
    }

    async function startLike() {
        if (!canLike()) {
            log('⛔ Like limit reached or outside action window');
            return;
        }

        const target = document.getElementById('omega-target').value.trim();
        const isHashtag = target.startsWith('#');
        document.getElementById('omega-action-msg').textContent = 'liking...';
        document.getElementById('btn-like').disabled = true;

        let count = 0;
        try {
            if (isHashtag) {
                const tag = target.replace('#', '');
                window.location.href = 'https://www.instagram.com/explore/tags/' + tag + '/';
                await wait(4000);
            } else if (target) {
                await goToProfile(target);
            }

            // Scroll to load posts
            humanScroll();
            await wait(2000);

            const posts = document.querySelectorAll('a[href*="/p/"]');
            log('Found ' + posts.length + ' posts');

            for (const link of posts) {
                if (!canLike()) {
                    log('⏸ Limit reached, stopping');
                    break;
                }

                try {
                    link.click();
                    await wait(2500 + Math.random() * 2000);

                    const svg = document.querySelector('svg[aria-label="Like"]');
                    if (svg) {
                        let el = svg.closest('button, div[role="button"]') || svg.parentElement;
                        while (el && el.tagName !== 'BUTTON' && el.tagName !== 'DIV' && !el.getAttribute('role')) {
                            el = el.parentElement;
                        }
                        if (el && el.click) {
                            el.click();
                            count++;
                            stats.likes++;
                            stats.hourlyLikes++;
                            saveStats(stats);
                            log('❤ Liked #' + count);
                            document.getElementById('omega-like-count').textContent = stats.likes;
                            updateLimits();
                        }
                    }

                    await wait(1500);

                    // Close
                    const closeSvg = document.querySelector('svg[aria-label="Close"]');
                    if (closeSvg) {
                        const closeBtn = closeSvg.closest('button') || closeSvg.parentElement;
                        if (closeBtn) closeBtn.click();
                    }

                    await humanDelay();
                } catch(e) {
                    log('Like error: ' + e.message);
                }
            }
        } catch(e) {
            log('Error: ' + e.message);
        }

        log('Done: ' + count + ' likes');
        document.getElementById('omega-action-msg').textContent = 'idle';
        document.getElementById('btn-like').disabled = false;
        updateLimits();
    }

    async function startFollow() {
        if (!canFollow()) {
            log('⛔ Follow limit reached or outside action window');
            return;
        }

        const target = document.getElementById('omega-target').value.trim();
        document.getElementById('omega-action-msg').textContent = 'following...';
        document.getElementById('btn-follow').disabled = true;

        let count = 0;
        try {
            if (target && !target.startsWith('#')) {
                await goToProfile(target);
                // Try followers link
                const fl = document.querySelector('a[href$="/followers/"]');
                if (fl) {
                    fl.click();
                    await wait(3000);
                }
            } else {
                // From hashtag or explore
                humanScroll();
                await wait(2000);
            }

            // Find follow buttons
            const allBtns = document.querySelectorAll('button');
            const followBtns = [];
            for (const btn of allBtns) {
                const txt = btn.textContent.trim().toLowerCase();
                if (txt === 'follow' && btn.offsetParent !== null && btn.offsetHeight > 0) {
                    followBtns.push(btn);
                }
            }
            log('Found ' + followBtns.length + ' followable users');

            for (const btn of followBtns) {
                if (!canFollow()) {
                    log('⏸ Limit reached');
                    break;
                }

                try {
                    btn.click();
                    count++;
                    stats.follows++;
                    stats.hourlyFollows++;
                    saveStats(stats);
                    log('➕ Followed #' + count);
                    updateLimits();
                    await humanDelay();
                } catch(e) {
                    log('Follow error: ' + e.message);
                }
            }
        } catch(e) {
            log('Error: ' + e.message);
        }

        log('Done: ' + count + ' follows');
        document.getElementById('omega-action-msg').textContent = 'idle';
        document.getElementById('btn-follow').disabled = false;
        updateLimits();
    }

    async function startUnfollow() {
        document.getElementById('omega-action-msg').textContent = 'unfollowing...';
        document.getElementById('btn-unfollow').disabled = true;

        let count = 0;
        try {
            window.location.href = 'https://www.instagram.com/' + (GM_getValue('last_target', 'chip.munk.19')) + '/';
            await wait(4000);

            const followingLink = document.querySelector('a[href$="/following/"]');
            if (followingLink) followingLink.click();
            await wait(3000);

            const unfollowBtns = document.querySelectorAll('button');
            let candidates = [];
            for (const btn of unfollowBtns) {
                const txt = btn.textContent.trim().toLowerCase();
                if (txt === 'following' && btn.offsetParent !== null) {
                    candidates.push(btn);
                }
            }

            for (const btn of candidates) {
                if (count >= CONFIG.dailyUnfollowLimit) break;

                try {
                    btn.click();
                    await wait(1000);
                    // Confirm "Unfollow"
                    const confirmBtn = document.querySelector('button:has-text("Unfollow")');
                    if (confirmBtn) confirmBtn.click();

                    count++;
                    stats.unfollows++;
                    saveStats(stats);
                    log('➖ Unfollowed #' + count);
                    updateLimits();
                    await humanDelay();
                } catch(e) {
                    log('Unfollow error: ' + e.message);
                }
            }
        } catch(e) {
            log('Error: ' + e.message);
        }

        log('Done: ' + count + ' unfollows');
        document.getElementById('omega-action-msg').textContent = 'idle';
        document.getElementById('btn-unfollow').disabled = false;
    }

    async function growthCycle() {
        log('🔄 Starting growth cycle...');
        document.getElementById('btn-cycle').disabled = true;

        // Phase 1: Like from hashtags
        const tag = CONFIG.hashtags[Math.floor(Math.random() * CONFIG.hashtags.length)];
        document.getElementById('omega-target').value = '#' + tag;
        GM_setValue('last_target', '#' + tag);
        await startLike();

        await wait(5000);

        // Phase 2: Follow competitors' followers
        const comp = CONFIG.competitors[Math.floor(Math.random() * CONFIG.competitors.length)];
        document.getElementById('omega-target').value = comp;
        GM_setValue('last_target', comp);
        await startFollow();

        log('🔄 Cycle complete!');
        document.getElementById('btn-cycle').disabled = false;
        document.getElementById('omega-action-msg').textContent = 'cycle done';
    }

    // ═══════════════════════════════════════════════
    //  COOKIE EXPORT (for bot reuse)
    // ═══════════════════════════════════════════════

    function exportCookies() {
        const cookies = document.cookie.split('; ').map(c => {
            const [n, ...v] = c.split('=');
            return { name: n.trim(), value: v.join('=') || '', domain: '.instagram.com', path: '/' };
        });

        // Add important cookies from localStorage if available
        const data = {
            cookies: cookies,
            userAgent: navigator.userAgent,
            url: window.location.href,
            exported: new Date().toISOString(),
        };

        const json = JSON.stringify(data, null, 2);
        GM_setValue(CONFIG.keys.cookies, json);

        // Copy to clipboard
        navigator.clipboard.writeText(json).then(() => {
            log('🍪 ' + cookies.length + ' cookies copied to clipboard');
        }).catch(() => {
            console.log('Ω COOKIES:', data);
            log('🍪 Cookies in console (F12)');
        });

        log('Cookies saved to GM storage');
    }

    function showStatus() {
        const s = getStats();
        const state = getState();
        const msg = 
            'Ω Stats:\n' +
            '  Session: ' + (s.sessionCount || 1) + '\n' +
            '  Today: ' + (s.follows || 0) + ' follows, ' + (s.likes || 0) + ' likes\n' +
            '  Limits: ' + CONFIG.dailyFollowLimit + ' follows/day, ' + CONFIG.dailyLikeLimit + ' likes/day\n' +
            '  Window: ' + CONFIG.actionStartHour + ':00-' + CONFIG.actionEndHour + ':00\n' +
            '  Delays: ' + CONFIG.minDelay + '-' + CONFIG.maxDelay + 's\n' +
            '  Pause: ' + Math.round(CONFIG.pauseChance * 100) + '% chance\n' +
            '  Target: ' + (state.lastTarget || 'none') + '\n' +
            '  Updated: ' + (state.updated ? new Date(state.updated).toLocaleString() : 'never');
        alert(msg);
        log('Status shown');
    }

    function updateLimits() {
        const el = document.querySelector('#omega-panel .limits');
        if (el) el.textContent = showLimits();
        const msgEl = document.querySelector('#omega-panel #omega-action-msg');
        if (msgEl) {
            msgEl.textContent = 'ready | ' + new Date().toLocaleTimeString();
        }
    }

    // Refresh limits every 30s
    setInterval(updateLimits, 30000);

    // ═══════════════════════════════════════════════
    //  INIT
    // ═══════════════════════════════════════════════

    function init() {
        const panel = buildPanel();
        log('Ω Million Bot loaded');

        // Wire buttons
        document.getElementById('btn-like').onclick = startLike;
        document.getElementById('btn-follow').onclick = startFollow;
        document.getElementById('btn-unfollow').onclick = startUnfollow;
        document.getElementById('btn-cycle').onclick = growthCycle;
        document.getElementById('btn-cookies').onclick = exportCookies;
        document.getElementById('btn-status').onclick = showStatus;
        document.getElementById('btn-close').onclick = () => panel.style.display = 'none';

        // Save target on change
        document.getElementById('omega-target').onchange = function() {
            GM_setValue('last_target', this.value);
            setState({ lastTarget: this.value });
        };

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'F12') {
                e.preventDefault();
                panel.style.display = 'block';
            }
            if (e.key === 'l' && panel.style.display !== 'none') {
                startLike();
            }
            if (e.key === 'f' && panel.style.display !== 'none') {
                startFollow();
            }
        });

        updateLimits();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
