---
name: generate-docs
description: Generate and update project documentation (PROJECT_KNOWLEDGE, PROJECT_DATABASE, PROJECT_API, AGENTS.md)
---

# Project Documentation Writer

Generate and maintain project documentation in `.project/` folder based on PRD files.

---

## Purpose

This skill helps you:

1. **Read PRD files** from `.project/prd/`
2. **Generate documentation** for `docs/` and `plans/` folders
3. **Keep docs in sync** with PRD changes
4. **Create strategic plans** from project requirements
5. **Create project root docs** as project configuration summary

---

## Quick Start

### Generate All Documentation

```
/skill:generate-docs
```

### Update Specific Document

```
/skill:generate-docs --doc=PROJECT_KNOWLEDGE
/skill:generate-docs --doc=PROJECT_DATABASE
/skill:generate-docs --doc=PROJECT_API
/skill:generate-docs --doc=agents
```

### Incremental Update Mode

```
/skill:generate-docs --incremental
```

---

## Workflow Overview

### Step 1: Locate PRD

- Check `.project/prd/` for PRD files
- Support formats: PDF, Markdown (.md)
- If no PRD found: Use AskUserQuestion to request PRD path or upload

### Step 2: Parse PRD Content

Extract key sections:

- Overview/Description
- User Types & Permissions
- Database Schema (explicit or inferred)
- API Endpoints (explicit or inferred from features)
- Features & Pages
- Tech Stack

### Step 3: Choose Update Mode

- **Full Update** (default): Regenerate all docs with preview
- **Incremental**: Ask questions for each section before updating

### Step 4: Generate Documents

| Document | Target Path |
|----------|-------------|
| PROJECT_KNOWLEDGE.md | `.project/docs/` |
| PROJECT_DATABASE.md | `.project/docs/` |
| PROJECT_API.md | `.project/docs/` |
| Strategic plans | `.project/plans/` |
| AGENTS.md | Project root |

**Note**: `AGENTS.md` is generated **last** because it references/summarizes the other docs.

### Step 5: Validate & Report

- Cross-reference check (entities, endpoints, features)
- Summary of changes made
- Warnings for missing mappings

---

## Target Directory Structure

```
.project/
├── prd/                    # Source: PRD files
│   └── [ProjectName]_PRD.pdf
├── docs/                   # Target: Generated docs
│   ├── PROJECT_KNOWLEDGE.md
│   ├── PROJECT_DATABASE.md
│   └── PROJECT_API.md
├── plans/                  # Target: Strategic plans
│   └── [feature]_PLAN.md
└── memory/                 # Target: Updates
    ├── DECISIONS.md
    └── LEARNINGS.md
```

---

## Document Generation Rules

### PROJECT_KNOWLEDGE.md

**Source PRD Sections**:

- Part 1: Basic Information
- Project Type & Tech Stack
- User Types & Permissions
- System Modules

**Generated Sections**:

- Overview (name, description, goals)
- Tech Stack
- User Roles & Permissions
- Core Features (grouped by user type)
- Page Breakdown (Public, User, Admin)
- Categories/Enums

### PROJECT_DATABASE.md

**Source PRD Sections**:

- Data entities mentioned in features
- User types → User entity
- Features → Related entities

**Generated Sections**:

- Entity Overview Table
- Entity Details (columns, types, constraints)
- Relationships (1:N, M:N)
- Indexes
- Enums
- ER Diagram (ASCII art)

### PROJECT_API.md

**Source PRD Sections**:

- Page features → API endpoints
- User permissions → Auth requirements
- Data operations → CRUD endpoints

**Generated Sections**:

- Authentication Endpoints
- Resource Endpoints (per entity)
- Admin Endpoints
- Common Responses
- Pagination Pattern
- Error Format

### AGENTS.md (Project Root)

**Source**: Aggregates from all generated docs + filesystem scan

**Data Sources**:

| Section | Source |
|---------|--------|
| Overview | PRD metadata |
| Tech Stack | PRD + package.json |
| Project Structure | Filesystem scan |
| Key Documentation | Hardcoded paths (validated) |
| User Roles | PROJECT_KNOWLEDGE.md |
| Core Enums | PROJECT_DATABASE.md |
| API Base URLs | PROJECT_API.md |
| Commands | Scan .opencode/prompts/ |

**Generated Sections**:

- Overview (name, type, status, description)
- Tech Stack (table format)
- Project Structure (ASCII tree)
- Key Documentation (links to .project/)
- User Roles & Permissions
- Core Enums
- Development Conventions
- Available Commands
- Design System
- API Base URLs
- Quick Reference

**Key Principle**: ~200 lines max, references detailed docs

---

## Update Modes

### Full Update Mode (Default)

Regenerates all documentation from PRD:

1. Parse PRD completely
2. Show preview of changes
3. Ask for confirmation
4. Generate fresh documents
5. Report summary

### Incremental Update Mode

Interactive section-by-section updates:

1. Show current section content
2. Show proposed new content from PRD
3. Ask: "Update this section? [Yes/No/Edit manually]"
4. Apply changes based on choice
5. Continue to next section

---

## PRD Handling

### Supported Formats

- **PDF**: Can read PDF directly
- **Markdown**: Direct text parsing
- **Multiple PRDs**: Ask user which to use

### Missing PRD Flow

If no PRD found in `.project/prd/`:

```
No PRD found in .project/prd/

Please choose an option:
1. Provide path to existing PRD file
2. Upload/paste PRD content
3. Generate docs from existing codebase instead
4. Cancel
```

Uses AskUserQuestion tool to gather PRD source.

---

## Command Arguments

| Argument | Description | Example |
|----------|-------------|---------|
| (none) | Full update all docs + AGENTS.md | `/skill:generate-docs` |
| `--doc=NAME` | Update specific doc | `--doc=PROJECT_API` |
| `--doc=agents` | Update only AGENTS.md | `--doc=agents` |
| `--incremental` | Interactive mode | `--incremental` |
| `--prd=PATH` | Specify PRD path | `--prd=/path/to/prd.pdf` |
| `--plan=NAME` | Generate specific plan | `--plan=authentication` |
| `--skip-agents` | Skip AGENTS.md generation | `--skip-agents` |

---

## Validation Checks

After generation, the skill validates:

- [ ] All user types from PRD are documented
- [ ] All entities have database definitions
- [ ] All features have related API endpoints
- [ ] No orphan references between docs
- [ ] Consistent terminology across all docs

### AGENTS.md Validation

- [ ] All linked documentation files exist
- [ ] Project structure matches actual filesystem
- [ ] Tech stack matches package.json dependencies
- [ ] Enums match PROJECT_DATABASE.md
- [ ] Commands listed exist in .opencode/prompts/
- [ ] Total length under 250 lines

---

## Related Skills

- **generate-prd**: Create PRD from client input
- **init-workspace**: Initialize .project folder structure

---

## Reference Files

For detailed instructions, see:

- [prompts/generate-prd.md](../../prompts/generate-prd.md) - PRD parsing rules
- [prompts/init-workspace.md](../../prompts/init-workspace.md) - Workspace initialization

### Document Templates (shared)

Templates are located in `.opencode/base/templates/`:

- `opencode-project/docs/PROJECT_KNOWLEDGE.template.md`
- `opencode-project/docs/PROJECT_DATABASE.template.md`
- `opencode-project/docs/PROJECT_API.template.md`
- `AGENTS.template.md` - Project root AGENTS.md template

---

**Skill Status**: COMPLETE
**Line Count**: ~300 (following 500-line rule)
**Progressive Disclosure**: Details in prompts/ and templates/ folders
