---
description: Verify .opencode/prompts/ directory structure and cross-reference with skills
argument-hint: no arguments
---

# /link-commands

Verifies that the `.opencode/prompts/` directory structure is complete and cross-references commands with registered skills.

> **Note:** In the current architecture, commands live directly in `.opencode/prompts/` subdirectories.
> This command replaces the legacy symlink setup with a structure verification tool.

---

## Purpose

This command verifies:
- All prompt subdirectories exist (`dev/`, `git/`, `project/`, `design/`, `qa/`, `agent/`, `utils/`)
- All prompts have proper YAML frontmatter
- Prompts are cross-referenced with `skill-rules.json`
- No orphaned or missing commands

---

## Step 1: Verify Prompt Directory Structure

```bash
for dir in dev git project design qa agent utils; do
  if [ -d ".opencode/prompts/$dir" ]; then
    count=$(find ".opencode/prompts/$dir" -name "*.md" -type f | wc -l)
    echo "✓ prompts/$dir/ ($count files)"
  else
    echo "✗ prompts/$dir/ MISSING"
  fi
done
```

---

## Step 2: Check Prompt Frontmatter

Verify all prompt files have YAML frontmatter:

```bash
find .opencode/prompts -name "*.md" -type f | while read f; do
  if ! head -1 "$f" | grep -q "^---"; then
    echo "⚠ Missing frontmatter: $f"
  fi
done
```

---

## Step 3: Cross-Reference with Skills

List all skill triggers from `skill-rules.json` and verify corresponding prompts exist:

```bash
# Read skill names from skill-rules.json
python3 -c "
import json
with open('.opencode/skills/skill-rules.json') as f:
    data = json.load(f)
for rule in data.get('rules', []):
    print(rule['name'])
" 2>/dev/null
```

---

## Step 4: Report Results

```
=== Prompts Structure Verification ===

Directories:
  ✓ prompts/dev/     (14 files)
  ✓ prompts/git/     (7 files)
  ✓ prompts/project/ (10 files)
  ✓ prompts/design/  (12 files)
  ✓ prompts/qa/      (8 files)
  ✓ prompts/agent/   (6 files)
  ✓ prompts/utils/   (11 files)

Frontmatter: 68/68 prompts have YAML frontmatter

Skills Cross-Reference:
  ✓ All 20 skills have corresponding prompts

Status: ✅ VERIFIED
```

---

## Error Handling

| Issue | Resolution |
|-------|------------|
| Missing prompts subdirectory | Check `.opencode/prompts/` structure |
| Missing frontmatter | Add `---` header to prompt file |
| Orphaned skill (no prompt) | Create corresponding prompt in appropriate subdirectory |
| Orphaned prompt (no skill) | Optional — not all prompts need skill registration |

---

## Related

- `/validate-OpenCode-config` — Full configuration validation
- `/audit-system` — Comprehensive system audit
- `/skills` — List all available skills and commands
