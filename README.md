# EcommerceApp

A full-stack ecommerce application with a **React** frontend and **FastAPI** (Python) backend, backed by **MongoDB**.

> **Branch strategy**
> - `main` — original Node.js/Express backend (stable, untouched)
> - `dev`  — FastAPI Python backend (this branch)

---

## Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, Redux Toolkit (RTK Query), Bootstrap 5 |
| Backend | FastAPI (Python 3.11+), Uvicorn |
| ODM | Beanie (async MongoDB ODM) |
| Database | MongoDB (Motor async driver) |
| Auth | python-jose (JWT) + passlib (bcrypt) |
| Email | aiosmtplib (async SMTP) |
| Linting | ruff |
| CI | GitHub Actions |

---

## Project Structure

```
EcommerceApp/
├── Backend/
│   ├── app.py                      # FastAPI application entry point
│   ├── config/
│   │   ├── config.env              # Environment variables (not committed)
│   │   └── dbConnect.py            # MongoDB connection (Motor + Beanie)
│   ├── models/
│   │   ├── user.py                 # User Beanie Document
│   │   ├── product.py              # Product Beanie Document
│   │   └── order.py                # Order Beanie Document
│   ├── routes/
│   │   ├── auth.py                 # Auth APIRouter (13 routes)
│   │   ├── products.py             # Products APIRouter (5 routes)
│   │   ├── order.py                # Orders APIRouter (6 routes)
│   │   └── productreview.py        # Reviews APIRouter (3 routes)
│   ├── controllers/
│   │   ├── authControllers.py
│   │   ├── productControllers.py
│   │   ├── orderControllers.py
│   │   └── productreviewControllers.py
│   ├── middleware/
│   │   ├── auth.py                 # is_authenticated_user + authorize_roles
│   │   └── middleware.py           # Global exception handlers
│   └── utils/
│       ├── errorHandler.py         # ErrorHandler(message, status_code)
│       ├── apiFilters.py           # Search / filter / pagination
│       ├── sendToken.py            # JWT cookie helper
│       ├── sendEmail.py            # Async SMTP email sender
│       └── emailTemplates.py       # Password reset HTML template
├── frontend/                       # React frontend (unchanged)
├── requirements.txt                # Pinned Python dependencies
├── .env.example                    # Environment variable template
└── .github/workflows/ci.yml       # GitHub Actions CI pipeline
```

---

## Setup & Running

### Prerequisites
- Python 3.11+
- MongoDB running locally (or Atlas URI)
- Node.js 18+ (for the React frontend)

### Backend (FastAPI)

```bash
# 1. Create and activate a virtual environment
python -m venv venv
source venv/bin/activate        # macOS/Linux
# venv\Scripts\activate         # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment variables
cp .env.example Backend/config/config.env
# Open Backend/config/config.env and fill in your values

# 4. Start the server (development, auto-reload)
uvicorn Backend.app:app --reload --port 4000
```

| URL | Description |
|-----|-------------|
| `http://localhost:4000/api/v1/...` | All API endpoints |
| `http://localhost:4000/health` | Liveness probe → `{"status": "ok"}` |
| `http://localhost:4000/docs` | Swagger UI (interactive) |
| `http://localhost:4000/redoc` | ReDoc UI |

### Frontend (React)

```bash
cd frontend/frontend
npm install
npm start
```

The React app runs at `http://localhost:3000` and proxies all `/api/v1` calls to port 4000 — no config changes needed.

---

## API Endpoints

