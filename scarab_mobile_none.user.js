// ==UserScript==
// @name         SCARAB v4m — Quora Poster (Mobile @grant none)
// @namespace    http://tampermonkey.net/
// @version      4.1
// @description  Post to Quora — @grant none, works on all browsers including mobile
// @author       ZORG-Ω
// @match        *://*.quora.com/*
// @match        *://quora.com/*
// @icon         https://www.google.com/s2/favicons?domain=quora.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    "use strict";

    /* ─── localStorage-backed storage (drop-in for GM_*Value) ─── */
    var STORE_NS = "scarab_v4m_";

    function getVal(key, def) {
        try {
            var v = localStorage.getItem(STORE_NS + key);
            return v !== null ? JSON.parse(v) : def;
        } catch(e) { return def; }
    }

    function setVal(key, val) {
        try { localStorage.setItem(STORE_NS + key, JSON.stringify(val)); } catch(e) {}
    }

    function delVal(key) {
        try { localStorage.removeItem(STORE_NS + key); } catch(e) {}
    }

    var QUEUE_KEY = "queue";

    function getQueue() { return getVal(QUEUE_KEY, []); }
    function setQueue(q) { setVal(QUEUE_KEY, q); }

    /* ─── Inject styles manually (no GM_addStyle) ─── */
    function injectStyles() {
        var style = document.createElement("style");
        style.textContent =
            "#scarab-panel-v4m{" +
            "position:fixed;bottom:20px;right:20px;z-index:999999;" +
            "background:#0d0d1a;color:#e0e0e0;padding:14px;border-radius:12px;" +
            "font-family:monospace;font-size:12px;max-width:420px;max-height:75vh;" +
            "overflow-y:auto;box-shadow:0 0 30px rgba(233,69,96,0.3);" +
            "border:1px solid #e94560;}" +
            "#scarab-panel-v4m h3{margin:0 0 6px;color:#e94560;font-size:13px;}" +
            "#scarab-panel-v4m .badge{background:#e94560;padding:2px 8px;border-radius:4px;font-size:10px;}" +
            "#scarab-panel-v4m .btn{background:#e94560;color:#fff;border:none;" +
            "padding:4px 10px;border-radius:5px;cursor:pointer;font-size:11px;margin:2px;}" +
            "#scarab-panel-v4m .btn:hover{background:#ff6b6b;}" +
            "#scarab-panel-v4m .item{padding:5px 8px;margin:3px 0;background:#16213e;" +
            "border-radius:5px;border-left:3px solid #e94560;font-size:11px;}" +
            "#scarab-panel-v4m .log{color:#888;font-size:10px;margin:1px 0;}";
        document.head.appendChild(style);
    }

    /* ─── State ─── */
    var panel = null;
    var logEl = null;
    var queueEl = null;

    function log(msg) {
        if (!logEl) return;
        var d = document.createElement("div");
        d.className = "log";
        d.textContent = "[" + new Date().toLocaleTimeString() + "] " + msg;
        logEl.appendChild(d);
        logEl.scrollTop = logEl.scrollHeight;
    }

    /* ─── Panel ─── */
    function createPanel() {
        if (document.getElementById("scarab-panel-v4m")) return;

        injectStyles();

        panel = document.createElement("div");
        panel.id = "scarab-panel-v4m";
        panel.innerHTML =
            "<h3>🐞 SCARAB v4m</h3>" +
            "<div style='margin:6px 0'>" +
            "<button class='btn' id='sc-extract-qid'>🔍 Extract QID</button>" +
            "<button class='btn' id='sc-fetch-page'>📄 Fetch Page</button>" +
            "<button class='btn' id='sc-post-btn'>📤 Post Now</button>" +
            "<button class='btn' id='sc-post-queue'>📋 Post Queue</button>" +
            "<button class='btn' id='sc-hide-btn' style='background:#555'>✕</button></div>" +
            "<div><strong>Queue:</strong> <span id='sc-qcount'>0</span></div>" +
            "<div id='sc-queue-list' style='max-height:150px;overflow-y:auto;margin:2px 0'></div>" +
            "<div style='margin:4px 0'><textarea id='sc-custom-text' " +
            "style='width:100%;height:60px;background:#16213e;color:#e0e0e0;" +
            "border:1px solid #e94560;border-radius:4px;padding:4px;font-size:11px' " +
            "placeholder='Custom text to post...'></textarea></div>" +
            "<div><strong>Log:</strong></div>" +
            "<div id='sc-log' style='max-height:120px;overflow-y:auto;" +
            "background:#050510;padding:4px;border-radius:4px'></div>" +
            "<div style='margin-top:4px;font-size:9px;color:#666'>@grant none — works everywhere</div>";

        document.body.appendChild(panel);
        logEl = panel.querySelector("#sc-log");
        queueEl = panel.querySelector("#sc-queue-list");

        panel.querySelector("#sc-extract-qid").onclick = extractQID;
        panel.querySelector("#sc-fetch-page").onclick = fetchPageContent;
        panel.querySelector("#sc-post-btn").onclick = postViaFetch;
        panel.querySelector("#sc-post-queue").onclick = postQueue;
        panel.querySelector("#sc-hide-btn").onclick = function() { panel.style.display = "none"; };

        updateQueue();
        log("✅ v4m active on " + window.location.hostname);
        log("Queue: " + getQueue().length + " items");
    }

    /* ─── Queue Display ─── */
    function updateQueue() {
        if (!queueEl) return;
        var q = getQueue();
        var count = document.getElementById("sc-qcount");
        if (count) count.textContent = q.length;

        if (q.length === 0) {
            queueEl.innerHTML = "<div class='log' style='color:#555'>Empty</div>";
            return;
        }

        var html = "";
        for (var i = 0; i < q.length; i++) {
            var t = (q[i].topic || "Untitled").substring(0, 30);
            var s = q[i].status || "pending";
            var color = s === "posted" ? "#4caf50" : s === "failed" ? "#f44336" : "#888";
            html += "<div class='item'>#" + (i+1) + " " + t +
                " <span style='color:" + color + "'>[" + s + "]</span>" +
                " <button class='btn' data-idx='" + i + "' style='font-size:9px;padding:2px 6px'>▶</button>" +
                " <button class='btn' data-rm='" + i + "' style='font-size:9px;padding:2px 6px;background:#555'>✕</button></div>";
        }
        queueEl.innerHTML = html;

        queueEl.querySelectorAll("[data-idx]").forEach(function(b) {
            b.onclick = function() {
                var idx = parseInt(this.getAttribute("data-idx"));
                postSingle(idx);
            };
        });
        queueEl.querySelectorAll("[data-rm]").forEach(function(b) {
            b.onclick = function() {
                var idx = parseInt(this.getAttribute("data-rm"));
                var qq = getQueue();
                qq.splice(idx, 1);
                setQueue(qq);
                updateQueue();
                log("Removed #" + (idx+1));
            };
        });
    }

    /* ─── Extract QID from URL ─── */
    function extractQID() {
        var qid = "";
        // Try URL pattern: /questions/123456789
        var m = window.location.pathname.match(/\/questions\/(\d+)/);
        if (m) qid = m[1];

        // Try URL param: qid=...
        if (!qid) {
            var up = new URLSearchParams(window.location.search);
            qid = up.get("qid") || "";
        }

        // Try meta tags
        if (!qid) {
            var meta = document.querySelector('meta[property="al:android:url"]');
            if (meta) {
                var mm = meta.content.match(/qid=(\d+)/);
                if (mm) qid = mm[1];
            }
        }

        if (qid) {
            setVal("last_qid", qid);
            log("📌 QID: " + qid);
            alert("QID extracted: " + qid);
        } else {
            // Extract from page data
            try {
                var scripts = document.querySelectorAll("script");
                for (var i = 0; i < scripts.length; i++) {
                    var t = scripts[i].textContent || "";
                    var qm = t.match(/"questionId"\s*:\s*"(\d+)"/);
                    if (qm) { qid = qm[1]; break; }
                    var qm2 = t.match(/"id"\s*:\s*"(\d+)"[^}]*"__typename"\s*:\s*"Question"/);
                    if (qm2) { qid = qm2[1]; break; }
                }
            } catch(e) {}

            if (qid) {
                setVal("last_qid", qid);
                log("📌 QID (from page): " + qid);
                alert("QID: " + qid);
            } else {
                log("⚠️ No QID found on this page");
                alert("Navigate to a question page first!");
            }
        }
    }

    /* ─── Fetch page content for context ─── */
    function fetchPageContent() {
        var title = document.title || "";
        var question = "";
        var h1 = document.querySelector("h1");
        if (h1) question = h1.textContent.trim();
        var meta = document.querySelector('meta[name="description"]');
        var desc = meta ? meta.getAttribute("content") : "";

        var info = {title: title, question: question, description: desc, url: window.location.href};
        setVal("last_page_info", info);
        log("📄 Page: " + (question || title).substring(0, 60));
        alert("Page info captured!\nQ: " + (question || title).substring(0, 100));
    }

    /* ─── Post via Fetch (replaces GM_xmlhttpRequest) ─── */
    function postViaFetch() {
        var qid = getVal("last_qid", "");
        var textarea = document.getElementById("sc-custom-text");
        var customText = textarea ? textarea.value.trim() : "";

        if (customText) {
            doFetchPost(qid, customText);
            return;
        }

        // Also check queue for current item
        var q = getQueue();
        var pending = q.filter(function(item) { return !item.status || item.status === "pending"; });
        if (pending.length > 0) {
            doFetchPost(qid, pending[0].content);
        } else {
            log("⚠️ No content to post. Type text or load queue.");
        }
    }

    function doFetchPost(qid, content) {
        if (!qid) {
            log("⚠️ No QID. Click 'Extract QID' first.");
            extractQID();
            qid = getVal("last_qid", "");
            if (!qid) { log("❌ Cannot post without QID"); return; }
        }

        var payload = JSON.stringify({
            operationName: "AddAnswerMutation",
            variables: {
                questionId: qid,
                text: content,
                isDraft: false
            },
            query: "mutation AddAnswerMutation($questionId: String!, $text: String!, $isDraft: Boolean) { addAnswer(questionId: $questionId, text: $text, isDraft: $isDraft) { id url __typename } }"
        });

        log("📤 Sending to GraphQL...");
        var start = Date.now();

        fetch("https://www.quora.com/graphql", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Origin": window.location.origin,
                "Referer": window.location.href,
                "x-requested-with": "XMLHttpRequest"
            },
            body: payload
        })
        .then(function(r) {
            log("Response: " + r.status + " (" + (Date.now()-start) + "ms)");
            return r.text();
        })
        .then(function(text) {
            log("Body: " + text.substring(0, 200));
            try {
                var d = JSON.parse(text);
                if (d && d.data && d.data.addAnswer && d.data.addAnswer.id) {
                    log("✅ POSTED! ID: " + d.data.addAnswer.id);
                    alert("Posted! ID: " + d.data.addAnswer.id);
                    return;
                }
                if (d && d.errors) {
                    log("❌ GQL error: " + (d.errors[0] ? d.errors[0].message : JSON.stringify(d.errors)));
                }
            } catch(e) {}

            // Fallback: try alternate mutation format
            log("Trying alternate mutation...");
            tryAltGQLFetch(qid, content);
        })
        .catch(function(err) {
            log("❌ Fetch failed: " + err.message);
            tryAltGQLFetch(qid, content);
        });
    }

    function tryAltGQLFetch(qid, content) {
        var altPayload = JSON.stringify({
            query: "mutation { addAnswer(questionId: \"" + qid + "\", text: " + JSON.stringify(content) + ", isDraft: false) { id url } }"
        });

        fetch("https://www.quora.com/graphql", {
            method: "POST",
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Origin": window.location.origin,
                "Referer": window.location.href,
                "x-requested-with": "XMLHttpRequest"
            },
            body: altPayload
        })
        .then(function(r) { return r.text(); })
        .then(function(text) {
            if (text.indexOf('"id"') > -1) {
                log("✅ POSTED via alt mutation!");
                alert("Posted via alt mutation!");
            } else {
                log("❌ Alt GQL failed");
                log("Trying DOM paste method...");
                pasteToEditor(content);
            }
        })
        .catch(function(err) {
            log("❌ Alt fetch failed: " + err.message);
            pasteToEditor(content);
        });
    }

    /* ─── DOM fallback: paste into editor ─── */
    function pasteToEditor(text) {
        var editor = document.querySelector('[contenteditable="true"]');
        if (!editor) {
            // Try clicking "Answer" button first
            var allBtns = document.querySelectorAll("button, a, div[role='button']");
            for (var i = 0; i < allBtns.length; i++) {
                var txt = (allBtns[i].textContent || "").toLowerCase();
                if (txt.indexOf("answer") > -1 && allBtns[i].offsetHeight > 0) {
                    allBtns[i].click();
                    log("Clicked Answer button");
                    break;
                }
            }
        }

        setTimeout(function() {
            var ed2 = document.querySelector('[contenteditable="true"]');
            if (ed2) {
                ed2.focus();
                // Try execCommand
                var success = document.execCommand("insertText", false, text);
                if (success) {
                    log("✅ Text inserted in editor. Submit manually if needed.");
                } else {
                    // Try pasting via clipboard API
                    ed2.textContent = text;
                    ed2.dispatchEvent(new Event("input", {bubbles: true}));
                    ed2.dispatchEvent(new Event("change", {bubbles: true}));
                    log("✅ Text set via textContent");
                }
            } else {
                log("❌ No editor found on page");
            }
        }, 1500);
    }

    /* ─── Queue Posting ─── */
    function postSingle(index) {
        var q = getQueue();
        if (index >= q.length) return;

        var item = q[index];
        log("Posting #" + (index+1) + ": " + (item.topic || "").substring(0, 25) + "...");

        var qid = getVal("last_qid", "");
        if (!qid && item.qid) qid = item.qid;

        if (qid && item.content) {
            doFetchPostWithCallback(qid, item.content, index);
        } else if (item.content) {
            pasteToEditor(item.content);
            var qq = getQueue();
            if (index < qq.length) {
                qq[index].status = "dom_pasted";
                setQueue(qq);
                updateQueue();
            }
        } else {
            log("❌ No content for #" + (index+1));
            var q4 = getQueue();
            if (index < q4.length) {
                q4[index].status = "no_content";
                setQueue(q4);
                updateQueue();
            }
        }
    }

    function doFetchPostWithCallback(qid, content, idx) {
        var payload = JSON.stringify({
            operationName: "AddAnswerMutation",
            variables: {
                questionId: qid,
                text: content,
                isDraft: false
            },
            query: "mutation AddAnswerMutation($questionId: String!, $text: String!, $isDraft: Boolean) { addAnswer(questionId: $questionId, text: $text, isDraft: $isDraft) { id url __typename } }"
        });

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
        .then(function(r) { return r.json().catch(function(){ return null; }); })
        .then(function(d) {
            var posted = d && d.data && d.data.addAnswer && d.data.addAnswer.id;
            var q = getQueue();
            if (idx < q.length) {
                q[idx].status = posted ? "posted" : "gql_failed";
                setQueue(q);
                updateQueue();
            }
            log(posted ? "✅ POSTED #" + (idx+1) : "❌ Failed #" + (idx+1));
            if (!posted) {
                log("Trying DOM for #" + (idx+1) + "...");
                if (q[idx]) pasteToEditor(q[idx].content);
            }
        })
        .catch(function(err) {
            log("❌ Network error for #" + (idx+1) + ": " + err.message);
            var q2 = getQueue();
            if (idx < q2.length) {
                q2[idx].status = "network_error";
                setQueue(q2);
                updateQueue();
            }
        });
    }

    function postQueue() {
        var q = getQueue();
        var pending = 0;
        for (var i = 0; i < q.length; i++) {
            if (!q[i].status || q[i].status === "pending") pending++;
        }
        if (pending === 0) { log("No pending items"); return; }

        log("📋 Queue: " + pending + " items to post");

        // Post first pending item
        for (var j = 0; j < q.length; j++) {
            if (!q[j].status || q[j].status === "pending") {
                postSingle(j);
                break;
            }
        }
    }

    /* ─── External API via window (instead of unsafeWindow) ─── */
    window.__scarab_add_to_queue = function(topic, content, platform) {
        var q = getQueue();
        q.push({topic: topic, content: content, platform: platform || "quora", status: "pending", ts: Date.now()});
        setQueue(q);
        updateQueue();
        log("➕ Added: " + (topic || "").substring(0, 30));
        return q.length - 1;
    };

    window.__scarab_get_queue = function() { return getQueue(); };
    window.__scarab_clear_queue = function() { setQueue([]); updateQueue(); log("🗑️ Queue cleared"); };
    window.__scarab_show_panel = function() {
        var p = document.getElementById("scarab-panel-v4m");
        if (p) p.style.display = "block";
    };
    window.__scarab_v4m_ready = true;

    // Log that it loaded (visible in browser console)
    console.log("[SCARAB v4m] ✅ Active — @grant none, localStorage-backed");

    /* ─── Init ─── */
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createPanel);
    } else {
        createPanel();
    }
})();
