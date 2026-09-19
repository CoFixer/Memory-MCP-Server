# Example: PRD-to-Doc Extraction Format

## API Endpoints

### Auth

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register | No |
| POST | `/api/auth/login` | Login | No |

### Resources

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/resources` | List | Yes |
| POST | `/api/resources` | Create | Yes |
| GET | `/api/resources/:id` | Get | Yes |
| PATCH | `/api/resources/:id` | Update | Yes |
| DELETE | `/api/resources/:id` | Delete | Yes |

## HTML-PRD Cross-Check

| HTML File | PRD Screen | Status |
|-----------|------------|--------|
| login.html | Login Screen | Matched |
| signup.html | Sign Up Screen | Matched |
| extra-page.html | - | Extra (not in PRD) |
| - | Settings Screen | Missing HTML |

## Screen-to-API Mapping

| Route | Frontend | API Endpoints | Status |
|-------|----------|---------------|--------|
| /login | frontend | POST /api/auth/login | ⬜ |
