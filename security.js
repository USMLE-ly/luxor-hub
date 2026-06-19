// LEXOR® Security — Minimal client-side protection
// Heavy security is handled natively in Android SecurityUtils.java
(function() {
    'use strict';
    // Keyboard shortcut prevention (F12, devtools)
    document.addEventListener('keydown', function(e) {
        if (e.key === 'F12' || (e.ctrlKey && e.shiftKey && ['I','J','C'].includes(e.key))) {
            e.preventDefault();
            return false;
        }
    });
    // Context menu prevention (except inputs)
    document.addEventListener('contextmenu', function(e) {
        var tag = e.target ? e.target.tagName : '';
        if (tag === 'INPUT' || tag === 'TEXTAREA') return true;
        e.preventDefault();
        return false;
    });
    console.log('[LEXOR] Security initialized');
})();
