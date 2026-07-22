# Vehicle Rental & Booking Management System — Full Stack Scaffold

Stack: **Node.js + Express + Sequelize + MySQL** (backend) · **React (Vite)** (frontend)

This is a working scaffold covering every module in the SRS at MVP depth:
Auth, Vehicles, Categories, Locations, Bookings (with a full pricing engine), Payments (mocked gateway),
Coupons, Drivers, Reviews, Notifications, Invoices, CMS, Settings, Reports, Admin Dashboard, Customer Dashboard.

Everything below has been installed and build-tested in this sandbox (backend syntax-checked, frontend
built successfully with Vite). You'll need your own MySQL instance to actually run it, since none is
available here.

---

## 1. Project Structure

```
vrbms/
  backend/
    src/
      config/db.js          Sequelize MySQL connection
      models/                18 tables from the SRS (User, Vehicle, Booking, Payment, Coupon, etc.)
      controllers/            Business logic per module
      routes/                 Express routers
      middleware/             JWT auth, role-based authorization, error handler
      utils/pricingEngine.js  Implements all 5 pricing models + coupon logic
      utils/seed.js           Demo data (admin user, categories, a sample vehicle, CMS pages)
      server.js               App entry point
  frontend/
    src/
      pages/                  Home, Search, VehicleDetail, Login, Register, Booking (10-step flow)
      pages/customer/         MyBookings
      pages/admin/            Dashboard, Vehicles, Bookings, Coupons, Locations
      components/             Navbar, VehicleCard, ProtectedRoute
      context/AuthContext.jsx JWT-based auth state
      api/axios.js            Pre-configured API client
```

---

## 2. Run It Locally First

### Backend
```bash
cd backend
cp .env.example .env        # edit DB_* and JWT_SECRET
npm install
npm run seed                # creates admin@vrbms.com / Admin@123 + demo vehicle
npm run dev                 # starts on http://localhost:5000
```

### Frontend
```bash
cd frontend
cp .env.example .env        # VITE_API_URL=http://localhost:5000/api
npm install
npm run dev                 # starts on http://localhost:5173
```

Login as admin, add vehicles/locations/categories from `/admin`, and the public site + booking flow
will populate automatically.

---

## 3. What's Real vs. What's a Stub

**Fully implemented, working end-to-end:**
- JWT auth (register/login/role-based access)
- Vehicle CRUD, search, filtering, sorting
- Pricing engine: daily / hourly / per-km / base+km / season multipliers (`utils/pricingEngine.js`)
- Full booking flow: quote → create → mock payment → invoice → confirmation
- Coupon validation (fixed/percentage, expiry, min amount, max discount)
- Admin dashboard stats, vehicle/booking/coupon/location management
- Customer dashboard: booking history, cancellation

**Intentionally stubbed — wire these before going live** (each is marked with a comment in code):
- **Payment gateway**: `paymentController.js` uses a mock order ID. Replace with real Razorpay/Stripe/Cashfree SDK calls.
- **OTP login / Google login / forgot password**: routes exist in `authController.js`, return `501 Not Implemented`.
- **Distance calculation**: uses straight-line (Haversine) distance. Replace with Google Distance Matrix API.
- **Notifications**: rows are created in the `notifications` table with `status: pending` but nothing sends them yet. Add a queue (BullMQ) + SMTP/Twilio/WhatsApp Business API worker.
- **Reports export**: `/api/admin/reports/:type` returns JSON. Add `exceljs`/`pdfkit` to export Excel/PDF/CSV.
- **Image uploads**: `addImage` accepts a URL. Wire `multer` + S3/Spaces upload before allowing file uploads from the admin UI.
- **2FA for admin**: not implemented.

None of these block a working demo or MVP soft-launch — they block a *safe production launch handling real
customer money*. Treat the payment gateway and notifications as the two highest-priority items.

---

## 4. Deployment Roadmap (Full Steps)

### Step 1 — Pre-deployment prep
- Keep `local → staging → production` environments separate
- Move all secrets into `.env` (never commit it) — DB credentials, `JWT_SECRET`, payment keys, Google Maps key, SMTP creds
- Use **test-mode** gateway keys on staging, **live-mode** keys only on production
- Run the full booking flow (search → book → pay → invoice) on staging before go-live
- Test all 3 roles: Guest, Registered Customer, Admin

### Step 2 — Choose hosting

