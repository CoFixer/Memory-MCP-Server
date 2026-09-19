# {PROJECT_NAME} — Database Schema

> Last updated: {DATE}

---

## Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│   users     │       │  [entity]   │       │  [entity2]  │
├─────────────┤       ├─────────────┤       ├─────────────┤
│ PK id       │◄──────┤ FK user_id  │       │ PK id       │
│ email       │  1:N  │ ...         │       │ ...         │
│ role        │       │ created_at  │       │ created_at  │
│ created_at  │       │ updated_at  │       │ updated_at  │
└─────────────┘       └─────────────┘       └─────────────┘
```

## Relationships

| Relationship | Cardinality | Description |
|--------------|-------------|-------------|
| users → [entity] | 1:N | One user has many [entities] |

## Tables

### users

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | PK |
| email | varchar(255) | No | - | Unique |
| password | varchar(255) | No | - | Hashed |
| role | enum | No | 'user' | user, admin |
| created_at | timestamp | No | now() | Creation |
| updated_at | timestamp | No | now() | Update |

**Constraints:** UNIQUE (email)

### [entity_name]

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| id | uuid | No | gen_random_uuid() | PK |
| [column] | [type] | [Yes/No] | [default] | [desc] |
| created_at | timestamp | No | now() | Creation |
| updated_at | timestamp | No | now() | Update |

**Constraints:** FOREIGN KEY [column] REFERENCES [table](id) ON DELETE [CASCADE/SET NULL]

## Indexes

| Table | Columns | Type | Purpose |
|-------|---------|------|---------|
| users | email | UNIQUE | Lookup |
