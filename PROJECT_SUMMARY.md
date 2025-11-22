# StockMaster Inventory Management System - Project Summary

## 🎯 Project Overview

StockMaster is a comprehensive, production-ready inventory management system built with modern web technologies. It provides complete stock tracking, multi-warehouse support, and real-time analytics.

## 📁 Project Structure

```
stock/
├── backend/                 # Node.js + Express API
│   ├── src/
│   │   ├── config/         # Database & email config
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth & error handling
│   │   ├── models/         # (Not used - direct DB queries)
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic (stock movements)
│   │   ├── utils/          # Validators
│   │   └── app.js          # Express app
│   ├── migrations/         # Database schema
│   ├── seeds/             # Sample data
│   └── package.json
│
├── frontend/               # Next.js 14 + Tailwind
│   ├── app/               # Next.js app router pages
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   └── layout/        # Layout components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities & API client
│   └── package.json
│
└── Documentation/
    ├── README.md
    ├── QUICK_START.md
    ├── SETUP_INSTRUCTIONS.md
    ├── API_DOCUMENTATION.md
    ├── ER_DIAGRAM.md
    └── postman_collection.json
```

## 🛠 Tech Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Database:** PostgreSQL 14+
- **Authentication:** JWT (JSON Web Tokens)
- **Email:** Nodemailer (Gmail SMTP)
- **Validation:** Joi
- **Password Hashing:** bcryptjs

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS
- **UI Components:** Custom (ShadCN-inspired)
- **Icons:** Lucide React
- **Charts:** Recharts
- **HTTP Client:** Axios
- **Date Handling:** date-fns

## ✨ Features

### Authentication & Security
- ✅ User registration and login
- ✅ JWT-based authentication
- ✅ OTP password reset via email
- ✅ Role-based access control (admin, user, manager)
- ✅ Protected routes

### Product Management
- ✅ Full CRUD operations
- ✅ SKU management
- ✅ Category organization
- ✅ Unit tracking
- ✅ Reorder level alerts

### Stock Movements
- ✅ **Receipts:** Incoming stock (increases inventory)
- ✅ **Deliveries:** Outgoing stock (decreases inventory)
- ✅ **Transfers:** Internal stock movement between warehouses
- ✅ **Adjustments:** Manual stock corrections

### Inventory Tracking
- ✅ Real-time stock levels per location
- ✅ Multi-warehouse support
- ✅ Location-based inventory
- ✅ Stock ledger (complete audit trail)
- ✅ Movement history with timestamps

### Dashboard & Analytics
- ✅ Key Performance Indicators (KPIs)
- ✅ Total products count
- ✅ Total stock quantity
- ✅ Low stock alerts
- ✅ Pending transactions
- ✅ Stock by category charts
- ✅ Movement trends (7-day)

### User Interface
- ✅ Modern, responsive design
- ✅ Dark mode ready (CSS variables)
- ✅ Intuitive navigation
- ✅ Real-time data updates
- ✅ Form validation
- ✅ Error handling
- ✅ Loading states

## 📊 Database Schema

### Core Tables
- `users` - User accounts and authentication
- `categories` - Product categories
- `warehouses` - Warehouse locations
- `locations` - Storage locations within warehouses
- `products` - Product catalog
- `stock` - Current stock levels (product + location)

### Transaction Tables
- `receipts` + `receipt_items` - Incoming stock
- `deliveries` + `delivery_items` - Outgoing stock
- `transfers` + `transfer_items` - Internal transfers
- `stock_adjustments` - Manual adjustments

### Audit Table
- `stock_ledger` - Complete movement history

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/send-otp`
- `POST /api/auth/reset-password`

### Products
- `POST /api/products` - Create
- `GET /api/products` - List (with search & pagination)
- `GET /api/products/:id` - Get details
- `PUT /api/products/:id` - Update
- `DELETE /api/products/:id` - Delete

### Stock Movements
- `POST /api/receipts` - Create receipt
- `PUT /api/receipts/:id/validate` - Validate & update stock
- `GET /api/receipts` - List receipts

- `POST /api/deliveries` - Create delivery
- `PUT /api/deliveries/:id/validate` - Validate & update stock
- `GET /api/deliveries` - List deliveries

- `POST /api/transfers` - Create transfer
- `PUT /api/transfers/:id/validate` - Validate & move stock
- `GET /api/transfers` - List transfers

- `POST /api/adjustments` - Create adjustment
- `GET /api/adjustments` - List adjustments

### Analytics
- `GET /api/dashboard/kpis` - Dashboard metrics
- `GET /api/ledger` - Stock movement history

### Meta Data
- `GET /api/meta/categories`
- `GET /api/meta/warehouses`
- `GET /api/meta/locations`

## 🚀 Getting Started

### Quick Start (5 minutes)
See `QUICK_START.md` for the fastest setup.

### Full Setup
See `SETUP_INSTRUCTIONS.md` for detailed instructions.

### API Testing
Import `postman_collection.json` into Postman for API testing.

## 📝 Key Business Logic

### Stock Movement Flow

1. **Receipt (Incoming)**
   - Create receipt with items → Status: `draft`
   - Validate receipt → Stock increases, Ledger entry created

2. **Delivery (Outgoing)**
   - Create delivery with items → Status: `draft`
   - Validate delivery → Stock decreases (if available), Ledger entry created

3. **Transfer (Internal)**
   - Create transfer with items → Status: `draft`
   - Validate transfer → Stock moves from source to destination, Ledger entries created

4. **Adjustment (Correction)**
   - Create adjustment → Stock updated immediately, Ledger entry created

### Stock Ledger
Every stock movement creates a ledger entry with:
- Product and location
- Movement type (receipt, delivery, transfer_in, transfer_out, adjustment)
- Quantity change
- Before/after quantities
- User who made the change
- Timestamp

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- OTP expiration (10 minutes)
- SQL injection prevention (parameterized queries)
- Input validation (Joi schemas)
- CORS configuration
- Error handling middleware

## 📈 Performance Considerations

- Database indexes on frequently queried columns
- Connection pooling (PostgreSQL)
- Pagination on list endpoints
- Efficient queries with JOINs
- Client-side caching (localStorage for auth)

## 🎨 UI/UX Features

- Responsive design (mobile-friendly)
- Loading states
- Error messages
- Form validation
- Modal dialogs
- Data tables with sorting
- Search functionality
- Real-time updates

## 📦 What's Included

✅ Complete backend API
✅ Complete frontend application
✅ Database schema with migrations
✅ Seed data script
✅ API documentation
✅ Postman collection
✅ ER diagram
✅ Setup instructions
✅ Quick start guide

## 🎓 Learning Resources

- Express.js: https://expressjs.com/
- Next.js: https://nextjs.org/docs
- PostgreSQL: https://www.postgresql.org/docs/
- Tailwind CSS: https://tailwindcss.com/docs

## 📄 License

MIT License - Feel free to use and modify as needed.

## 🙏 Credits

Built with:
- Express.js
- Next.js
- PostgreSQL
- Tailwind CSS
- And many other open-source libraries

---

**Ready to start?** Follow `QUICK_START.md` to get running in 5 minutes!

