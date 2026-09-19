# .opencode Examples

Example outputs and references for the `.opencode` workflow system.

## Skill Examples

### Commit Workflow

```bash
# Example: Committing a new feature
git add backend/src/products/
git commit -m "feat(backend): add product search endpoint

- Implement fuzzy search via TypeORM query builder
- Add Redis caching for search results
- Include pagination metadata in response

Closes #123"
git push origin feature/123-product-search
```

### Gap Finder Output

```markdown
## Gap Analysis: Product Search

### Summary
- Total items checked: 15
- Gaps found: 3
- Severity: 1 High, 2 Medium

### Gaps
1. **[HIGH]** Missing Redis cache invalidation on product update
   - Location: `backend/src/products/product.service.ts`
   - Expected: Cache should be cleared when product is updated
   - Actual: No cache invalidation logic

2. **[MEDIUM]** Frontend missing empty state for no results
   - Location: `frontend/app/routes/products.tsx`
   - Expected: Show "No products found" message
   - Actual: Blank page when search returns empty

3. **[MEDIUM]** Missing E2E test for search flow
   - Location: `frontend/test/e2e/`
   - Expected: Test covering search input → results → clear
   - Actual: No E2E tests for search
```

### Code Review Output

```markdown
## Review: Add Product Search Feature

### Summary
- Lines changed: +450 / -30
- Files: 12
- Approval: Approved with suggestions

### Critical Issues
None

### Major Issues
1. **Performance**: Search query missing index on `name` field
   - Consider adding `@Index(['name'])` to Product entity

### Minor Suggestions
1. Could extract search debounce logic into reusable hook
2. Add loading skeleton instead of generic spinner

### Positive Notes
- Clean separation of concerns between service and repository
- Good test coverage for edge cases
- Swagger docs well documented
```

## Prompt Examples

### Debug Prompt Usage

```
User: "Use the debug prompt"

Context:
- Package: backend
- Error: "Cannot read property 'name' of undefined"
- When: Calling GET /api/products/123
- Recent: Added new product relation

Steps:
1. Check product.service.ts line 45
2. Found missing relation load: .leftJoinAndSelect('product.category', 'category')
3. Added relation load
4. Test passes
5. Commit fix
```

## Agent Invocation Examples

```
User: "Run the backend-agent to implement a new order status endpoint"

Agent:
1. Read spec from .project/docs/PROJECT_API.md
2. Found pattern in existing OrderController
3. Created:
   - UpdateOrderStatusDto
   - OrderService.updateStatus()
   - PATCH /api/orders/:id/status
   - Tests
4. Verified type check and tests pass
```

## Adding Examples

When you produce good output using `.opencode` workflows, consider adding sanitized examples here for future reference.
