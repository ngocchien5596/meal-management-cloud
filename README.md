# Meal Management System

Hệ thống Quản lý Suất Ăn cho doanh nghiệp sản xuất.

## 🚀 Tech Stack

- **Frontend**: Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend**: Express + TypeScript + Prisma + Socket.io
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Container**: Docker

## 📁 Project Structure

```
meal-management/
├── apps/
│   ├── web/          # Next.js Frontend
│   └── api/          # Express Backend
├── packages/
│   └── shared/       # Shared types & utils
├── docker-compose.dev.yml
└── README.md
```

## 🛠️ Development Setup

### Prerequisites

- Node.js 20+ 
- Docker Desktop
- pnpm (recommended) or npm

### 1. Start Database

```bash
docker-compose -f docker-compose.dev.yml up -d
```

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Setup Database

```bash
cd apps/api
pnpm prisma migrate dev
pnpm prisma db seed
```

### 4. Start Development

```bash
# Terminal 1: Backend
cd apps/api
pnpm dev

# Terminal 2: Frontend
cd apps/web
pnpm dev
```

### 5. Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Adminer (DB UI): http://localhost:8080

## 🔐 Default Credentials

### Database (Development)
- Host: localhost:5432
- User: meal_user
- Password: dev123456
- Database: meal_management

### Redis (Development)
- Host: localhost:6379
- Password: dev123456

### Admin Account (after seeding)
- Username: admin
- Password: Admin@123

## 📝 Scripts

```bash
# Start all services
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build

# Lint code
pnpm lint
```

## 📚 Documentation

- [Phân tích Yêu cầu](./docs/requirements_analysis.md)
- [Kế hoạch Công nghệ](./docs/PLAN-meal-management-tech.md)

## 📄 License

Private - © 2026
