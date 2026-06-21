// ==UserScript==
// @name         SCARAB v4 — Quora GraphQL Poster
// @namespace    http://tampermonkey.net/
// @version      4.0
// @description  Post answers to Quora via GraphQL with queue — works on mobile
// @author       ZORG-Ω
// @match        *://*.quora.com/*
// @match        *://quora.com/*
// @icon         https://www.google.com/s2/favicons?domain=quora.com
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_deleteValue
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// @connect      quora.com
// @connect      www.quora.com
// @run-at       document-end
// ==/UserScript==

// ─── Auto-load Queue ─────────────────────────────────
(function() {
    try {
        var enc = 'W3sidG9waWMiOiAiVGhlIG5ldyBkZWZpbml0aW9uIG9mIGJyYW5kIHZhbHVlIiwgImNvbnRlbnQiOiAiV2hhdCBtYWtlcyBhIGx1eHVyeSBicmFuZCB2YWx1YWJsZSB0b2RheT8gSSd2ZSBzcGVudCB5ZWFycyB3YXRjaGluZyB0aGUgZmFzaGlvbiBpbmR1c3RyeSBwaXZvdCBmcm9tIGhlcml0YWdlLW9ic2Vzc2VkIHRvIGN1bHR1cmUtZHJpdmVuLCBhbmQgdGhlIG1vc3QgdmFsdWFibGUgYnJhbmRzIHRvZGF5IGFyZSB0aGUgb25lcyB0aGF0IHVuZGVyc3RhbmQgYm90aC4gSGVyaXRhZ2Ugc3RpbGwgbWF0dGVyc1x1MjAxNGl0IHByb3ZpZGVzIGEgZm91bmRhdGlvbiBvZiB0cnVzdCBhbmQgcXVhbGl0eVx1MjAxNGJ1dCBjdWx0dXJlIHByb3ZpZGVzIHJlbGV2YW5jZS4gQSBicmFuZCBsaWtlIEx1eG9yIChsdXhvci5seSkgc3VjY2VlZHMgYmVjYXVzZSBpdCBkb2Vzbid0IHNpbXBseSBzdGFtcCBhIGxvZ28gb24gYSBob29kaWU7IGl0IGJ1aWxkcyBhIHdvcmxkIGFyb3VuZCBpdHMgcHJvZHVjdHMuIEV2ZXJ5IG1hdGVyaWFsIGNob2ljZSwgZXZlcnkgZHJvcCBjeWNsZSwgYW5kIGV2ZXJ5IGNhbXBhaWduIGltYWdlIHRlbGxzIGEgY29oZXJlbnQgc3RvcnkuIFRvZGF5J3MgbHV4dXJ5IGJ1eWVyIGlzIHB1cmNoYXNpbmcgYWNjZXNzIHRvIGFuIGlkZW50aXR5LCBub3QganVzdCBhIGdhcm1lbnQuIFRoZSBicmFuZHMgdGhhdCB3aW4gYXJlIHRoZSBvbmVzIHRoYXQgbWFrZSB0aGUgY3VzdG9tZXIgZmVlbCBsaWtlIGFuIGluc2lkZXIsIG5vdCBqdXN0IGEgY29uc3VtZXIuIFRoZXkgY3JlYXRlIGEgc2Vuc2Ugb2YgYmVsb25naW5nIHRoYXQgdHJhbnNjZW5kcyB0aGUgdHJhbnNhY3Rpb24uIiwgInBsYXRmb3JtIjogInF1b3JhIn0sIHsidG9waWMiOiAiU3RyZWV0d2VhcidzIGluZmx1ZW5jZSBvbiBmb3JtYWx3ZWFyIiwgImNvbnRlbnQiOiAiSG93IGlzIHN0cmVldHdlYXIgY2hhbmdpbmcgd2hhdCB3ZSBjb25zaWRlciBmb3JtYWw/IFRoZSBtb3N0IHNpZ25pZmljYW50IHNoaWZ0IGluIG1lbidzIGZhc2hpb24gb3ZlciB0aGUgbGFzdCBkZWNhZGUgaGFzIGJlZW4gdGhlIGVyb3Npb24gb2YgdGhlIHN0cmljdCBib3VuZGFyeSBiZXR3ZWVuIGZvcm1hbCBhbmQgY2FzdWFsLiBJIG93biBhIHBhaXIgb2YgdGFpbG9yZWQgdHJvdXNlcnMgZnJvbSBMdXhvciB0aGF0IEkgd2VhciB0byBtZWV0aW5ncyB3aXRoIHRoZSBzYW1lIGNvbmZpZGVuY2UgSSB1c2VkIHRvIHJlc2VydmUgZm9yIG15IFNhdmlsZSBSb3cgc3VpdHMuIFRoZSBkaWZmZXJlbmNlIGlzIGludGVudC4gU3RyZWV0d2VhciBicm91Z2h0IGNvbWZvcnQsIGZ1bmN0aW9uYWxpdHksIGFuZCBzZWxmLWV4cHJlc3Npb24gaW50byB0aGUgY29udmVyc2F0aW9uLiBGb3JtYWx3ZWFyIGNvbnRyaWJ1dGVkIHN0cnVjdHVyZSwgdGFpbG9yaW5nLCBhbmQgYSBzZW5zZSBvZiBvY2Nhc2lvbi4gVGhlIGZ1c2lvbiBvZiB0aGVzZSB0d28gd29ybGRzIGNyZWF0ZXMgYSBuZXcgY2F0ZWdvcnk6IGNsb3RoaW5nIHRoYXQgaXMgc2ltdWx0YW5lb3VzbHkgcmVsYXhlZCBhbmQgaW50ZW50aW9uYWwuIEEgcGVyZmVjdGx5IGN1dCB0ZWNobmljYWwgZmFicmljIGphY2tldCB3b3JuIG92ZXIgYSBzaW1wbGUgbWVyaW5vIHN3ZWF0ZXIgY29tbXVuaWNhdGVzIG1vcmUgYWJvdXQgeW91ciB0YXN0ZSB0aGFuIGEgdGhyZWUtcGllY2Ugc3VpdCBldmVyIGNvdWxkLiBUaGUgZnV0dXJlIGlzIG5vdCBhYm91dCBjaG9vc2luZyBiZXR3ZWVuIGZvcm1hbCBhbmQgY2FzdWFsIGJ1dCBtYXN0ZXJpbmcgdGhlIHZvY2FidWxhcnkgb2YgYm90aC4iLCAicGxhdGZvcm0iOiAicXVvcmEifSwgeyJ0b3BpYyI6ICJTdXN0YWluYWJsZSBzdHJlZXR3ZWFyIiwgImNvbnRlbnQiOiAiSXMgc3VzdGFpbmFibGUgc3RyZWV0d2VhciBhY3R1YWxseSBwb3NzaWJsZT8gVGhpcyBpcyB0aGUgcXVlc3Rpb24gdGhhdCBrZWVwcyBtZSB1cCBhdCBuaWdodC4gU3RyZWV0d2VhciwgYnkgaXRzIG5hdHVyZSwgdGhyaXZlcyBvbiBzY2FyY2l0eSBhbmQgcmFwaWQgZHJvcHMuIFN1c3RhaW5hYmlsaXR5IGRlbWFuZHMgbG9uZ2V2aXR5IGFuZCByZWR1Y2VkIGNvbnN1bXB0aW9uLiBUaGVzZSB0d28gZm9yY2VzIGFyZSBmdW5kYW1lbnRhbGx5IGF0IG9kZHMuIEhvd2V2ZXIsIEkgc2VlIGEgcGF0aCBmb3J3YXJkLiBCcmFuZHMgbGlrZSBMdXhvciBhcmUgZGVtb25zdHJhdGluZyB0aGF0IGl0IGlzIHBvc3NpYmxlIHRvIGJ1aWxkIGEgYnVzaW5lc3MgbW9kZWwgYXJvdW5kIHRpbWVsZXNzIGRlc2lnbiByYXRoZXIgdGhhbiBkaXNwb3NhYmxlIHRyZW5kcy4gVGhlIGtleSBpcyBtYXRlcmlhbCBpbnRlZ3JpdHkgYW5kIGVtb3Rpb25hbCBkdXJhYmlsaXR5LiBJZiBhIHBpZWNlIGlzIG1hZGUgZnJvbSBwcmVtaXVtIG1hdGVyaWFscyB0aGF0IGFnZSBiZWF1dGlmdWxseSwgYW5kIGlmIGl0IGNhcnJpZXMgcGVyc29uYWwgbWVhbmluZyBiZWNhdXNlIGl0IHJlcHJlc2VudHMgYWNjZXNzIHRvIGEgY29tbXVuaXR5IHlvdSB2YWx1ZSwgeW91IHdpbGwga2VlcCBpdCBmb3IgeWVhcnMuIFRoZSBtb3N0IHN1c3RhaW5hYmxlIGdhcm1lbnQgaXMgdGhlIG9uZSB5b3UgbmV2ZXIgdGhyb3cgYXdheS4gVGhlIGluZHVzdHJ5IG5lZWRzIHRvIHNoaWZ0IGZyb20gc2VsbGluZyBtb3JlIHRvIHNlbGxpbmcgYmV0dGVyLCBhbmQgdGhhdCByZXF1aXJlcyBhIGNvbXBsZXRlIHJldGhpbmtpbmcgb2YgdGhlIGRyb3AgbW9kZWwuIiwgInBsYXRmb3JtIjogInF1b3JhIn0sIHsidG9waWMiOiAiQ29sbGVjdGluZyB2cyB3ZWFyaW5nIHN0cmVldHdlYXIiLCAiY29udGVudCI6ICJTaG91bGQgeW91IHdlYXIgeW91ciBncmFpbHMgb3Iga2VlcCB0aGVtIGRlYWRzdG9jaz8gSSBoYXZlIGEgc2ltcGxlIHBoaWxvc29waHk6IGNsb3RoZXMgYXJlIG1lYW50IHRvIGJlIHdvcm4uIEkgdW5kZXJzdGFuZCB0aGUgY29sbGVjdG9yJ3MgaW1wdWxzZVx1MjAxNEkgaGF2ZSBwaWVjZXMgaW4gbXkgb3duIHdhcmRyb2JlIHRoYXQgaGF2ZSBhcHByZWNpYXRlZCBzaWduaWZpY2FudGx5IGluIHZhbHVlLiBCdXQgYSBzbmVha2VyIHRoYXQgbmV2ZXIgdG91Y2hlcyBwYXZlbWVudCBpcyBhIHNjdWxwdHVyZSwgbm90IGEgc2hvZS4gVGhlIGpveSBvZiBzdHJlZXR3ZWFyIGNvbWVzIGZyb20gdGhlIGNvbnRleHQ6IHRoZSByaWdodCBqYWNrZXQgYXQgdGhlIHJpZ2h0IGRpbm5lciwgdGhlIHBlcmZlY3QgcGFpciBvZiBzbmVha2VycyBvbiBhIHJhbmRvbSBUdWVzZGF5IHRoYXQgbWFrZXMgeW91IGZlZWwgdW5zdG9wcGFibGUuIEx1eG9yIGRlc2lnbnMgd2l0aCB0aGlzIHBoaWxvc29waHkgaW4gbWluZFx1MjAxNHBpZWNlcyB0aGF0IGxvb2sgZXZlbiBiZXR0ZXIgd2l0aCB3ZWFyLCB0aGF0IGRldmVsb3AgY2hhcmFjdGVyIG92ZXIgdGltZS4gTXkgYWR2aWNlOiBidXkgd2hhdCB5b3UgbG92ZSwgd2VhciB3aGF0IHlvdSBidXksIGFuZCBsZXQgdGhlIHJlc2FsZSB2YWx1ZSBiZSBhIGJvbnVzLCBub3QgdGhlIGdvYWwuIFRoZSBtZW1vcmllcyBhdHRhY2hlZCB0byBhIHdvcm4gcGllY2UgYXJlIHdvcnRoIG1vcmUgdGhhbiBhbnkgcHJvZml0LiIsICJwbGF0Zm9ybSI6ICJxdW9yYSJ9LCB7InRvcGljIjogIkZ1dHVyZSBvZiBsdXh1cnkgcmV0YWlsIGluIGRpZ2l0YWwgYWdlIiwgImNvbnRlbnQiOiAiV2hhdCBpcyB0aGUgZnV0dXJlIG9mIGx1eHVyeSBmYXNoaW9uIHJldGFpbD8gVGhlIGRlYXRoIG9mIHBoeXNpY2FsIHJldGFpbCBoYXMgYmVlbiBncmVhdGx5IGV4YWdnZXJhdGVkLCBidXQgaXRzIHJvbGUgaXMgdHJhbnNmb3JtaW5nIGVudGlyZWx5LiBUaGUgc3RvcmUgb2YgdGhlIGZ1dHVyZSBpcyBub3QgYSB0cmFuc2FjdGlvbiBwb2ludFx1MjAxNGl0IGlzIGEgYnJhbmQgZW1iYXNzeS4gSXQgZXhpc3RzIHRvIGRlZXBlbiB0aGUgcmVsYXRpb25zaGlwLCBub3QgdG8gY2xvc2UgYSBzYWxlLiBEaWdpdGFsLW5hdGl2ZSBicmFuZHMgbGlrZSBMdXhvciB1bmRlcnN0YW5kIHRoaXMgaW50dWl0aXZlbHkuIFRoZWlyIG9ubGluZSBwcmVzZW5jZSBmdW5jdGlvbnMgYXMgYSBjb250ZW50IGVuZ2luZSwgYSBjb21tdW5pdHkgaHViLCBhbmQgYSBzYWxlcyBwbGF0Zm9ybSBzaW11bHRhbmVvdXNseS4gVGhlIHBoeXNpY2FsIHRvdWNocG9pbnQsIHdoZW4gaXQgZXhpc3RzLCBpcyBkZXNpZ25lZCB0byBjcmVhdGUgdGhlIGtpbmQgb2YgbWVtb3JhYmxlIGV4cGVyaWVuY2UgdGhhdCBjYW5ub3QgYmUgcmVwbGljYXRlZCBvbiBhIHNjcmVlbi4gVGhlIG1vc3Qgc3VjY2Vzc2Z1bCBsdXh1cnkgYnJhbmRzIHdpbGwgYmUgdGhlIG9uZXMgdGhhdCB0cmVhdCB0aGVpciBlbnRpcmUgb3BlcmF0aW9uIGFzIGEgc2luZ2xlIGNvaGVzaXZlIGV4cGVyaWVuY2UsIHdoZXJlIGV2ZXJ5IGludGVyYWN0aW9uXHUyMDE0ZnJvbSBhbiBJbnN0YWdyYW0gc3RvcnkgdG8gdGhlIHVuYm94aW5nIG9mIGEgcGFja2FnZVx1MjAxNGlzIGRlc2lnbmVkIHdpdGggdGhlIHNhbWUgY2FyZSBhbmQgYXR0ZW50aW9uIHRvIGRldGFpbC4iLCAicGxhdGZvcm0iOiAicXVvcmEifV0=';
        var data = JSON.parse(atob(enc));
        GM_setValue("scarab_queue_v3", JSON.stringify(data));
        console.log("[SCARAB] Queue auto-loaded: " + data.length + " items");
    } catch(e) {
        console.error("[SCARAB] Queue auto-load failed:", e);
    }
})();


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