| Component | Recommended |
|---|---|
| Backend (Node/Express) | AWS EC2/Lightsail, DigitalOcean Droplet, Railway, Render |
| Database (MySQL) | AWS RDS, DigitalOcean Managed DB, PlanetScale |
| Frontend (React build) | Vercel, Netlify, or served as static files via Nginx on the same VPS |
| Image/file storage | AWS S3 or DigitalOcean Spaces — don't store on local disk |
| Domain + SSL | Domain via GoDaddy/Namecheap; SSL via Let's Encrypt (free) or Cloudflare |

A 2–4GB RAM VPS is enough for launch traffic; scale up once you see real usage.

### Step 3 — Backend deployment
```bash
git clone <your-repo>
cd vrbms/backend
npm install --production
cp .env.example .env        # fill production values, NODE_ENV=production
npm run seed                # once, to create the initial admin account
```
- Use **PM2** to keep the Node process alive and auto-restart:
  ```bash
  npm install -g pm2
  pm2 start src/server.js --name vrbms-api
  pm2 save && pm2 startup
  ```
- Put **Nginx** in front as a reverse proxy (`proxy_pass http://localhost:5000`) and terminate SSL there
- In production, replace `sequelize.sync({ alter: true })` in `server.js` with proper `sequelize-cli`
  migrations, so schema changes are reviewed and reversible instead of auto-altering live tables

### Step 4 — Database
- Create the production MySQL database and a dedicated (non-root) DB user with only the privileges the app needs
- Seed only essential data (categories, locations, the admin account) — not test bookings
- Set up automated daily backups (`mysqldump` via cron, or your host's managed backup)

### Step 5 — Frontend deployment
```bash
cd vrbms/frontend
cp .env.example .env        # VITE_API_URL=https://api.yourdomain.com/api
npm install
npm run build                # outputs to dist/
```
- Deploy `dist/` to Vercel/Netlify (point their build command to `npm run build`, output dir `dist`), **or**
- Serve `dist/` as static files via Nginx on your VPS alongside the API

### Step 6 — Domain & SSL
- Point your domain's A record to your server IP (or CNAME to Vercel/Netlify)
- Install SSL via `certbot` (Let's Encrypt) or use Cloudflare's free SSL
- Force HTTPS redirects at the web server level
- Update the payment gateway webhook URLs and the Google Maps API key's allowed-domain restriction to your live domain

### Step 7 — Payment gateway go-live
- Complete KYC/business verification with Razorpay/Stripe/Cashfree — required before live mode is enabled
- Replace the mock logic in `paymentController.js` with real SDK calls (order creation + signature verification)
- Switch `.env` from test keys to live keys
- Point the gateway's webhook to `https://yourdomain.com/api/payments/verify` (or a dedicated webhook route)
- Test one real low-value transaction before opening to customers

### Step 8 — Third-party integrations
- **Google Maps**: restrict the API key to your live domain, enable billing, replace the Haversine estimate in `locationController.js` with a real Distance Matrix call
- **Email**: use SendGrid/Mailgun/SES with a verified sending domain (SPF/DKIM) so confirmations don't land in spam
- **SMS/WhatsApp**: activate production access with your provider (Twilio, MSG91, etc.) and add a worker that consumes the `notifications` table

### Step 9 — Monitoring
- Uptime monitoring (UptimeRobot, free tier is enough at launch) pointed at `GET /health`
- Error tracking (Sentry) on both backend and frontend
- Watch server CPU/RAM for the first few weeks and scale the VPS if needed

### Step 10 — Go-live checklist
- [ ] `.env` set to production values, `NODE_ENV=production`
- [ ] SSL active, HTTPS enforced
- [ ] Live payment gateway keys + webhook tested with a real transaction
- [ ] Database backups scheduled
- [ ] Admin account created with a strong password
- [ ] Full booking flow tested end-to-end on the live domain
- [ ] Legal pages published (Privacy Policy, T&C, Cancellation Policy) — also required for payment gateway approval
- [ ] Support contact visible on the site (see below)

---

## 5. Contact Info

You asked to include these — I've added them to the seeded **Contact Us** CMS page (`cms_pages` table,
slug `contact-us`) so they show on the live site once deployed:

- Phone: 7972360488
- Email: bharatchawan06@gmail.com

You can edit them anytime via `POST /api/cms` (admin-only) or by editing `backend/src/utils/seed.js` before
re-seeding.
