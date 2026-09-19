---
description: Show all available skills, commands, and magic keywords organized by category with workflow recommendations
argument-hint: "[--search <term>] [--category <name>] [--recommend]"
---

# /skills

Display all available skills, commands, and their magic keywords from the .opencode 3-tier system. Optionally recommend skills based on what the user is working on.

## Instructions

### Step 1: Read configuration
Read `.opencode/stack-config.json` to determine which stacks are enabled.

### Step 2: Collect skills from skill-rules.json
Read and merge all `skill-rules.json` files from enabled stacks:
- `.opencode/skills/skill-rules.json` (project overrides)
- `.opencode/base/skills/skill-rules.json`
- `.opencode/skills/skill-rules.json` for each enabled stack (nestjs, react, marketing, etc.)

Collect all skills with their `magicKeyword`, `category`, and `description` fields.

### Step 3: Scan ALL command directories for slash commands
**This is critical.** Glob for command files across all enabled sources:
- `.opencode/prompts/**/*.md` (project-level commands from all subdirectories)
- `.opencode/skills/**/SKILL.md` (skills from enabled stacks)

For each prompt file found:
- The command name is the filename without `.md` (e.g., `fullstack.md` → `/fullstack`)
- The subdirectory is the category (e.g., `dev/fullstack.md` → category: `dev`)
- Read the YAML frontmatter `description` field from each file for the description
- If no frontmatter description, use the filename as a fallback description

### Step 4: Map folder names to categories
Commands are organized by their parent folder. Map folder names to category keys:

| Subdirectory | Category Key |
|---|---|
| dev | dev-workflow |
| git | git |
| project | operations |
| design | design-docs |
| qa | testing |
| agent | automation |
| utils | meta |

### Step 5: Add command magic keywords
These shortcuts map keywords to specific commands:

| Keyword | Command | Description |
|---------|---------|-------------|
| team: | /team | Launch multi-agent orchestration (team/parallel/solo/ticket) |
| swarm: | /team team | (alias) Launch team mode (PM + Dev + QA loop) |
| commit: | /commit-all | Commit to current branch, PR to dev |
| ralph: | /ralph | Autonomous verify/fix workflow loops |
| start: | /start | Pull latest and start dev servers |
| debug: | /debug | Systematic root-cause debugging |
| fix: | /fix-gaps | Structured bug fix with root-cause analysis |
| api: | /fullstack | Structured API endpoint development |
| test: | /run-e2e | Run or write tests systematically |
| plan: | /create-strategic-plan | Architecture-first planning before implementation |

### Step 6: Deduplicate skills and commands
Some skills from skill-rules.json have a corresponding command file (e.g., skill `qa` and command `operation:qa`). Merge these — show the magic keyword from the skill but also list the slash command name.

### Step 7: Group by category
Use these display names:

| Category Key | Display Name |
|---|---|
| dev-workflow | Development Workflow |
| git | Git & Branches |
| backend | Backend (NestJS) |
| frontend | Frontend (React) |
| testing | Testing |
| design-docs | Design & Documentation |
| operations | Operations |
| marketing | Marketing & Growth |
| meta | Meta & Configuration |

### Step 8: Output format

**Always start with the Quick Reference section**, then show the full catalog.

```
SKILL CATALOG
===========================================

QUICK REFERENCE — Magic Keywords
  debug:    Systematic error analysis     fix:      Root-cause bug fixing
  api:      Build endpoints (NestJS)      test:     Run or write tests
  commit:   Git workflow + PR to dev      team:     Multi-agent parallel work
  plan:     Architecture-first planning   start:    Pull + start dev servers
  figma:    Design-to-code (Figma)        docs:     Generate documentation
  qa:       Full quality assurance        ralph:    Autonomous verify/fix

  Usage: Type keyword + colon + space, then your task
  Example: "debug: login page returns 500 after clicking submit"

-------------------------------------------

[CATEGORY NAME]
  keyword:     skill-name              Description
  keyword:     skill-name              Description
               /folder:command         Description (commands without magic keywords)

[NEXT CATEGORY]
  ...

===========================================
N magic keywords | N skills | N commands
```

### Step 9: Apply filters
- If `--search` argument is provided, filter to skills/commands whose name, description, or keyword contains the search term
- If `--category` argument is provided, show only that category
- Skills/commands without a magic keyword should still appear in the catalog (just without a keyword column)

### Step 10: Recommend mode (`--recommend`)
If `--recommend` is passed (or user asks "which skills should I use" / "recommend skills"), show a **workflow recommendation section** instead of (or in addition to) the full catalog.

Analyze the user's current context to suggest relevant skills:

1. **Check what files are currently open or recently modified** (use `git diff --name-only HEAD~5` to see recent work)
2. **Detect the work pattern** and recommend matching skills:

| If the user is working on... | Recommend |
|---|---|
| Frontend files (`.tsx`, `.css`, `.scss`) | `figma:` for design-to-code, `qa:` for UI review, batch changes with plan mode |
| Backend files (`.controller.ts`, `.service.ts`, `.module.ts`) | `api:` for structured endpoints, `test:` for tests |
| Multiple files across frontend + backend | `team:` to parallelize, `plan:` to coordinate |
| Bug fixes / error resolution | `debug:` for root-cause analysis, `fix:` for structured fixing |
| Git operations (commit, push, PR) | `commit:` for automated workflow |
| Documentation or specs | `docs:` for auto-generation, `prd:` for requirements |
| New feature / large scope | `plan:` first, then `team:` for parallel implementation |

3. **Output recommendations** in this format:

```
SKILL RECOMMENDATIONS
===========================================
Based on your recent work:

  You're working on: [detected pattern]

  Recommended skills:
    1. keyword:  description — why it helps
    2. keyword:  description — why it helps
    3. keyword:  description — why it helps

  Workflow tip:
    [One-sentence workflow suggestion based on detected pattern]

===========================================
```

### Step 11: Workflow tips section
After the catalog, always append these workflow tips:

```
-------------------------------------------
WORKFLOW TIPS

  Debugging:     "debug: [error message]" — gets root-cause analysis, not just a fix
  Big features:  Start with "plan:" — map architecture before coding
  Parallel work: "team: [task]" — splits work across agents for speed
  Code review:   "qa:" after implementation — checks design fidelity + tests
  Batch changes: List all UI tweaks at once instead of one-by-one
```
