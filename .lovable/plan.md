# AURELIA — Launch-Ready Roadmap

> Updated: 2026-03-07 — Practical, prioritized roadmap for a reliable launch.

---

## P0 — Critical (Must fix before launch)

### 1. AI Error Handling & Fallbacks
- [x] Chat: handles 429/402 gracefully with toasts
- [x] Chat: streaming SSE parsing with proper buffer flush
- [ ] OutfitAnalysis: add retry button on AI failure, show friendly error state  
- [ ] VideoAnalysis: add timeout handling for long video processing
- [ ] FashionDesigner: add retry on generation failure
- [ ] All AI pages: wrap in ErrorBoundary for crash recovery
- [ ] All edge functions: consistent 429/402 handling

### 2. Image Upload Robustness
- [ ] Compress images client-side before upload (target <2MB via canvas)
- [ ] Enforce consistent size limits across all pages
- [ ] Show file size in upload preview
- [ ] Add privacy notice banner on all upload pages ("Images processed by AI")
- [ ] Lazy load all gallery/product images

### 3. Mobile UX
- [ ] Test sidebar collapse on small screens
- [ ] Fix horizontal overflow in carousels (scrollbar-none + snap)
- [ ] Ensure modals/dialogs scrollable on short viewports
- [ ] Touch-friendly tap targets (min 44px)
- [ ] Swipe hint: test reliability across screen sizes

### 4. Auth & Security
- [x] RLS policies on all 20+ tables
- [x] No client-side admin checks
- [ ] Privacy notice for AI image processing
- [ ] Ensure all storage uploads use user-scoped paths
- [ ] Rate limit awareness on all AI endpoints

---

## P1 — Important (Should fix for quality)

### 5. Shop/Products Polish
- [ ] Consistent fallback placeholder images
- [ ] Loading skeletons while products load
- [ ] "No results" helpful message state
- [ ] Test edge function with varied query formats

### 6. Onboarding Polish
- [ ] Clear selfie instructions with example photos
- [ ] Swipe hint: click alternative for non-touch
- [ ] Style DNA explanation tooltip
- [ ] Clear step progress indicator

### 7. AI Accuracy & Quality
- [ ] Test outfit analysis with diverse outfits
- [ ] Validate Style DNA with multiple skin tones
- [ ] Wardrobe gap: no repeated suggestions
- [ ] Cap confidence scores 0-100

### 8. Chat Improvements
- [ ] Test multi-turn context (5+ messages)
- [ ] Calendar/weather: graceful fallback if denied
- [ ] Offline suggestion cards from last Style DNA
- [ ] Auto-save conversation periodically

---

## P2 — Nice to Have (Post-launch)

### 9. Performance
- [ ] Audit bundle size, lazy-load heavy pages
- [ ] Service worker for offline
- [ ] Optimize 3D mannequin loading
- [ ] Analytics tracking for feature usage

### 10. Community & Social
- [ ] Report/flag for public designs
- [ ] Multi-store shop filtering
- [ ] Design collaboration
- [ ] Style challenges with prizes

---

## Status
- [ ] Not started
- [x] Complete
- 🔧 In progress
