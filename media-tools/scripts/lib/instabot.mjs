#!/usr/bin/env node
/**
 * InstaBot — ZORG-Ω deployment engine
 * Headless Instagram automation using puppeteer-core + Electron Chrome
 * Actions: login, follow, like, unfollow, comment, view
 */
import puppeteer from 'puppeteer-core';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '../../..');
const ELECTRON_PATH = path.join(PROJECT_ROOT, 'instatakker', 'node_modules', 'electron', 'dist', 'electron');
const CORE_SCRIPT = path.join(PROJECT_ROOT, 'instatakker', 'instatakker-core.js');

const CONFIG = {
  headless: true,
  executablePath: ELECTRON_PATH,
  args: ['--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage', '--disable-setuid-sandbox'],
};

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function randomDelay(min, max) {
  return sleep(Math.floor(Math.random() * (max - min + 1) + min));
}

async function launch() {
  console.log('[ZORG-Ω] Launching InstaBot engine...');
  const browser = await puppeteer.launch(CONFIG);
  const page = await browser.newPage();
  await page.setViewport({ width: 1366, height: 768 });
  
  // Set a realistic UA
  await page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
    '(KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36'
  );
  
  return { browser, page };
}

async function login(page, username, password) {
  console.log('[ZORG-Ω] Phase 1: Login injection...');
  await page.goto('https://www.instagram.com/accounts/login/', { 
    waitUntil: 'networkidle2', timeout: 30000 
  });
  
  // Wait for login form
  await page.waitForSelector('input[name="username"]', { timeout: 10000 });
  await randomDelay(1000, 2000);
  
  // Type credentials with human-like delays
  await page.type('input[name="username"]', username, { delay: 50 + Math.random() * 80 });
  await randomDelay(500, 1000);
  await page.type('input[name="password"]', password, { delay: 30 + Math.random() * 60 });
  await randomDelay(800, 1500);
  
  // Click login button
  await page.click('button[type="submit"]');
  
  // Wait for navigation
  await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }).catch(() => {});
  await randomDelay(3000, 5000);
  
  console.log('[ZORG-Ω] Login sequence complete');
  return true;
}

async function followTargets(page, targets, count = 50) {
  console.log(`[ZORG-Ω] Phase 2: Following ${count} targets...`);
  let followed = 0;
  
  for (const target of targets) {
    if (followed >= count) break;
    try {
      await page.goto(`https://www.instagram.com/${target}/`, { 
        waitUntil: 'networkidle2', timeout: 15000 
      });
      await randomDelay(2000, 4000);
      
      const followBtn = await page.$('button:has(div:contains("Follow"))');
      if (followBtn) {
        await followBtn.click();
        followed++;
        console.log(`  ✓ Followed @${target} (${followed}/${count})`);
        await randomDelay(8000, 14000); // Human-like delay between follows
      }
    } catch (e) {
      console.log(`  ✗ Failed @${target}: ${e.message}`);
    }
  }
  return followed;
}

async function likePosts(page, username, count = 100) {
  console.log(`[ZORG-Ω] Phase 3: Liking ${count} posts from @${username}...`);
  await page.goto(`https://www.instagram.com/${username}/`, {
    waitUntil: 'networkidle2', timeout: 15000
  });
  await randomDelay(2000, 3000);
  
  // Click first post
  const posts = await page.$$('article a');
  let liked = 0;
  
  for (let i = 0; i < Math.min(posts.length, count); i++) {
    try {
      await posts[i].click();
      await randomDelay(2000, 3000);
      
      const likeBtn = await page.$('svg[aria-label="Like"]');
      if (likeBtn) {
        const parent = await likeBtn.$('xpath=..');
        if (parent) await parent.click();
        liked++;
      }
      
      // Close
      await page.click('svg[aria-label="Close"]');
      await randomDelay(1000, 2000);
    } catch (e) {
      console.log(`  ✗ Like failed on post ${i + 1}`);
    }
  }
  return liked;
}

async function runBot(config) {
  const { username, password, action, targets, count } = config;
  
  console.log('[ZORG-Ω] ================================');
  console.log('[ZORG-Ω] INSTABOT ENGINE v2.0.0');
  console.log('[ZORG-Ω] ================================');
  console.log(`[ZORG-Ω] Target: @${username}`);
  console.log(`[ZORG-Ω] Action: ${action}`);
  console.log(`[ZORG-Ω] Count:  ${count}`);
  console.log('');
  
  const { browser, page } = await launch();
  
  try {
    await login(page, username, password);
    
    switch (action) {
      case 'follow':
        const f = await followTargets(page, targets || ['vaulex_watches'], count);
        console.log(`\n[ZORG-Ω] Done. Followed ${f} accounts.`);
        break;
        
      case 'like':
        const l = await likePosts(page, targets?.[0] || username, count);
        console.log(`\n[ZORG-Ω] Done. Liked ${l} posts.`);
        break;
        
      case 'view':
        console.log('[ZORG-Ω] View mode: browsing profile...');
        await page.goto(`https://www.instagram.com/${username}/`);
        await randomDelay(5000, 8000);
        const screenshot = path.join(PROJECT_ROOT, 'profile_view.png');
        await page.screenshot({ path: screenshot, fullPage: true });
        console.log(`[ZORG-Ω] Screenshot saved: ${screenshot}`);
        break;
        
      default:
        console.log(`[ZORG-Ω] Unknown action: ${action}`);
    }
  } catch (e) {
    console.error(`[ZORG-Ω] Error: ${e.message}`);
  } finally {
    await browser.close();
    console.log('[ZORG-Ω] Browser closed.');
  }
}

// CLI handler
const args = process.argv.slice(2);
const action = args[0] || 'help';

switch (action) {
  case 'login':
    runBot({
      username: args[1] || process.env.IG_USERNAME,
      password: args[2] || process.env.IG_PASSWORD,
      action: 'view',
      count: 1,
    });
    break;
    
  case 'follow':
    runBot({
      username: args[1] || process.env.IG_USERNAME,
      password: args[2] || process.env.IG_PASSWORD,
      action: 'follow',
      targets: args[3] ? args[3].split(',') : ['vaulex_watches'],
      count: parseInt(args[4] || '50'),
    });
    break;
    
  case 'like':
    runBot({
      username: args[1] || process.env.IG_USERNAME,
      password: args[2] || process.env.IG_PASSWORD,
      action: 'like',
      targets: args[3] ? [args[3]] : undefined,
      count: parseInt(args[4] || '100'),
    });
    break;
    
  case 'view':
    runBot({
      username: args[1] || process.env.IG_USERNAME,
      password: args[2] || process.env.IG_PASSWORD,
      action: 'view',
    });
    break;
    
  default:
    console.log('InstaBot — ZORG-Ω Deployment Engine');
    console.log('');
    console.log('Usage:');
    console.log('  node instabot.mjs login <user> <pass>        Test login');
    console.log('  node instabot.mjs follow <user> <pass> [targets] [count]');
    console.log('  node instabot.mjs like <user> <pass> [target] [count]');
    console.log('  node instabot.mjs view <user> <pass>         View profile');
    console.log('');
    console.log('Env vars: IG_USERNAME, IG_PASSWORD');
    console.log('Targets: comma-separated usernames');
}
