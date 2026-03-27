# Build & Test
- Dev: `npm run dev`
- Build: `npm run build`
- Pack: `npm run pack`
- QR: `npm run qr`
- Start all: `npm start`

# Code Style
- TypeScript, ES modules
- 2 space indent
- Functional components + hooks
- Tailwind + even-toolkit design tokens

# Project Structure
- Glass modules: `src/glass/screens/*.ts` (per-screen G2 functionality)
- Web screens: `src/screens/*.tsx` (React UI for web/simulator)
- Shared components: `src/components/shared/`
- State: `src/contexts/`, `src/hooks/`
- Data layer: `src/data/`

# Workflow
- Each feature has a pair: `src/screens/Feature.tsx` + `src/glass/screens/feature.ts`
- Glass modules use createGlassScreenRouter (even-toolkit)
- State managed via PomodoroContext + custom hooks
- See .claude/rules/ for detailed architecture rules

# Workflow Rules
- When implementation plan completes or major feature is done: create git commit automatically
- If user's instruction differs from prior context: treat previous work as complete, then auto-commit
- Use the /commit skill to handle commits
- Follow **Conventional Commits** format with project context
- See `.claude/rules/commits.md` for detailed commit conventions

