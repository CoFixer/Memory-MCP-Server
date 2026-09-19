---
description: Validate .OpenCode configuration structure and fix issues
argument-hint: Optional --fix to auto-fix common issues, --verbose for detailed output
---


# /validate-OpenCode-config

You are a OpenCode configuration validator. Your task is to check that the `.opencode` directory follows the 3-tier system and all files are properly organized.

## The 3-Tier System

```
Tier 3 (Shared Base): .opencode/base/       - Generic commands, agents, skills, hooks
Tier 2 (Framework):   .opencode/<tech>/     - Framework-specific (nestjs, react, etc.)
Tier 1 (Project):     .opencode/            - Project-specific config + symlinks
```

**Key principles:**
- Commands live in `.opencode/prompts/` subdirectories (dev/, git/, project/, design/, qa/, agent/, utils/)
- Agents are in `.opencode/agents/` and framework-specific agent directories
- Skills are in `.opencode/skills/{skill-name}/SKILL.md`
- Hooks are configured in `settings.json` with `.opencode` paths

---

## Step 1: Check Submodule Initialization

```bash
cd .OpenCode && git submodule status --recursive && cd ..
```

**Expected output:**
- Each line should start with a commit hash (e.g., ` abc1234 base`)
- Lines starting with `-` indicate uninitialized submodules
- Lines starting with `+` indicate submodule is at different commit than recorded

**If issues found and `--fix` requested:**
```bash
git submodule update --init --recursive
```

---

## Step 2: Check .gitmodules Configuration

```bash
cat .opencode/.gitmodules
```

**Expected content:**
- Should define `base` submodule pointing to `OpenCode-base` repo
- May include `nestjs`, `react`, or other framework submodules
- URLs should use `https://github.com/` format

**Verify URLs match actual remotes:**
```bash
cd .opencode/base && git remote -v && cd ../..
```

**If URL mismatch and `--fix` requested:**
```bash
cd .OpenCode && git submodule sync --recursive && cd ..
```

---

## Step 3: Check Prompts Directory

```bash
ls -la .opencode/prompts/
```

**Expected output:**
```
dev/  git/  project/  design/  qa/  agent/  utils/  README.md
```

**Verify prompts exist:**
```bash
ls .opencode/prompts/dev/*.md | head -5
ls .opencode/prompts/git/*.md | head -5
```

**If missing and `--fix` requested:**
Report that prompts directory is incomplete — may need to re-clone or update the .opencode submodule.

---

## Step 4: Validate settings.json

```bash
cat .opencode/settings.json | python3 -c "import sys,json; json.load(sys.stdin); print('Valid JSON')"
```

**Check hook paths exist:**
```bash
# Extract hook paths and verify they exist
# Hooks should use .opencode variable
cat .opencode/settings.json
```

**Verify each hook file exists and is executable:**
```bash
ls -la .opencode/base/hooks/*.sh
ls -la .project/hooks/*.sh 2>/dev/null || echo "No project hooks"
```

**Expected:**
- All `.sh` files should have execute permission (`-rwxr-xr-x`)
- Hook paths in settings.json should reference existing files

**If not executable and `--fix` requested:**
```bash
chmod +x .opencode/base/hooks/*.sh
chmod +x .project/hooks/*.sh 2>/dev/null
```

---

## Step 5: Validate skill-rules.json

```bash
cat .opencode/skills/skill-rules.json | python3 -c "import sys,json; json.load(sys.stdin); print('Valid JSON')"
```

**Check regex patterns compile:**
```bash
python3 << 'EOF'
import json
import re
import sys

with open('.opencode/skills/skill-rules.json') as f:
    rules = json.load(f)

errors = []
for skill_name, skill in rules.get('skills', {}).items():
    patterns = skill.get('promptTriggers', {}).get('intentPatterns', [])
    for pattern in patterns:
        try:
            re.compile(pattern)
        except re.error as e:
            errors.append(f"  - {skill_name}: Invalid regex '{pattern}': {e}")

if errors:
    print("Invalid regex patterns found:")
    print('\n'.join(errors))
    sys.exit(1)
else:
    print("All regex patterns are valid")
EOF
```

---

## Step 6: Check Directory Structure

**Required directories at project level (.opencode/):**
```bash
for dir in agents skills hooks; do
  if [ -d ".opencode/$dir" ]; then
    echo "OK: .opencode/$dir exists"
  else
    echo "MISSING: .opencode/$dir"
  fi
done
```

**Required directories in base tier (.opencode/base/):**
```bash
for dir in commands agents skills hooks templates; do
  if [ -d ".opencode/base/$dir" ]; then
    echo "OK: .opencode/base/$dir exists"
  else
    echo "MISSING: .opencode/base/$dir"
  fi
done
```

**Check framework tiers (if present):**
```bash
for framework in nestjs react; do
  if [ -d ".opencode/$framework" ]; then
    echo "=== .opencode/$framework ==="
    for dir in agents skills guides hooks; do
      if [ -d ".opencode/$framework/$dir" ]; then
        echo "  OK: $dir"
      else
        echo "  MISSING: $dir"
      fi
    done
  fi
done
```

