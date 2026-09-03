# Requirement Analysis Document — Blinkit Clone (Django + React)

## 1. Project Overview

This project is a clone of Blinkit (a quick-commerce grocery delivery platform), built as a technical assignment for a company hiring round. The application has **two user panels**: an **Admin Panel** and a **Customer Panel**, sharing the same product catalog and order data.

**Tech Stack:**
- Backend: Django + Django REST Framework (DRF)
- Frontend: React (with React Router for navigation)
- Database: SQLite (default, can be swapped for PostgreSQL)
- Authentication: JWT (JSON Web Tokens) via `djangorestframework-simplejwt`
- API style: RESTful JSON APIs consumed by React frontend

**Deployment context:** This is a time-boxed assignment (not a production system), so scope is deliberately kept minimal but functionally complete.

---

## 2. User Roles

### 2.1 Admin
- Exactly **one** admin account, pre-created in the backend (via `createsuperuser` or a fixture). Admin does **not** register through a signup form.
- Admin logs in through the same login endpoint as customers; the response includes a `role` field that the frontend uses to route the user to the correct panel.
- Admin has full control over the product catalog.

### 2.2 Customer
- Customers register via a signup form (`role` is hardcoded to `customer` server-side; users cannot self-assign the admin role).
- After login, customers can browse, search, filter, purchase, and view their own orders.

---

## 3. Functional Requirements

### 3.1 Authentication & Authorization
- Signup (customer only) — email/username, password, basic profile info.
- Login (shared endpoint for admin and customer) — returns a JWT access/refresh token pair and the user's role.
- Role-based access control (RBAC):
  - Only `role == admin` can create, update, or delete products.
  - Any authenticated user can view products (public read access).
  - Only authenticated customers can access cart, checkout, and order endpoints.
- Protected routes on the frontend: unauthenticated users are redirected to login; customers cannot access `/admin/*` routes and vice versa.

### 3.2 Admin Panel
- **Add** a new product (name, description, price, stock quantity, category, image).
- **Update** an existing product's details.
- **Delete** a product.
- **Retrieve/List** all products (with basic table view — name, price, stock, category, actions).

### 3.3 Customer Panel
- **Signup / Login** with validation and error handling.
- **Browse products** — home page listing all available products.
- **Search** products by name/keyword.
- **Filter** products by category and price range.
- **Add items to cart**, update quantity, remove items.
- **Checkout / Buy** — convert cart into an order.
- **Payment** — simulated/mock payment flow (no real payment gateway integration required for this assignment); on "successful" payment, order status is updated to `paid`.
- *(Optional, if time permits)* View own order history ("My Orders").

---

## 4. Data Models (Entities)

| Model | Key Fields |
|---|---|
| **User** (extends Django's AbstractUser) | username, email, password, `role` (`admin` / `customer`) |
| **Category** | id, name |
| **Product** | id, name, description, price, stock, image, category (FK → Category) |
| **Cart** | id, user (FK → User, one active cart per customer) |
| **CartItem** | id, cart (FK → Cart), product (FK → Product), quantity |
| **Order** | id, user (FK → User), total_amount, status (`pending` / `paid`), created_at |
| **OrderItem** | id, order (FK → Order), product (FK → Product), quantity, price_at_purchase |

---

## 5. API Endpoints (REST, DRF)

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/signup/` | Public | Customer registration |
| POST | `/api/auth/login/` | Public | Login (admin or customer), returns JWT + role |
| GET | `/api/products/` | Public | List products (supports `?search=`, `?category=`, `?min_price=`, `?max_price=`) |
| GET | `/api/products/<id>/` | Public | Product detail |
| POST | `/api/products/` | Admin only | Create product |
| PUT/PATCH | `/api/products/<id>/` | Admin only | Update product |
| DELETE | `/api/products/<id>/` | Admin only | Delete product |
| GET | `/api/cart/` | Authenticated customer | View current cart |
| POST | `/api/cart/add/` | Authenticated customer | Add item to cart |
| DELETE | `/api/cart/remove/<item_id>/` | Authenticated customer | Remove item from cart |
| POST | `/api/orders/checkout/` | Authenticated customer | Create order from cart |
| POST | `/api/orders/<id>/pay/` | Authenticated customer | Mock payment, marks order as paid |
| GET | `/api/orders/` | Authenticated customer | List own orders (optional feature) |

---

## 6. Frontend Structure (React)

**Customer-facing routes:**
- `/signup`, `/login`
- `/` — Home (product list + search + filter bar)
- `/product/:id` — Product detail
- `/cart` — Cart view
- `/checkout` — Order summary + mock payment
- `/orders` — Order history (optional)

**Admin-facing routes:**
- `/admin/login` (or shared `/login` with role-based redirect)
- `/admin/dashboard` — Product table with Edit/Delete actions
- `/admin/products/add` — Add product form
- `/admin/products/edit/:id` — Edit product form

**State/Auth handling:** JWT stored client-side (localStorage), attached to API requests via Axios interceptor/default headers. A `ProtectedRoute` wrapper component enforces authentication and role checks.

---

## 7. Non-Functional Requirements

- Clean separation between backend (API-only) and frontend (consumes API over HTTP).
- Basic input validation on both frontend and backend (required fields, price/stock as positive numbers, etc.).
- CORS enabled on the Django backend so the React dev server can communicate with it.
- Code should be reasonably organized into Django apps (e.g., `accounts`, `products`, `orders`) rather than one monolithic app.

---

## 8. Out of Scope (Explicitly Not Required)

- Real payment gateway integration (Razorpay/Stripe/etc.) — a mock/simulated payment flow is sufficient.
- Delivery tracking, live location, or logistics features.
- Multiple admin accounts or admin self-registration.
- Advanced features like recommendations, ratings/reviews, wishlists, coupons (unless explicitly requested later).

---

## 9. Success Criteria

The assignment is considered complete when the following end-to-end flow works without errors:
1. Admin logs in and adds/edits/deletes at least a few products.
2. A new customer signs up and logs in.
3. Customer searches/filters products, adds items to cart, proceeds to checkout, and completes a mock payment.
4. Order is recorded in the database with correct items, quantity, and status.
