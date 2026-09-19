# Example: Database Schema Format

## ERD

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│     users       │         │    orders       │         │   products      │
├─────────────────┤         ├─────────────────┤         ├─────────────────┤
│ PK id (uuid)    │◄───────│ FK user_id (uuid)         │ PK id (uuid)    │
│ email (varchar) │   1:N   │ FK product_id (uuid) ─────┤►│ name (varchar)  │
│ role (enum)     │         │ quantity (int)  │         │ price (decimal) │
│ created_at      │         │ status (enum)   │         │ created_at      │
└─────────────────┘         └─────────────────┘         └─────────────────┘
```

## Relationships

| Relationship | Cardinality |
|--------------|-------------|
| users → orders | 1:N |
| products → orders | 1:N |

## Tables

### users

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | No | gen_random_uuid() |
| email | varchar(255) | No | - |
| password | varchar(255) | No | - |
| role | enum | No | 'user' |
| created_at | timestamp | No | now() |
| updated_at | timestamp | No | now() |

**Constraints:** UNIQUE (email)

### orders

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | No | gen_random_uuid() |
| user_id | uuid | No | - |
| product_id | uuid | No | - |
| quantity | int | No | 1 |
| status | enum | No | 'pending' |
| created_at | timestamp | No | now() |
| updated_at | timestamp | No | now() |

**Constraints:**
- FK user_id REFERENCES users(id) ON DELETE CASCADE
- FK product_id REFERENCES products(id) ON DELETE RESTRICT

### products

| Column | Type | Nullable | Default |
|--------|------|----------|---------|
| id | uuid | No | gen_random_uuid() |
| name | varchar(255) | No | - |
| price | decimal(10,2) | No | 0.00 |
| created_at | timestamp | No | now() |
| updated_at | timestamp | No | now() |
