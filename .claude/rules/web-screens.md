---
paths:
  - "src/screens/**/*.tsx"
  - "src/components/**/*.tsx"
  - "src/hooks/**/*.ts"
---

# Web Screens & Components

## Structure
- React screens: `src/screens/{Feature}.tsx` (paired with `src/glass/screens/{feature}.ts`)
- Shared components: `src/components/shared/`
- Custom hooks: `src/hooks/`

## Requirements
- Use even-toolkit web components
- Use Tailwind CSS + design tokens
- Access state via WorkoutContext + custom hooks
- Follow functional component + hooks pattern

## Examples
- `src/screens/ActiveWorkout.tsx` ↔ `src/glass/screens/active.ts`
- `src/screens/WorkoutList.tsx` ↔ `src/glass/screens/workout-list.ts`
- `src/components/shared/ExerciseCard.tsx` — Reusable exercise display
- `src/hooks/useWorkoutActions.ts` — Workout state actions