---

## Step 7: Check File Permissions

**All shell scripts should be executable:**
```bash
find .OpenCode -name "*.sh" -type f ! -perm -u+x 2>/dev/null | while read f; do
  echo "NOT EXECUTABLE: $f"
done
```

**All markdown files should be readable:**
```bash
find .OpenCode -name "*.md" -type f ! -perm -u+r 2>/dev/null | while read f; do
  echo "NOT READABLE: $f"
done
```

**If issues found and `--fix` requested:**
```bash
find .OpenCode -name "*.sh" -type f -exec chmod +x {} \;
find .OpenCode -name "*.md" -type f -exec chmod +r {} \;
```

---

## Step 8: Cross-Reference Check

**List all commands available:**
```bash
echo "=== Available Commands ==="
find .opencode/prompts -name "*.md" -type f 2>/dev/null | grep -v README.md | xargs -I{} basename {} .md | sort
```

**List all agents at each tier:**
```bash
echo "=== Project Agents ==="
ls .opencode/agents/*.md 2>/dev/null | xargs -I{} basename {} .md | sort

echo "=== Base Agents ==="
ls .opencode/base/agents/*.md 2>/dev/null | xargs -I{} basename {} .md | sort

echo "=== Agents Directory ==="
ls .opencode/agents/*.md 2>/dev/null | xargs -I{} basename {} .md | sort

for framework in nestjs react; do
  if [ -d ".opencode/$framework/agents" ]; then
    echo "=== $framework Agents ==="
    ls .opencode/$framework/agents/*.md 2>/dev/null | xargs -I{} basename {} .md | sort
  fi
done
```

**Check for duplicate agents (same name at multiple tiers):**
```bash
echo "=== Checking for Duplicates ==="
(ls .opencode/agents/*.md 2>/dev/null; ls .opencode/base/agents/*.md 2>/dev/null; ls .opencode/backend/agents/**/*.md 2>/dev/null; ls .opencode/frontend/agents/**/*.md 2>/dev/null) | xargs -I{} basename {} .md | sort | uniq -d
```

---

## Step 9: Generate Health Report

After running all checks, generate a summary report:

```
=== OpenCode configuration Health Report ===

Submodules:
  [ ] base: initialized, on main
  [ ] nestjs: initialized, on main
  [ ] react: initialized, on main

Prompts:
  [ ] .opencode/prompts/dev/
  [ ] .opencode/prompts/git/
  [ ] .opencode/prompts/project/
  [ ] .opencode/prompts/design/
  [ ] .opencode/prompts/qa/
  [ ] .opencode/prompts/agent/
  [ ] .opencode/prompts/utils/

Settings:
  [ ] settings.json is valid JSON
  [ ] All hook paths exist
  [ ] All hooks are executable

Skills:
  [ ] skill-rules.json is valid JSON
  [ ] All regex patterns compile

Directories:
  [ ] .opencode/agents
  [ ] .opencode/skills
  [ ] .opencode/hooks
  [ ] .opencode/prompts
  [ ] .opencode/base/templates

Permissions:
  [ ] All .sh files executable
  [ ] All .md files readable

Overall: OK / ISSUES FOUND
```

Use checkmarks for passing checks:
- `[x]` = Pass
- `[ ]` = Fail
- `[~]` = Warning (optional item missing)

---

## Auto-Fix Mode

If `$ARGUMENTS` contains `--fix`, attempt these automatic fixes:

| Issue | Fix Command |
|-------|-------------|
| Uninitialized submodules | `git submodule update --init --recursive` |
| URL mismatch | `git submodule sync --recursive` |
| Missing prompts directory | Re-clone or update .opencode submodule |
| Scripts not executable | `chmod +x .opencode/**/*.sh` |
| Detached HEAD in submodule | `cd submodule && git checkout main` |

**Note:** Auto-fix will NOT:
- Commit uncommitted changes (use `/commit` for that)
- Create missing directories (report only)
- Modify settings.json structure

---

## Verbose Mode

If `$ARGUMENTS` contains `--verbose`, include additional details:
- List all files in each directory
- Show git status for each submodule
- Display full hook configuration
- Show skill-rules.json content

---

## Common Issues and Solutions

| Issue | Symptom | Solution |
|-------|---------|----------|
| Commands not found | `/command` fails | Check prompts: `ls -la .opencode/prompts/` |
| Hook not running | No skill suggestions | Verify settings.json hook paths |
| Submodule empty | Directory exists but empty | `git submodule update --init --recursive` |
| Permission denied | Hook fails to execute | `chmod +x .opencode/**/*.sh` |
| Invalid skill-rules | JSON parse error | Check for trailing commas, missing quotes |
| Wrong branch | Features missing | `cd .opencode/base && git checkout main` |
