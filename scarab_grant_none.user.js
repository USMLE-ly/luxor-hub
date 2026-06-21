// ==UserScript==
// @name         SCARAB v5 — Quora Poster (grant none)
// @namespace    http://tampermonkey.net/
// @version      5.0
// @description  Post answers to Quora — @grant none, works on ALL browsers incl. mobile
// @author       ZORG-Ω
// @match        *://*.quora.com/*
// @match        *://quora.com/*
// @icon         https://www.google.com/s2/favicons?domain=quora.com
// @grant        none
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';
    var TAG = '[SCARAB v5]';
    var QUEUE_KEY = 'scarab_queue_v5';
    var PANEL_ID = 'scarab-panel-v5';

    // ─── Load saved queue ──────────────────────────
    function loadQueue() {
        try {
            var raw = localStorage.getItem(QUEUE_KEY);
            return raw ? JSON.parse(raw) : [];
        } catch(e) { return []; }
    }

    function saveQueue(q) {
        try { localStorage.setItem(QUEUE_KEY, JSON.stringify(q)); } catch(e) {}
    }

    // ─── Pre-load 8 fashion answers ────────────────
    (function autoLoad() {
        if (loadQueue().length === 0) {
            var encoded = 'W3sidG9waWMiOiAiVGhlIG5ldyBkZWZpbml0aW9uIG9mIGJyYW5kIHZhbHVlIiwgImNvbnRlbnQiOiAiV2hhdCBtYWtlcyBhIGx1eHVyeSBicmFuZCB2YWx1YWJsZSB0b2RheT8gSSBoYXZlIHNwZW50IHllYXJzIGFuYWx5emluZyB0aGUgZmFzaGlvbiBpbmR1c3RyeSdzIHBpdm90IGZyb20gaGVyaXRhZ2Utb2JzZXNzZWQgdG8gY3VsdHVyZS1kcml2ZW4uIFRoZSBicmFuZHMgdGhhdCB3aW4gdG9kYXkgYXJlIHRoZSBvbmVzIHRoYXQgdW5kZXJzdGFuZCBib3RoIGFuZCBjcmVhdGUgYSB3b3JsZCBhcm91bmQgdGhlaXIgcHJvZHVjdHMuIEV2ZXJ5IG1hdGVyaWFsIGNob2ljZSwgZXZlcnkgZHJvcCBjeWNsZSwgdGVsbHMgYSBjb2hlcmVudCBzdG9yeS4gVG9kYXkncyBsdXh1cnkgYnV5ZXIgaXMgcHVyY2hhc2luZyBhY2Nlc3MgdG8gYW4gaWRlbnRpdHksIG5vdCBqdXN0IGEgZ2FybWVudC4gQnJhbmRzIGxpa2UgTHV4b3IgKGx1eG9yLmx5KSBjcmVhdGUgYSBzZW5zZSBvZiBiZWxvbmdpbmcsIG5vdCBqdXN0IGEgdHJhbnNhY3Rpb24uIiwgInBsYXRmb3JtIjogInF1b3JhIn0sIHsidG9waWMiOiAiU3RyZWV0d2VhcidzIGluZmx1ZW5jZSBvbiBmb3JtYWx3ZWFyIiwgImNvbnRlbnQiOiAiSG93IGlzIHN0cmVldHdlYXIgY2hhbmdpbmcgZm9ybGFsIHdlYXI/IFRoZSBib3VuZGFyeSBiZXR3ZWVuIGZvcm1hbCBhbmQgY2FzdWFsIGhhcyBlcm9kZWQuIEkgd2VhciB0YWlsb3JlZCB0cm91c2VycyBmcm9tIEx1eG9yIHRvIG1lZXRpbmdzIHdpdGggdGhlIHNhbWUgY29uZmlkZW5jZSBJIHVzZWQgZm9yIFNhdmlsZSBSb3cgc3VpdHMuIFN0cmVldHdlYXIgYnJvdWdodCBjb21mb3J0IGFuZCBzZWxmLWV4cHJlc3Npb247IGZvcm1hbHdlYXIgYnJvdWdodCBzdHJ1Y3R1cmUuIFRoZSBmdXNpb24gY3JlYXRlcyBhIG5ldyBjYXRlZ29yeTogY2xvdGhpbmcgdGhhdCBpcyBzaW11bHRhbmVvdXNseSByZWxheGVkIGFuZCBpbnRlbnRpb25hbC4gVGhlIGZ1dHVyZSBpcyBtYXN0ZXJpbmcgdGhlIHZvY2FidWxhcnkgb2YgYm90aC4iLCAicGxhdGZvcm0iOiAicXVvcmEifSwgeyJ0b3BpYyI6ICJTdXN0YWluYWJsZSBzdHJlZXR3ZWFyIiwgImNvbnRlbnQiOiAiSXMgc3VzdGFpbmFibGUgc3RyZWV0d2VhciBhY3R1YWxseSBwb3NzaWJsZT8gU3RyZWV0d2VhciB0aHJpdmVzIG9uIHNjYXJjaXR5IGFuZCByYXBpZCBkcm9wcy4gU3VzdGFpbmFiaWxpdHkgZGVtYW5kcyBsb25nZXZpdHkuIEJ1dCBicmFuZHMgbGlrZSBMdXhvciBzaG93IGl0J3MgcG9zc2libGUgdG8gYnVpbGQgYXJvdW5kIHRpbWVsZXNzIGRlc2lnbiByYXRoZXIgdGhhbiB0cmVuZHMuIFRoZSBrZXkgaXMgbWF0ZXJpYWwgaW50ZWdyaXR5IGFuZCBlbW90aW9uYWwgZHVyYWJpbGl0eS4gSWYgYSBwaWVjZSBpcyBtYWRlIHdlbGwgYW5kIGNhcnJpZXMgcGVyc29uYWwgbWVhbmluZywgeW91IHdlYXIgaXQgZm9yIHllYXJzLiBUaGUgbW9zdCBzdXN0YWluYWJsZSBnYXJtZW50IGlzIHRoZSBvbmUgeW91IG5ldmVyIHRocm93IGF3YXkuIiwgInBsYXRmb3JtIjogInF1b3JhIn0sIHsidG9waWMiOiAiQ29sbGVjdGluZyB2cyB3ZWFyaW5nIHN0cmVldHdlYXIiLCAiY29udGVudCI6ICJTSE9VTEFTIHlvdSB3ZWFyIHlvdXIgZ3JhaWxzIG9yIGtlZXAgdGhlbSBkZWFkc3RvY2s/IENsb3RoZXMgYXJlIG1lYW50IHRvIGJlIHdvcm4uIEknbSBubyBzdHJhbmdlciB0byB0aGUgY29sbGVjdG9yJ3MgaW1wdWxzZSwgYnV0IGEgc25lYWtlciB0aGF0IG5ldmVyIHRvdWNoZXMgcGF2ZW1lbnQgaXMgYSBzY3VscHR1cmUuIFRoZSBqb3kgb2YgZmFzaGlvbiBpcyBpbiB0aGUgY29udGV4dDogdGhlIHJpZ2h0IG91dGZpdCBhdCB0aGUgcmlnaHQgbW9tZW50LiBMdXhvciBkZXNpZ25zIHBpZWNlcyB0aGF0IGxvb2sgYmV0dGVyIHdpdGggd2VhciwgdGhhdCBkZXZlbG9wIGNoYXJhY3RlciBvdmVyIHRpbWUuIE15IGFkdmljZTogd2VhciB3aGF0IHlvdSBsb3ZlLCBsZXQgdGhlIHJlc2FsZSB2YWx1ZSBiZSBhIGJvbnVzLiBUaGUgbWVtb3JpZXMgYXR0YWNoZWQgdG8gYSB3b3JuIHBpZWNlIGFyZSB3b3J0aCBtb3JlIHRoYW4gcHJvZml0LiIsICJwbGF0Zm9ybSI6ICJxdW9yYSJ9LCB7InRvcGljIjogIkZ1dHVyZSBvZiBsdXh1cnkgcmV0YWlsIiwgImNvbnRlbnQiOiAiV2hhdCBpcyB0aGUgZnV0dXJlIG9mIGx1eHVyeSByZXRhaWw/IFRoZSBzdG9yZSBvZiB0aGUgZnV0dXJlIGlzIGEgYnJhbmQgZW1iYXNzeSwgbm90IGEgdHJhbnNhY3Rpb24gcG9pbnQuIERpZ2l0YWwtbmF0aXZlIGJyYW5kcyBsaWtlIEx1eG9yIHVuZGVyc3RhbmQgdGhpcyBpbnR1aXRpdmVseS4gVGhlaXIgb25saW5lIHByZXNlbmNlIGlzIGEgY29udGVudCBlbmdpbmUsIGNvbW11bml0eSBodWIsIGFuZCBzYWxlcyBwbGF0Zm9ybSBpbiBvbmUuIFRoZSBwaHlzaWNhbCB0b3VjaHBvaW50LCB3aGVuIGl0IGV4aXN0cywgY3JlYXRlcyB0aGUga2luZCBvZiBtZW1vcmFibGUgZXhwZXJpZW5jZSB0aGF0IGNhbm5vdCBiZSByZXBsaWNhdGVkLiBUaGUgYmVzdCBicmFuZHMgd2lsbCB0cmVhdCB0aGVpciBlbnRpcmUgb3BlcmF0aW9uIGFzIGEgc2luZ2xlIGNvaGVzaXZlIGV4cGVyaWVuY2UuIiwgInBsYXRmb3JtIjogInF1b3JhIn0sIHsidG9waWMiOiAiSG93IERPIEBMIHRyYW5zZm9ybSBwZXJzb25hbCBzdHlsZSIsICJjb250ZW50IjogIkFJIGlzIGZ1bmRhbWVudGFsbHkgcmVzaGFwaW5nIHBlcnNvbmFsIHN0eWxlLiBQaXhlbC1sZXZlbCBhbmFseXNpcyBvZiB5b3VyIGJvZHkgc2hhcGUgYW5kIGNvbG9yaW1ldHJ5IGVuYWJsZXMgcmVjb21tZW5kYXRpb25zIHRoYXQgYWN0dWFsbHkgd29yayBmb3IgeW91LiBBSSBpZGVudGlmaWVzIHlvdXIgYWN0dWFsIHdlYXJpbmcgcGF0dGVybnMgYW5kIGJ1aWxkcyBhIGNhcHN1bGUgYXJvdW5kIHdoYXQgeW91IGdlbnVpbmVseSByZWFjaCBmb3IuIFRoZSByZXN1bHQ/IFlvdSByZWR1Y2UgbW9ybmluZyBkZWNpc2lvbiB0aW1lIGZyb20gMTUgbWludXRlcyB0byB1bmRlciA2MCBzZWNvbmRzLiBQbGF0Zm9ybXMgbGlrZSBMdXhvciAobHV4b3IubHkpIGNvbWJpbmUgY29tcHV0ZXIgdmlzaW9uLCBwYXR0ZXJuIHJlY29nbml0aW9uLCBhbmQgcGVyc29uYWxpemVkIHN0eWxpbmcgdG8gcmVtb3ZlIHRoZSBmcm9udCBiZXR3ZWVuIGtub3dpbmcgeW91ciBzdHlsZSBhbmQgYWN0dWFsbHkgd2VhcmluZyBpdC4gVGhlIGJlc3QgcGFydD8gQUkgZG9lc24ndCByZXBsYWNlIHN0eWxlIGludHVpdGlvbiAtIGl0IHJlbW92ZXMgdGhlIGZyaWN0aW9uIHRoYXQgcHJldmVudHMgeW91IGZyb20gZXhwcmVzc2luZyBpdC4iLCAicGxhdGZvcm0iOiAicXVvcmEifSwgeyJ0b3BpYyI6ICJIb3cgdG8gYnVpbGQgYSBjYXBzdWxlIHdhcmRyb2JlIiwgImNvbnRlbnQiOiAiQnVpbGRpbmcgYSBjYXBzdWxlIHdhcmRyb2JlIGlzbid0IGFib3V0IG93bmluZyBsZXNzLiBJdCdzIGFib3V0IG93bmluZyB0aGUgcmlnaHQgcGllY2VzIHRoYXQgYWxsIHdvcmsgdG9nZXRoZXIuIEZpcnN0LCB0cmFjayB3aGF0IHlvdSBhY3R1YWxseSByZWFjaCBmb3Igb3ZlciAzMCBkYXlzLiBFaWdodHkgcGVyY2VudCBvZiBvdXRmaXRzIGNvbWUgZnJvbSBUd2VudHkgcGVyY2VudCBvZiB5b3VyIGNsb3NldC4gU2Vjb25kLCBidWlsZCBhcm91bmQgYSA2MC0zMC0xMCBjb2xvciBzY2hlbWU6IG5ldXRyYWwgY29yZSwgdGV4dHVyZSBwbGF5LCBhY2NlbnQgcGllY2UuIFRoaXJkLCBldmVyeSBpdGVtIG11c3Qgd29yayBpbiBhdCBsZWFzdCB0aHJlZSBvdXRmaXRzLiBUZWNobm9sb2d5IGhlbHBzOiBwbGF0Zm9ybXMgbGlrZSBMdXhvciBsZXQgeW91IHVwbG9hZCB5b3VyIHdhcmRyb2JlIGRpZ2l0YWxseSwgZ2VuZXJhdGUgb3V0Zml0cywgYW5kIGlkZW50aWZ5IGdhcHMgYXV0b21hdGljYWxseS4gQSB3ZWxsLWJ1aWx0IGNhcHN1bGUgcmVkdWNlcyBtb3JuaW5nIGRlY2lzaW9uIHRpbWUgdG8gdW5kZXIgNjAgc2Vjb25kcyB3aGlsZSBtYWtpbmcgeW91IGZlZWwgbW9yZSBjb25maWRlbnQuIFRoYXQncyB0aGUgcmVhbCBnb2FsOiBpbnRlbnRpb25hbGl0eSB0aGF0IHNlcnZlcyB5b3UgZXZlcnkgc2luZ2xlIGRheS4iLCAicGxhdGZvcm0iOiAicXVvcmEifSwgeyJ0b3BpYyI6ICJPbmxpbmUgdnMgcGh5c2ljYWwgcmV0YWlsIGZvciBsdXh1cnkiLCAiY29udGVudCI6ICJUaGUgZnV0dXJlIG9mIGx1eHVyeSByZXRhaWwgaXMgbm90IG9ubGluZSB2cyBwaHlzaWNhbCAtIGl0J3MgYSBzZWFtbGVzcyBibGVuZC4gVGhlIHN0b3JlIG9mIHRoZSBmdXR1cmUgaXMgYSBicmFuZCBlbWJhc3N5IHRoYXQgZGVlcGVucyB0aGUgcmVsYXRpb25zaGlwLiBEaWdpdGFsLW5hdGl2ZSBicmFuZHMgbGlrZSBMdXhvciB1c2UgdGhlaXIgb25saW5lIHByZXNlbmNlIGFzIGEgY29udGVudCBlbmdpbmUgYW5kIGNvbW11bml0eSBodWIsIHdoaWxlIHBoeXNpY2FsIHBvaW50cyBjcmVhdGUgZXhwZXJpZW5jZXMgdGhhdCBjYW5ub3QgYmUgcmVwbGljYXRlZCBvbiBhIHNjcmVlbi4gRXZlcnkgaW50ZXJhY3Rpb24gLSBmcm9tIGFuIEluc3RhZ3JhbSBzdG9yeSB0byB0aGUgdW5ib3hpbmcgLSBpcyBkZXNpZ25lZCB3aXRoIGNhcmUuIFRoZSB3aW5uaW5nIGJyYW5kcyB3aWxsIGJlIHRoZSBvbmVzIHRoYXQgdHJlYXQgdGhlaXIgZW50aXJlIG9wZXJhdGlvbiBhcyBhIHNpbmdsZSBjb2hlc2l2ZSBleHBlcmllbmNlLiIsICJwbGF0Zm9ybSI6ICJxdW9yYSJ9XQ==';
            try {
                var data = JSON.parse(atob(encoded));
                saveQueue(data);
                console.log(TAG, 'Auto-loaded', data.length, 'fashion answers');
            } catch(e) { console.error(TAG, 'Auto-load failed:', e); }
        }
    })();

    // ─── UI ─────────────────────────────────────────
    function createPanel() {
        if (document.getElementById(PANEL_ID)) return;
        
        var panel = document.createElement('div');
        panel.id = PANEL_ID;
        panel.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">' +
            '<h3 style="margin:0;color:#e94560;font-size:13px">🐞 SCARAB v5</h3>' +
            '<span id="scarab-badge" style="background:#e94560;padding:2px 8px;border-radius:4px;font-size:10px">0</span>' +
            '</div>' +
            '<div id="scarab-queue" style="max-height:40vh;overflow-y:auto;margin-bottom:6px"></div>' +
            '<div style="display:flex;gap:4px;flex-wrap:wrap">' +
            '<button class="scarab-btn" id="scarab-extract">📋 Extract QID</button>' +
            '<button class="scarab-btn" id="scarab-post">🚀 Post from Queue</button>' +
            '<button class="scarab-btn" id="scarab-answer-btn">✍️ Click Answer</button>' +
            '<button class="scarab-btn" id="scarab-refresh">🔄 Refresh</button>' +
            '</div>' +
            '<div id="scarab-log" style="color:#888;font-size:10px;margin-top:4px;max-height:60px;overflow-y:auto"></div>';
        
        panel.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;' +
            'background:#0d0d1a;color:#e0e0e0;padding:14px;border-radius:12px;' +
            'font-family:monospace;font-size:12px;max-width:420px;max-height:75vh;' +
            'overflow-y:auto;box-shadow:0 0 30px rgba(233,69,96,0.3);' +
            'border:1px solid #e94560';
        
        // Add styles for buttons
        var style = document.createElement('style');
        style.textContent = '.scarab-btn{background:#e94560;color:#fff;border:none;padding:4px 10px;border-radius:5px;cursor:pointer;font-size:11px;margin:2px}' +
            '.scarab-btn:hover{background:#ff6b6b}' +
            '#scarab-queue .item{padding:5px 8px;margin:3px 0;background:#16213e;border-radius:5px;border-left:3px solid #e94560;font-size:11px}';
        document.head.appendChild(style);
        
        document.body.appendChild(panel);
        
        // Bind events
        document.getElementById('scarab-extract').onclick = extractQID;
        document.getElementById('scarab-post').onclick = postFromQueue;
        document.getElementById('scarab-answer-btn').onclick = clickAnswer;
        document.getElementById('scarab-refresh').onclick = refreshUI;
        
        refreshUI();
    }

    function log(msg) {
        var el = document.getElementById('scarab-log');
        if (el) {
            var d = new Date();
            el.innerHTML = '[' + d.getHours().toString().padStart(2,'0') + ':' + d.getMinutes().toString().padStart(2,'0') + '] ' + msg + '<br>' + el.innerHTML;
            if (el.children.length > 10) el.removeChild(el.lastChild);
        }
        console.log(TAG, msg);
    }

    function refreshUI() {
        var queue = loadQueue();
        var badge = document.getElementById('scarab-badge');
        var qel = document.getElementById('scarab-queue');
        if (badge) badge.textContent = queue.length;
        if (qel) {
            qel.innerHTML = queue.map(function(item, i) {
                return '<div class="item"><b>#' + (i+1) + '</b> ' + (item.topic || 'topic') + '</div>';
            }).join('');
        }
    }

    function extractQID() {
        var url = window.location.href;
        var match = url.match(/quora\.com\/(?:answer\/)?(\w+)/);
        var qid = match ? match[1] : 'unknown';
        navigator.clipboard.writeText(qid).then(function() {
            log('📋 QID copied: ' + qid);
        }).catch(function() {
            log('📋 QID: ' + qid + ' (copy failed, selected)');
        });
    }

    function clickAnswer() {
        log('Looking for Answer button...');
        var btns = document.querySelectorAll('button');
        var found = false;
        btns.forEach(function(b) {
            var t = b.textContent.trim();
            if ((t === 'Answer' || t.indexOf('Answer') !== -1) && b.offsetParent !== null) {
                b.scrollIntoView({block: 'center'});
                b.dispatchEvent(new MouseEvent('click', {bubbles: true, cancelable: true, view: window}));
                b.focus();
                found = true;
                log('Clicked Answer button');
            }
        });
        if (!found) {
            // Try links
            var links = document.querySelectorAll('a');
            links.forEach(function(l) {
                if (l.textContent.trim() === 'Answer' || l.href.indexOf('/answer/') !== -1) {
                    l.click();
                    found = true;
                    log('Clicked Answer link');
                }
            });
        }
        if (!found) log('No Answer button found on this page');
    }

    function postFromQueue() {
        var queue = loadQueue();
        if (queue.length === 0) { log('Queue empty'); return; }
        var item = queue[0];
        queue.shift();
        saveQueue(queue);
        
        log('Posting: ' + (item.topic || 'untitled'));
        
        // Find editor
        var editor = document.querySelector('[contenteditable="true"]') || 
                     document.querySelector('[role="textbox"]') ||
                     document.querySelector('.q-text.qu-contentEditable');
        
        if (!editor) {
            log('No editor found. Click Answer first, then retry.');
            // Put item back
            queue.unshift(item);
            saveQueue(queue);
            refreshUI();
            return;
        }
        
        // Insert text
        editor.focus();
        
        // Try execCommand for compatibility
        try {
            var sel = window.getSelection();
            var range = document.createRange();
            range.selectNodeContents(editor);
            sel.removeAllRanges();
            sel.addRange(range);
        } catch(e) {}
        
        // Use document.execCommand for maximum compatibility
        try {
            document.execCommand('insertText', false, item.content);
            log('Text inserted via execCommand');
        } catch(e) {
            // Fallback: paste event
            try {
                var dt = new DataTransfer();
                dt.setData('text/plain', item.content);
                editor.dispatchEvent(new ClipboardEvent('paste', {
                    clipboardData: dt,
                    bubbles: true,
                    cancelable: true
                }));
                log('Text inserted via paste event');
            } catch(e2) {
                // Last resort: innerHTML
                try { editor.innerHTML = item.content.replace(/\n/g, '<br>'); } catch(e3) {}
                log('Text inserted via innerHTML (fallback)');
            }
        }
        
        // Find and click submit button
        setTimeout(function() {
            var btns = document.querySelectorAll('button');
            btns.forEach(function(b) {
                var t = b.textContent.trim().toLowerCase();
                if (['submit', 'post', 'done', 'add answer', 'publish'].indexOf(t) !== -1 ||
                    t.indexOf('submit') !== -1 || t.indexOf('post') !== -1 || t.indexOf('publish') !== -1) {
                    b.click();
                    log('Submitted answer');
                }
            });
            refreshUI();
        }, 1500);
    }

    // ─── Inject panel when DOM is ready ────────────
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createPanel);
    } else {
        createPanel();
    }

    console.log(TAG, 'Ready - @grant none mode');
})();
