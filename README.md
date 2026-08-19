# CampiFa — Campaign Poster Personalization Platform
**Parent Brand:** i-Fa Design  
**Tagline:** Create • Personalize • Share

---

## 1. Overview & Core Philosophy

**CampiFa** is a production-ready, full-stack campaign poster personalization web platform.

### Core Philosophy:
1. **Ready-Made Poster Base**: The customer/admin creates their finished campaign poster externally using standard graphic software (Photoshop, CorelDRAW, Canva, Illustrator).
2. **Artwork Integrity**: CampiFa does **NOT** design or alter the poster, does **NOT** use generative AI to redesign backgrounds, and keeps the original customer artwork locked as Layer 0.
3. **Personalization Layer**: The campaign owner defines interactive photo areas (with circle, rounded, or rectangle clipping, borders, and shadows) and dynamic text areas (Name, Designation, Organization).
4. **Instant Public Generation**: Public users visit the campaign link (`/c/:slug`), upload their photo, enter their details, see a live HTML5 Canvas preview, and generate a high-resolution PNG (`CampiFa-[slug].png`) to download or share via WhatsApp and Web Share.
5. **Zero Subscription / Payment System**: All authenticated customers have equal feature access with no pricing tiers, payment gateways, or usage paywalls.
6. **Multi-Tenant Isolation**: Strict `customerId` data isolation on every query prevents customer data cross-contamination.

---

## 2. Technology Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, Canvas API, QR Code, Confetti, PWA support.
- **Backend API**: Node.js, TypeScript, Express, Helmet, CORS, Morgan, Cookie Parser, Multer, Rate Limiting, Zod.
- **Database & ORM**: PostgreSQL / SQLite with Prisma ORM.
- **Image Compositing**: Sharp (high-performance C++ image compositing engine).
- **Authentication**: Bcrypt password hashing, JWT token authentication, secure HTTP-only cookies, and role authorization middlewares.
- **Storage**: Abstracted local disk storage provider with AWS S3 compatibility for production.

---

## 3. Architecture & User Roles

```
                      +-------------------+
                      |    SUPER ADMIN    |
                      +---------+---------+
                                |
                    +-----------v-----------+
                    |       CUSTOMERS       |
                    | (Multi-Tenant Scoped) |
                    +-----------+-----------+
                                |
                    +-----------v-----------+
                    |   CUSTOMER CAMPAIGNS  |
                    |   Ready-Made Poster   |
                    |  Template & Elements  |
                    +-----------+-----------+
                                |
                    +-----------v-----------+
                    |  PUBLIC CAMPAIGN LINK |
                    |      /c/:slug         |
                    +-----------+-----------+
                                |
                    +-----------v-----------+
                    |      PUBLIC USER      |
                    |   Upload Photo & Info |
                    |   Live Canvas Preview |
                    +-----------+-----------+
                                |
                    +-----------v-----------+
                    |  PERSONALIZED POSTER  |
                    |  HD PNG Download / WA |
                    +-----------------------+
```

### Roles Supported:
1. **SUPER_ADMIN**:
   - Oversight of all customers and campaigns
   - Customer suspension / reactivation / deletion
   - System-wide generation and download analytics
2. **CUSTOMER**:
   - Workspace profile and branding
   - Campaign creation and poster upload
   - Drag & drop Template Editor (Photo area with circle/rect/rounded shapes, dynamic text fields)
   - Campaign publishing, pausing, duplication, QR code generation
   - Campaign-specific and overall analytics
3. **PUBLIC_USER**:
   - No login required
   - Responsive, mobile-first personalization form
   - Real-time HTML5 Canvas rendering
   - High-resolution poster generation, HD PNG download, WhatsApp and Web Share.

---

## 4. Project Structure

```
campifa/
├── backend/
│   ├── src/
│   │   ├── config/             # Environment, constants, Prisma client
│   │   ├── controllers/        # Auth, Customer, Campaign, Template, Upload, Generate, Analytics, Admin
│   │   ├── middleware/         # Auth, Upload, Error, Rate Limiter
│   │   ├── routes/             # API routes
│   │   ├── services/           # Storage, Sharp Image Compositor
│   │   ├── utils/              # Response formatter, slugify
│   │   ├── seed.ts             # Database seeder with sample ready-made posters
│   │   ├── test_workflow.ts    # End-to-end acceptance test suite
│   │   └── server.ts           # Express application entry
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   ├── canvas/             # Interactive Canvas and rendering utilities
│   │   ├── components/         # Header, Sidebar, Footer, QR Modal, Loading Spinner
│   │   ├── editor/             # Template Editor, ToolBar, PropertiesBar, FieldManager, Preview
│   │   ├── hooks/              # Auth context and hooks
│   │   ├── layouts/            # AppLayout (Customer), AdminLayout, PublicLayout
│   │   ├── pages/              # Home, Login, Register, Dashboard, Campaigns, Editor, Analytics, Public, Admin
│   │   ├── services/           # HTTP API client wrappers
│   │   ├── styles/             # Tailwind CSS directives & custom scrollbars
│   │   ├── types/              # TypeScript interfaces
│   │   ├── App.tsx             # Route definitions
│   │   └── main.tsx
│   ├── public/                 # Manifest.json, Favicon
│   ├── package.json
│   ├── vite.config.ts
│   └── tailwind.config.js
├── prisma/
│   └── schema.prisma           # Multi-tenant relational schema
├── uploads/                    # Local storage (posters, photos, thumbnails, generated)
├── .env.example
├── package.json                # Root orchestration scripts
└── README.md
```

