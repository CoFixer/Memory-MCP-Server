---
description: Pull latest changes from dev branch into current branch and all submodules
argument-hint: Optional source branch (default: dev)
---


# /pull

You are a git workflow assistant. Your task is to pull the latest changes **from `dev`** into the current branch for both the parent repository and all git submodules.

## Key Principle

**Pull FROM dev** - Merges latest `dev` changes into your current branch to keep it up-to-date.

```bash
# Example: If on branch 'siam', this pulls dev into siam
git pull origin dev
```

## Submodule Architecture

This project uses nested submodules:

```
project/                    # Parent repo (pull dev → current branch)
├── .opencode/                # Submodule → project-OpenCode (pull dev → current branch)
│   ├── base/               # Submodule → OpenCode-base (pull dev → current branch)
│   ├── <tech-stack>/       # Submodules → OpenCode-nestjs, OpenCode-react, etc.
│   └── prompts/              # Commands live here (dev/, git/, project/, design/, qa/, agent/, utils/)
```

**Pull Policy:**
- **All repos:** Pull FROM `dev` INTO current branch
- **Submodules:** Same - pull from `dev` into their current branch

**Important:** Update submodules in order from deepest to shallowest.

---

## Step 0: Check Current State

Before pulling, check the current state of all repos:

```bash
CURRENT_BRANCH=$(git branch --show-current)
echo "Current branch: $CURRENT_BRANCH"
echo "Will pull from: dev"
git status
```

If there are uncommitted changes (staged or unstaged), warn the user that pulling may cause conflicts.

---

## Step 1: Initialize Submodules

First, ensure all submodules are initialized:

```bash
git submodule init
git submodule update --init --recursive
```

This syncs submodules to the commits recorded in the parent repo.

---

## Step 2: Pull Nested Submodules (Deepest First)

**IMPORTANT:** Update submodules from deepest to shallowest to avoid conflicts.

### 2.1 Pull All Nested Submodules in .opencode

```bash
cd .opencode

# Find and pull all nested submodules
for submodule in */; do
  submodule_name="${submodule%/}"

  # Skip if not a git submodule
  if [ ! -e "$submodule_name/.git" ]; then
    continue
  fi

  # Skip symlinks (legacy commands symlink)
  if [ -L "$submodule_name" ]; then
    continue
  fi

  echo "Pulling dev into .opencode/$submodule_name..."
  cd "$submodule_name"

  NESTED_BRANCH=$(git branch --show-current)
  if [ -z "$NESTED_BRANCH" ]; then
    echo "⚠️ .opencode/$submodule_name is in detached HEAD, skipping pull"
  else
    echo "  Current branch: $NESTED_BRANCH"
    echo "  Pulling from: dev"
    git pull origin dev
  fi

  cd ..
done

cd ..
```

### 2.2 Pull .opencode Submodule

After nested submodules are pulled, pull `.opencode` itself:

```bash
cd .opencode

CLAUDE_BRANCH=$(git branch --show-current)
if [ -z "$CLAUDE_BRANCH" ]; then
  echo "⚠️ .opencode is in detached HEAD, skipping pull"
else
  echo "Pulling dev into .opencode (branch: $CLAUDE_BRANCH)"
  git pull origin dev
fi

cd ..
```

---

## Step 3: Pull Parent Repository

Pull `dev` into the current branch:

```bash
CURRENT_BRANCH=$(git branch --show-current)

if [ -z "$CURRENT_BRANCH" ]; then
  echo "⚠️ Parent repo is in detached HEAD state"
  # Cannot pull in detached HEAD - inform user
else
  echo "Pulling dev into $CURRENT_BRANCH..."
  git pull origin dev
fi
```

If $ARGUMENTS is provided, use it as the source branch instead of `dev`:
```bash
git pull origin "$ARGUMENTS"
```

Handle potential issues:
- If there are merge conflicts, inform the user and stop
- If the pull was successful, report what was updated

---

## Step 4: Check for Submodule Reference Updates

After pulling, check if the parent repo needs to record new submodule commits:

```bash
git status
```

If `.opencode` shows as modified (new commits), inform the user:

```
Note: Submodules were updated. If you want to record these updates in the parent repo,
run `/commit` to create a commit with the updated submodule references.
```

---

## Step 5: Verify Prompts Directory

After pulling submodule updates, verify the prompts directory structure is intact:

```bash
# Check if prompts directory exists with all subdirectories
for dir in dev git project design qa agent utils; do
  if [ -d ".opencode/prompts/$dir" ]; then
    echo "✓ prompts/$dir OK"
  else
    echo "⚠ prompts/$dir missing"
  fi
done
```

---

## Step 6: Report Results

After completion, report:

```
✓ Pull Complete

Source branch: dev

Parent repo:
  - Branch: <current-branch>
  - Pulled from: dev
  - Status: <updated/already up to date/conflicts>

Submodules updated:
  - .opencode/base: <current-branch> ← dev
  - .opencode/<other>: <current-branch> ← dev
  - .opencode: <current-branch> ← dev

Commands: <symlink status>

Any issues: <warnings if any>
```

---

## Error Handling

| Issue | Resolution |
|-------|------------|
| Working directory is dirty | Warn user, continue (let git handle conflicts) |
| Pull fails due to conflicts | STOP, inform user how to resolve |
| Submodule in detached HEAD | Skip pull for that submodule, inform user |
| Submodule pull fails | Report which submodule failed and why |
| "Entry would be overwritten" | Nested submodule has uncommitted changes |
| No submodules exist | Skip submodule steps silently |
| Prompts directory missing | Check .opencode/prompts/ structure |

---

## Quick Reference

Pull order (deepest first):
1. `.opencode/<all-nested-submodules>` ← dev
2. `.opencode` ← dev
3. Parent repo ← dev

---

## Alternative: Pull from Different Branch

To pull from a different branch instead of `dev`:

```
/pull main
```

This will pull `main` instead of `dev` into all current branches.
