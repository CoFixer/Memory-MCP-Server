---
description: Create a complete new project with OpenCode config and boilerplate code
argument-hint: "<project-name> [--docs-only]"
---

You are a full project setup assistant. This command creates a new project with the shared opencode-workflow as `.opencode` submodule.

## Step 0: Parse Arguments and Select Mode

### 0.1 Parse Project Name

Parse `$ARGUMENTS` for `$PROJECT_NAME`.

```
Examples:
  /new-project my-app           → Full setup
  /new-project my-app --docs-only → Documentation only
```

If no project name provided, ask:
```
What is the project name? (e.g., storepilot, my-platform)
```

Store as `$PROJECT_NAME` (lowercase, hyphenated).

### 0.2 Determine Setup Mode

Check if `--docs-only` flag is present in `$ARGUMENTS`:

**If `--docs-only` flag is present:**
```bash
DOCS_ONLY_MODE=true
```

**If `--docs-only` flag is NOT present:**

Use **AskUserQuestion** to ask the user:

```
Question: "What type of setup do you want to perform?"
Header: "Setup Mode"
Options:
  1. Full Project Setup (Recommended)
     Description: "Create new project with boilerplate code, .opencode config, and documentation"

  2. Documentation Only
     Description: "Set up documentation for existing project (requires .opencode/ submodule)"
```

Store result:
- Option 1 selected → `$DOCS_ONLY_MODE = false`
- Option 2 selected → `$DOCS_ONLY_MODE = true`

## Step 0.5: Detect and Migrate Resources

**This step ALWAYS runs in both normal and --docs-only modes.**

This step automatically detects existing project resources (HTML prototypes, PRD documents) at the root directory and migrates them to the proper locations within `.project/`.

### 0.5.1 Check for Existing Resources

```bash
# Check for HTML folder
HTML_FOLDER_EXISTS=false
HTML_FILE_COUNT=0
if [ -d "HTML" ]; then
  HTML_FOLDER_EXISTS=true
  HTML_FILE_COUNT=$(find HTML -name "*.html" 2>/dev/null | wc -l | tr -d ' ')
fi

# Check for PRD PDF
PRD_PDF_EXISTS=false
if [ -f "prd.pdf" ]; then
  PRD_PDF_EXISTS=true
fi
```

### 0.5.2 Report Detected Resources

If resources are found, display:

```
=== Detected Project Resources ===

HTML Folder:  ${HTML_FOLDER_EXISTS ? "Found ($HTML_FILE_COUNT HTML files)" : "Not found"}
PRD PDF:      ${PRD_PDF_EXISTS ? "Found (prd.pdf)" : "Not found"}
```

### 0.5.3 Execute Migration (Automatic)

Automatically migrate resources without prompting:

```bash
# Create target directories
mkdir -p .project/resources
mkdir -p .project/prd

# Move HTML folder
if [ "$HTML_FOLDER_EXISTS" = true ]; then
  mv HTML .project/resources/HTML
  echo "Migrated: HTML/ → .project/resources/HTML/ ($HTML_FILE_COUNT files)"
fi

# Move PRD PDF
if [ "$PRD_PDF_EXISTS" = true ]; then
  mv prd.pdf .project/prd/prd.pdf
  echo "Migrated: prd.pdf → .project/prd/prd.pdf"
fi
```

## Step 1: Gather Tech Stack

Use **AskUserQuestion** to ask for the complete tech stack.

**If Step 0.5 detected tech stack values, use them as defaults (pre-selected).**

### Backend Framework (Required)

Default Selected: `$BACKEND_DETECTED` (if available from Step 0.5)

- **NestJS** (Recommended) - TypeScript, TypeORM, JWT, Swagger
- **Django** - Python, DRF, SimpleJWT, drf-spectacular

Store as:
- `$BACKEND` = "nestjs" | "django"

### Frontend Framework(s) Selection (multiSelect: true):

```
Question: "Which frontend(s) do you want to create?"
Header: "Frontend"
Options:
  1. React Web - "Web application (port 5173)"
  2. React Native - "Mobile application"
  3. None - "Skip frontend creation"
```

Store as:
- `$FRONTENDS` = array of selected options (can be empty if "None" selected)

### Dashboard Selection:

```
Question: "Create a dashboard for admin/privileged roles?"
Header: "Dashboard"
Options:
  1. Yes - "Single dashboard for admin/ops/privileged roles (port 5174)"
  2. No - "No dashboard needed"
```

Store result:
- Option 1 → `$CREATE_DASHBOARD = true`
- Option 2 → `$CREATE_DASHBOARD = false`

## Step 2: Confirm Project Structure

Display the planned structure and ask for confirmation:

```
=== Project Setup Plan: $PROJECT_NAME ===

OpenCode Configuration:
  - Uses shared opencode-workflow submodule
  - Contains: prompts, skills, agents, hooks, guides

Boilerplate Code:
  - backend/                       ← nestjs-starter-kit (if NestJS)
  - frontend/                      ← react-starter-kit (if React Web selected)
  - dashboard/                     ← react-starter-kit (if dashboard selected)
  - mobile/                        ← react-native-starter-kit (if React Native)

Project Documentation:
  - .project/status/
  - .project/memory/
  - .project/docs/

Proceed with this setup?
```

