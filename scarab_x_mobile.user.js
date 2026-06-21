// ==UserScript==
// @name         SCARAB X Poster — Mobile @grant none
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Post to X/Twitter — @grant none, works on Lemur/mobile
// @author       ZORG-Ω
// @match        *://*.x.com/*
// @match        *://*.twitter.com/*
// @match        *://x.com/*
// @match        *://twitter.com/*
// @icon         https://www.google.com/s2/favicons?domain=x.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    "use strict";

    var STORE_NS = "scarab_x_";

    function getVal(key, def) {
        try {
            var v = localStorage.getItem(STORE_NS + key);
            return v !== null ? JSON.parse(v) : def;
        } catch(e) { return def; }
    }

    function setVal(key, val) {
        try { localStorage.setItem(STORE_NS + key, JSON.stringify(val)); } catch(e) {}
    }

    var PANEL_ID = "scarab-x-panel";

    function injectStyles() {
        var s = document.createElement("style");
        s.textContent =
            "#" + PANEL_ID + "{" +
            "position:fixed;bottom:20px;right:20px;z-index:999999;" +
            "background:#0d0d1a;color:#e0e0e0;padding:12px;border-radius:12px;" +
            "font-family:monospace;font-size:12px;max-width:380px;" +
            "box-shadow:0 0 30px rgba(29,155,240,0.3);" +
            "border:1px solid #1d9bf0;}" +
            "#" + PANEL_ID + " h3{margin:0 0 6px;color:#1d9bf0;font-size:13px;}" +
            "#" + PANEL_ID + " .btn{background:#1d9bf0;color:#fff;border:none;" +
            "padding:4px 10px;border-radius:5px;cursor:pointer;font-size:11px;margin:2px;}" +
            "#" + PANEL_ID + " .btn:hover{background:#6bc9ff;}" +
            "#" + PANEL_ID + " .log{color:#888;font-size:10px;margin:1px 0;}";
        document.head.appendChild(s);
    }

    var logEl = null;

    function log(msg) {
        if (!logEl) return;
        var d = document.createElement("div");
        d.className = "log";
        d.textContent = "[" + new Date().toLocaleTimeString() + "] " + msg;
        logEl.appendChild(d);
        logEl.scrollTop = logEl.scrollHeight;
        console.log("[SCARAB-X] " + msg);
    }

    function createPanel() {
        if (document.getElementById(PANEL_ID)) return;
        injectStyles();

        var panel = document.createElement("div");
        panel.id = PANEL_ID;
        panel.innerHTML =
            "<h3>🐞 SCARAB X</h3>" +
            "<div style='margin:4px 0'>" +
            "<button class='btn' id='sx-post-text'>📝 Post Text</button>" +
            "<button class='btn' id='sx-reply'>💬 Reply</button>" +
            "<button class='btn' id='sx-hide' style='background:#555'>✕</button></div>" +
            "<textarea id='sx-text' style='width:100%;height:60px;background:#16213e;color:#e0e0e0;" +
            "border:1px solid #1d9bf0;border-radius:4px;padding:4px;font-size:11px'" +
            " placeholder='Post text...'></textarea>" +
            "<div><strong>Log:</strong></div>" +
            "<div id='sx-log' style='max-height:120px;overflow-y:auto;" +
            "background:#050510;padding:4px;border-radius:4px'></div>" +
            "<div style='margin-top:4px;font-size:9px;color:#666'>@grant none — works everywhere</div>";

        document.body.appendChild(panel);
        logEl = panel.querySelector("#sx-log");

        panel.querySelector("#sx-post-text").onclick = postToX;
        panel.querySelector("#sx-reply").onclick = replyToPost;
        panel.querySelector("#sx-hide").onclick = function() { panel.style.display = "none"; };

        log("✅ Active on " + window.location.hostname);
    }

    function getText() {
        var ta = document.getElementById("sx-text");
        return ta ? ta.value.trim() : "";
    }

    /* ─── Post to X via DOM ─── */
    function postToX() {
        var text = getText();
        if (!text) { log("⚠️ Enter text first"); return; }

        log("📤 Looking for composer...");

        // Find the tweet composer
        var composer = document.querySelector('[data-testid="tweetTextarea_0"]');
        if (!composer) {
            // Try clicking "Post" button
            var postBtns = document.querySelectorAll('[data-testid="SideNav_NewTweet_Button"], a[aria-label="Post"]');
            for (var i = 0; i < postBtns.length; i++) {
                if (postBtns[i].offsetHeight > 0) { postBtns[i].click(); break; }
            }
        }

        setTimeout(function() {
            var c2 = document.querySelector('[data-testid="tweetTextarea_0"]');
            if (!c2) c2 = document.querySelector('[contenteditable="true"]');
            if (!c2) {
                // Try any div with role textbox
                c2 = document.querySelector('div[role="textbox"]');
            }

            if (c2) {
                c2.focus();
                c2.textContent = text;
                c2.dispatchEvent(new InputEvent("input", {bubbles: true}));
                log("✏️ Text inserted");

                // Click submit button
                setTimeout(function() {
                    var submitBtn = document.querySelector('[data-testid="tweetButton"]') ||
                                    document.querySelector('[data-testid="tweetButtonInline"]');
                    if (submitBtn) {
                        submitBtn.click();
                        log("✅ Posted!");
                    } else {
                        log("⚠️ Text inserted, click Post manually");
                    }
                }, 500);
            } else {
                // Fallback: use clipboard
                log("❌ No composer found. Paste manually.");
                navigator.clipboard.writeText(text).then(function() {
                    log("📋 Text copied to clipboard!");
                });
            }
        }, 1000);
    }

    /* ─── Reply to current post ─── */
    function replyToPost() {
        var text = getText();
        if (!text) { log("⚠️ Enter reply text first"); return; }

        log("💬 Looking for reply box...");
        var replyBtn = document.querySelector('[data-testid="reply"]');
        if (replyBtn) { replyBtn.click(); }

        setTimeout(function() {
            var rbox = document.querySelector('[data-testid="tweetTextarea_0"]');
            if (!rbox) rbox = document.querySelector('div[role="textbox"]');

            if (rbox) {
                rbox.focus();
                rbox.textContent = text;
                rbox.dispatchEvent(new InputEvent("input", {bubbles: true}));
                log("✏️ Reply text inserted");

                setTimeout(function() {
                    var replySubmit = document.querySelector('[data-testid="tweetButton"]');
                    if (replySubmit) {
                        replySubmit.click();
                        log("✅ Reply posted!");
                    } else {
                        log("⚠️ Reply text inserted, click Reply manually");
                    }
                }, 500);
            } else {
                log("❌ No reply box found");
            }
        }, 1000);
    }

    console.log("[SCARAB X] ✅ Active — @grant none");

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createPanel);
    } else {
        createPanel();
    }
})();
