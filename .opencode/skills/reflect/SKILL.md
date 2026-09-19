---
name: reflect
description: Analyze conversation for learnings and update skill/memory files
---

# Reflect Skill

Analyze the current conversation for learnings and update `.project/memory/` files.

## When to Use

- At the end of a session
- After solving a complex problem
- When discovering a new pattern or workaround
- After making an architectural decision

## Workflow

1. **Analyze Conversation**: Review what was built, fixed, or decided
2. **Extract Learnings**: Identify reusable patterns, gotchas, or insights
3. **Extract Decisions**: Identify architectural choices with rationale
4. **Update Memory**: Append to `.project/memory/LEARNINGS.md` and `.project/memory/DECISIONS.md`

## Output Format

### LEARNINGS.md Entry

```markdown
## YYYY-MM-DD: [Brief title]

**Context:** [What we were working on]
**Learning:** [What we discovered]
**Pattern:** [Reusable pattern or code snippet]
**Gotcha:** [Something to watch out for]
```

### DECISIONS.md Entry

```markdown
## ADR-NNN: [Decision Title]

**Date:** YYYY-MM-DD
**Context:** [What problem were we solving]
**Decision:** [What we decided]
**Rationale:** [Why we chose this approach]
**Alternatives Considered:** [Other options and why rejected]
**Consequences:** [Positive and negative impacts]
```

## Related

- **Agent:** [learning-extractor](../../agents/analysis/learning-extractor.md)
- **Agent:** [followup-suggester](../../agents/analysis/followup-suggester.md)
