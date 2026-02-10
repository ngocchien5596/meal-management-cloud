# 🚀 PLAN: Meal Management System - Tech Stack

> **Dự án:** Hệ thống Quản lý Suất Ăn  
> **Ngày tạo:** 01/02/2026  
> **Cập nhật:** 01/02/2026  
> **Mode:** Self-Hosted (On-Premise)  
> **Status:** ✅ CONFIRMED - Option D

---

## 🎯 QUYẾT ĐỊNH: Option D - Self-Hosted

| Quyết định | Chi tiết |
|------------|----------|
| **Tech Stack** | Next.js + Express + PostgreSQL + Redis |
| **Deployment** | Docker containers |
| **Dev Environment** | Máy cá nhân (Windows + Docker Desktop) |
| **Production** | Server công ty (Ubuntu + Docker) |
| **Chi phí** | $0 (dev) → $5-30/mo (prod) |

---

## 📋 Tóm tắt yêu cầu

| Yêu cầu | Chi tiết |
|---------|----------|
| **Users** | ~500 nhân viên + 10 admin |
| **Concurrent** | ≥ 50 người check-in cùng lúc |
| **Realtime** | WebSocket cho danh sách check-in |
| **QR** | Generate + Scan QR codes |
| **Export** | Excel reports |
| **Devices** | Desktop, Tablet, Mobile (responsive web) |

---

## 🎯 ĐỀ XUẤT TECH STACK (Recommended)

### Option A: Modern Full-Stack (⭐ Recommended)

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  Next.js 14 (App Router) + TypeScript + Tailwind CSS        │
│  + shadcn/ui + React Query + Zustand                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        BACKEND                               │
│  Node.js + Express/Fastify + TypeScript                     │
│  + Prisma ORM + Socket.io (Realtime)                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        DATABASE                              │
│  PostgreSQL (Supabase/Neon) + Redis (Upstash)               │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                        CLOUD                                 │
│  Vercel (Frontend) + Railway/Render (Backend)               │
└─────────────────────────────────────────────────────────────┘
```

#### Chi tiết từng layer:

| Layer | Technology | Lý do chọn |
|-------|------------|------------|
| **Frontend** | Next.js 14 | SSR, App Router, tối ưu SEO, Fast |
| **UI Library** | shadcn/ui + Tailwind | Beautiful, customizable, no vendor lock |
| **State** | Zustand + React Query | Lightweight, server state caching |
| **Backend** | Express.js + TypeScript | Mature, nhiều middleware, dễ hire |
| **ORM** | Prisma | Type-safe, migrations, great DX |
| **Realtime** | Socket.io | Stable, fallback support |
| **Database** | PostgreSQL | ACID, reliable, free tier available |
| **Cache** | Redis (Upstash) | Session, realtime pub/sub |
| **QR** | qrcode.js + html5-qrcode | Generate + Scan |
| **Excel** | ExcelJS | Feature-rich, streaming |
| **Auth** | JWT + bcrypt | Standard, stateless |

#### Cloud Services:

| Service | Provider | Free Tier | Paid |
|---------|----------|-----------|------|
| Frontend | **Vercel** | 100GB bandwidth | $20/mo |
| Backend | **Railway** | $5 credit/mo | ~$10/mo |
| Database | **Supabase** | 500MB, 2 projects | $25/mo |
| Redis | **Upstash** | 10K commands/day | $10/mo |
| **Total** | | **~$0-5/mo** | **~$65/mo** |

---

### Option B: All-in-One Supabase

```
┌─────────────────────────────────────────────────────────────┐
│  Next.js 14 + Supabase (Auth + DB + Realtime + Storage)     │
└─────────────────────────────────────────────────────────────┘
```

| Pros | Cons |
|------|------|
| ✅ Nhanh setup | ❌ Vendor lock-in |
| ✅ Auth built-in | ❌ Giới hạn customization |
| ✅ Realtime built-in | ❌ Khó migrate sau |
| ✅ Free tier generous | ❌ Business logic trong DB |

---

### Option C: Enterprise (.NET Core)

```
┌─────────────────────────────────────────────────────────────┐
│  React/Angular + ASP.NET Core + SQL Server + Azure         │
└─────────────────────────────────────────────────────────────┘
```

| Pros | Cons |
|------|------|
| ✅ Enterprise-ready | ❌ Chi phí cao hơn |
| ✅ Tích hợp Azure AD | ❌ Cần .NET developers |
| ✅ SQL Server integration | ❌ Setup phức tạp hơn |

---

### Option D: Self-Hosted (On-Premise) ⭐ NEW

```
┌─────────────────────────────────────────────────────────────┐
│                     YOUR SERVER                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    NGINX                             │    │
│  │            (Reverse Proxy + SSL)                    │    │
│  └─────────────────────────────────────────────────────┘    │
│                          │                                   │
│            ┌─────────────┴─────────────┐                    │
│            ▼                           ▼                    │
│  ┌─────────────────┐         ┌─────────────────┐           │
│  │   Frontend      │         │    Backend      │           │
│  │   (Next.js)     │         │   (Express)     │           │
│  │   Port 3000     │         │   Port 4000     │           │
│  └─────────────────┘         └─────────────────┘           │
│                                      │                      │
│                    ┌─────────────────┴─────────────────┐   │
│                    ▼                                   ▼   │
│          ┌─────────────────┐               ┌───────────┐   │
│          │   PostgreSQL    │               │   Redis   │   │
│          │   Port 5432     │               │   6379    │   │
│          └─────────────────┘               └───────────┘   │
│                                                             │
│  All running in Docker containers                          │
└─────────────────────────────────────────────────────────────┘
```

#### Yêu cầu Server:

| Yêu cầu | Minimum | Recommended |
|---------|---------|-------------|
| **CPU** | 2 cores | 4 cores |
| **RAM** | 4 GB | 8 GB |
| **Storage** | 20 GB SSD | 50 GB SSD |
| **OS** | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS |
| **Network** | 100 Mbps | 1 Gbps |

#### Chi phí Self-Host:

| Hạng mục | Chi phí 1 lần | Chi phí/tháng |
|----------|---------------|---------------|
| VPS (nếu thuê) | - | $10-30/mo |
| Server on-premise | $500-2000 | $0 (điện + internet) |
| Domain + SSL | $10-20/năm | ~$1/mo |
| **Total (VPS)** | | **$11-31/mo** |
| **Total (On-premise)** | $500-2000 | **~$5/mo** |

#### Docker Compose (Self-Host):

```yaml
# docker-compose.yml
version: '3.8'

