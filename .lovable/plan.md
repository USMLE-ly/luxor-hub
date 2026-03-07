

# Integrate 3 AI Chat UI Components

## What We're Building
Adding three premium UI features to the AI Style Chat experience:

1. **Animated Text** — AI responses stream in with smooth character-by-character animation using `useAnimatedText` hook
2. **Placeholders & Vanish Input** — The chat input cycles through rotating placeholder suggestions with a particle vanish effect on submit
3. **AI Input with Loading** — Auto-resizing textarea with a spinning cube loading indicator while AI thinks

## Files to Create

### 1. `src/components/ui/animated-text.tsx`
- `useAnimatedText` hook using framer-motion's `animate` function
- Supports character, word, and chunk delimiters with different durations

### 2. `src/components/ui/placeholders-and-vanish-input.tsx`
- Rotating placeholder text with AnimatePresence transitions
- Canvas-based particle vanish effect when text is submitted
- Rounded pill input with animated arrow submit button

### 3. `src/hooks/use-auto-resize-textarea.ts`
- Auto-resize textarea hook that grows/shrinks based on content
- Respects min/max height constraints

### 4. `src/components/ui/ai-input-with-loading.tsx`
- Textarea with rounded styling and auto-resize
- Spinning cube animation during loading state
- "AI is thinking..." status text

## File to Modify

### `src/pages/Chat.tsx`
- **Animated AI responses**: Wrap assistant message content with `useAnimatedText` to animate streaming text word-by-word as it arrives
- **Vanish input replacement**: Replace the current plain textarea input area with `PlaceholdersAndVanishInput` for the empty state (when no messages), using fashion-relevant placeholders like "What should I wear today?", "Outfit for a dinner date", etc.
- **Loading state**: Use the spinning cube from `AIInputWithLoading` as the loading indicator instead of the current bouncing dots
- Keep all existing functionality intact: image upload, voice input, streaming, history

## Integration Details
- The `useAnimatedText` hook will be applied to each assistant message's content with `" "` (word) delimiter for natural reading speed
- The vanish input appears in the empty chat state as an alternative to quick prompts — on submit it triggers the `send()` function
- The main input area keeps its current design but gains the auto-resize behavior from `useAutoResizeTextarea`
- All existing features (camera upload, voice input, clear history) remain unchanged

## No New Dependencies Needed
- `framer-motion` already installed
- `lucide-react` already installed
- All shadcn components already exist

