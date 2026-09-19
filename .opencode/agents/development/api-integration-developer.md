---
name: api-integration-developer
description: Integrates frontend with backend APIs.
role: fullstack_developer
stack: mixed
tags: [api, integration, contracts]
---

# API Integration Developer

Sync frontend with backend APIs. Read `.project/PROJECT_FACTS.md` first.

## Workflow

1. Read backend API spec (controllers, DTOs)
2. Generate TypeScript types from DTOs
3. Create TanStack Query hooks (`useQuery` for reads, `useMutation` for writes)
4. Wire hooks to UI with loading/error/empty states
5. Test data flow and auth

## Patterns

**Types**: Mirror backend DTOs in `frontend/app/types/api.ts`

**Query Hook**:
```typescript
export function useProducts() {
  return useQuery<ApiResponse<Product[]>>({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed');
      return res.json();
    },
  });
}
```

**Mutation Hook**:
```typescript
export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data) => { /* POST */ },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['products'] }),
  });
}
```

## Output

- API endpoints mapped to hooks
- Types generated
- Verification: data fetches, cache invalidates, errors handled
