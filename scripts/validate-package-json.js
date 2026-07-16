#!/usr/bin/env node
/**
 * Validates package.json to prevent the build system from treating the repo
 * as an npm package (causing 404 install/publish failures).
 *
 * Checks:
 * 1. The root package.json MUST have "private": true (prevents publish)
 * 2. Name must not collide with well-known public packages on npm
 * 3. No publishConfig that could trigger a publish attempt
 * 4. Workspaces config is valid if present
 * 5. No .npmrc pointing to sandbox/private registries
 *
 * Exit code 0 = valid, 1 = invalid
 */

const fs = require("fs");
const path = require("path");

// These are actual npm packages — using their name would cause confusion/conflicts
const COLLISION_NAMES = new Set([
  "react", "react-dom", "react-router", "react-router-dom",
  "vite", "typescript", "next", "express", "lodash", "axios",
  "zustand", "framer-motion", "tailwindcss", "postcss",
  "@radix-ui/react-dialog", "@radix-ui/react-tooltip",
]);

let failures = 0;
const PREFIX = "[PKG-VALIDATE]";

function check(pkgPath, label) {
  if (!fs.existsSync(pkgPath)) {
    console.log(`${PREFIX} ${label}: not found, skipping`);
    return;
  }

  const raw = fs.readFileSync(pkgPath, "utf8");
  let pkg;
  try {
    pkg = JSON.parse(raw);
  } catch (e) {
    console.error(`${PREFIX} ❌ ${label}: invalid JSON — ${e.message}`);
    failures++;
    return;
  }

  const name = pkg.name || "(no name)";
  const isPrivate = pkg.private === true;
  const pubConfig = pkg.publishConfig || null;

  console.log(`${PREFIX} ${label}: name="${name}", private=${pkg.private}`);

  // 1. Must be private
  if (!isPrivate) {
    console.error(`${PREFIX} ❌ ${label}: "private": true is REQUIRED to prevent publish 404`);
    console.error(`   Add "private": true to ${pkgPath}`);
    failures++;
  }

  // 2. Name collision — only flag if it's a real known public package
  if (name && COLLISION_NAMES.has(name)) {
    console.error(`${PREFIX} ❌ ${label}: name "${name}" is an existing npm package`);
    console.error(`   Rename to something unique like "my-app" or "luxor-hub"`);
    failures++;
  }

  // 3. No publishConfig
  if (pubConfig) {
    console.error(`${PREFIX} ❌ ${label}: publishConfig triggers publish — remove it`);
    failures++;
  }

  // 4. Workspaces
  if (pkg.workspaces && !Array.isArray(pkg.workspaces)) {
    console.error(`${PREFIX} ❌ ${label}: workspaces must be an array`);
    failures++;
  }
}

function checkNpmrc(npmrcPath) {
  if (!fs.existsSync(npmrcPath)) return;
  const content = fs.readFileSync(npmrcPath, "utf8");
  console.log(`${PREFIX} Found ${npmrcPath}`);

  if (/registry\s*=.*(?:replit|sandbox|vercel|lovable)/i.test(content)) {
    console.error(`${PREFIX} ❌ ${npmrcPath} points to a sandbox/private registry`);
    console.error(`   This causes 404s when build systems try to install from it`);
    console.error(`   FIX: Remove or comment out the registry line`);
    failures++;
  }
}

console.log(`${PREFIX} === Package.json Validation ===`);

check("package.json", "Root");
check("luxor-hub/package.json", "luxor-hub");

checkNpmrc(".npmrc");
checkNpmrc("luxor-hub/.npmrc");

if (failures > 0) {
  console.error(`\n${PREFIX} ❌ ${failures} failure(s) — fix before building`);
  process.exit(1);
}
console.log(`\n${PREFIX} ✅ All package.json files are valid`);
process.exit(0);
