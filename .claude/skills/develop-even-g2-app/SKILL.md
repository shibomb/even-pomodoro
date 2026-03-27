---
name: develop-even-g2-app
description: Develop an app for Even Realities G2 smart glasses using even-toolkit
---

# Per-Screen Architecture

This project uses **paired screen development**: each feature has both a web React component and a G2 glass module.

## Adding a New Screen/Feature

```
1. Create web screen: src/screens/{Feature}.tsx
   - React component
   - Use even-toolkit components
   - Manage state via WorkoutContext / custom hooks

2. Create glass module: src/glass/screens/{feature}.ts
   - Export via createGlassModule(...)
   - Import actions from ../actions.ts
   - Import selectors from ../selectors.ts
   - Use shared utilities from ../shared.ts

3. Register in src/glass/WorkoutGlasses.tsx
   - Import the new screen module
   - Add to glass screens object

4. Add state logic if needed:
   - Update src/glass/actions.ts for state changes
   - Update src/glass/selectors.ts for derived state
   - Update WorkoutContext if needed
```

## Key Files
- **Glass entry**: `src/glass/WorkoutGlasses.tsx`
- **Glass screens**: `src/glass/screens/*.ts` (per-screen modules)
- **Glass state**: `src/glass/actions.ts`, `src/glass/selectors.ts`
- **Web screens**: `src/screens/*.tsx`
- **Shared components**: `src/components/shared/*`

## Resources
- Even Toolkit docs: https://github.com/fabioglimb/even-toolkit/tree/main/docs
- Example apps: even-market, even-kitchen, even-browser
- Unofficial notes: https://github.com/nickustinov/even-g2-notes