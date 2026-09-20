---
skill_name: create-pr-workflow
applies_to_local_project_only: true
auto_trigger_regex:
  [
    "new pr",
    "create pr",
    "pull request",
    "merge request",
    "do it again",
    "feature branch",
    "commit and push",
    "git workflow",
    "pr workflow",
  ]
tags: [git, github, workflow, pr, automation]
related_skills: [commit, create-dev-pr]
---

# Create PR Workflow

Automates the full Git PR lifecycle: branch → commit → push → PR → merge → cleanup.

---

## Quick Start

Trigger with: **"do it with new PR"** or **"/skill:create-pr-workflow"**

### What It Does

1. Checks for uncommitted changes
2. Creates a feature branch (`feature/*` or `bug/*`)
3. Commits all changes with a descriptive message
4. Pushes branch to origin
5. Creates a Pull Request to `dev`
6. Checks PR status (mergeable/conflicts)
7. Merges the PR
8. Switches back to `dev` and pulls latest
9. Deletes local and remote feature branches

---

## Workflow Steps (Auto-Executed)

### Step 1: Check Status

```bash
git status
git stash list
```

- Detects modified/untracked files
- Warns if no changes exist

### Step 2: Create Feature Branch

```bash
git checkout -b feature/<descriptive-name>
```

Naming convention based on changes:
- `feature/<what-it-does>` — new features
- `bug/<what-it-fixes>` — bug fixes
- `refactor/<what-changed>` — refactoring
- `chore/<what-it-updates>` — maintenance

### Step 3: Stage & Commit

```bash
git add -A
git commit -m "<type>(<scope>): <description>

- Change 1
- Change 2
- Change 3"
```

Commit format follows Conventional Commits:
- `feat()` — new feature
- `fix()` — bug fix
- `refactor()` — code restructuring
- `chore()` — maintenance/tasks
- `docs()` — documentation
- `test()` — tests

### Step 4: Push to Origin

```bash
git push -u origin <branch-name>
```

### Step 5: Create Pull Request

```bash
gh pr create --base dev --title "<title>" --body "<description>"
```

PR body template:
```markdown
## Summary
Brief description of changes.

### Changes
- Change 1
- Change 2

### Testing
- [ ] Test item 1
- [ ] Test item 2
```

### Step 6: Check PR Status

```bash
gh pr view <number> --json state,mergeStateStatus,mergeable,title
```

Checks:
- `mergeable: MERGEABLE` — ready to merge
- `mergeStateStatus: UNSTABLE` — checks running (still mergeable)
- `mergeStateStatus: BLOCKED` — cannot merge

### Step 7: Merge PR

```bash
gh pr merge <number> --merge --body "Merging <branch> into dev." --subject "<title> (#<number>)"
```

### Step 8: Cleanup

```bash
git checkout dev
git pull origin dev
git branch -d <branch>
git push origin --delete <branch>
```

---

## Handling Edge Cases

### No Changes Detected

**Action:** Prompt user to choose:
1. Make changes first
2. Create a test/dummy change
3. Apply stashed changes (`git stash pop`)

### Push Protection Block (Secrets)

**Action:**
1. Read the file with the detected secret
2. Replace with safe placeholder (e.g., `your-secret-here`)
3. Re-stage and amend commit
4. Force push with lease: `git push --force-with-lease`

### Merge Conflicts

**Action:**
1. Notify user of conflicts
2. Do NOT auto-merge
3. Ask user to resolve manually

### Fast-Forward Errors (Local Changes)

**Action:**
1. `git status` to check state
2. If clean: `git reset --hard` then `git pull origin dev`
3. If dirty: `git stash` → pull → `git stash pop`

---

## Branch Strategy

This project follows **GitHub Flow** with two main branches:

| Branch | Purpose | PR Target |
|--------|---------|-----------|
| `main` | Production, default branch | First PR only |
| `dev` | Development, integration | All subsequent PRs |

**Rule:** All feature/bug branches target `dev`. `main` only receives PRs from `dev` during releases.

---

## Example Session

**User:** "do it with new PR"

**Agent:**
1. `git status` → finds `backend/Dockerfile` modified
2. `git checkout -b feature/dockerfile-improvements`
3. `git add -A && git commit -m "feat(docker): optimize build stage

- Use smaller base image
- Combine RUN commands
- Remove unnecessary layers"`
4. `git push -u origin feature/dockerfile-improvements`
5. `gh pr create --base dev --title "feat(docker): optimize build stage" --body "..."`
6. `gh pr view 15 --json mergeable` → `MERGEABLE`
7. `gh pr merge 15 --merge ...`
8. `git checkout dev && git pull origin dev`
9. `git branch -d feature/dockerfile-improvements && git push origin --delete feature/dockerfile-improvements`
10. "Done! PR #15 merged into dev."

---

## Related Skills

- `commit` — Simple commit & push without PR
- `create-dev-pr` — Create PR to dev with validation only

---

**Status:** COMPLETE ✅
**Line Count:** < 200 lines ✅