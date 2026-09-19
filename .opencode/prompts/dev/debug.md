---
description: Systematic debugging and root-cause analysis
argument-hint: "[error message or symptom description]"
---

# /debug

Help me debug an issue in the StorePilot project.

## Context

- Package: {backend|frontend|dashboard|plugin}
- Error message: {paste error}
- When it happens: {reproduction steps}
- Recent changes: {what changed recently}

## Steps

1. **Analyze the error**
   - Identify error type and location
   - Check stack trace
   - Look for common causes

2. **Check related code**
   - Find the file and line causing the issue
   - Review recent git changes: `git diff HEAD~1 --name-only`
   - Check for type errors: `npm run type-check`

3. **Check dependencies**
   - Did any package update recently?
   - Are environment variables set correctly?
   - Is the database migrated?

4. **Reproduce**
   - Confirm the issue locally
   - Create minimal reproduction

5. **Fix**
   - Make minimal targeted fix
   - Verify fix works
   - Check for similar issues elsewhere

6. **Prevent**
   - Add test for this case if missing
   - Update docs if needed

## Common Checks

### Backend
- Database connection: `npm run migration:run`
- Redis connection
- Environment variables in `.env`
- TypeORM relations loaded correctly
- DTO validation rules

### Frontend/Dashboard
- API base URL configured
- Router loaders return correct data
- Error boundaries catch the issue
- TypeScript types match API responses

### Plugin
- WordPress debug log: `wp-content/debug.log`
- REST API registered correctly
- Nonce verification passing
- Asset URLs correct
