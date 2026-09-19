# Frontend Patterns for OpenCode

Quick reference for React frontend/dashboard development in StorePilot.

## Project Structure

```
app/
├── routes/           # Route components (React Router 7)
├── components/       # Reusable UI components
├── hooks/            # Custom React hooks
├── lib/              # Utilities and helpers
├── types/            # TypeScript definitions
└── styles/           # Global styles
```

## Route Pattern (React Router 7)

```typescript
// app/routes/products.tsx
import { json } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';

export async function loader() {
  const products = await getProducts();
  return json({ products });
}

export default function ProductsPage() {
  const { products } = useLoaderData<typeof loader>();
  
  return (
    <div>
      <ProductList products={products} />
    </div>
  );
}
```

## API Hook Pattern

```typescript
// hooks/use-products.ts
import { useQuery } from '@tanstack/react-query';

export function useProducts() {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) throw new Error('Failed to fetch');
      return response.json();
    },
  });
}
```

## Component Pattern

```typescript
// components/product-card.tsx
import { Link } from '@remix-run/react';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{product.name}</h3>
      <p className="text-gray-600">{product.price}</p>
      <Link to={`/products/${product.id}`} className="text-blue-600">
        View Details
      </Link>
    </div>
  );
}
```

## Form Pattern

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  price: z.number().positive('Price must be positive'),
});

export function ProductForm() {
  const form = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = form.handleSubmit((data) => {
    // Submit data
  });

  return (
    <form onSubmit={onSubmit}>
      <input {...form.register('name')} />
      {form.formState.errors.name && (
        <span>{form.formState.errors.name.message}</span>
      )}
      <button type="submit">Save</button>
    </form>
  );
}
```

## Error Handling

```typescript
export function ErrorBoundary() {
  const error = useRouteError();
  
  return (
    <div className="p-4">
      <h1>Error</h1>
      <p>{error.message}</p>
    </div>
  );
}
```

## Common Commands

```bash
cd frontend  # or cd dashboard

# Dev server
npm run dev

# Build
npm run build

# Type check
npm run typecheck

# Tests
npm run test:e2e
```

## Tailwind Tips

- Use Tailwind CSS v4 utility classes
- Prefer composition over custom CSS
- Use `cn()` utility for conditional classes
- Keep responsive design mobile-first

## Accessibility

- Use semantic HTML (`<button>` not `<div onClick>`)
- Add `aria-label` to icon buttons
- Ensure keyboard navigation works
- Test with screen readers
