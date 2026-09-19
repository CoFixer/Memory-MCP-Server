# {PROJECT_NAME} — API Documentation

> Last updated: {DATE}

---

## Base URL

| Environment | URL |
|-------------|-----|
| Development | `http://localhost:{BACKEND_PORT}` |

---

## Auth Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register | No |
| POST | `/api/auth/login` | Login | No |
| POST | `/api/auth/refresh` | Refresh token | No |
| POST | `/api/auth/logout` | Logout | Yes |

---

## User Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/me` | Current user | Yes |
| PATCH | `/api/users/me` | Update user | Yes |

---

## [Module] Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/[module]` | List | Yes |
| POST | `/api/[module]` | Create | Yes |
| GET | `/api/[module]/:id` | Get | Yes |
| PATCH | `/api/[module]/:id` | Update | Yes |
| DELETE | `/api/[module]/:id` | Delete | Yes |

---

## Response Formats

### Success

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

---

## Pagination

All list endpoints support:

| Param | Default | Description |
|-------|---------|-------------|
| `page` | 1 | Page number |
| `limit` | 10 | Items per page |
| `sort` | created_at | Sort field |
| `order` | desc | asc / desc |
