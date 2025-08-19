# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Development Tasks

### Development
```bash
# Install dependencies (using Yarn)
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start

# Run linting
yarn lint

# Type check
yarn type-check
```

## Architecture Overview

This is a Korean/English typing practice web application built with Next.js 15, React 19, and TypeScript. The application focuses on accurate Korean IME (Input Method Editor) handling and real-time typing statistics.

### Key Architecture Components

1. **State Management (Zustand stores)**
   - `typingStore.ts`: Core typing state including current position, keystrokes, mistakes, and test progress. Handles Korean jamo filtering to prevent double-counting during IME composition.
   - `statsStore.ts`: Real-time typing statistics calculation (CPM/WPM, accuracy, consistency)
   - `settingsStore.ts`: User preferences for language, theme, test mode, and test targets

2. **Typing Engine (`src/components/core/`)**
   - `TypingEngine.tsx`: Main orchestrator component managing test lifecycle, timers, and IME composition states
   - `InputHandler.tsx`: Captures keyboard input and handles IME composition events
   - `TextRenderer.tsx`: Visual rendering of text with current position, correct/incorrect highlighting
   - `StatsCalculator.tsx`: Real-time circular progress charts for typing statistics
   - `TestResult.tsx`: Post-test results display

3. **Korean IME Handling**
   - Special logic to filter Korean jamo characters (Unicode ranges 0x3131-0x314F, 0x1100-0x11FF)
   - Composition state tracking to prevent duplicate keystroke registration during Hangul assembly
   - Accurate character comparison considering IME intermediate states

4. **Test Modes**
   - Time-based: Fixed duration tests (15/30/60/120 seconds)
   - Word-based: Fixed word count tests (10/25/50/100 words)
   - Dynamic text generation based on language pack and text type

### Path Aliases
- `@/*` maps to `./src/*` for cleaner imports

### Styling
- Tailwind CSS with custom theme variables for dark/light/high-contrast modes
- CSS variables defined in `globals.css` for consistent theming
- 이모지 사용을 자제하세요