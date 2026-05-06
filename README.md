# EcommerceApp

A full-stack ecommerce application with a **React** frontend and **FastAPI** (Python) backend, backed by **MongoDB**.

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Redux Toolkit (RTK Query), Bootstrap 5 |
| Backend | FastAPI (Python), Uvicorn |
| ODM | Beanie (async Mongoose equivalent) |
| Database | MongoDB (Motor async driver) |
| Auth | python-jose (JWT) + passlib (bcrypt) |
| Email | aiosmtplib (async SMTP) |

---

## Project Structure

```
EcommerceApp/
├── Backend/                  # FastAPI backend (Python)
│   ├── app.py                # Application entry point
│   ├── config/
│   │   └── dbConnect.py      # MongoDB connection setup
│   ├── models/               # Beanie Document models
│   ├── routes/               # FastAPI APIRouter definitions
│   ├── controllers/          # Route handler functions
│   ├── middleware/           # Auth dependencies & error handlers
│   └── utils/                # Shared utilities
├── frontend/                 # React frontend (unchanged)
├── requirements.txt          # Python dependencies
├── .env.example              # Environment variable template
└── .github/workflows/        # CI pipeline
```

---

## Setup & Running

### Prerequisites
- Python 3.11+
- MongoDB running locally (or Atlas URI)
- Node.js 18+ (for the frontend)

### Backend (FastAPI)

```bash
# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy and configure environment variables
cp .env.example Backend/config/config.env
# Edit Backend/config/config.env with your values

# 4. Start the FastAPI server (development)
uvicorn Backend.app:app --reload --port 4000
```

The API will be available at `http://localhost:4000`
Swagger docs at `http://localhost:4000/docs`

### Frontend (React)

```bash
cd frontend/frontend
npm install
npm start
```

The React app runs at `http://localhost:3000` and proxies API calls to port 4000.

---

## API Endpoints

All endpoints are prefixed with `/api/v1`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/products` | No | List products (search, filter, paginate) |
| GET | `/products/:id` | No | Product details |
| POST | `/admin/products` | Admin | Create product |
| PUT | `/admin/products/:id` | Admin | Update product |
| DELETE | `/admin/products/:id` | Admin | Delete product |
| POST | `/register` | No | Register user |
| POST | `/login` | No | Login |
| POST | `/logout` | No | Logout |
| GET | `/me` | User | Current user profile |
| PUT | `/me/updateprofile` | User | Update profile |
| PUT | `/me/upload_avatar` | User | Upload avatar |
| PUT | `/password/update` | User | Change password |
| POST | `/password/forgot` | No | Forgot password email |
| PUT | `/password/reset/:token` | No | Reset password |
| POST | `/order/new` | User | Create order |
| GET | `/order/getdetails/:id` | User | Order details |
| GET | `/order/all/me` | User | My orders |
| PUT | `/reviews` | User | Add/update review |
| GET | `/product/reviews/:id` | User | Get reviews |
| DELETE | `/products/:productId/reviews/:reviewId` | Admin | Delete review |
| GET | `/health` | No | Health check |

---

## Conversion Progress

- [x] Project structure setup
- [x] .gitignore, requirements.txt, .env.example
- [x] User model converted
- [x] Product model converted
- [x] Order model converted
- [x] Database connection (dbConnect.py)
- [x] Utility files (errorHandler, apiFilters, sendToken, sendEmail, emailTemplates)
- [x] Auth middleware (isAuthenticatedUser, authorizeRoles)
- [x] Global error handler
- [x] Product routes & controllers
- [x] Auth routes & controllers
- [x] Order routes & controllers
- [x] Product review routes & controllers
- [x] App entry point (app.py) with health check
- [ ] GitHub Actions CI pipeline

---

## Background: Why Migrate from Node.js to Python/FastAPI?

The original backend was built with **Node.js + Express + Mongoose**. This migration replaces it with **Python + FastAPI + Beanie** to gain:

- **Automatic API docs** — FastAPI generates Swagger UI at `/docs` with zero extra work
- **Type safety** — Pydantic models validate all request/response data automatically
- **Async-first** — Motor (async MongoDB driver) + Beanie give full async support natively
- **Python ecosystem** — easier access to ML/data libraries if needed later

The React frontend is **completely unchanged** — all API paths, HTTP methods, and JSON shapes are identical.
