---
description: Refactor code with structured, safe transformations
argument-hint: "<file-or-scope> [goal description]"
---

# /refactor

Help me refactor code safely in the StorePilot project.

## Context

- Package: {backend|frontend|dashboard|plugin}
- Target: {file/module/feature}
- Goal: {why refactor - performance, readability, patterns}

## Safety Rules

1. **Never change behavior**
   - Output should be identical
   - Side effects should be preserved
   - Error handling should be equivalent

2. **Tests must pass**
   - Run tests before starting
   - Run tests after each change
   - Fix tests only if interface changes (document in commit)

3. **One thing at a time**
   - Don't refactor and add features simultaneously
   - Make small, reviewable commits

## Refactor Types

### Extract Function/Component
- Identify duplicated logic
- Extract with clear naming
- Update all call sites

### Rename
- Use IDE rename (F2) for symbols
- Update string references carefully
- Check tests for hardcoded names

### Simplify
- Remove dead code
- Simplify conditionals
- Use modern syntax (optional chaining, nullish coalescing)

### Reorganize
- Move files to better locations
- Update imports
- Check for circular dependencies

## Process

1. Identify what to refactor and why
2. Ensure test coverage exists
3. Make changes in small steps
4. Run tests after each step
5. Run lint and type check
6. Commit with `refactor(scope): description`
