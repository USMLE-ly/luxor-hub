// ==UserScript==
// @name         SCARAB All-in-One — Quora + X Poster @grant none
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Post to Quora (GraphQL) and X (DOM) — @grant none, works mobile
// @author       ZORG-Ω
// @match        *://*.quora.com/*
// @match        *://quora.com/*
// @match        *://*.x.com/*
// @match        *://*.twitter.com/*
// @match        *://x.com/*
// @match        *://twitter.com/*
// @icon         https://www.google.com/s2/favicons?domain=quora.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    "use strict";

    /* ─── Storage (localStorage, no GM_* needed) ─── */
    var NS = "scarab_ai_";

    function gv(key, def) {
        try { var v = localStorage.getItem(NS + key); return v !== null ? JSON.parse(v) : def; }
        catch(e) { return def; }
    }
    function sv(key, val) {
        try { localStorage.setItem(NS + key, JSON.stringify(val)); } catch(e) {}
    }

    /* ─── Detect platform ─── */
    var host = window.location.hostname.toLowerCase();
    var isQuora = host.indexOf("quora") > -1;
    var isX = host.indexOf("x.com") > -1 || host.indexOf("twitter") > -1;

    /* ─── Styles ─── */
    function addStyle(css) {
        var s = document.createElement("style");
        s.textContent = css;
        document.head.appendChild(s);
    }

    /* ─── Panel ─── */
    var PANEL_ID = "scarab-ai-panel";
    var logEl, panel;

    function log(msg) {
        console.log("[SCARAB-AI] " + msg);
        if (!logEl) return;
        var d = document.createElement("div");
        d.className = "slog";
        d.textContent = "[" + new Date().toLocaleTimeString() + "] " + msg;
        logEl.appendChild(d);
        logEl.scrollTop = logEl.scrollHeight;
    }

    function createPanel() {
        if (document.getElementById(PANEL_ID)) return;

        addStyle(
            "#" + PANEL_ID + "{" +
            "position:fixed;bottom:15px;right:15px;z-index:999999;" +
            "background:#0d0d1a;color:#e0e0e0;padding:12px;border-radius:12px;" +
            "font-family:monospace;font-size:12px;max-width:400px;max-height:80vh;" +
            "overflow-y:auto;box-shadow:0 0 30px rgba(233,69,96,0.3);" +
            "border:1px solid #e94560;" +
            (isX ? "border-color:#1d9bf0;box-shadow:0 0 30px rgba(29,155,240,0.3);" : "") + "}" +
            "#" + PANEL_ID + " h3{margin:0 0 6px;color:" + (isX ? "#1d9bf0" : "#e94560") + ";font-size:13px;}" +
            "#" + PANEL_ID + " .btn{color:#fff;border:none;padding:4px 10px;border-radius:5px;" +
            "cursor:pointer;font-size:11px;margin:2px;}" +
            "#" + PANEL_ID + " .btn:hover{opacity:0.8;}" +
            "#" + PANEL_ID + " .btn-primary{background:" + (isX ? "#1d9bf0" : "#e94560") + ";}" +
            "#" + PANEL_ID + " .btn-secondary{background:#555;}" +
            "#" + PANEL_ID + " .slog{color:#888;font-size:10px;margin:1px 0;}" +
            "#" + PANEL_ID + " .item{padding:4px 6px;margin:2px 0;background:#16213e;" +
            "border-radius:4px;border-left:3px solid " + (isX ? "#1d9bf0" : "#e94560") + ";font-size:10px;}" +
            "#" + PANEL_ID + " textarea{width:100%;background:#16213e;color:#e0e0e0;" +
            "border:1px solid " + (isX ? "#1d9bf0" : "#e94560") + ";border-radius:4px;" +
            "padding:4px;font-size:11px;box-sizing:border-box;}"
        );

        panel = document.createElement("div");
        panel.id = PANEL_ID;

        var platform = isX ? "X/Twitter" : "Quora";
        var btns = isX ?
            "<button class='btn btn-primary' id='sai-post'>📝 Post</button>" +
            "<button class='btn btn-primary' id='sai-reply'>💬 Reply</button>" :
            "<button class='btn btn-primary' id='sai-extract'>🔍 QID</button>" +
            "<button class='btn btn-primary' id='sai-post'>📤 Post</button>" +
            "<button class='btn btn-primary' id='sai-queue'>📋 Queue</button>";

        panel.innerHTML =
            "<h3>🐞 SCARAB AI — " + platform + "</h3>" +
            "<div style='margin:4px 0'>" + btns +
            "<button class='btn btn-secondary' id='sai-hide'>✕</button></div>" +
            "<textarea id='sai-text' rows='3' placeholder='Your text...'></textarea>" +
            "<div id='sai-extra' style='margin:2px 0;font-size:10px;color:#666'></div>" +
            "<div><strong>Log:</strong></div>" +
            "<div id='sai-log' style='max-height:100px;overflow-y:auto;" +
            "background:#050510;padding:4px;border-radius:4px'></div>" +
            "<div style='margin-top:3px;font-size:9px;color:#444'>@grant none v5.0</div>";

        document.body.appendChild(panel);
        logEl = panel.querySelector("#sai-log");

        document.getElementById("sai-hide").onclick = function() { panel.style.display = "none"; };
        if (isX) {
            document.getElementById("sai-post").onclick = postX;
            document.getElementById("sai-reply").onclick = replyX;
        } else {
            document.getElementById("sai-extract").onclick = extractQID;
            document.getElementById("sai-post").onclick = postQuora;
            document.getElementById("sai-queue").onclick = postQueue;
        }

        log("✅ Active on " + host);
        updateStatus();
    }

    function getText() {
        var ta = document.getElementById("sai-text");
        return ta ? ta.value.trim() : "";
    }

    function updateStatus() {
        var el = document.getElementById("sai-extra");
        if (!el) return;
        if (isQuora) {
            var qid = gv("last_qid", "");
            el.textContent = qid ? "QID: " + qid + " | Queue: " + getQueue().length : "Queue: " + getQueue().length;
        }
    }

    /* ═══════════════ QUORA ═══════════════ */

    function getQueue() { return gv("q", []); }
    function setQueue(q) { sv("q", q); }

    function extractQID() {
        var qid = "";
        var m = window.location.pathname.match(/\/questions\/(\d+)/);
        if (m) qid = m[1];

        if (!qid) {
            try {
                var scripts = document.querySelectorAll("script");
                for (var i = 0; i < scripts.length; i++) {
                    var t = scripts[i].textContent || "";
                    var qm = t.match(/"questionId"\s*:\s*"(\d+)"/);
                    if (qm) { qid = qm[1]; break; }
                }
            } catch(e) {}
        }

        if (qid) {
            sv("last_qid", qid);
            log("📌 QID: " + qid);
            updateStatus();
        } else {
            log("⚠️ No QID on this page");
        }
    }

    function postQuora() {
        var text = getText();
        if (!text) { log("⚠️ Enter text first"); return; }

        var qid = gv("last_qid", "");
        if (!qid) { extractQID(); qid = gv("last_qid", ""); }
        if (!qid) { log("❌ Navigate to a question and extract QID"); return; }

        var payload = JSON.stringify({
            operationName: "AddAnswerMutation",
            variables: { questionId: qid, text: text, isDraft: false },
            query: "mutation AddAnswerMutation($questionId: String!, $text: String!, $isDraft: Boolean) { addAnswer(questionId: $questionId, text: $text, isDraft: $isDraft) { id url __typename } }"
        });

        log("📤 Posting to Quora...");
        fetch("https://www.quora.com/graphql", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Origin": window.location.origin,
                "Referer": window.location.href
            },
            body: payload
        })
        .then(function(r) { return r.text(); })
        .then(function(body) {
            log("Resp: " + body.substring(0, 150));
            if (body.indexOf('"id"') > -1 && body.indexOf('"addAnswer"') > -1) {
                log("✅ Posted!");
                return;
            }
            // Fallback DOM
            log("GQL failed, trying DOM...");
            pasteToEditor(text);
        })
        .catch(function(e) {
            log("❌ " + e.message);
            pasteToEditor(text);
        });
    }

    function pasteToEditor(text) {
        setTimeout(function() {
            var editor = document.querySelector('[contenteditable="true"]');
            if (!editor) {
                editor = document.querySelector('div[role="textbox"]');
            }
            if (editor) {
                editor.focus();
                editor.textContent = text;
                editor.dispatchEvent(new Event("input", {bubbles: true}));
                log("✏️ Text in editor — submit manually if needed");
            } else {
                log("❌ No editor found");
                navigator.clipboard.writeText(text).then(function() {
                    log("📋 Copied to clipboard!");
                });
            }
        }, 1000);
    }

    function postSingle(idx) {
        var q = getQueue();
        if (idx >= q.length) return;
        var item = q[idx];
        log("Queue #" + (idx+1) + ": " + (item.topic || "").substring(0, 20));

        var qid = gv("last_qid", "") || item.qid || "";
        if (qid && item.content) {
            var payload = JSON.stringify({
                operationName: "AddAnswerMutation",
                variables: { questionId: qid, text: item.content, isDraft: false },
                query: "mutation AddAnswerMutation($questionId: String!, $text: String!, $isDraft: Boolean) { addAnswer(questionId: $questionId, text: $text, isDraft: $isDraft) { id url __typename } }"
            });

            fetch("https://www.quora.com/graphql", {
                method: "POST", credentials: "include",
                headers: {"Content-Type": "application/json", "Accept": "application/json",
                          "Origin": window.location.origin, "Referer": window.location.href},
                body: payload
            })
            .then(function(r) { return r.text(); })
            .then(function(body) {
                var posted = body.indexOf('"id"') > -1 && body.indexOf('"addAnswer"') > -1;
                q[idx].status = posted ? "posted" : "failed";
                setQueue(q);
                log(posted ? "✅ Posted #" + (idx+1) : "❌ Failed #" + (idx+1));
                updateStatus();
            });
        } else {
            pasteToEditor(item.content || "");
            q[idx].status = "dom_pasted";
            setQueue(q);
        }
    }

    function postQueue() {
        var q = getQueue();
        var pending = q.filter(function(i) { return !i.status || i.status === "pending"; });
        if (pending.length === 0) { log("No pending items"); return; }
        log("📋 " + pending.length + " pending — posting first...");
        for (var j = 0; j < q.length; j++) {
            if (!q[j].status || q[j].status === "pending") { postSingle(j); break; }
        }
    }

    window.__scarab_add_queue = function(topic, content) {
        var q = getQueue();
        q.push({topic: topic, content: content, status: "pending", ts: Date.now()});
        setQueue(q);
        updateStatus();
        log("➕ Added: " + (topic || "").substring(0, 25));
    };

    /* ═══════════════ X/TWITTER ═══════════════ */

    function findComposer() {
        return document.querySelector('[data-testid="tweetTextarea_0"]') ||
               document.querySelector('[contenteditable="true"]') ||
               document.querySelector('div[role="textbox"]');
    }

    function clickPostBtn() {
        var btn = document.querySelector('[data-testid="tweetButton"]') ||
                  document.querySelector('[data-testid="tweetButtonInline"]');
        if (btn) { btn.click(); return true; }
        return false;
    }

    function postX() {
        var text = getText();
        if (!text) { log("⚠️ Enter text first"); return; }

        log("📤 Looking for composer...");
        var composer = findComposer();
        if (!composer) {
            var newBtn = document.querySelector('[data-testid="SideNav_NewTweet_Button"], a[aria-label="Post"]');
            if (newBtn && newBtn.offsetHeight > 0) newBtn.click();
        }

        setTimeout(function() {
            var c2 = findComposer();
            if (c2) {
                c2.focus();
                c2.textContent = text;
                c2.dispatchEvent(new InputEvent("input", {bubbles: true}));
                log("✏️ Text set");

                setTimeout(function() {
                    if (clickPostBtn()) {
                        log("✅ Posted to X!");
                    } else {
                        log("⚠️ Text set — click Post manually");
                    }
                }, 500);
            } else {
                log("❌ No composer. Copied to clipboard.");
                navigator.clipboard.writeText(text);
            }
        }, 1000);
    }

    function replyX() {
        var text = getText();
        if (!text) { log("⚠️ Enter reply text"); return; }

        var replyBtn = document.querySelector('[data-testid="reply"]');
        if (replyBtn) replyBtn.click();

        setTimeout(function() {
            var c2 = findComposer();
            if (c2) {
                c2.focus();
                c2.textContent = text;
                c2.dispatchEvent(new InputEvent("input", {bubbles: true}));
                setTimeout(function() {
                    if (clickPostBtn()) log("✅ Reply posted!");
                    else log("⚠️ Reply text set — click Reply");
                }, 500);
            }
        }, 1000);
    }

    /* ═══════════════ INIT ═══════════════ */

    console.log("[SCARAB-AI] ✅ Ready on " + host);

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createPanel);
    } else {
        createPanel();
    }
})();
