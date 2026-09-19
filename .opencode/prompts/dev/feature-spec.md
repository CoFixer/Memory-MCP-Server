---
description: Generate a feature specification from requirements
argument-hint: "<feature-name> [optional context]"
---

# /feature-spec

Help me implement a feature from a specification.

## Context

- Ticket/PRD: {reference}
- Feature name: {name}
- Scope: {backend|frontend|dashboard|plugin|fullstack}

## Steps

1. **Read the spec**
   - Check `.project/docs/` for PRD, API, DB docs
   - Note acceptance criteria
   - Identify dependencies

2. **Explore existing code**
   - Find similar features
   - Check patterns in `.opencode/backend/guides/`
   - Review entity relationships

3. **Plan implementation**
   - List files to create/modify
   - Plan database changes
   - Define API contract
   - Plan UI components

4. **Implement backend**
   - Entity/migration
   - DTOs with validation
   - Service + repository
   - Controller with routes
   - Tests

5. **Implement frontend**
   - API hooks
   - Components
   - Pages/routes
   - Tests

6. **Implement plugin (if needed)**
   - PHP endpoints
   - Admin UI
   - Asset handling

7. **Validate**
   - Type check all packages
   - Run tests
   - Check for gaps
   - Manual verification

## Output

For each step, produce:
- What was done
- Files changed
- Commands run
- Any blockers or decisions made

## Notes

- Follow existing patterns in the codebase
- Use base controller/response patterns from `.opencode/backend/guides/`
- Ensure i18n compatibility for user-facing strings
- Respect the two-user-system (customers vs users)
