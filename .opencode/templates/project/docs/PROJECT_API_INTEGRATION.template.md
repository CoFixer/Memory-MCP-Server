# {PROJECT_NAME} — Frontend-to-API Integration Map

> Last updated: {DATE}

---

## Screen-to-API Mapping

### Auth Screens

| Route | Frontend | API Endpoints | Status |
|-------|----------|---------------|--------|
| /login | frontend | POST /api/auth/login | ⬜ |
| /forgot-password | frontend | POST /api/auth/forgot-password | ⬜ |

### User Screens

| Route | Frontend | API Endpoints | Status |
|-------|----------|---------------|--------|
| /profile | frontend | GET /api/users/me, PATCH /api/users/me | ⬜ |

### [Feature] Screens

| Route | Frontend | API Endpoints | Status |
|-------|----------|---------------|--------|
| /[feature] | frontend | GET /api/[feature] | ⬜ |

---

## Checklist

- [ ] All screens mapped to API endpoints
- [ ] Loading states handled
- [ ] Error states handled
- [ ] Auth guards in place
