# PLAN: New Docker Database Setup

## Overview
The user wants to isolate the experimental database from the existing running containers by creating a completely new Postgres container on a different port (5444).

## Project Type
**BACKEND / INFRASTRUCTURE**

## Success Criteria
- [ ] New Docker container `meal-db-new` is running on port `5444`.
- [ ] Database `meal_management_new` is created.
- [ ] Data from `final_meal_backup.sql` is restored to the new database.
- [ ] Application `.env` is updated to connect to `postgresql://meal_user:dev123456@localhost:5444/meal_management_new`.
- [ ] Application starts successfully and connects to the new database.

## Tech Stack
- **Docker / Docker Compose**: Containerization.
- **PostgreSQL 16**: Database engine.
- **Prisma**: ORM (for schema generation and verification).

## Proposed Changes

### [NEW] docker-compose.new-db.yml
Create a new compose file to avoid conflicts with the existing one.
```yaml
version: '3.8'
services:
  postgres-new:
    image: postgres:16-alpine
    container_name: meal-db-new
    environment:
      POSTGRES_USER: meal_user
      POSTGRES_PASSWORD: dev123456
      POSTGRES_DB: meal_management_new
    ports:
      - "5444:5432"
    volumes:
      - postgres_data_new:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data_new:
```

### [MODIFY] .env
Update `DATABASE_URL` to point to the new port and database name.

## Task Breakdown

### Phase 1: Infrastructure Setup
| Task ID | Task Name | Agent | Skills | Priority | Dependencies | INPUT→OUTPUT→VERIFY |
|---------|-----------|-------|--------|----------|--------------|----------------------|
| INF-01 | Create `docker-compose.new-db.yml` | `orchestrator` | `clean-code` | P0 | None | Create file → File exists → `docker-compose config` check |
| INF-02 | Start New Database Container | `orchestrator` | `server-management` | P0 | INF-01 | `docker-compose -f docker-compose.new-db.yml up -d` → Container running → `docker ps` |

### Phase 2: Data Restoration
| Task ID | Task Name | Agent | Skills | Priority | Dependencies | INPUT→OUTPUT→VERIFY |
|---------|-----------|-------|--------|----------|--------------|----------------------|
| DAT-01 | Copy SQL to Container | `orchestrator` | `bash-linux` | P1 | INF-02 | `docker cp final_meal_backup.sql meal-db-new:/backup.sql` → File in container |
| DAT-02 | Restore Database | `orchestrator` | `database-design` | P1 | DAT-01 | `docker exec meal-db-new psql -U meal_user -d meal_management_new -f /backup.sql` → Success message |

### Phase 3: Application Integration
| Task ID | Task Name | Agent | Skills | Priority | Dependencies | INPUT→OUTPUT→VERIFY |
|---------|-----------|-------|--------|----------|--------------|----------------------|
| APP-01 | Update `.env` | `orchestrator` | `clean-code` | P1 | INF-02 | Update `DATABASE_URL` → Verify string |
| APP-02 | Generate Prisma Client | `orchestrator` | `clean-code` | P2 | APP-01 | `pnpm prisma generate` → Client updated |
| APP-03 | Start Dev Server | `orchestrator` | `nodejs-best-practices` | P2 | APP-02 | `pnpm dev` → "Connected to database at localhost:5444" |

## Phase X: Verification
- [ ] `docker ps` shows `meal-db-new` on `0.0.0.0:5444->5432/tcp`.
- [ ] `psql -h localhost -p 5444 -U meal_user -d meal_management_new -c "SELECT count(*) FROM \"User\";"` returns data.
- [ ] API logs show no connection errors.
