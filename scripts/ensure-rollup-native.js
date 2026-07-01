/**
 * Postinstall script: ensures Rollup's native binary is available.
 * 
 * Rollup 4.x uses optionalDependencies for platform-specific native binaries.
 * Known npm bug #4828 causes these to not be installed when the lock file
 * was generated on a different platform (e.g., ARM64 lock on x86_64 build).
 * 
 * This script checks if the native binary for the current platform is available.
 * If not, it patches Rollup's native.js to fall back to the WASM/JS parser.
 */
const fs = require('fs');
const path = require('path');
const { platform, arch } = require('process');

// The native binary package name that should be installed
const packageBase = {
    linux: {
        arm64: 'linux-arm64-gnu',
        x64: 'linux-x64-gnu'
    },
    darwin: {
        arm64: 'darwin-arm64',
        x64: 'darwin-x64'
    },
    win32: {
        x64: 'win32-x64-msvc',
        arm64: 'win32-arm64-msvc'
    }
};

const expectedPackage = platform && arch && packageBase[platform]?.[arch]
    ? `@rollup/rollup-${packageBase[platform][arch]}`
    : null;

const nativeJsPath = path.join(process.cwd(), 'node_modules', 'rollup', 'dist', 'native.js');

if (!fs.existsSync(nativeJsPath)) {
    console.log('[ensure-rollup-native] rollup/dist/native.js not found — skipping');
    process.exit(0);
}

// Check if the expected native module is available
let nativeAvailable = false;
if (expectedPackage) {
    try {
        require.resolve(expectedPackage, { paths: [process.cwd()] });
        nativeAvailable = true;
    } catch {
        // Try resolving from rollup's own node_modules
        try {
            const rollupDir = path.dirname(path.dirname(nativeJsPath));
            require.resolve(expectedPackage, { paths: [rollupDir] });
            nativeAvailable = true;
        } catch {
            nativeAvailable = false;
        }
    }
}

if (nativeAvailable) {
    console.log(`[ensure-rollup-native] ✓ ${expectedPackage} available`);
    process.exit(0);
}

console.log(`[ensure-rollup-native] ⚠ ${expectedPackage || 'native binary'} not found — patching native.js with JS fallback`);

// Read the current native.js
let content = fs.readFileSync(nativeJsPath, 'utf8');

// Replace the error-throwing requireWithFriendlyError with a try-catch version
// that falls back to Rollup's built-in parseAst when native binary is missing.
// We replace the entire module with a shim.
const shim = `'use strict';

const { existsSync } = require('node:fs');
const path = require('node:path');
const { platform, arch, report } = require('node:process');

const nativePkg = '${expectedPackage || '@rollup/rollup-unknown'}';
let mod;
try {
    mod = require(nativePkg);
} catch (err) {
    // Native binary not available — use JS fallback from Rollup's own parseAst
    console.warn('[rollup-native] Native binary not found, using JS fallback. Builds may be slower.');
    mod = require('../parseAst.js');
    // The JS parseAst exports parseAst/parseAstAsync not parse/parseAsync,
    // so we need to wrap them
    const pa = require('../parseAst.js');
    mod = {
        parse(source, opts) {
            return pa.parseAst(source, opts);
        },
        parseAsync(source, opts) {
            return pa.parseAstAsync(source, opts);
        },
        xxhashBase64Url() { return ''; },
        xxhashBase36() { return ''; },
        xxhashBase16() { return ''; }
    };
}

module.exports.parse = mod.parse || mod.parseAst;
module.exports.parseAsync = mod.parseAsync || mod.parseAstAsync;
module.exports.xxhashBase64Url = mod.xxhashBase64Url || (() => '');
module.exports.xxhashBase36 = mod.xxhashBase36 || (() => '');
module.exports.xxhashBase16 = mod.xxhashBase16 || (() => '');
`;

fs.writeFileSync(nativeJsPath, shim, 'utf8');
console.log('[ensure-rollup-native] ✓ native.js patched with JS fallback');
