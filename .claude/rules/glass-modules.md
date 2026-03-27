---
paths:
  - "src/glass/**/*.ts"
  - "src/glass/**/*.tsx"
---

# Glass Modules (Per-Screen Architecture)

## Structure
- Each screen gets a module: `src/glass/screens/{screen-name}.ts`
- Main glass entry: `src/glass/{App}Glasses.tsx`
- Screen router: `src/glass/{app}Selectors.ts`
- Shared types: `src/glass/{app}Shared.ts`

## Even G2 Input Model
The G2 glasses have exactly 4 inputs: **Up**, **Down**, **Click (tap)**, **Double Click (double-tap)**.
All glass screen interactions must be designed around these 4 inputs only.

Common patterns:
- **Value adjustment**: Up/Down to increment/decrement a value, Click to confirm and move to next field
- **Navigation**: Click to go forward / select, Double Click to go back
- **List browsing**: Up/Down to scroll, Click to select item

### Focus-driven Glass Screens
When a web page has multiple input fields (e.g. config form), the Glass screen can change based on which field is focused on the web side.
- Store the currently focused field name in Context/state
- In `deriveScreen()`, combine URL path + focused field to return a specific glass screen name
- Each field gets its own glass screen module where Up/Down adjusts that field's value
- Click in the glass action handler advances focus to the next field (and updates context)
- This keeps Glass UI simple: one value per screen with Up/Down adjustment

## Display Layout Rules
- Operation hints (操作説明) must be a single line at the very bottom of the display.
- Format: `Click:Action Dn:Action x2:Action` — compact, separated by spaces.
- Use `separator()` line above the hint line to visually separate it from content.
- Abbreviations: `Click` (tap), `x2` (double-tap), `Up/Dn` (swipe up/down), `Dn` (swipe down only).

## Display Data Rules
- NEVER return plain strings in `lines` arrays. The `display()` function must return `{ lines: DisplayLine[] }`, not `{ lines: string[] }`.
- ALWAYS use the `line()` helper from `even-toolkit/types` to create DisplayLine objects: `line('text')`, `line('text', 'meta')`, `line('text', 'normal', true)`.
- Use `separator()` from `even-toolkit/types` for separator lines.
- Use `glassHeader()` from `even-toolkit/types` for header + separator blocks.
- NEVER use `as any` to bypass type errors in display return values. If TypeScript complains about the return type, the data structure is wrong — fix it, don't cast it.

## API Signatures (even-toolkit)
- `useGlasses({ toDisplayData: (snapshot, nav) => DisplayData, onGlassAction: (action, nav, snapshot) => GlassNavState, ... })`
- `createGlassScreenRouter` returns `{ toDisplayData(snapshot, nav), onGlassAction(action, nav, snapshot, ctx) }`
- Do not pass extra arguments (e.g. screenName) — the router resolves screens via `nav.screen` internally.

## Import Paths
- Use `even-toolkit/types` for `line`, `separator`, `glassHeader`, `DisplayData`, `DisplayLine`
- Use `even-toolkit/glass-screen-router` for `createGlassScreenRouter`, `GlassScreen`
- Use `even-toolkit/useGlasses` for `useGlasses`
- Use `even-toolkit/glass-router` for `createScreenMapper`
- Do NOT use internal paths like `even-toolkit/glasses/types` — use the exported subpath from package.json exports.