services:
  # PostgreSQL Database
  postgres:
    image: postgres:16-alpine
    container_name: meal-db
    environment:
      POSTGRES_USER: meal_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: meal_management
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    restart: unless-stopped

  # Redis for sessions + realtime
  redis:
    image: redis:7-alpine
    container_name: meal-redis
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    restart: unless-stopped

  # Backend API
  api:
    build:
      context: ./apps/api
      dockerfile: Dockerfile
    container_name: meal-api
    environment:
      DATABASE_URL: postgresql://meal_user:${DB_PASSWORD}@postgres:5432/meal_management
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    ports:
      - "4000:4000"
    depends_on:
      - postgres
      - redis
    restart: unless-stopped

  # Frontend
  web:
    build:
      context: ./apps/web
      dockerfile: Dockerfile
    container_name: meal-web
    environment:
      NEXT_PUBLIC_API_URL: http://api:4000
    ports:
      - "3000:3000"
    depends_on:
      - api
    restart: unless-stopped

  # Nginx Reverse Proxy
  nginx:
    image: nginx:alpine
    container_name: meal-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx/nginx.conf:/etc/nginx/nginx.conf
      - ./nginx/ssl:/etc/nginx/ssl
      - ./nginx/logs:/var/log/nginx
    depends_on:
      - web
      - api
    restart: unless-stopped

volumes:
  postgres_data:
  redis_data:
