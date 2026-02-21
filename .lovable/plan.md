

# AURELIA — AI Personal Stylist OS (v1)

## Design System
- **Dark luxury theme** with deep charcoal/near-black backgrounds
- **Gold accent color** for CTAs, highlights, and branding
- **Glassmorphism cards** with frosted glass effects and soft borders
- **Apple-level typography** — clean sans-serif, generous spacing
- **Micro-animations** on hover, transitions, and page changes
- **Neutral palette**: charcoal, slate, off-white text, gold accents

---

## Pages & Features

### 1. Landing Page
- Hero with headline: *"Your AI Stylist That Knows You Better Than You Know Yourself"*
- Animated mockup/visual showing the app in action
- How It Works section (4 steps: Scan → Profile → Outfits → Optimize)
- Feature grid showcasing key capabilities
- Pricing section (Free / Pro / Elite tiers — display only for now)
- CTA buttons leading to sign up

### 2. Authentication
- Email + password sign-up/login
- Google OAuth login
- Sleek dark-themed auth pages with gold accents
- User profiles stored in database

### 3. Style Onboarding (First-time flow)
- Multi-step quiz after signup (~10 key questions covering):
  - Style preferences (minimalist, streetwear, classic, bold, etc.)
  - Lifestyle & occasions (corporate, casual, social, fitness)
  - Favorite colors and patterns
  - Budget range
  - Body type self-selection
  - Fashion goals
- AI generates a **Style DNA profile** (e.g., "Modern Minimal Power") stored to the user's account

### 4. Dashboard (Home)
- **Today's Outfit** card — AI-generated recommendation front and center
- Current weather display (via weather API integration)
- Quick stats: total items, outfits generated, style score
- "Regenerate" button for new outfit suggestions
- Quick access to closet and AI chat

### 5. My Closet
- **Grid layout** of all uploaded clothing items with photos
- Upload single or multiple items (photo upload to Supabase Storage)
- AI-powered item analysis on upload using Lovable AI:
  - Auto-detect category (top, bottom, shoes, accessory, outerwear)
  - Color extraction
  - Style classification (casual, formal, streetwear, etc.)
  - Season tagging (summer, winter, all-season)
  - Occasion tagging
- Filter and search by category, color, season, occasion
- Edit item details manually
- Delete items

### 6. Outfit Generator
- Select context: occasion, mood, weather preference
- AI generates **3–5 complete outfits** from your closet items
- Each outfit shows:
  - Visual layout of the pieces together
  - AI explanation of why this works
  - Confidence/style match score
- Save favorite outfits
- Shuffle/regenerate individual outfits
- Outfit history log

### 7. AI Stylist Chat
- Conversational chat interface with streaming responses
- Context-aware — knows your closet, style DNA, and preferences
- Example prompts: *"Dress me for a dinner date"*, *"What should I wear to a job interview?"*
- Markdown-rendered responses with outfit suggestions
- Chat history persisted

### 8. Wardrobe Analytics
- **Cost per wear** tracking (log when items are worn)
- Most worn / least worn items
- Category distribution chart (pie/bar chart)
- Style evolution timeline
- "Underused items" alerts
- Simple sustainability score

### 9. Sidebar Navigation
- Dark glassmorphism sidebar with gold active indicators
- Links: Home, My Closet, Outfit Generator, AI Stylist, Analytics, Settings
- Collapsible with icon-only mini mode
- User avatar and name at bottom

---

## Backend (Lovable Cloud + Supabase)

- **Auth**: Email + Google OAuth
- **Database tables**: profiles, clothing_items, outfits, outfit_items, style_profiles, chat_messages, wear_logs
- **Storage**: Clothing item photos bucket
- **Edge Functions**: 
  - AI item analysis (on upload)
  - Outfit generation
  - AI stylist chat (streaming)
- **Lovable AI**: Powers all AI features (style DNA, outfit generation, chat, item analysis)
- **Weather API**: Free weather data for outfit context

---

## What's NOT in v1 (Future phases)
- 3D body scanning & virtual try-on (AR)
- Brand detection & smart shopping with affiliate links
- Social feed & outfit sharing
- Stripe payments (pricing is display-only for now)
- Video closet scanning
- Price prediction engine

