---
description: Full-stack development command - run backend and frontend together
argument-hint: "[--backend-only|--frontend-only|--dashboard-only]"
---

You are a full-stack development assistant. This command coordinates development across all project layers.

## Quick Start

```
/fullstack                    # Show pipeline status
/fullstack --run              # Run next pending phase
/fullstack --phase backend    # Run specific phase
/fullstack --run-all          # Run all remaining phases
```

## Pipeline Phases

| # | Phase | Description | Status Check |
|---|-------|-------------|--------------|
| 1 | init | Project setup complete | `.project/` exists |
| 2 | prd | Requirements documented | `PROJECT_KNOWLEDGE.md` exists |
| 3 | database | Schema defined | `PROJECT_DATABASE.md` exists |
| 4 | backend | API implemented | Status file updated |
| 5 | frontend | UI implemented | Status file updated |
| 6 | integrate | Frontend ↔ Backend connected | API integration status |
| 7 | test | E2E tests passing | Test report exists |
| 8 | qa | Quality checks pass | Gap analysis score |
| 9 | ship | Deployed to production | Deployment log |

## Commands

### Show Status

```
/fullstack
```

Output current phase and completion percentage.

### Run Next Phase

```
/fullstack --run
```

Execute the next pending phase:
1. Identify current phase from status files
2. Determine what needs to be built
3. Run appropriate agents/skills
4. Update status

### Run Specific Phase

```
/fullstack --phase <phase-name>
```

Run a specific phase even if not next in sequence.

### Run All Remaining

```
/fullstack --run-all
```

Execute all pending phases in sequence.

## Phase Details

### Phase 4: Backend Development

When running backend phase:
1. Read `PROJECT_API.md` for endpoint specs
2. Read `PROJECT_DATABASE.md` for entities
3. Run `backend-developer` agent to implement missing endpoints
4. Update `.project/status/backend/API_IMPLEMENTATION_STATUS.md`

### Phase 5: Frontend Development

When running frontend phase:
1. Read `PROJECT_DESIGN_GUIDELINES.md`
2. Read HTML prototypes from `.project/resources/HTML/`
3. Run `frontend-developer` agent to implement screens
4. Update `.project/status/frontend/SCREEN_IMPLEMENTATION_STATUS.md`

### Phase 6: Integration

When running integration phase:
1. Map frontend pages to backend endpoints
2. Create service files in frontend
3. Connect components to APIs
4. Update `.project/status/frontend/API_INTEGRATION_STATUS.md`

## Flags

| Flag | Description |
|------|-------------|
| `--backend-only` | Only run backend phases |
| `--frontend-only` | Only run frontend phases |
| `--dashboard-only` | Only run dashboard phases |
| `--reset <phase>` | Reset a phase to pending |
| `--skip-tests` | Skip test phase |
| `--skip-qa` | Skip QA phase |

## Related

- **Skill:** [run-fullstack](../skills/dev/run-fullstack/SKILL.md)
- **Agent:** [project-coordinator](../agents/orchestration/project-coordinator.md)
