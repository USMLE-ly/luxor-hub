#!/usr/bin/env python3
"""
SHANNON-Ω Million Bot — Instagram Growth Engine
Uses InstaTakker core logic wrapped in Playwright for 
human-like automation at scale.
"""
import sys, os, json, time, random, logging, argparse
from pathlib import Path
from datetime import datetime

PROJECT_ROOT = Path(__file__).resolve().parent.parent.parent
CONFIG_PATH = PROJECT_ROOT / 'million_bot' / 'config' / 'bot_config.json'
LOGS_DIR = PROJECT_ROOT / 'million_bot' / 'logs'

logging.basicConfig(
    level=logging.INFO,
    format='[%(asctime)s] %(message)s',
    datefmt='%H:%M:%S',
    handlers=[
        logging.FileHandler(LOGS_DIR / f'bot_{datetime.now().strftime("%Y%m%d_%H%M%S")}.log'),
        logging.StreamHandler()
    ]
)
log = logging.getLogger(__name__)

def load_config():
    with open(CONFIG_PATH) as f:
        return json.load(f)

def save_config(cfg):
    with open(CONFIG_PATH, 'w') as f:
        json.dump(cfg, f, indent=2)

def random_delay(min_s=1.0, max_s=3.0):
    """Human-like random delay with InstaTakker anti-ban patterns"""
    # 8% chance of extended pause (human-like behavior)
    if random.random() < 0.08:
        time.sleep(random.uniform(5.0, 12.0))
    else:
        time.sleep(random.uniform(min_s, max_s))