---

## 5. Getting Started & Installation

### Prerequisites:
- Node.js (v18 or higher)
- npm (v9 or higher)

### Setup Steps:

1. **Install Dependencies**:
   ```bash
   cd campifa
   npm install --prefix backend
   npm install --prefix frontend
   ```

2. **Database Initialization**:
   ```bash
   npm run prisma:generate --prefix backend
   npm run db:push --prefix backend
   npm run db:seed --prefix backend
   ```

3. **Run in Development Mode**:
   ```bash
   # Terminal 1: Backend API (Port 5000)
   npm run dev --prefix backend

   # Terminal 2: Frontend (Port 3000)
   npm run dev --prefix frontend
   ```

4. **Production Build**:
   ```bash
   npm run build --prefix backend
   npm run build --prefix frontend
   npm run start --prefix backend
   ```

---

## 6. Pre-Seeded Demo Accounts & Campaigns

| Account Type | Email | Password | Role | Description |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@campifa.com` | `AdminPassword123!` | `SUPER_ADMIN` | Platform oversight & customer controls |
| **Demo Customer** | `customer@campifa.com` | `CustomerPassword123!` | `CUSTOMER` | Demo Events Organizer |
| **Secondary Customer** | `alex@apexacademy.org` | `CustomerPassword123!` | `CUSTOMER` | Apex International Academy (Tenant isolation demo) |

### Pre-Configured Demo Campaigns:
1. **Milad-un-Nabi 2026**: `http://localhost:3000/c/milad-un-nabi-2026`
2. **Independence Day 2026**: `http://localhost:3000/c/independence-day-2026`
3. **School Achievement 2026**: `http://localhost:3000/c/school-achievement-2026`

---

## 7. API Reference Overview

### Authentication:
- `POST /api/auth/register` - Create customer account
- `POST /api/auth/login` - Login and receive JWT
- `POST /api/auth/logout` - Clear session
- `GET /api/auth/me` - Current session details

### Customer & Campaigns:
- `GET /api/customer/profile` / `PUT /api/customer/profile` - Profile & branding
- `GET /api/campaigns` - List customer's campaigns
- `POST /api/campaigns` - Create campaign with base template
- `GET /api/campaigns/:id` - Fetch campaign
- `PUT /api/campaigns/:id` - Update campaign
- `DELETE /api/campaigns/:id` - Delete campaign
- `POST /api/campaigns/:id/publish` - Validate & publish campaign
- `POST /api/campaigns/:id/pause` - Temporarily disable public access
- `POST /api/campaigns/:id/duplicate` - Duplicate campaign

### Template Editor:
- `GET /api/campaigns/:id/template` - Load elements & fields
- `PUT /api/campaigns/:id/template` - Save template & elements
- `POST /api/campaigns/:id/template/validate` - Pre-publish validation

### Uploads & Generation:
- `POST /api/uploads/poster` - Upload base ready-made poster (Sharp dimension extraction & thumbnail generation)
- `POST /api/uploads/photo` - Temporary photo upload
- `POST /api/uploads/logo` - Branding logo upload
- `GET /api/public/campaigns/:slug` - Public campaign page configuration
- `POST /api/generate` - Server-side high-resolution Sharp poster composition
- `GET /api/generations/:id` - Fetch generation output

### Analytics & Super Admin:
- `GET /api/analytics` - Customer metrics (Views, Generations, Downloads, Shares)
- `POST /api/analytics/event` - Record view/share/download event
- `GET /api/admin/overview` - System-wide statistics
- `GET /api/admin/customers` - List customer accounts
- `POST /api/admin/customers/:id/suspend` - Suspend customer account
- `POST /api/admin/customers/:id/activate` - Reactivate customer account
- `GET /api/admin/campaigns` - Oversight of all campaigns

---

## 8. Verification & Acceptance Suite

To execute the automated end-to-end acceptance suite:
```bash
npm run dev:test (or npx tsx src/test_workflow.ts inside backend)
```

**License**: Proprietary • Built by Google Antigravity for i-Fa Design.
