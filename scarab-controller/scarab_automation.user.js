// ==UserScript==
// @name         SCARAB - Quora Automation Bridge v2
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  ZORG-OMEGA Quora automation — post answers, bypass Cloudflare
// @author       ZORG-OMEGA
// @match        https://www.quora.com/*
// @match        https://quora.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_listValues
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    var SCARAB_KEY = 'scarab_quora_cmd';
    var RESPONSE_KEY = 'scarab_quora_resp';
    var QUEUE_KEY = 'scarab_quora_queue';
    var COOKIE_KEY = 'scarab_quora_cookies';
    var INTERVAL = 2000;

    GM_addStyle(
        '#scarab-panel{position:fixed;bottom:20px;right:20px;z-index:99999;' +
        'background:#1a1a2e;color:#e0e0e0;padding:16px;border-radius:12px;' +
        'font-family:monospace;font-size:13px;max-width:420px;max-height:80vh;' +
        'overflow-y:auto;box-shadow:0 0 30px rgba(0,0,0,0.7);border:1px solid #e94560;}' +
        '#scarab-panel h3{margin:0 0 8px;color:#e94560;}' +
        '#scarab-panel .status{background:#e94560;padding:4px 8px;border-radius:4px;}' +
        '#scarab-panel .queue-item{padding:8px;margin:4px 0;background:#16213e;' +
        'border-radius:6px;border-left:3px solid #e94560;}' +
        '#scarab-panel .queue-item:hover{background:#0f3460;}' +
        '#scarab-panel .btn{background:#e94560;color:white;border:none;' +
        'padding:6px 14px;border-radius:6px;cursor:pointer;font-size:12px;margin:2px;}' +
        '#scarab-panel .log{color:#aaa;font-size:11px;margin:2px 0;}'
    );

    var panel = null;
    var logContainer = null;
    var queueContainer = null;

    function log(msg) {
        if (!logContainer) return;
        var div = document.createElement('div');
        div.className = 'log';
        div.textContent = '[' + new Date().toLocaleTimeString() + '] ' + msg;
        logContainer.appendChild(div);
        logContainer.scrollTop = logContainer.scrollHeight;
    }

    function createPanel() {
        panel = document.createElement('div');
        panel.id = 'scarab-panel';
        panel.innerHTML =
            '<h3>SCARAB v2 — ZORG-OMEGA</h3>' +
            '<div class="status" id="scarab-status">READY</div>' +
            '<div style="margin:8px 0">' +
            '<button class="btn" id="scarab-post">Post from Queue</button>' +
            '<button class="btn" id="scarab-refresh">Refresh Cookies</button>' +
            '<button class="btn" id="scarab-clear">Clear Queue</button>' +
            '<button class="btn" id="scarab-hide">Hide</button></div>' +
            '<div><strong>Content Queue:</strong></div>' +
            '<div id="scarab-queue" style="max-height:200px;overflow-y:auto;margin:4px 0;"></div>' +
            '<div><strong>Log:</strong></div>' +
            '<div id="scarab-log" style="max-height:150px;overflow-y:auto;' +
            'background:#0a0a1a;padding:4px;border-radius:4px;"></div>';
        document.body.appendChild(panel);
        logContainer = panel.querySelector('#scarab-log');
        queueContainer = panel.querySelector('#scarab-queue');

        panel.querySelector('#scarab-post').onclick = postFromQueue;
        panel.querySelector('#scarab-refresh').onclick = refreshCookies;
        panel.querySelector('#scarab-clear').onclick = function() {
            GM_setValue(QUEUE_KEY, JSON.stringify([]));
            updateQueue();
            log('Queue cleared');
        };
        panel.querySelector('#scarab-hide').onclick = function() {
            panel.style.display = 'none';
        };

        log('Panel loaded');
        updateQueue();
    }

    function getQueue() {
        try { return JSON.parse(GM_getValue(QUEUE_KEY, '[]')); }
        catch(e) { return []; }
    }

    function setQueue(queue) {
        GM_setValue(QUEUE_KEY, JSON.stringify(queue));
    }

    function updateQueue() {
        if (!queueContainer) return;
        var queue = getQueue();
        if (queue.length === 0) {
            queueContainer.innerHTML = '<div class="log" style="color:#666;">Empty</div>';
            return;
        }
        var html = '';
        for (var i = 0; i < queue.length; i++) {
            var item = queue[i];
            var topic = (item.topic || 'Untitled').substring(0, 40);
            var platform = item.platform || 'quora';
            var chars = (item.content || '').length;
            var status = item.status || 'pending';
            html += '<div class="queue-item">' +
                '<div><strong>#' + (i+1) + '</strong> ' + topic + '</div>' +
                '<div style="font-size:11px;color:#aaa;">' + platform + ' / ' + chars + ' chars</div>' +
                '<div style="font-size:11px;color:#e94560;">' + status +
                ' <button class="btn" data-post="' + i + '" style="font-size:10px;padding:2px 8px;">Post</button>' +
                ' <button class="btn" data-del="' + i + '" style="font-size:10px;padding:2px 8px;background:#555;">X</button></div></div>';
        }
        queueContainer.innerHTML = html;

        queueContainer.querySelectorAll('[data-post]').forEach(function(btn) {
            btn.onclick = function(e) {
                e.stopPropagation();
                postSingle(parseInt(btn.dataset.post));
            };
        });
        queueContainer.querySelectorAll('[data-del]').forEach(function(btn) {
            btn.onclick = function(e) {
                e.stopPropagation();
                var idx = parseInt(btn.dataset.del);
                var q = getQueue();
                q.splice(idx, 1);
                setQueue(q);
                updateQueue();
                log('Removed #' + (idx+1));
            };
        });
    }

    async function postSingle(index) {
        var queue = getQueue();
        if (index >= queue.length) { log('Invalid index'); return; }
        var item = queue[index];
        log('Posting: ' + (item.topic || '').substring(0, 40) + '...');
        var success = false;

        if (item.platform === 'quora') {
            success = await postQuoraAnswer(item.content);
        } else if (item.platform === 'x') {
            success = await postXTweet(item.content);
        }

        if (success) {
            queue[index].status = 'posted';
            setQueue(queue);
            updateQueue();
            log('Posted!');
        } else {
            log('Failed');
        }
    }

    async function postFromQueue() {
        var queue = getQueue();
        for (var i = 0; i < queue.length; i++) {
            if (!queue[i].status || queue[i].status === 'pending') {
                await postSingle(i);
                await new Promise(r => setTimeout(r, 5000));
            }
        }
    }

    async function postQuoraAnswer(text) {
        try {
            var answerBtn = document.querySelector('button:has-text("Answer")');
            if (answerBtn) { answerBtn.click(); await sleep(2000); }

            var editor = document.querySelector('[contenteditable="true"]');
            if (!editor) {
                var btns = document.querySelectorAll('button');
                for (var i = 0; i < btns.length; i++) {
                    if (btns[i].textContent.includes('Answer') || btns[i].textContent.includes('Write')) {
                        btns[i].click(); break;
                    }
                }
                await sleep(2000);
            }

            var editor2 = document.querySelector('[contenteditable="true"]');
            if (!editor2) { log('Editor not found'); return false; }

            editor2.focus();
            document.execCommand('insertText', false, text);
            await sleep(1000);

            var submitBtn = document.querySelector('button:has-text("Submit"), button:has-text("Post"), button:has-text("Add Answer")');
            if (submitBtn) { submitBtn.click(); await sleep(3000); return true; }
            return false;
        } catch(e) { log('Error: ' + e.message); return false; }
    }

    async function postXTweet(text) {
        try {
            var composer = document.querySelector('[data-testid="SideNav_NewTweet_Button"]');
            if (composer) composer.click();
            await sleep(2000);

            var editor = document.querySelector('[data-testid="tweetTextarea_0"]');
            if (!editor) return false;

            editor.focus();
            document.execCommand('insertText', false, text);
            await sleep(1000);

            var btn = document.querySelector('[data-testid="tweetButton"]');
            if (btn) { btn.click(); await sleep(3000); return true; }
            return false;
        } catch(e) { return false; }
    }

    function refreshCookies() {
        var cookieData = document.cookie.split('; ').map(function(c) {
            var parts = c.split('=');
            return { name: parts[0], value: parts.slice(1).join('='), domain: window.location.hostname };
        });
        GM_setValue(COOKIE_KEY, JSON.stringify(cookieData));
        log(cookieData.length + ' cookies saved');
    }

    unsafeWindow.__scarab_quora_ready = true;
    unsafeWindow.__scarab_post_answer = async function(text) { return await postQuoraAnswer(text); };
    unsafeWindow.__scarab_add_to_queue = function(topic, content, platform) {
        var queue = getQueue();
        queue.push({ topic: topic, content: content, platform: platform || 'quora', status: 'pending', ts: Date.now() });
        setQueue(queue);
        updateQueue();
        log('Added: ' + (topic || '').substring(0, 30));
        return queue.length - 1;
    };
    unsafeWindow.__scarab_get_queue = function() { return getQueue(); };

    function pollCommands() {
        var command = GM_getValue(SCARAB_KEY, null);
        if (command) {
            GM_deleteValue(SCARAB_KEY);
            try {
                var cmd = JSON.parse(command);
                var result = 'Unknown';
                if (cmd.action === 'post_answer') { unsafeWindow.__scarab_post_answer(cmd.content); result = 'Posted'; }
                GM_setValue(RESPONSE_KEY, JSON.stringify({ status: 'done', result: result, ts: Date.now() }));
            } catch(e) {
                GM_setValue(RESPONSE_KEY, JSON.stringify({ status: 'error', error: e.message, ts: Date.now() }));
            }
        }
        setTimeout(pollCommands, INTERVAL);
    }

    function sleep(ms) { return new Promise(function(r) { setTimeout(r, ms); }); }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createPanel);
    } else {
        createPanel();
    }
    pollCommands();
    log('SCARAB v2 loaded on ' + window.location.hostname);
    console.log('[SCARAB] ZORG-OMEGA bridge active');
})();


