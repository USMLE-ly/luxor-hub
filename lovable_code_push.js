// =============================================================
// Lovable Code Push — Direct file creation via Playwright
// Creates 3 TypeScript files in the Lovable project's code editor
// =============================================================
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const PROJECT_ID = '5deb8621-bcc7-408a-a556-13a42a1aa488';
const PROJECT_URL = `https://lovable.dev/projects/${PROJECT_ID}`;

// Read session cookie from file
const cookieFile = process.argv[2] || '/tmp/codex-web-uploads/f-NEW6Af/cookie (7).json';
const cookies = JSON.parse(fs.readFileSync(cookieFile, 'utf8'));

function getCookie(name) {
    const c = cookies.find(c => c.name === name);
    return c ? c.value : null;
}

const sessionCookie = getCookie('lovable-session-id-v2');
const workspaceCookie = getCookie('lovable-workspace-id');

if (!sessionCookie) {
    console.error('Error: lovable-session-id-v2 cookie not found');
    process.exit(1);
}

// Read TypeScript files
const tsDir = path.join(__dirname, 'lovable_push', 'ts');
const files = {
    'src/utils/colorQuantizer.ts': fs.readFileSync(path.join(tsDir, 'colorQuantizer.ts'), 'utf8'),
    'src/utils/humanizer.ts': fs.readFileSync(path.join(tsDir, 'humanizer.ts'), 'utf8'),
    'src/utils/enrichedAnalysis.ts': fs.readFileSync(path.join(tsDir, 'enrichedAnalysis.ts'), 'utf8'),
};

async function main() {
    console.log('🚀 Launching browser...');
    const browser = await chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const context = await browser.newContext({
        userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        viewport: { width: 1920, height: 1080 },
    });

    // Set cookies
    await context.addCookies([
        {
            name: 'lovable-session-id-v2',
            value: sessionCookie,
            domain: 'lovable.dev',
            path: '/',
            httpOnly: true,
            secure: true,
            sameSite: 'Lax',
        },
        {
            name: 'lovable-workspace-id',
            value: workspaceCookie || '',
            domain: 'lovable.dev',
            path: '/',
            httpOnly: false,
            secure: true,
            sameSite: 'Lax',
        }
    ]);

    const page = await context.newPage();

    console.log('📄 Navigating to project page...');
    await page.goto(PROJECT_URL, { waitUntil: 'networkidle', timeout: 60000 });
    
    console.log('✅ Page loaded, waiting for app to initialize...');
    await page.waitForTimeout(3000);

    // Take a screenshot for debugging
    await page.screenshot({ path: '/tmp/lovable-page.png', fullPage: false });
    console.log('📸 Screenshot saved to /tmp/lovable-page.png');

    // Try to find and click the Code tab/button
    console.log('🔍 Looking for Code editor panel...');
    
    // Common selectors for the code editor
    const selectors = [
        'button:has-text("Code")', 
        '[data-testid="code-tab"]',
        '[aria-label="Code"]',
        'button:has-text("Files")',
        'text=Code Editor',
        '[role="tab"]:has-text("Code")',
        '.code-editor-tab',
        'a:has-text("Code")',
        '.file-tree',
        '[class*="code"]',
        '[class*="editor"]',
    ];

    let codeFound = false;
    for (const sel of selectors) {
        const el = await page.$(sel);
        if (el) {
            console.log(`  Found element matching: ${sel}`);
            try {
                await el.click();
                console.log('  Clicked!');
                codeFound = true;
                break;
            } catch (e) {
                console.log(`  Could not click: ${e.message}`);
            }
        }
    }

    if (!codeFound) {
        console.log('⚠️  Could not find Code tab. Trying to work with current view...');
    }

    await page.waitForTimeout(2000);

    // Try to find the file tree or project files view
    console.log('🔍 Looking for file tree...');
    
    // Look for the file tree structure that shows src/ etc
    const fileTreeSelectors = [
        '[class*="file-tree"]',
        '[class*="FileTree"]', 
        '[class*="sidebar"]',
        '[class*="explorer"]',
        '[class*="files"]',
        '.files-panel',
        'nav[aria-label="Files"]',
        'div:has(> span:has-text("src"))',
        'text=src',
    ];

    let fileTreeFound = false;
    for (const sel of fileTreeSelectors) {
        const el = await page.$(sel);
        if (el) {
            console.log(`  Found file tree element: ${sel}`);
            fileTreeFound = true;
            break;
        }
    }

    if (!fileTreeFound) {
        console.log('⚠️  Could not find file tree. Will try to use the chat API as fallback.');
    }

    // Now try to create files - either through the UI or via API
    console.log('\n📝 Attempting file creation...');
    console.log(`  Files to create: ${Object.keys(files).join(', ')}`);

    // Strategy: Try to inject via page.evaluate
    // Lovable likely uses a specific global or React component for file management
    const result = await page.evaluate(() => {
        // Check if there's a Lovable-specific API exposed
        const lovableGlobal = (window).__lovable || (window).lovable;
        if (lovableGlobal && lovableGlobal.files) {
            return 'lovableGlobal found';
        }
        
        // Check for React internals
        const root = document.getElementById('__next');
        if (root && root._reactRootContainer) {
            return 'React root found';
        }
        
        return 'No specific file API found in window scope';
    });
    console.log(`  Browser context: ${result}`);

    // Take another screenshot
    await page.screenshot({ path: '/tmp/lovable-page-after.png', fullPage: true });
    console.log('📸 Screenshot saved to /tmp/lovable-page-after.png');

    // Try using the Lovable API directly via fetch from the browser context
    console.log('\n🔄 Attempting direct API call from browser context...');
    
    const apiResult = await page.evaluate(async (files) => {
        const token = document.cookie.split('; ')
            .find(c => c.startsWith('lovable-session-id-v2='))
            ?.split('=')[1];
        
        if (!token) {
            return { error: 'No session token found' };
        }

        const pid = '5deb8621-bcc7-408a-a556-13a42a1aa488';
        const results = [];

        // Try POST to create files via Lovable API
        for (const [filepath, content] of Object.entries(files)) {
            try {
                const resp = await fetch(`/api/chat`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        messages: [{
                            role: 'user',
                            content: `Create file ${filepath} with the following content:\n\`\`\`typescript\n${content.substring(0, 500)}\`\`\``
                        }],
                        projectId: pid,
                    }),
                });
                results.push({ filepath, status: resp.status, ok: resp.ok });
            } catch (e) {
                results.push({ filepath, error: e.message });
            }
        }
        
        return results;
    }, Object.fromEntries(
        Object.entries(files).map(([k, v]) => [k, v.substring(0, 100)])
    ));

    console.log('  API results:', JSON.stringify(apiResult, null, 2));

    await browser.close();
    console.log('\n✅ Done');
}

main().catch(err => {
    console.error('❌ Error:', err.message);
    process.exit(1);
});
