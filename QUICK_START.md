# StockMaster Quick Start Guide

Get up and running in 5 minutes!

## Prerequisites Check

- ✅ Node.js 18+ installed
- ✅ PostgreSQL 14+ installed and running
- ✅ Git installed

## Quick Setup

### 1. Database (2 minutes)

```sql
-- Open PostgreSQL and run:
CREATE DATABASE stockmaster;
```

### 2. Backend (2 minutes)

```bash
cd backend
npm install

# Create .env file
cp .env.example .env
# Edit .env with your PostgreSQL password

# Run migrations
npm run migrate

# Seed data (optional but recommended)
npm run seed

# Start server
npm run dev
```

### 3. Frontend (1 minute)

```bash
# In a new terminal
cd frontend
npm install

# Create .env.local
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Start frontend
npm run dev
```

### 4. Login

1. Open `http://localhost:3000`
2. Login with:
   - Email: `admin@stockmaster.com`
   - Password: `Admin123!`

## That's It! 🎉

You now have a fully functional inventory management system running locally.

## What's Included

✅ User authentication (JWT + OTP)
✅ Product management
✅ Stock receipts (incoming)
✅ Stock deliveries (outgoing)
✅ Internal transfers
✅ Stock adjustments
✅ Real-time dashboard with KPIs
✅ Complete audit trail (ledger)
✅ Multi-warehouse support

## Next Steps

1. **Explore the Dashboard** - See KPIs and analytics
2. **Add Products** - Go to Products page
3. **Create a Receipt** - Add incoming stock
4. **View History** - Check the ledger for all movements

## Need Help?

- Full setup: See `SETUP_INSTRUCTIONS.md`
- API docs: See `API_DOCUMENTATION.md`
- Database schema: See `ER_DIAGRAM.md`

## Troubleshooting

**Backend won't start?**
- Check PostgreSQL is running
- Verify `.env` has correct database credentials

**Frontend can't connect?**
- Ensure backend is running on port 5000
- Check `NEXT_PUBLIC_API_URL` in `.env.local`

**Database errors?**
- Run migrations: `npm run migrate` in backend folder
- Check PostgreSQL service is running

