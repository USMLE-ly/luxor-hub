// ==UserScript==
// @name         Omega Instagram Auto Liker
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Auto-like and auto-follow for Instagram growth
// @author       SHANNON-Ω
// @match        https://www.instagram.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=instagram.com
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_log
// ==/UserScript==

(function() {
    'use strict';

    const CONFIG = {
        likeInterval: parseInt(GM_getValue('likeInterval', '3000')),  // ms between likes
        followInterval: parseInt(GM_getValue('followInterval', '5000')),
        maxLikes: parseInt(GM_getValue('maxLikes', '50')),
        maxFollows: parseInt(GM_getValue('maxFollows', '20')),
        target: GM_getValue('target', 'vaulex_watches'),
        autoLike: GM_getValue('autoLike', 'true') === 'true',
        autoFollow: GM_getValue('autoFollow', 'true') === 'true',
    };

    GM_log(`Ω Omega Auto: target=@${CONFIG.target}`);

    // Add control panel to page
    function addControlPanel() {
        const panel = document.createElement('div');
        panel.id = 'omega-controls';
        panel.innerHTML = `
            <div style="position:fixed;bottom:20px;right:20px;z-index:99999;
                background:#1a1a2e;color:#fff;padding:12px;border-radius:8px;
                font-family:monospace;font-size:12px;min-width:200px;
                box-shadow:0 0 20px rgba(0,255,0,0.3);border:1px solid #00ff88;">
                <div style="font-weight:bold;margin-bottom:8px;color:#00ff88;">
                    Ω OMEGA BOT
                </div>
                <div style="margin-bottom:6px;">
                    <label>Target: <input id="omega-target" value="${CONFIG.target}"
                        style="width:100px;background:#16213e;color:#fff;border:1px solid #333;padding:2px 4px;"></label>
                </div>
                <div style="margin-bottom:6px;">
                    <button id="omega-like-btn"
                        style="background:#00ff88;color:#000;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;">
                        ❤ Like Posts
                    </button>
                    <button id="omega-follow-btn"
                        style="background:#ff6b6b;color:#fff;border:none;padding:4px 12px;border-radius:4px;cursor:pointer;margin-left:4px;">
                        ➕ Follow
                    </button>
                </div>
                <div style="font-size:10px;color:#888;">
                    Likes: <span id="omega-like-count">0</span> |
                    Follows: <span id="omega-follow-count">0</span>
                </div>
                <div style="margin-top:4px;">
                    <button id="omega-close-btn" style="background:none;color:#666;border:none;cursor:pointer;font-size:10px;">
                        ✕ hide
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);

        // Button handlers
        document.getElementById('omega-like-btn').onclick = startAutoLike;
        document.getElementById('omega-follow-btn').onclick = startAutoFollow;
        document.getElementById('omega-close-btn').onclick = () => panel.style.display = 'none';
    }

    async function startAutoLike() {
        GM_log('Ω Starting auto-like...');
        let count = 0;
        const posts = document.querySelectorAll('article a[href*="/p/"]');
        for (const post of posts) {
            if (count >= CONFIG.maxLikes) break;
            post.click();
            await new Promise(r => setTimeout(r, 2000));
            const likeBtn = document.querySelector('svg[aria-label="Like"]');
            if (likeBtn) {
                likeBtn.closest('button')?.click();
                count++;
                document.getElementById('omega-like-count').textContent = count;
                GM_log(`Ω Liked ${count}`);
            }
            const closeBtn = document.querySelector('svg[aria-label="Close"]');
            if (closeBtn) closeBtn.closest('button')?.click();
            await new Promise(r => setTimeout(r, CONFIG.likeInterval));
        }
        GM_log(`Ω Auto-like complete: ${count} likes`);
    }

    async function startAutoFollow() {
        GM_log('Ω Starting auto-follow...');
        let count = 0;
        const followBtns = document.querySelectorAll('button:has-text("Follow")');
        for (const btn of followBtns) {
            if (count >= CONFIG.maxFollows) break;
            btn.click();
            count++;
            document.getElementById('omega-follow-count').textContent = count;
            GM_log(`Ω Followed ${count}`);
            await new Promise(r => setTimeout(r, CONFIG.followInterval));
        }
        GM_log(`Ω Auto-follow complete: ${count} follows`);
    }

    // Init on page load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', addControlPanel);
    } else {
        addControlPanel();
    }
})();
