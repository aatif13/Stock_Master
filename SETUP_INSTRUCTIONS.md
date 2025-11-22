# StockMaster Setup Instructions

Complete step-by-step guide to set up and run the StockMaster Inventory Management System.

## Prerequisites

Before starting, ensure you have the following installed:

- **Node.js** 18+ ([Download](https://nodejs.org/))
- **PostgreSQL** 14+ ([Download](https://www.postgresql.org/download/))
- **Git** ([Download](https://git-scm.com/))
- **npm** or **yarn** (comes with Node.js)

## Step 1: Database Setup

### 1.1 Create PostgreSQL Database

Open PostgreSQL command line or pgAdmin and run:

```sql
CREATE DATABASE stockmaster;
```

### 1.2 Note Your Database Credentials

You'll need:
- Database name: `stockmaster`
- Username: (usually `postgres`)
- Password: (your PostgreSQL password)
- Host: `localhost`
- Port: `5432` (default)

## Step 2: Backend Setup

### 2.1 Navigate to Backend Directory

```bash
cd backend
```

### 2.2 Install Dependencies

```bash
npm install
```

### 2.3 Configure Environment Variables

Create a `.env` file in the `backend/` directory:

```bash
cp .env.example .env
```

Edit `.env` with your database credentials:

```env
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=stockmaster
DB_USER=postgres
DB_PASSWORD=your_postgres_password

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Email Configuration (Gmail example)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
EMAIL_FROM=noreply@stockmaster.com

# OTP Configuration
OTP_EXPIRE_MINUTES=10
```

**Important Notes:**
- Replace `your_postgres_password` with your actual PostgreSQL password
- For Gmail, you need to generate an [App Password](https://support.google.com/accounts/answer/185833)
- Change `JWT_SECRET` to a strong random string

### 2.4 Run Database Migrations

```bash
npm run migrate
```

This will create all necessary tables in your database.

### 2.5 (Optional) Seed Sample Data

```bash
npm run seed
```

This creates:
- Admin user: `admin@stockmaster.com` / `Admin123!`
- Sample categories, warehouses, locations, and products

### 2.6 Start Backend Server

```bash
npm run dev
```

The backend will run on `http://localhost:5000`

You should see:
```
✅ Connected to PostgreSQL database
🚀 Server running on port 5000
```

## Step 3: Frontend Setup

### 3.1 Navigate to Frontend Directory

Open a new terminal window and navigate to:

```bash
cd frontend
```

### 3.2 Install Dependencies

```bash
npm install
```

### 3.3 Configure Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 3.4 Start Frontend Development Server

```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## Step 4: Access the Application

1. Open your browser and go to `http://localhost:3000`
2. You'll be redirected to the login page
3. If you ran the seed script, use:
   - Email: `admin@stockmaster.com`
   - Password: `Admin123!`
4. Or register a new account

## Step 5: Verify Everything Works

### Backend Health Check

Visit: `http://localhost:5000/health`

Should return: `{"status":"ok","timestamp":"..."}`

### Test API Endpoint

```bash
curl http://localhost:5000/api/meta/warehouses
```

Should return JSON (may be empty if no data seeded)

## Troubleshooting

### Database Connection Issues

1. **Check PostgreSQL is running:**
   ```bash
   # Windows
   services.msc (look for PostgreSQL service)
   
   # Mac/Linux
   sudo systemctl status postgresql
   ```

2. **Verify credentials in `.env` file**

3. **Test connection manually:**
   ```bash
   psql -U postgres -d stockmaster
   ```

### Port Already in Use

If port 5000 or 3000 is already in use:

1. **Backend:** Change `PORT` in `backend/.env`
2. **Frontend:** Update `NEXT_PUBLIC_API_URL` in `frontend/.env.local` to match

### Email Not Working

1. For Gmail, ensure you're using an App Password, not your regular password
2. Check firewall/antivirus isn't blocking SMTP
3. Verify email credentials in `.env`

### Frontend Can't Connect to Backend

1. Ensure backend is running on port 5000
2. Check `NEXT_PUBLIC_API_URL` in `frontend/.env.local`
3. Check browser console for CORS errors (shouldn't happen with current setup)

## Development Commands

### Backend

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm run migrate    # Run database migrations
npm run seed       # Seed sample data
```

### Frontend

```bash
npm run dev        # Start development server
npm run build      # Build for production
npm start          # Start production server
npm run lint       # Run ESLint
```

## Production Deployment

### Backend

1. Set `NODE_ENV=production` in `.env`
2. Use a process manager like PM2:
   ```bash
   npm install -g pm2
   pm2 start src/app.js --name stockmaster-backend
   ```

### Frontend

1. Build the application:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm start
   ```

Or deploy to Vercel/Netlify (recommended for Next.js)

## Next Steps

1. **Create Categories:** Go to Products → Add Product → Select/Create Category
2. **Add Warehouses:** Use API or database directly
3. **Add Locations:** Use API or database directly
4. **Create Products:** Dashboard → Products → Add Product
5. **Create Receipts:** Dashboard → Receipts → New Receipt
6. **View Dashboard:** See KPIs and analytics

## Support

For issues or questions:
1. Check the API documentation in `API_DOCUMENTATION.md`
2. Review the ER diagram in `ER_DIAGRAM.md`
3. Check browser console and server logs for errors

## Security Notes

⚠️ **Important for Production:**

1. Change all default passwords
2. Use strong `JWT_SECRET`
3. Enable HTTPS
4. Set up proper CORS policies
5. Use environment variables for all secrets
6. Regularly update dependencies
7. Implement rate limiting
8. Add input sanitization
9. Use prepared statements (already implemented)
10. Regular database backups

