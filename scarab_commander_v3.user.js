// ==UserScript==
// @name         SCARAB Commander v3 — Quora Poster
// @namespace    http://tampermonkey.net/
// @version      3.1
// @description  Post answers to Quora via GraphQL from your browser
// @author       ZORG-Omega
// @match        https://www.quora.com/*
// @match        https://quora.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function() {
    "use strict";

    var QUEUE_KEY = "scarab_queue_v3";
    var PANEL_ID = "scarab-panel-v3";

    // ─── Styles ───────────────────────────────────────────
    GM_addStyle(
        "#" + PANEL_ID + "{position:fixed;bottom:20px;right:20px;z-index:99999;" +
        "background:#0d0d1a;color:#e0e0e0;padding:14px;border-radius:12px;" +
        "font-family:monospace;font-size:12px;max-width:420px;max-height:75vh;" +
        "overflow-y:auto;box-shadow:0 0 30px rgba(233,69,96,0.3);" +
        "border:1px solid #e94560;}" +
        "#" + PANEL_ID + " h3{margin:0 0 6px;color:#e94560;font-size:13px;}" +
        "#" + PANEL_ID + " .badge{background:#e94560;padding:2px 8px;border-radius:4px;font-size:10px;}" +
        "#" + PANEL_ID + " .btn{background:#e94560;color:#fff;border:none;" +
        "padding:4px 10px;border-radius:5px;cursor:pointer;font-size:11px;margin:2px;}" +
        "#" + PANEL_ID + " .btn:hover{background:#ff6b6b;}" +
        "#" + PANEL_ID + " .item{padding:5px 8px;margin:3px 0;background:#16213e;" +
        "border-radius:5px;border-left:3px solid #e94560;font-size:11px;}" +
        "#" + PANEL_ID + " .log{color:#888;font-size:10px;margin:1px 0;}"
    );

    // ─── State ────────────────────────────────────────────
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

    function getQueue() {
        try { return JSON.parse(GM_getValue(QUEUE_KEY, "[]")) || []; }
        catch(e) { return []; }
    }

    function setQueue(q) {
        GM_setValue(QUEUE_KEY, JSON.stringify(q));
    }

    // ─── Panel ────────────────────────────────────────────
    function createPanel() {
        if (document.getElementById(PANEL_ID)) return;

        panel = document.createElement("div");
        panel.id = PANEL_ID;
        panel.innerHTML =
            "<h3>SCARAB v3</h3>" +
            "<div style='margin:6px 0'>" +
            "<button class='btn' id='sc-panel-extract'>Extract QID</button>" +
            "<button class='btn' id='sc-panel-gql'>Post via GQL</button>" +
            "<button class='btn' id='sc-panel-queue'>Post Queue</button>" +
            "<button class='btn' id='sc-panel-hide' style='background:#555'>Hide</button></div>" +
            "<div><strong>Queue:</strong> <span id='sc-queue-count'>0</span></div>" +
            "<div id='sc-queue-list' style='max-height:150px;overflow-y:auto;margin:2px 0'></div>" +
            "<div><strong>Log:</strong></div>" +
            "<div id='sc-log' style='max-height:120px;overflow-y:auto;background:#050510;padding:4px;border-radius:4px'></div>";

        document.body.appendChild(panel);
        logEl = panel.querySelector("#sc-log");
        queueEl = panel.querySelector("#sc-queue-list");

        panel.querySelector("#sc-panel-extract").onclick = extractQID;
        panel.querySelector("#sc-panel-gql").onclick = postViaGQL;
        panel.querySelector("#sc-panel-queue").onclick = postQueue;
        panel.querySelector("#sc-panel-hide").onclick = function() { panel.style.display = "none"; };

        updateQueue();
        log("Loaded on " + window.location.hostname);
        console.log("[SCARAB] v3 active");
    }

    // ─── Queue Display ────────────────────────────────────
    function updateQueue() {
        if (!queueEl) return;
        var q = getQueue();
        var count = document.getElementById("sc-queue-count");
        if (count) count.textContent = q.length;

        if (q.length === 0) {
            queueEl.innerHTML = "<div class='log' style='color:#555'>Empty</div>";
            return;
        }

        var html = "";
        for (var i = 0; i < q.length; i++) {
            var t = (q[i].topic || "Untitled").substring(0, 35);
            var s = q[i].status || "pending";
            html += "<div class='item'>#" + (i+1) + " " + t +
                " <span style='color:#888'>[" + s + "]</span>" +
                " <button class='btn' data-idx='" + i + "' style='font-size:9px;padding:2px 6px'>Post</button>" +
                " <button class='btn' data-rm='" + i + "' style='font-size:9px;padding:2px 6px;background:#555'>X</button></div>";
        }
        queueEl.innerHTML = html;

        queueEl.querySelectorAll("[data-idx]").forEach(function(b) {
            b.onclick = function() {
                postSingle(parseInt(b.getAttribute("data-idx")));
            };
        });
        queueEl.querySelectorAll("[data-rm]").forEach(function(b) {
            b.onclick = function() {
                var idx = parseInt(b.getAttribute("data-rm"));
                var q2 = getQueue();
                q2.splice(idx, 1);
                setQueue(q2);
                updateQueue();
                log("Removed #" + (idx+1));
            };
        });
    }

    // ─── QID Extraction ───────────────────────────────────
    function extractQID() {
        log("Extracting QID...");
        var qid = null;
        var m;

        // From URL
        m = window.location.href.match(/qid=(\d+)/);
        if (m) qid = m[1];

        // From page scripts
        if (!qid) {
            var scripts = document.querySelectorAll("script");
            for (var i = 0; i < scripts.length; i++) {
                var txt = scripts[i].textContent || "";
                m = txt.match(/"questionId"\s*:\s*"(\d+)"/);
                if (m) { qid = m[1]; break; }
                m = txt.match(/"qid"\s*:\s*"?(\d+)"?/);
                if (m) { qid = m[1]; break; }
            }
        }

        if (qid) {
            GM_setValue("scarab_qid", qid);
            log("QID saved: " + qid);
        } else {
            log("QID not found on this page");
        }
    }

    // ─── GraphQL Posting ──────────────────────────────────
    function postViaGQL() {
        var qid = GM_getValue("scarab_qid", "");
        if (!qid) {
            extractQID();
            qid = GM_getValue("scarab_qid", "");
            if (!qid) { log("No QID. Visit a question page first"); return; }
        }

        var content = prompt("Enter answer text:", "");
        if (!content) return;

        log("Posting to QID " + qid + "...");
        doGraphQLPost(qid, content);
    }

    function doGraphQLPost(qid, content) {
        var payload = JSON.stringify({
            operationName: "AddAnswerMutation",
            variables: {
                questionId: qid,
                text: content,
                isDraft: false
            },
            query: "mutation AddAnswerMutation($questionId: String!, $text: String!, $isDraft: Boolean) { addAnswer(questionId: $questionId, text: $text, isDraft: $isDraft) { id url __typename } }"
        });

        GM_xmlhttpRequest({
            method: "POST",
            url: "https://www.quora.com/graphql",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Origin": "https://www.quora.com",
                "Referer": window.location.href
            },
            data: payload,
            onload: function(resp) {
                if (resp.status === 200) {
                    try {
                        var d = JSON.parse(resp.responseText);
                        if (d && d.data && d.data.addAnswer && d.data.addAnswer.id) {
                            log("POSTED! ID: " + d.data.addAnswer.id);
                        } else {
                            log("GQL resp: " + JSON.stringify(d).substring(0, 120));
                            tryAltGQL(qid, content);
                        }
                    } catch(e) {
                        log("Parse error, trying alt format");
                        tryAltGQL(qid, content);
                    }
                } else {
                    log("GQL error " + resp.status + ", trying alt format");
                    tryAltGQL(qid, content);
                }
            },
            onerror: function() {
                log("GQL request failed");
            }
        });
    }

    function tryAltGQL(qid, content) {
        log("Trying alt mutation...");
        var payload = JSON.stringify({
            query: "mutation { addAnswer(questionId: \"" + qid + "\", text: " + JSON.stringify(content) + ", isDraft: false) { id url } }"
        });

        GM_xmlhttpRequest({
            method: "POST",
            url: "https://www.quora.com/graphql",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Origin": "https://www.quora.com",
                "Referer": window.location.href
            },
            data: payload,
            onload: function(resp) {
                if (resp.status === 200 && resp.responseText.indexOf('"id"') > -1) {
                    log("POSTED via alt mutation!");
                } else {
                    log("Alt GQL failed: " + resp.responseText.substring(0, 80));
                    postViaDOM(content);
                }
            }
        });
    }

    function postViaDOM(text) {
        log("Trying DOM posting...");
        var editor = document.querySelector('[contenteditable="true"]');
        if (!editor) {
            // Click answer button
            var btns = document.querySelectorAll("button");
            for (var i = 0; i < btns.length; i++) {
                if (btns[i].textContent.indexOf("Answer") > -1) {
                    btns[i].click();
                    break;
                }
            }
        }

        setTimeout(function() {
            var ed2 = document.querySelector('[contenteditable="true"]');
            if (ed2) {
                ed2.focus();
                document.execCommand("insertText", false, text);
                log("Text inserted. Please submit manually.");
            } else {
                log("DOM posting failed - no editor found");
            }
        }, 2000);
    }

    // ─── Queue Posting ────────────────────────────────────
    function postSingle(index) {
        var q = getQueue();
        if (index >= q.length) return;

        var item = q[index];
        log("Posting #" + (index+1) + ": " + (item.topic || "").substring(0, 30) + "...");

        var qid = GM_getValue("scarab_qid", "");
        if (!qid) {
            extractQID();
            qid = GM_getValue("scarab_qid", "");
        }
        if (!qid && item.qid) qid = item.qid;

        if (qid && item.content) {
            doGraphQLPostWithCallback(qid, item.content, index);
        } else {
            postViaDOM(item.content);
        }
    }

    function doGraphQLPostWithCallback(qid, content, idx) {
        var payload = JSON.stringify({
            operationName: "AddAnswerMutation",
            variables: {
                questionId: qid,
                text: content,
                isDraft: false
            },
            query: "mutation AddAnswerMutation($questionId: String!, $text: String!, $isDraft: Boolean) { addAnswer(questionId: $questionId, text: $text, isDraft: $isDraft) { id url __typename } }"
        });

        GM_xmlhttpRequest({
            method: "POST",
            url: "https://www.quora.com/graphql",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "Origin": "https://www.quora.com",
                "Referer": window.location.href
            },
            data: payload,
            onload: function(resp) {
                var posted = false;
                if (resp.status === 200) {
                    try {
                        var d = JSON.parse(resp.responseText);
                        if (d && d.data && d.data.addAnswer && d.data.addAnswer.id) posted = true;
                    } catch(e) {}
                }
                var q = getQueue();
                if (idx < q.length) {
                    q[idx].status = posted ? "posted" : "failed";
                    setQueue(q);
                    updateQueue();
                }
                log(posted ? "POSTED #" + (idx+1) : "Failed #" + (idx+1));
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

        log("Posting " + pending + " items...");
        // Post first pending item
        for (var j = 0; j < q.length; j++) {
            if (!q[j].status || q[j].status === "pending") {
                postSingle(j);
                break;
            }
        }
    }

    // ─── External API ─────────────────────────────────────
    unsafeWindow.__scarab_add_to_queue = function(topic, content, platform) {
        var q = getQueue();
        q.push({topic: topic, content: content, platform: platform || "quora", status: "pending", ts: Date.now()});
        setQueue(q);
        updateQueue();
        log("Added: " + (topic || "").substring(0, 30));
        return q.length - 1;
    };
    unsafeWindow.__scarab_v3_ready = true;

    // ─── Init ─────────────────────────────────────────────
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", createPanel);
    } else {
        createPanel();
    }
})();
