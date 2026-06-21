// ==UserScript==
// @name         SCARAB X — Twitter/X Auto Poster + Queue
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Post tweets to X/Twitter via browser automation + pre-loaded fashion content
// @author       ZORG-Ω
// @match        *://*.x.com/*
// @match        *://x.com/*
// @match        *://*.twitter.com/*
// @match        *://twitter.com/*
// @icon         https://www.google.com/s2/favicons?domain=x.com
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-end
// @connect      x.com
// @connect      www.x.com
// @connect      api.x.com
// @connect      twitter.com
// @connect      www.twitter.com
// @connect      api.twitter.com
// ==/UserScript==

(function() {
    "use strict";

    var QUEUE_KEY = "scarab_x_queue";
    var PANEL_ID = "scarab-x-panel";

    // ─── Pre-loaded Fashion Posts (Base64) ───────────────
    var encPosts = 'WwoieyJ0b3BpYyI6ICJMdXhvciBmYXNoaW9uIGx1eHVyeSBicmFuZCIsICJjb250ZW50IjogIkx1eHVyeSBpcyBub3QganVzdCBhIGxhYmVsOyBpdCdzIGEgY29udmVyc2F0aW9uLiBMdXhvciBicmluZ3MgcGl4ZWwtdG8tcGF2ZW1lbnQgZGlnaXRhbCBsdXh1cnkgdG8geW91ciBmZWVkLiBGcm9tIHRoZSBzdHJlZXRzIHRvIHRoZSBjYXR3YWxrLCB3ZSByZWRlZmluZSB3aGF0IGl0IG1lYW5zIHRvIHdlYXIgc3VjY2Vzcy4gI0x1eG9yICNMaWZlc3R5bGVMdXh1cnkgI0Zhc2hpb25UZWNoIn0sCnsidG9waWMiOiAiQnVpbGRpbmcgYSBsdXh1cnkgYnJhbmQiLCAiY29udGVudCI6ICJXaGF0IG1ha2VzIGEgYnJhbmQgdmFsdWFibGUgdG9kYXk/IEF1dGhlbnRpY2l0eS4gQ3VsdHVyZS4gQ29tbXVuaXR5LiBMdXhvciBpc24ndCBqdXN0IGNsb3RoaW5nOyBpdCdzIGEgbW92ZW1lbnQuIFdlJ3JlIGJ1aWxkaW5nIGEgd29ybGQgd2hlcmUgZGlnaXRhbCBsdXh1cnkgbWVldHMgcmVhbC13b3JsZCBzdHlsZS4gIEJyaW5naW5nIEhvdXQgQ291dHVyZSB0byB5b3VyIGRvb3JzdGVwLiAgI0x1eG9yICNGYXNoaW9uSW5ub3ZhdGlvbiA8bmV3cz48bmV3cz4ifSwKeyJ0b3BpYyI6ICJMdXhvciBmYXNoaW9uIHN0cmVldHdlYXIiLCAiY29udGVudCI6ICJUaGUgZnV0dXJlIG9mIGZhc2hpb24gaXMgaGVyZS4gTWVldCBMdXhvcjogd2hlcmUgc3RyZWV0d2VhciBtZWV0cyBjb3V0dXJlLiBPdXIgY29sbGVjdGlvbiBpcyBkZXNpZ25lZCBmb3IgdGhvc2Ugd2hvIHdhbnQgdG8gbWFrZSBhIHN0YXRlbWVudC4gT24gdGhlIHN0cmVldHMuIE9uIHlvdXIgdGVybXMuICBMdXhvciA6IGx1eG9yLmx5ICAjTHV4b3IgI1N0cmVldHdlYXIgI0Zhc2hpb25UZWNoIn0KXQ==';

    function loadQueue() {
        try {
            var data = JSON.parse(atob(encPosts));
            if (!GM_getValue(QUEUE_KEY)) {
                GM_setValue(QUEUE_KEY, JSON.stringify(data));
                console.log("[SCARAB-X] Queue auto-loaded: " + data.length + " items");
            }
        } catch(e) {
            console.error("[SCARAB-X] Queue load failed:", e);
        }
    }
    loadQueue();

    // ─── Styles ───────────────────────────────────────────
    GM_addStyle(
        "#" + PANEL_ID + "{position:fixed;bottom:20px;left:20px;z-index:99999;" +
        "background:#0d0d1a;color:#e0e0e0;padding:14px;border-radius:12px;" +
        "font-family:monospace;font-size:12px;max-width:380px;max-height:70vh;" +
        "overflow-y:auto;box-shadow:0 0 20px rgba(29,161,242,0.3);" +
        "border:1px solid #1da1f2;}" +
        "#" + PANEL_ID + " h3{margin:0 0 6px;color:#1da1f2;font-size:13px;}" +
        "#" + PANEL_ID + " .badge{background:#1da1f2;padding:2px 8px;border-radius:4px;font-size:10px;}" +
        "#" + PANEL_ID + " .btn{background:#1da1f2;color:#fff;border:none;" +
        "padding:4px 10px;border-radius:5px;cursor:pointer;font-size:11px;margin:2px;}" +
        "#" + PANEL_ID + " .btn:hover{background:#4dc9f6;}" +
        "#" + PANEL_ID + " .item{padding:5px 8px;margin:3px 0;background:#16213e;" +
        "border-radius:5px;border-left:3px solid #1da1f2;font-size:11px;}" +
        "#" + PANEL_ID + " .log{color:#888;font-size:10px;margin:1px 0;}"
    );

    var panel = null, logEl = null, queueEl = null;

    function log(msg) { if (logEl) logEl.innerHTML = "[SCARAB-X] " + msg + "<br>" + logEl.innerHTML; }

    function getQueue() { try { return JSON.parse(GM_getValue(QUEUE_KEY, "[]")); } catch(e) { return []; } }
    function setQueue(q) { GM_setValue(QUEUE_KEY, JSON.stringify(q)); }

    function updateQueue() {
        if (!queueEl) return;
        var q = getQueue();
        var html = "";
        for (var i = 0; i < q.length; i++) {
            var item = q[i];
            var status = item.status || "pending";
            var statusColor = status === "posted" ? "#4caf50" : status === "failed" ? "#f44336" : "#ff9800";
            html += '<div class="item">' +
                '<b>#' + (i+1) + '</b> ' + (item.content || "").substring(0, 40) + '... ' +
                '<span style="color:' + statusColor + ';">' + status + '</span></div>';
        }
        queueEl.innerHTML = html || "<i>Queue empty</i>";
    }

    function postTweet(text) {
        // Try posting via X API directly using browser cookies
        var csrfToken = document.cookie.split('; ').find(function(r) { return r.startsWith('ct0='); });
        csrfToken = csrfToken ? csrfToken.split('=')[1] : '';

        // Method 1: API via GM_xmlhttpRequest
        var payload = JSON.stringify({
            variables: { tweet_text: text, dark_request: false },
            queryId: "xR9WpZmGxT8x7zQnF3R3g"
        });

        GM_xmlhttpRequest({
            method: "POST",
            url: "https://x.com/i/api/graphql/xR9WpZmGxT8x7zQnF3R3g/CreateTweet",
            headers: {
                "Content-Type": "application/json",
                "Authorization": "Bearer AAAAAAAAAAAAAAAAAAAAANRILgAAAAAAnNwIzUejRCOuH5E6I8xnZz4puTs%3D1Zv7ttfk8LF81IUq16cHjhLTvJu4FA33AGWWjCpTnA",
                "X-CSRF-Token": csrfToken,
                "x-twitter-auth-type": "OAuth2Session",
                "x-twitter-client-language": "en",
                "Origin": "https://x.com",
                "Referer": window.location.href
            },
            data: payload,
            onload: function(resp) {
                if (resp.status === 200) {
                    log("TWEET POSTED via API!");
                } else {
                    log("API failed (" + resp.status + "). Trying DOM...");
                    postViaDOM(text);
                }
            },
            onerror: function() {
                log("API error. Trying DOM...");
                postViaDOM(text);
            }
        });
    }

    function postViaDOM(text) {
        // Find the tweet composer on X
        var composer = document.querySelector('[data-testid="tweetTextarea_0"]') ||
                       document.querySelector('[role="textbox"]') ||
                       document.querySelector('.public-DraftEditor-content');

        if (composer) {
            composer.focus();
            composer.click();
            // Use Clipboard API as fallback
            document.execCommand("insertText", false, text);
            log("Text inserted! Press Tweet button or Ctrl+Enter");
            return;
        }

        // Try clicking "Post" button first
        var postBtn = document.querySelector('[data-testid="SideNav_NewTweet_Button"]') ||
                     document.querySelector('a[aria-label="Post"]');
        if (postBtn) {
            postBtn.click();
            setTimeout(function() {
                var ed2 = document.querySelector('[data-testid="tweetTextarea_0"]') ||
                          document.querySelector('[role="textbox"]');
                if (ed2) {
                    ed2.focus();
                    document.execCommand("insertText", false, text);
                    log("Text inserted in composer! Click Tweet button.");
                }
            }, 1000);
        } else {
            log("Could not find tweet composer. Navigate to x.com/home first.");
        }
    }

    function createPanel() {
        if (document.getElementById(PANEL_ID)) return;

        panel = document.createElement("div");
        panel.id = PANEL_ID;
        panel.innerHTML =
            '<h3>🐦 SCARAB X <span class="badge" id="x-count">0</span></h3>' +
            '<div id="x-queue" style="max-height:200px;overflow-y:auto;"></div>' +
            '<div style="margin-top:6px;">' +
            '<button class="btn" id="x-post-one">▶ Post Next</button>' +
            '<button class="btn" id="x-post-all">▶▶ Post All</button>' +
            '<button class="btn" id="x-mark-all">✅ Mark All Posted</button>' +
            '</div>' +
            '<div class="log" id="x-log"><i>Ready</i></div>';

        document.body.appendChild(panel);

        logEl = document.getElementById("x-log");
        queueEl = document.getElementById("x-queue");
        updateQueue();

        var countEl = document.getElementById("x-count");
        var q = getQueue();
        countEl.textContent = q.filter(function(i) { return i.status !== "posted"; }).length;

        document.getElementById("x-post-one").onclick = function() { postNext(); };
        document.getElementById("x-post-all").onclick = function() { postAll(); };
        document.getElementById("x-mark-all").onclick = function() {
            var qq = getQueue();
            for (var i = 0; i < qq.length; i++) qq[i].status = "posted";
            setQueue(qq);
            updateQueue();
            log("All marked posted");
        };
    }

    function postNext() {
        var q = getQueue();
        for (var i = 0; i < q.length; i++) {
            if (!q[i].status || q[i].status === "pending") {
                log("Posting #" + (i+1) + ": " + (q[i].content || "").substring(0, 30) + "...");
                postSingle(i);
                return;
            }
        }
        log("No pending items");
    }

    function postAll() {
        var q = getQueue();
        var pending = 0;
        for (var i = 0; i < q.length; i++) {
            if (!q[i].status || q[i].status === "pending") pending++;
        }
        if (pending === 0) { log("No pending items"); return; }
        log("Posting " + pending + " items...");
        // Post first pending
        for (var j = 0; j < q.length; j++) {
            if (!q[j].status || q[j].status === "pending") {
                postSingle(j);
                break;
            }
        }
    }

    function postSingle(idx) {
        var q = getQueue();
        if (idx >= q.length) return;
        var item = q[idx];

        postTweet(item.content);

        // Mark as posted after attempt
        q[idx].status = "posted";
        setQueue(q);
        updateQueue();
    }

    // ─── External API ─────────────────────────────────────
    unsafeWindow.__scarab_x_add = function(content) {
        var q = getQueue();
        q.push({content: content, status: "pending", ts: Date.now()});
        setQueue(q);
        updateQueue();
        log("Added tweet to queue");
        return q.length - 1;
    };

    // ─── Init ─────────────────────────────────────────────
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createPanel);
    } else {
        createPanel();
    }
})();