// ==UserScript==
// @name         SCARAB - X/Twitter Bridge
// @namespace    http://tampermonkey.net/
// @version      2.0
// @description  X posting bridge
// @author       ZORG-OMEGA
// @match        https://x.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    var CMD_KEY = 'scarab_x_cmd';
    var RESP_KEY = 'scarab_x_resp';

    unsafeWindow.__scarab_x_ready = true;
    unsafeWindow.__scarab_post_tweet = async function(content) {
        var composer = document.querySelector('[data-testid="SideNav_NewTweet_Button"]');
        if (composer) composer.click();
        await new Promise(function(r) { setTimeout(r, 2000); });
        var editor = document.querySelector('[data-testid="tweetTextarea_0"]');
        if (!editor) return 'Editor not found';
        editor.focus();
        document.execCommand('insertText', false, content);
        await new Promise(function(r) { setTimeout(r, 1000); });
        var btn = document.querySelector('[data-testid="tweetButton"]');
        if (btn) { btn.click(); return 'Posted'; }
        return 'Button not found';
    };

    function poll() {
        var cmd = GM_getValue(CMD_KEY, null);
        if (cmd) {
            GM_deleteValue(CMD_KEY);
            try {
                var c = JSON.parse(cmd);
                var result = 'Unknown';
                if (c.action === 'post_tweet') { unsafeWindow.__scarab_post_tweet(c.content); result = 'Posted'; }
                GM_setValue(RESP_KEY, JSON.stringify({ status: 'done', result: result, ts: Date.now() }));
            } catch(e) {
                GM_setValue(RESP_KEY, JSON.stringify({ status: 'error', error: e.message, ts: Date.now() }));
            }
        }
        setTimeout(poll, 2000);
    }
    poll();
    console.log('[SCARAB] X bridge loaded');
})();
