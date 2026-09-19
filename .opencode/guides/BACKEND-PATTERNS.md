# Backend Patterns for OpenCode

Quick reference for NestJS backend development in StorePilot.

## Response Pattern

Always use the standardized response wrapper:

```typescript
// Success
{
  success: true,
  data: { ... },
  message: "Operation successful"
}

// Error
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "User-friendly message"
  }
}
```

See `.pi/backend/guides/RESPONSE-LAYOUT-GUIDE.md` for details.

## Controller Pattern

Extend `BaseController` and use `@One()` decorator:

```typescript
@Controller('products')
export class ProductController extends BaseController {
  @One('product', CreateProductDto, UpdateProductDto)
  async create(@Body() dto: CreateProductDto) {
    return this.service.create(dto);
  }
}
```

See `.pi/backend/guides/BASE-CONTROLLER-GUIDE.md` and `ONE-DECORATOR-GUIDE.md`.

## Service Pattern

```typescript
@Injectable()
export class ProductService {
  constructor(
    private readonly repository: ProductRepository,
    private readonly logger: Logger,
  ) {}

  async create(dto: CreateProductDto) {
    try {
      const entity = this.repository.create(dto);
      return await this.repository.save(entity);
    } catch (error) {
      this.logger.error('Failed to create product', error);
      throw new BadRequestException('Failed to create product');
    }
  }
}
```

## Repository Pattern

```typescript
@EntityRepository(Product)
export class ProductRepository extends Repository<Product> {
  async findByCategory(categoryId: string) {
    return this.find({ where: { categoryId } });
  }
}
```

## DTO Pattern

```typescript
export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsNumber()
  @IsPositive()
  price: number;
}
```

## Error Handling

- Use custom exceptions from `exceptions/` folder
- Wrap in `ExceptionFilter` for consistent responses
- Log errors with context

## RBAC

```typescript
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
@Controller('admin/users')
```

## Testing

```typescript
describe('ProductService', () => {
  let service: ProductService;
  let repository: jest.Mocked<ProductRepository>;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ProductService,
        { provide: ProductRepository, useValue: mockRepository() },
      ],
    }).compile();

    service = module.get(ProductService);
    repository = module.get(ProductRepository);
  });

  it('should create product', async () => {
    const dto = { name: 'Test', price: 100 };
    repository.save.mockResolvedValue({ id: '1', ...dto });
    
    const result = await service.create(dto);
    
    expect(result).toEqual({ id: '1', ...dto });
  });
});
```

## Common Commands

```bash
cd backend

# Dev server
npm run start:dev

# Tests
npm test
npm run test:e2e

# Type check
npm run type-check

# Lint
npm run lint:check

# Database
npm run migration:generate -- -n MigrationName
npm run migration:run
npm run migration:revert
```
