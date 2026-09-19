---
name: fix-gaps
description: Fix implementation gaps found by find-gaps, syncing results to dev/STATUS.md
---

# Gap Fixer Skill

Fix implementation gaps found by the gap-finder skill and sync results to status files.

## Quick Start

```
/skill:fix-gaps                  # Fix all gaps
/skill:fix-gaps --report=path    # Fix from specific report
/skill:fix-gaps --category=ui    # Fix only UI gaps
```

## Workflow

1. **Read Gap Report**: Load the most recent gap analysis from `.project/status/temp/`
2. **Prioritize**: Sort by severity (Critical → High → Medium → Low)
3. **Fix**: Apply fixes one category at a time
4. **Verify**: Run build/type checks after each category
5. **Update Status**: Sync fixes to `.project/status/` files
6. **Report**: Summary of what was fixed

## Fix Categories

### Design System Compliance
- Replace custom hex colors with theme tokens
- Fix font usage (heading vs body)
- Standardize border-radius and shadow usage

### Missing Icons
- Add lucide-react imports
- Add icons to nav items, buttons, badges
- Add loading spinners and empty state icons

### Missing Pages/Features
- Create missing page components
- Add routes to router
- Fix navigation links (use `<Link>` instead of `<a>`)

### Missing UI States
- Add loading skeletons/spinners
- Add error boundaries and error messages
- Add empty state illustrations
- Add form validation feedback
- Add confirmation dialogs for destructive actions
- Add toast notifications for success

### Hardcoded Content
- Replace hardcoded user info with API data
- Remove placeholder text
- Address TODO/FIXME comments
- Remove hardcoded credentials

### Accessibility
- Add `alt` attributes to images
- Add `aria-label` to icon-only buttons
- Add labels to form inputs
- Add `role` to interactive divs/spans

### API Integration
- Create missing service functions
- Add error handling to services
- Add pagination params
- Add search/filter params

### Backend Gaps
- Add Swagger decorators
- Add DTO validation
- Add auth guards
- Add proper exceptions

### Auth & State Management
- Fix infinite loop patterns
- Add auth check tracking flags
- Fix public page links to protected routes

## Status Sync

After fixing gaps, update:
- `.project/status/frontend/SCREEN_IMPLEMENTATION_STATUS.md`
- `.project/status/frontend/API_INTEGRATION_STATUS.md`
- `.project/status/backend/API_IMPLEMENTATION_STATUS.md`

## Related

- **Skill:** [find-gaps](../find-gaps/SKILL.md) — Finds the gaps
- **Agent:** [gap-fixer](../../agents/quality/gap-fixer.md) — Executes fixes