All endpoints carry the `/api/v1` prefix.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/products` | No | List products (keyword, price, category, page) |
| GET | `/products/:id` | No | Product detail |
| POST | `/admin/products` | Admin | Create product |
| PUT | `/admin/products/:id` | Admin | Update product |
| DELETE | `/admin/products/:id` | Admin | Delete product |
| POST | `/register` | No | Register user |
| POST | `/login` | No | Login |
| POST | `/logout` | No | Logout (clears cookie) |
| GET | `/me` | User | Current user profile |
| PUT | `/me/updateprofile` | User | Update profile |
| PUT | `/me/upload_avatar` | User | Upload avatar |
| PUT | `/password/update` | User | Change password |
| POST | `/password/forgot` | No | Send reset email |
| PUT | `/password/reset/:token` | No | Reset password |
| GET | `/admin/users` | Admin | List all users |
| GET | `/admin/userid/:id` | Admin | Get user by ID |
| PUT | `/admin/user/update/:id` | Admin | Update user |
| DELETE | `/admin/user/delete/:id` | Admin | Delete user |
| POST | `/order/new` | User | Create order |
| GET | `/order/getdetails/:id` | User | Order detail |
| GET | `/order/all/me` | User | My orders |
| GET | `/admin/order` | Admin | All orders |
| PUT | `/admin/order/update/:id` | Admin | Update order status |
| DELETE | `/admin/order/delete/:id` | Admin | Delete order |
| PUT | `/reviews` | User | Add/update review |
| GET | `/product/reviews/:id` | User | Get product reviews |
| DELETE | `/products/:productId/reviews/:reviewId` | Admin | Delete review |
| GET | `/health` | No | Health check |

---

## How It Works: Node.js vs FastAPI

### Framework

**Before (Node.js/Express):**
```js
const app = express();
app.use(express.json());
app.use('/api/v1', productRouter);
app.listen(process.env.PORT);
```

**After (FastAPI):**
```python
app = FastAPI()
app.include_router(products_router)  # prefix="/api/v1" is set on the router
uvicorn Backend.app:app --port 4000
```

### Authentication middleware

**Before (Express middleware):**
```js
exports.isAuthenticatedUser = catchAsyncErrors(async (req, res, next) => {
  const token = req.cookies.token;
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  req.user = await User.findById(decoded.id);
  next();
});
```

**After (FastAPI dependency):**
```python
async def is_authenticated_user(request: Request) -> User:
    token = request.cookies.get("token")
    payload = jwt.decode(token, os.getenv("JWT_SECRET"), algorithms=["HS256"])
    return await User.get(payload["id"])

# Used on any route:
@router.get("/me")
async def me(current_user: User = Depends(is_authenticated_user)):
    ...
```

### Database models

**Before (Mongoose):**
```js
const userSchema = new mongoose.Schema({ name: String, email: String, ... });
module.exports = mongoose.model('User', userSchema);
```

**After (Beanie):**
```python
class User(Document):
    name: str
    email: str
    ...
    class Settings:
        collection = "users"
```

### Error handling

**Before (Express):**
```js
class ErrorHandler extends Error {
  constructor(message, statusCode) { ... }
}
// Central middleware: app.use((err, req, res, next) => res.status(err.statusCode).json({...}))
```

**After (FastAPI):**
```python
class ErrorHandler(HTTPException):
    def __init__(self, message, status_code):
        super().__init__(status_code=status_code, detail=message)

# Registered globally:
app.add_exception_handler(ErrorHandler, error_handler)
```

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
- [x] GitHub Actions CI pipeline

**Conversion complete.** All 27 API endpoints are live on FastAPI.

---

## Deliberate Fixes Over the Original Node.js Code

Two bugs from the Node.js backend were fixed during migration to match the React frontend:

| # | Bug | Original | Fixed |
|---|-----|----------|-------|
| 1 | Logout HTTP method | `GET /api/v1/logout` | `POST /api/v1/logout` |
| 2 | Update password path | `PUT /api/v1/me/updatepassword` | `PUT /api/v1/password/update` |

Both fixes are needed because the React frontend was already calling the correct paths — the Node.js backend was the one that was wrong.

---

## CI / Linting

GitHub Actions runs on every push to `dev` and `main`, and on PRs to `main`:

```yaml
- pip install -r requirements.txt
- ruff check Backend/    # linting
```

To run locally:
```bash
ruff check Backend/
```