```

#### Nginx Config:

```nginx
# nginx/nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server web:3000;
    }
    
    upstream backend {
        server api:4000;
    }

    server {
        listen 80;
        server_name meal.yourcompany.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name meal.yourcompany.com;

        ssl_certificate /etc/nginx/ssl/fullchain.pem;
        ssl_certificate_key /etc/nginx/ssl/privkey.pem;

        # Frontend
        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        # API
        location /api {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        # WebSocket for realtime
        location /socket.io {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }
}
```

| Pros | Cons |
|------|------|
| ✅ Full control | ❌ Cần quản lý server |
| ✅ Data stays on-premise | ❌ Tự backup/restore |
| ✅ No recurring cloud cost | ❌ Cần IT support |
| ✅ Comply với policy công ty | ❌ SSL/Domain setup |
| ✅ Faster (local network) | ❌ Downtime nếu server hỏng |

---

## 📊 SO SÁNH 4 OPTIONS

| Tiêu chí | Option A (Node Cloud) | Option B (Supabase) | Option C (.NET) | Option D (Self-Host) |
|----------|----------------------|---------------------|-----------------|----------------------|
| **Setup time** | 2-3 ngày | 1 ngày | 3-5 ngày | 1-2 ngày |
| **Learning curve** | Medium | Low | High | Medium |
| **Flexibility** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Cost (dev)** | $0-65/mo | $0-25/mo | $50-200/mo | $0/mo |
| **Cost (prod)** | $65+/mo | $25+/mo | $100+/mo | $5-30/mo |
| **Scalability** | ⭐⭐⭐⭐ | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Data control** | Cloud provider | Cloud provider | Cloud provider | **Full control** |
| **Maintenance** | Managed | Managed | Managed | Self-manage |
| **Downtime risk** | Low | Low | Low | Medium |

### 🏆 Recommendation:

| Trường hợp | Chọn |
|------------|------|
| **Muốn nhanh, ít quản lý** | Option A (Cloud) |
| **MVP/Prototype nhanh** | Option B (Supabase) |
| **Enterprise, có team .NET** | Option C (.NET) |
| **Tự quản lý, data nội bộ, tiết kiệm** | **Option D (Self-Host) ⭐** |

### Nếu chọn Self-Host (Option D):

**Ưu điểm:**
- ✅ Data ở trong công ty - không lo bảo mật
- ✅ Chạy nội mạng - nhanh hơn
- ✅ Không phụ thuộc internet
- ✅ Chi phí thấp sau đầu tư ban đầu
- ✅ Dễ tích hợp với hệ thống nội bộ (HRM, Payroll)

**Yêu cầu:**
- Server/VPS với Ubuntu + Docker
- Có người IT quản lý (hoặc script tự động)
- Domain nội bộ hoặc public (nếu cần truy cập từ xa)

---

## 📦 CHI TIẾT PACKAGES

### Frontend (Next.js 14)

```json
{
  "dependencies": {
    "next": "^14.1.0",
    "react": "^18.2.0",
    "typescript": "^5.3.0",
    "@tanstack/react-query": "^5.17.0",
    "zustand": "^4.5.0",
    "tailwindcss": "^3.4.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "lucide-react": "^0.312.0",
    "html5-qrcode": "^2.3.8",
    "qrcode": "^1.5.3",
    "date-fns": "^3.2.0",
    "zod": "^3.22.0",
    "react-hook-form": "^7.49.0"
  }
}
```

### Backend (Express + TypeScript)

```json
{
  "dependencies": {
    "express": "^4.18.0",
    "typescript": "^5.3.0",
    "@prisma/client": "^5.8.0",
    "socket.io": "^4.7.0",
    "jsonwebtoken": "^9.0.0",
    "bcrypt": "^5.1.0",
    "zod": "^3.22.0",
    "exceljs": "^4.4.0",
    "qrcode": "^1.5.3",
    "cors": "^2.8.5",
    "helmet": "^7.1.0",
    "morgan": "^1.10.0",
    "dotenv": "^16.3.0"
  },
  "devDependencies": {
    "prisma": "^5.8.0",
    "tsx": "^4.7.0",
    "vitest": "^1.2.0"
  }
}
```

---

## 🗄️ DATABASE SCHEMA (Prisma)

```prisma
// schema.prisma

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Department {
  id        String     @id @default(cuid())
  name      String     @unique
  employees Employee[]
  createdAt DateTime   @default(now())
}

model Position {
  id        String     @id @default(cuid())
  name      String     @unique
  employees Employee[]
  createdAt DateTime   @default(now())
}

model Employee {
  id           String         @id @default(cuid())
  employeeCode String         @unique
  fullName     String
  email        String?        @unique
  department   Department     @relation(fields: [departmentId], references: [id])
  departmentId String
  position     Position       @relation(fields: [positionId], references: [id])
  positionId   String
  account      Account?
  registrations Registration[]
  checkins     CheckinLog[]
  createdAt    DateTime       @default(now())
  updatedAt    DateTime       @updatedAt
}

model Account {
  id           String   @id @default(cuid())
  employee     Employee @relation(fields: [employeeId], references: [id])
  employeeId   String   @unique
  passwordHash String
  secretCode   String   @db.VarChar(6)
  role         Role     @default(EMPLOYEE)
  isActive     Boolean  @default(true)
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}

enum Role {
  EMPLOYEE
  ADMIN_KITCHEN
  ADMIN_SYSTEM
  HR
}

model MealEvent {
  id            String         @id @default(cuid())
  mealDate      DateTime       @db.Date
  mealType      MealType
  status        MealStatus     @default(DRAFT)
  qrToken       String?        @unique
  qrGeneratedAt DateTime?
  registrations Registration[]
  checkins      CheckinLog[]
  guests        Guest[]
  ingredients   Ingredient[]
  menuItems     MenuItem[]
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt

  @@unique([mealDate, mealType])
}

enum MealType {
  LUNCH
  DINNER
}

enum MealStatus {
  DRAFT
  IN_PROGRESS
  COMPLETED
}

model Registration {
  id           String    @id @default(cuid())
  mealEvent    MealEvent @relation(fields: [mealEventId], references: [id])
  mealEventId  String
  employee     Employee  @relation(fields: [employeeId], references: [id])
  employeeId   String
  isCancelled  Boolean   @default(false)
  cancelledBy  String?
  createdAt    DateTime  @default(now())

  @@unique([mealEventId, employeeId])
}

model CheckinLog {
  id          String    @id @default(cuid())
  mealEvent   MealEvent @relation(fields: [mealEventId], references: [id])
  mealEventId String
  employee    Employee? @relation(fields: [employeeId], references: [id])
  employeeId  String?
  guest       Guest?    @relation(fields: [guestId], references: [id])
  guestId     String?
  checkinTime DateTime  @default(now())
  method      CheckinMethod

  @@unique([mealEventId, employeeId])
}

enum CheckinMethod {
  QR_SCAN
  MANUAL
  SELF_SCAN
}

model Guest {
  id          String       @id @default(cuid())
  mealEvent   MealEvent    @relation(fields: [mealEventId], references: [id])
  mealEventId String
  fullName    String
  note        String?
  qrToken     String       @unique
  checkins    CheckinLog[]
  createdAt   DateTime     @default(now())
}

model Ingredient {
  id          String    @id @default(cuid())
  mealEvent   MealEvent @relation(fields: [mealEventId], references: [id])
  mealEventId String
  name        String
  quantity    Float
  unit        String
  unitPrice   Float
  totalPrice  Float
}

model MenuItem {
  id          String    @id @default(cuid())
  mealEvent   MealEvent @relation(fields: [mealEventId], references: [id])
  mealEventId String
  name        String
}

model SystemConfig {
  id        String   @id @default(cuid())
  key       String   @unique
  value     String
  updatedAt DateTime @updatedAt
}

model RegistrationPreset {
  id       String @id @default(cuid())
  name     String @unique
  mealType String
  weekdays String
}
```

---

## 📁 CẤU TRÚC THƯ MỤC

```
meal-management/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── app/
│   │   │   ├── (auth)/
│   │   │   │   ├── login/
│   │   │   │   └── change-password/
│   │   │   ├── (employee)/
│   │   │   │   ├── calendar/
│   │   │   │   ├── my-qr/
│   │   │   │   └── scan/
│   │   │   ├── (kitchen)/
│   │   │   │   ├── meals/
│   │   │   │   ├── checkin/
│   │   │   │   └── reports/
│   │   │   ├── (admin)/
│   │   │   │   ├── accounts/
│   │   │   │   └── settings/
│   │   │   └── layout.tsx
│   │   ├── components/
│   │   │   ├── ui/
│   │   │   ├── calendar/
│   │   │   ├── qr/
│   │   │   └── forms/
│   │   ├── lib/
│   │   │   ├── api.ts
│   │   │   ├── auth.ts
│   │   │   └── utils.ts
│   │   └── package.json
│   │
│   └── api/                    # Express Backend
│       ├── src/
│       │   ├── routes/
│       │   │   ├── auth.ts
│       │   │   ├── accounts.ts
│       │   │   ├── registrations.ts
│       │   │   ├── meals.ts
│       │   │   ├── checkin.ts
│       │   │   ├── reports.ts
│       │   │   └── config.ts
│       │   ├── middleware/
│       │   │   ├── auth.ts
│       │   │   └── rbac.ts
│       │   ├── services/
│       │   │   ├── qr.service.ts
│       │   │   ├── excel.service.ts
│       │   │   └── realtime.service.ts
│       │   ├── socket/
│       │   │   └── checkin.socket.ts
│       │   └── index.ts
│       ├── prisma/
│       │   ├── schema.prisma
│       │   └── seed.ts
│       └── package.json
│
├── packages/
│   └── shared/
│       ├── types/
│       └── validators/
│
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🚀 DEPLOYMENT PLAN

### Development (Local)

```bash
docker-compose up -d
cd apps/api && npx prisma migrate dev
cd apps/api && npm run dev
cd apps/web && npm run dev
```

### Staging (Cloud)

| Service | Provider |
|---------|----------|
| Frontend | Vercel |
| Backend | Railway |
| Database | Supabase |
| Redis | Upstash |

---

## 📅 TIMELINE MAPPING

| Sprint | Focus | Tech Tasks |
|--------|-------|------------|
| **1-2** | Auth + Account | Setup project, Prisma, Auth API, Login UI |
| **3-4** | Registration | Calendar component, Preset logic, API |
| **5-6** | Meal Management | CRUD meals, NVL, Menu, Tabs UI |
| **7-8** | Check-in | QR scan, Socket.io realtime, Sound |
| **9-10** | Reports | Excel export, Charts, Filter |
| **11-12** | QA | Testing, Bug fixes, Performance |
| **13-14** | Pilot | Deploy prod, Training, Go-live |

---

## ✅ NEXT STEPS

1. **Confirm tech stack** - Chọn Option A/B/C
2. **Setup repositories** - Create GitHub repos
3. **Setup cloud services** - Vercel, Railway, Supabase
4. **Initialize projects** - Boilerplate code
5. **Start Sprint 1** - Auth + Account module
