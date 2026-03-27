# Git Commit Rules

## Commit Message Format

Follow **Conventional Commits** format:

```
<type>(<scope>): <subject>

<body>
```

### Types
- `feat`: New feature (web screen, glass module, or new functionality)
- `fix`: Bug fix
- `refactor`: Code refactoring (no feature change)
- `docs`: Documentation updates
- `chore`: Build, CI/CD, dependencies

### Scope
- `pomodoro`: Core state/logic
- `glass`: Glass module/screen
- `web`: Web screen/UI
- `ui`: Components, styling
- `data`: Data layer, persistence
- `config`: Configuration

### Subject
- Imperative mood ("add", "implement", "fix")
- No period at end
- Under 50 characters
- Describe WHAT was done

### Body (Optional)
- Explain WHY the change
- List key files changed (if significant)
- Reference related tasks/issues: "Related: task #123"
- Separate from subject with blank line

## Examples

### New Feature
```
feat(web): implement pomodoro timer UI

- Add Session screen with countdown timer
- Integrate with PomodoroContext
- Add audio notification on completion

Related: Pomodoro Session Screen feature
```

### Glass Module
```
feat(glass): add session screen to glass

- Export session screen module using createGlassScreenRouter
- Connect to pomodoroActions and selectors
- Register in PomodoroGlasses.tsx
```

### Bug Fix
```
fix(ui): correct timer display formatting

- Fix millisecond overflow in display
- Apply proper zero-padding to minutes/seconds

Files: src/utils/format.ts, src/components/Timer.tsx
```

## Auto-Commit Triggers

Commits are created automatically when:

1. **Feature implementation completes**
   - A feature screen pair is fully implemented (web + glass)
   - Related state management is complete
   - Example: Complete Pomodoro Session screen implementation

2. **Architecture change**
   - Significant refactor of state flow or structure
   - Change in project organization

3. **Bug fix completion**
   - Critical bug is fixed and tested

## Commit Authoring Rules

- **When to commit**: After feature is tested and working
- **Who triggers**: User explicitly requests or implementation plan marks feature complete
- **Automated message**: Include implementation details + related tasks
- **Always include**: Files changed, what was implemented, why (context)

## Project Context for Commits

This is **even-pomodoro**: A Pomodoro timer app for Even Realities G2 smart glasses.

- Dual-platform: React web app + G2 glass modules
- Paired architecture: Each feature = web screen + glass module
- State: PomodoroContext + custom hooks
- Design: Tailwind + even-toolkit tokens

Include this context in commit bodies when relevant.
