---
name: mobile-workspace
description: React Native mobile workspace for StorePilot.
---

# .opencode/mobile

React Native-specific agents, guides, and examples for the StorePilot mobile app.

## Directory Structure

```
mobile/
├── README.md
├── agents/
│   └── development/       # Mobile developer, error fixer
├── docs/
│   ├── AUTHENTICATION.md  # Mobile auth patterns
│   └── BEST_PRACTICES.md  # Mobile-specific best practices
├── examples/
│   └── complete-examples.md
└── guides/
    └── *.md               # Mobile development guides
```

## Agents

| Agent | Purpose |
|-------|---------|
| `frontend-developer` | React Native development |
| `frontend-error-fixer` | Fix mobile errors |

## Guides

- `api-integration.md` — API integration patterns
- `common-patterns.md` — Reusable patterns
- `component-patterns.md` — Component architecture
- `data-fetching.md` — TanStack Query for mobile
- `file-organization.md` — Project structure
- `loading-and-error-states.md` — UX patterns
- `mobile-testing.md` — Testing strategies
- `navigation-guide.md` — Navigation patterns
- `performance.md` — Mobile optimization
- `styling-guide.md` — Styling patterns
- `tanstack-query.md` — Query/mutation patterns

## Quick Commands

```bash
cd mobile  # or react-native directory
npm run start        # Start Metro bundler
npm run android      # Run on Android
npm run ios          # Run on iOS
npm run test         # Run tests
```

## Mobile-Specific Considerations

- Offline support with caching
- Push notifications
- Deep linking
- Biometric auth
- Image optimization
- Battery efficiency