## Step 3: Create Project Directory

```bash
# Check if we're in an empty directory or need to create one
if [ "$(ls -A .)" ]; then
    mkdir $PROJECT_NAME
    cd $PROJECT_NAME
fi

# Initialize git if not already
git init 2>/dev/null || true
```

## Step 4: Add OpenCode Configuration

Add the shared opencode-workflow as `.opencode` submodule:

```bash
git submodule add https://github.com/CoFixer/opencode-workflow.git .opencode
git submodule update --init --recursive
```

This provides:
- `prompts/` - reusable command templates
- `skills/` - domain-specific skills
- `agents/` - specialized agents
- `hooks/` - automation hooks
- `backend/guides/` - backend development guides
- `frontend/guides/` - frontend development guides

## Step 5: Create .project Documentation Structure

### 5.1 Check for existing .project

```bash
if [ -d ".project" ]; then
  # Ask user: Overwrite, Merge, or Skip?
fi
```

### 5.2 Create directory structure

```bash
mkdir -p .project/docs
mkdir -p .project/memory
mkdir -p .project/status/backend
mkdir -p .project/status/frontend
mkdir -p .project/status/temp
mkdir -p .project/prd
mkdir -p .project/secrets
```

### 5.3 Create status files

Create initial status tracking files based on detected tech stack.

## Step 6: Create AGENTS.md

Create consolidated context file in root for token-efficient interactions:

```bash
# Copy template from .opencode/base/templates/
cp .opencode/base/templates/AGENTS.template.md AGENTS.md

# Replace placeholders
sed -i "s/{PROJECT_NAME}/$PROJECT_NAME/g" AGENTS.md
sed -i "s/{BACKEND}/$BACKEND/g" AGENTS.md
sed -i "s/{DATE}/$(date +%Y-%m-%d)/g" AGENTS.md
```

## Step 7: Create README.md

```bash
# Create basic README
cat > README.md << 'EOF'
# $PROJECT_NAME

## Getting Started

1. Install dependencies: `npm install` (in each package)
2. Start backend: `cd backend && npm run start:dev`
3. Start frontend: `cd frontend && npm run dev`

## Documentation

See [AGENTS.md](./AGENTS.md) for project context and conventions.

## Project Structure

- `backend/` - $BACKEND backend
- `frontend/` - React frontend
- `dashboard/` - Admin dashboard
- `.project/` - Project documentation
- `.opencode/` - OpenCode workflow
EOF
```

## Step 8: Create .gitignore

```bash
cat > .gitignore << 'EOF'
# Node
**/node_modules/
**/dist/
**/build/

# Python
**/__pycache__/
**/*.pyc
**/.venv/

# Environment
**/.env
**/.env.local
**/.env.*.local

# IDE
.idea/
.vscode/
*.swp

# OS
.DS_Store
Thumbs.db

# Project
.project/secrets/*
!.project/secrets/.gitkeep
.project/status/temp/*
!.project/status/temp/.gitkeep
EOF
```

## Step 9: Initial Commit

```bash
git add -A
git commit -m "feat: Initial $PROJECT_NAME project setup

- .opencode/ submodule using shared opencode-workflow
- Backend: $BACKEND
- Frontend: $FRONTENDS
- Documentation structure initialized
"
```

## Step 10: Create GitHub Repo and Push

### 10.1 Create Main Project Repo on GitHub

```bash
gh repo create CoFixer/$PROJECT_NAME --private --description "$PROJECT_NAME - Full stack application"
```

### 10.2 Add Remote and Push main Branch

```bash
git remote add origin https://github.com/CoFixer/$PROJECT_NAME.git
git branch -M main
git push -u origin main
```

### 10.3 Create and Push dev Branch

```bash
git checkout -b dev
git push -u origin dev
```

### 10.4 Set dev as Default Branch (Optional)

```bash
gh repo edit CoFixer/$PROJECT_NAME --default-branch dev
```

### 10.5 Return to main Branch

```bash
git checkout main
```

## Step 11: Final Report

```
=== Project Setup Complete ===

$PROJECT_NAME/
├── .opencode/              # Shared opencode-workflow
├── .project/               # Project docs
├── backend/                # $BACKEND boilerplate
├── frontend/               # React Web (if selected)
├── dashboard/              # Admin dashboard (if selected)
├── mobile/                 # React Native (if selected)
├── .gitignore
├── AGENTS.md
└── README.md

GitHub: https://github.com/CoFixer/$PROJECT_NAME (private)
Branches: main (production), dev (active development)

Next Steps:
1. cd $PROJECT_NAME
2. Begin development on dev branch!
```

## Error Handling

| Error | Resolution |
|-------|------------|
| `gh` not authenticated | Run `gh auth login` |
| Repo already exists | Ask to use existing or choose new name |
| Clone failed | Check network and repo access |
| Directory not empty | Ask to proceed or choose new location |

## Rollback

If setup fails midway:

```bash
# Clean up local
rm -rf backend frontend dashboard mobile .opencode .project

# Clean up GitHub (if repo was created)
gh repo delete CoFixer/$PROJECT_NAME --yes
```
