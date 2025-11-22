# StockMaster Inventory Management System

A comprehensive inventory management system built with Node.js, Express, PostgreSQL, and Next.js 14.

## Features

- ✅ User authentication with JWT and OTP password reset
- ✅ Product management (CRUD operations)
- ✅ Stock movements: Receipts, Deliveries, Transfers, Adjustments
- ✅ Real-time stock tracking with ledger
- ✅ Dashboard with KPIs and analytics
- ✅ Multi-warehouse and location support
- ✅ Email notifications via Nodemailer

## Tech Stack

**Backend:**
- Node.js + Express
- PostgreSQL
- JWT authentication
- Nodemailer for emails
- Joi for validation

**Frontend:**
- Next.js 14 (App Router)
- Tailwind CSS
- ShadCN UI components
- Lucide icons
- Axios for API calls

## Project Structure

```
stock/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── utils/
│   │   └── app.js
│   ├── migrations/
│   ├── seeds/
│   └── package.json
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── hooks/
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed and running
- Git

### 1. Database Setup

1. Create a PostgreSQL database:
```sql
CREATE DATABASE stockmaster;
```

2. Update `.env` file in `backend/` with your database credentials

3. Run migrations:
```bash
cd backend
npm run migrate
```

4. (Optional) Seed sample data:
```bash
npm run seed
```

### 2. Backend Setup

```bash
cd backend
npm install
npm run dev
```

Backend will run on `http://localhost:5000`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend will run on `http://localhost:3000`

## Environment Variables

### Backend (.env)

```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stockmaster
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@stockmaster.com

OTP_EXPIRE_MINUTES=10
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## API Endpoints

See `API_DOCUMENTATION.md` for complete API documentation.

## Default Credentials

After seeding:
- Email: admin@stockmaster.com
- Password: Admin123!

## License

MIT