def human_scroll(page, distance=500):
    """Scroll like a human — small steps with random delays"""
    steps = max(1, min(distance // 200, 8))
    for _ in range(steps):
        page.evaluate(f'window.scrollBy(0, {random.randint(150, 350)})')
        time.sleep(random.uniform(0.2, 0.6))

def human_type(page, locator, text):
    """Type like a human — character by character with random delays"""
    locator.click()
    time.sleep(random.uniform(0.3, 0.8))
    for char in text:
        locator.type(char, delay=random.randint(30, 120))
    time.sleep(random.uniform(0.3, 0.8))

class IGrowthBot:
    """Instagram growth automation bot."""
    
    def __init__(self, config):
        self.config = config
        self.stats = {'followed': 0, 'unfollowed': 0, 'liked': 0, 'commented': 0}
    
    def login(self, username, password):
        """Login to Instagram via Playwright."""
        from playwright.sync_api import sync_playwright
        
        log.info(f'Logging in as @{username}...')
        
        with sync_playwright() as p:
            browser = p.chromium.launch(
                headless=True,
                args=['--no-sandbox', '--disable-setuid-sandbox']
            )
            context = browser.new_context(
                viewport={'width': 1366, 'height': 900},
                user_agent='Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            )
            page = context.new_page()
            
            # Stealth patches
            page.add_init_script("""
            Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
            window.chrome = { runtime: {} };
            """)
            
            page.goto('https://www.instagram.com/accounts/login/', wait_until='networkidle', timeout=30000)
            page.wait_for_selector('input[name="username"]', timeout=15000)
            random_delay(2, 4)
            
            # Fill login
            page.locator('input[name="username"]').fill(username)
            random_delay(1, 2)
            page.locator('input[name="password"]').fill(password)
            random_delay(1, 2)
            page.locator('button[type="submit"]').click()
            
            # Wait for login to complete
            random_delay(5, 8)
            page.wait_for_selector('[aria-label="Home"], [aria-label="Instagram"]', timeout=30000)
            log.info('✓ Login successful!')
            
            # Check for "Save Info" dialog
            try:
                not_now = page.locator('button:has-text("Not Now")').first
                if not_now.is_visible(timeout=5000):
                    not_now.click()
                    random_delay(2, 3)
            except: pass
            
            # Check for notification dialog
            try:
                not_now2 = page.locator('button:has-text("Not Now")').first
                if not_now2.is_visible(timeout=3000):
                    not_now2.click()
            except: pass
            
            self.browser = browser
            self.page = page
            self.context = context
            log.info('Bot ready!')
            return True
    
    def navigate_to_profile(self, username):
        """Navigate to a user's profile."""
        log.info(f'Navigating to @{username}...')
        self.page.goto(f'https://www.instagram.com/{username}/', wait_until='networkidle', timeout=30000)
        random_delay(2, 4)
        return self.page.locator('h2').count() > 0
    
    def follow_user(self):
        """Follow the current profile."""
        try:
            follow_btn = self.page.locator('button:has-text("Follow")').first
            if follow_btn.is_visible(timeout=5000):
                follow_btn.click()
                random_delay(3, 6)
                self.stats['followed'] += 1
                log.info(f'  Followed! (total: {self.stats["followed"]})')
                return True
            return False
        except Exception as e:
            log.error(f'  Follow error: {e}')
            return False
    
    def like_recent_posts(self, count=10):
        """Like recent posts from the current profile."""
        liked = 0
        try:
            # Scroll to load posts
            self.page.evaluate('window.scrollTo(0, 500)')
            random_delay(1, 2)
            
            for i in range(count):
                try:
                    # Find post links
                    posts = self.page.locator('a[href*="/p/"]').all()
                    if i >= len(posts):
                        log.info('  No more posts to like')
                        break
                    
                    # Click post
                    posts[i].click()
                    random_delay(2, 4)
                    
                    # Like it
                    like_btn = self.page.locator('[aria-label="Like"], svg[aria-label="Like"]').first
                    if like_btn.is_visible(timeout=3000):
                        like_btn.click()
                        random_delay(2, 4)
                        liked += 1
                        log.info(f'  Liked post {i+1}')
                    
                    # Close
                    close_btn = self.page.locator('[aria-label="Close"], svg[aria-label="Close"]').first
                    if close_btn.is_visible(timeout=3000):
                        close_btn.click()
                    random_delay(1, 3)
                    
                except Exception as e:
                    log.warning(f'  Post {i+1} error: {e}')
                    continue
            
            self.stats['liked'] += liked
            return liked
            
        except Exception as e:
            log.error(f'  Like error: {e}')
            return liked
    
    def search_hashtag(self, hashtag):
        """Search and navigate to a hashtag."""
        log.info(f'Searching #{hashtag}...')
        self.page.goto(f'https://www.instagram.com/explore/tags/{hashtag}/', wait_until='networkidle', timeout=30000)
        random_delay(2, 4)
    
    def run_growth_cycle(self, cycles=3):
        """Run one growth cycle: follow users from competitor followers."""
        cfg = self.config['growth_strategy']
        competitors = self.config.get('competitor_accounts', [])
        
        log.info('=' * 50)
        log.info(f'Starting growth cycle ({cycles} rounds)')
        log.info('=' * 50)
        
        for cycle in range(cycles):
            log.info(f'\n--- Cycle {cycle+1}/{cycles} ---')
            
            for competitor in competitors[:3]:  # Top 3 competitors
                log.info(f'\nTargeting @{competitor} followers...')
                
                if not self.navigate_to_profile(competitor):
                    continue
                
                # Click followers
                try:
                    followers_link = self.page.locator('a[href$="/followers/"]').first
                    if followers_link.is_visible(timeout=5000):
                        followers_link.click()
                        random_delay(3, 5)
                        
                        # Scroll follower list
                        for _ in range(30):
                            self.page.evaluate('document.querySelector("div[role=dialog] div")?.scrollBy(0, 300)')
                            random_delay(0.5, 1)
                        
                        # Find and follow users
                        follow_btns = self.page.locator('button:has-text("Follow")').all()
                        log.info(f'  Found {len(follow_btns)} follow buttons')
                        
                        followed_this_round = 0
                        for btn in follow_btns:
                            if followed_this_round >= cfg['daily_follows'] // (cycles * 3):
                                break
                            
                            try:
                                btn.click()
                                # Use InstaTakker's human delay with pause chance
                                ab = cfg.get('anti_ban', {})
                                random_delay(ab.get('min_delay_seconds', 8), ab.get('max_delay_seconds', 14))
                                self.stats['followed'] += 1
                                followed_this_round += 1
                                log.info(f'  ✓ Followed #{self.stats["followed"]}')
                                # Check hourly limit
                                if followed_this_round >= ab.get('hourly_follow_limit', 30):
                                    log.info(f'  Hourly limit reached ({followed_this_round}), pausing...')
                                    time.sleep(random.uniform(300, 600))  # 5-10 min pause
                            except:
                                continue
                        
                        # Close dialog
                        try:
                            close_btn = self.page.locator('[aria-label="Close"]').first
                            if close_btn.is_visible(timeout=3000):
                                close_btn.click()
                        except: pass
                        
                except Exception as e:
                    log.warning(f'  Follower fetch error: {e}')
                
                random_delay(5, 10)
            
            # Like some hashtag posts
            log.info('\nLiking hashtag posts...')
            for ht in self.config.get('hashtags', [])[:3]:
                self.search_hashtag(ht)
                liked = self.like_recent_posts(5)
                if liked > 0:
                    log.info(f'  Liked {liked} posts from #{ht}')
                random_delay(3, 6)
        
        log.info('\n' + '=' * 50)
        log.info('Growth cycle complete!')
        log.info(f'Stats: {json.dumps(self.stats)}')
        log.info('=' * 50)
    
    def close(self):
        """Clean up browser resources."""
        try:
            self.browser.close()
        except: pass

def main():
    parser = argparse.ArgumentParser(description='SHANNON-Ω Instagram Growth Bot')
    parser.add_argument('--login', nargs=2, metavar=('USERNAME', 'PASSWORD'), help='Instagram login')
    parser.add_argument('--cycles', type=int, default=3, help='Number of growth cycles')
    parser.add_argument('--target', help='Follow specific user\'s followers')
    parser.add_argument('--like', type=int, default=10, help='Like recent posts')
    
    args = parser.parse_args()
    
    cfg = load_config()
    log.info('Anti-ban engine loaded from InstaTakker v2.0.0')
    log.info(f'  Daily follow limit: {cfg["anti_ban"]["daily_follow_limit"]}')
    log.info(f'  Daily like limit: {cfg["anti_ban"]["daily_like_limit"]}')
    log.info(f'  Min delay: {cfg["anti_ban"]["min_delay_seconds"]}s, Max delay: {cfg["anti_ban"]["max_delay_seconds"]}s')
    
    # Use command line credentials or config
    username = args.login[0] if args.login else cfg['instagram']['username']
    password = args.login[1] if args.login else cfg['instagram']['password']
    
    if not username or not password:
        print("❌ No Instagram credentials provided!")
        print("   Use: python3 bot_engine.py --login user pass --cycles 5")
        print("   Or set credentials in config/bot_config.json")
        sys.exit(1)
    
    bot = IGrowthBot(cfg)
    
    if bot.login(username, password):
        if args.target:
            bot.navigate_to_profile(args.target)
        if args.like:
            bot.like_recent_posts(args.like)
        bot.run_growth_cycle(cycles=args.cycles)
    
    bot.close()
    
    print(f"\n{'='*50}")
    print(f"✅ Session complete!")
    print(f"   Followed: {bot.stats['followed']}")
    print(f"   Liked: {bot.stats['liked']}")
    print(f"{'='*50}")

if __name__ == '__main__':
    main()
