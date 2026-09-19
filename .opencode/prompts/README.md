# Prompts Catalog

This directory contains all slash commands available in this project, organized by category.

```
prompts/
├── dev/       # Development workflow
├── git/       # Git & version control
├── project/   # Project setup & initialization
├── design/    # Design & documentation
├── qa/        # Quality assurance & testing
├── agent/     # Multi-agent & automation
├── utils/     # Utilities & meta commands
└── README.md  # This file
```

---

## Quick Reference

| Category | Commands |
|----------|----------|
| **dev** | `/fullstack`, `/generate-crud`, `/generate-dto`, `/add-auth`, `/add-swagger`, `/debug`, `/refactor`, `/extract-types`, `/sync-enums`, `/build-app`, `/start`, `/gap-finder`, `/fix-gaps`, `/feature-spec` |
| **git** | `/commit`, `/commit-all`, `/commit-workflow`, `/branch`, `/pull`, `/deploy`, `/git-create` |
| **project** | `/new-project`, `/init-workspace`, `/setup-OpenCode`, `/init-OpenCode-config`, `/validate-OpenCode-config`, `/init-pm2`, `/init-harness`, `/create-mono-repo`, `/migrate-submodules`, `/submodule-check` |
| **design** | `/generate-prd`, `/prd-to-design-guide`, `/prd-to-design-prompts`, `/design-guide-to-aura-prompts`, `/prompts-to-aura`, `/html-to-react`, `/set-html-routing`, `/figma-extract-screens`, `/md-to-pdf`, `/generate-ppt`, `/generate-sop`, `/pdf-to-prd` |
| **qa** | `/qa`, `/design-qa`, `/ui-review`, `/audit-skills`, `/audit-system`, `/validate-references`, `/run-e2e`, `/fix-ticket` |
| **agent** | `/ralph`, `/team`, `/agent-report`, `/review-command`, `/build-registry`, `/n8n-generator` |
| **utils** | `/skills`, `/stack`, `/link-commands`, `/fix-gitignore`, `/summarize-youtube`, `/daily-note`, `/notify-slack`, `/create-strategic-plan`, `/generate-random-project`, `/session-handoff`, `/reflect` |

---

## Command Listing

### dev/ — Development

| Command | Description |
|---------|-------------|
| `/fullstack` | Multi-agent fullstack pipeline orchestrator |
| `/generate-crud` | Generate a complete CRUD module interactively |
| `/generate-dto` | Generate DTOs for an entity |
| `/add-auth` | Add JWT authentication and authorization |
| `/add-swagger` | Add Swagger documentation to a controller |
| `/debug` | Systematic debugging and root-cause analysis |
| `/refactor` | Refactor code with structured approach |
| `/extract-types` | Extract inline types to dedicated type files |
| `/sync-enums` | Sync enums across frontend and backend |
| `/build-app` | Build React Native app using Expo |
| `/start` | Start development servers |
| `/gap-finder` | Scan project for implementation gaps |
| `/fix-gaps` | Fix gaps found by gap-finder |
| `/feature-spec` | Generate a feature specification |

### git/ — Git Workflow

| Command | Description |
|---------|-------------|
| `/commit` | Conventional commit helper |
| `/commit-all` | Commit all changes with submodule PRs |
| `/commit-workflow` | Commit selected submodules with validation |
| `/branch` | Create a new feature branch |
| `/pull` | Pull latest changes from dev |
| `/deploy` | Deploy through git workflow |
| `/git-create` | Create GitHub repo and push HTML files |

### project/ — Project Setup

| Command | Description |
|---------|-------------|
| `/new-project` | Create a complete new project |
| `/init-workspace` | Initialize workspace documentation |
| `/setup-opencode` | Manage framework submodules |
| `/init-opencode-config` | Initialize .opencode submodule |
| `/validate-opencode-config` | Validate .opencode configuration |
| `/init-pm2` | Initialize PM2 server management |
| `/init-harness` | Install Harness Engineering setup |
| `/create-mono-repo` | Create a mono-repo |
| `/migrate-submodules` | Batch add framework submodules |
| `/submodule-check` | Check submodule health |

### design/ — Design & Documentation

| Command | Description |
|---------|-------------|
| `/generate-prd` | Generate a comprehensive PRD |
| `/prd-to-design-guide` | Convert PRD to Design Guide |
| `/prd-to-design-prompts` | Convert PRD to AURA.build prompts |
| `/design-guide-to-aura-prompts` | Convert Design Guide to AURA prompts |
| `/prompts-to-aura` | Execute design prompts on AURA.build |
| `/html-to-react` | Convert HTML prototypes to React |
| `/set-html-routing` | Set up navigation routing for HTML |
| `/figma-extract-screens` | Extract Figma screen names and IDs |
| `/md-to-pdf` | Convert markdown to PDF |
| `/generate-ppt` | Generate HTML presentations |
| `/generate-sop` | Generate Standard Operating Procedure |
| `/pdf-to-prd` | Convert PRD PDF to markdown |

### qa/ — Quality Assurance

| Command | Description |
|---------|-------------|
| `/qa` | Unified QA (design fidelity + acceptance) |
| `/design-qa` | QA screens against Figma designs |
| `/ui-review` | Review UI implementation |
| `/audit-skills` | Audit skill-rules.json files |
| `/audit-system` | Comprehensive .opencode system audit |
| `/validate-references` | Validate skill/command references |
| `/run-e2e` | Run E2E tests |
| `/fix-ticket` | Fix Notion bug report tickets |

### agent/ — Agents & Automation

| Command | Description |
|---------|-------------|
| `/ralph` | Run autonomous workflow loops |
| `/team` | Launch multi-agent orchestration (team/parallel/solo/ticket) |
| `/agent-report` | Generate agent monitoring reports |
| `/review-command` | Review a command file |
| `/build-registry` | Build registry of skills and commands |
| `/n8n-generator` | Generate n8n workflow JSON |

### utils/ — Utilities

| Command | Description |
|---------|-------------|
| `/skills` | Show all available skills and commands |
| `/stack` | Manage technology stacks |
| `/link-commands` | Create symlinks for submodule commands |
| `/fix-gitignore` | Fix .gitignore for submodules |
| `/summarize-youtube` | Summarize a YouTube video |
| `/daily-note` | Generate daily work notes |
| `/notify-slack` | Send activity report to Slack |
| `/create-strategic-plan` | Create strategic plan |
| `/generate-random-project` | Generate random project for training |
| `/session-handoff` | Capture session handoff notes |
| `/reflect` | Analyze conversation for learnings |

---

## Adding New Commands

1. Choose the appropriate category subdirectory
2. Create a new `.md` file there
3. Add YAML frontmatter:
   ```yaml
   ---
   description: Brief description
   argument-hint: "[optional] <required> [--flag]"
   ---
   ```
4. Start with `# /command-name` as the title

## Conventions

- **Command name** = filename without `.md` (subdirectory doesn't affect invocation)
- **Frontmatter** is required for catalog indexing
- **Keep prompts focused** — move lengthy orchestration logic to `../skills/`
