# YourDrive

A self-hostable cloud storage and file management app with authentication, file sharing, device management, and optional document conversion.

---

## Description

YourDrive is a full-stack web application that lets users store files, organize them in folders, share links, and manage devices. It supports email/password sign-up, email verification, optional two-factor authentication (TOTP), and OAuth (Google, GitHub, Facebook). File storage uses PostgreSQL for metadata and an S3-compatible backend (e.g. Backblaze B2). The frontend is a React single-page app that talks to the API; in development the web app proxies `/api` to the backend so cookies work for auth.

---

## Features

- **Auth**: Register, login, email verification, password reset, 2FA (TOTP), OAuth (Google, GitHub, Facebook)
- **Files**: Upload, download, organize in folders, preview (images, PDF, text, etc.), edit text files
- **Sharing**: Create share links with view/comment/edit permissions, optional expiry
- **Storage**: Per-user storage limits; educational bonus for verified @skole.hr users (e.g. +50GB)
- **Devices**: List and manage devices; optional conversion service (Vert) for document conversion
- **Dashboard**: Your files, recently edited, shared with you, recycle bin, favorites, settings

---

## Tech Stack

| Layer   | Technology |
|--------|------------|
| Frontend | React 19, Vite 7, TanStack Router, Zustand, styled-components, Axios |
| Backend  | Node.js, Express, TypeScript (tsx in dev) |
| Database | PostgreSQL, Prisma ORM |
| Storage  | S3-compatible (e.g. Backblaze B2) |
| Auth     | JWT (access + refresh), cookies, bcrypt, Passport (OAuth), TOTP (otplib) |
| Optional | Vert (Docker) for document conversion |

---

## Folder Structure

```
yourdrive/
├── apps/
│   ├── api/                 # Backend (Express + Prisma)
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── migrations/
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── lib/
│   │   │   └── middleware/
│   │   ├── .env.example
│   │   └── package.json
│   └── web/                 # Frontend (React + Vite)
│       ├── src/
│       ├── public/
│       ├── .env.example
│       ├── vite.config.ts
│       └── package.json
├── scripts/
│   ├── start-dev.js         # Runs API + Web together (npm run dev)
│   └── start-vert.js
├── docker-compose.dev.yml   # Optional: Vert conversion service
├── package.json             # Monorepo root (npm workspaces)
└── README.md
```

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** (comes with Node)
- **PostgreSQL** 14+ (local or remote)
- **S3-compatible storage** (e.g. Backblaze B2) for file blobs
- (Optional) **Docker** – only if you use the Vert conversion service

---

## Installation

### 1. Clone and install dependencies

```bash
cd yourdrive
npm install
```

This installs dependencies for the root and all workspaces (`apps/api`, `apps/web`).

### 2. Environment variables

**Backend (`apps/api/`)**

Copy the example env and edit it:

```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` and set at least:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string, e.g. `postgresql://user:password@localhost:5432/yourdrive` |
| `JWT_ACCESS_SECRET` | Secret for access tokens (e.g. `openssl rand -base64 32`) |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens (e.g. `openssl rand -base64 32`) |
| `FRONTEND_URL` | Frontend origin for CORS, e.g. `http://localhost:5173` |
| `BACKEND_URL` | Backend base URL, e.g. `http://localhost:3000` |
| `B2_KEY_ID` | S3-compatible access key (e.g. B2) |
| `B2_APPLICATION_KEY` | S3-compatible secret key |
| `B2_BUCKET_NAME` | Bucket name |
| `B2_ENDPOINT` | S3 endpoint URL |
| `B2_REGION` | Region (e.g. `eu-central-003`) |

Optional: OAuth (Google, GitHub, Facebook), SMTP for emails, WebAuthn, Vert URL. See `apps/api/.env.example` for the full list.

**Frontend (`apps/web/`)**

```bash
cp apps/web/.env.example apps/web/.env
```

For local dev you can leave defaults:

- `NODE_ENV=development`
- `FRONTEND_URL=http://localhost:5173`
- `VITE_VERT_URL=http://localhost:3003` (only if you run Vert)

Do **not** set `VITE_API_URL` to a full URL if you use the Vite proxy (recommended); the app will use `/api` and the proxy in `vite.config.ts` will forward to the backend.

### 3. Database setup (Prisma)

From the repo root:

```bash
npm run db:generate
npm run db:push
```

Or, to use migrations:

```bash
npm run db:migrate
```

- `db:generate` – generates Prisma Client.
- `db:push` – pushes the schema to the DB (no migration history).
- `db:migrate` – runs migrations (use for production).

Ensure `DATABASE_URL` in `apps/api/.env` is correct before running these.

There is **no seed script** in the repo; you create the first user via the app (Register).

### 4. Vite proxy (development)

So that `/api` and cookies work, the frontend proxies API requests to the backend. In `apps/web/vite.config.ts` the proxy target is set (e.g. `http://localhost:3000` or `http://192.168.1.2:3000`). Change the `target` to match where your API runs (same machine → `http://localhost:3000`).

---

## Environment Variables

### API (`apps/api/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | Yes | Access token signing secret |
| `JWT_REFRESH_SECRET` | Yes | Refresh token signing secret |
| `FRONTEND_URL` | Yes | Frontend origin (CORS) |
| `BACKEND_URL` | Yes | Backend base URL (callbacks, etc.) |
| `B2_KEY_ID` | Yes | S3 access key |
| `B2_APPLICATION_KEY` | Yes | S3 secret key |
| `B2_BUCKET_NAME` | Yes | Bucket name |
| `B2_ENDPOINT` | Yes | S3 endpoint |
| `B2_REGION` | Yes | S3 region |
| `PORT` | No | Default `3000` |
| `HOST` | No | Bind address; default `0.0.0.0`. Use `127.0.0.1` to bind only to localhost |
| `NODE_ENV` | No | `development` or `production` |
| OAuth / SMTP / Vert | No | See `.env.example` |

### Web (`apps/web/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | No | `development` or `production` |
| `FRONTEND_URL` | No | Used in docs/config |
| `VITE_VERT_URL` | No | Vert base URL (conversion), e.g. `http://localhost:3003` |
| `VITE_API_URL` | No | Leave unset to use `/api` + proxy; set only if you need a different API base |
| `API_PROXY_TARGET` | No | Vite dev proxy target; default `http://localhost:3000`. Override if API runs elsewhere |

---

## Running the App

### Development

**Option A – API and Web together (recommended)**

From the repo root:

```bash
npm run dev
```

This starts the API and the web app (see `scripts/start-dev.js`). Typical URLs:

- Web: http://localhost:5173/
- API: http://localhost:3000/

**Option B – Run separately**

Terminal 1 – API:

```bash
npm run dev:api
```

Terminal 2 – Web:

```bash
npm run dev:web
```

Ensure the proxy in `apps/web/vite.config.ts` points to the same host/port as the API.

### Production

1. **Build**

   From the repo root:

   ```bash
   npm run build
   ```

   This runs the build script in each workspace (API compiles TypeScript, Web runs `tsc -b && vite build`).

2. **Run the API**

   ```bash
   cd apps/api
   node dist/index.js
   ```

   Or use the npm script:

   ```bash
   cd apps/api && npm start
   ```

   Set `NODE_ENV=production` and ensure `PORT` and all env vars are set. The API listens on `HOST` (default `0.0.0.0`); use `HOST=127.0.0.1` if you only want localhost.

3. **Serve the frontend**

   Serve the contents of `apps/web/dist/` with any static file server (e.g. nginx, Caddy, or `npm run preview` in `apps/web` for a quick test):

   ```bash
   cd apps/web && npm run preview
   ```

   Configure your reverse proxy so that:

   - The app is served from the root (or a subpath you choose).
   - `/api` is proxied to the Node API (e.g. `http://127.0.0.1:3000`).

---

## Deployment / Self-Hosting Guide

### Overview

- **Backend**: Node.js app in `apps/api`, runs with `node dist/index.js`.
- **Frontend**: Static files in `apps/web/dist/` after `npm run build`.
- **Database**: PostgreSQL; use Prisma migrations in production.
- **File storage**: S3-compatible (e.g. B2); configure via env.
- **Optional**: Vert for conversion – see `docker-compose.dev.yml` (dev) or run Vert yourself and set `VITE_VERT_URL` / backend Vert URL.

No Dockerfile is provided for the app itself; you can run Node and a static server directly or put them in your own Docker setup.

### Step-by-step (e.g. Ubuntu VM or generic server)

1. **Install Node.js 18+ and PostgreSQL**

   ```bash
   sudo apt update
   sudo apt install -y nodejs npm postgresql
   ```

   Or use a Node version manager (nvm) and install PostgreSQL from your distro or official repo.

2. **Create a database and user**

   ```bash
   sudo -u postgres psql
   CREATE USER yourdrive WITH PASSWORD 'your_password';
   CREATE DATABASE yourdrive OWNER yourdrive;
   \q
   ```

3. **Clone and install**

   ```bash
   cd /opt  # or your preferred path
   git clone <your-repo-url> yourdrive
   cd yourdrive
   npm install
   ```

4. **Configure env**

   ```bash
   cp apps/api/.env.example apps/api/.env
   cp apps/web/.env.example apps/web/.env
   # Edit both .env files (DATABASE_URL, JWT secrets, B2, FRONTEND_URL, BACKEND_URL, etc.)
   ```

5. **Database (Prisma)**

   ```bash
   npm run db:generate
   cd apps/api && npx prisma migrate deploy
   cd ../..
   ```

6. **Build**

   ```bash
   npm run build
   ```

7. **Run API (e.g. with PM2)**

   ```bash
   npm install -g pm2
   cd apps/api
   NODE_ENV=production pm2 start dist/index.js --name yourdrive-api
   pm2 save && pm2 startup
   ```

   Or run with `node dist/index.js` behind a process manager of your choice.

8. **Reverse proxy (nginx example)**

   - Serve `apps/web/dist/` as the site root.
   - Proxy ` /api` to `http://127.0.0.1:3000`.

   Example nginx snippet:

   ```nginx
   server {
     listen 80;
     server_name your-domain.com;
     root /opt/yourdrive/apps/web/dist;
     index index.html;
     location / {
       try_files $uri $uri/ /index.html;
     }
     location /api {
       proxy_pass http://127.0.0.1:3000;
       proxy_http_version 1.1;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
       proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
       proxy_set_header X-Forwarded-Proto $scheme;
       proxy_set_header Cookie $http_cookie;
     }
   }
   ```

9. **Set production URLs**

   In `apps/api/.env`: `FRONTEND_URL=https://your-domain.com`, `BACKEND_URL=https://your-domain.com` (if you proxy both under one host). In `apps/web/.env` you typically don’t need `VITE_API_URL` in production if `/api` is proxied.

### Optional: Vert (conversion service) with Docker

For in-browser document conversion, the repo includes a dev Compose file for Vert:

```bash
docker-compose -f docker-compose.dev.yml up -d
```

This starts Vert (e.g. on port 3003). Set `VITE_VERT_URL` in the web app to that URL. For production, run Vert on a URL you control and point the app and API to it.

### Building production artifacts (summary)

| Step | Command |
|------|---------|
| Install deps | `npm install` |
| Generate Prisma client | `npm run db:generate` |
| Run migrations | `cd apps/api && npx prisma migrate deploy` |
| Build all | `npm run build` |
| API artifact | `apps/api/dist/` (run with `node dist/index.js`) |
| Frontend artifact | `apps/web/dist/` (serve statically + proxy `/api`) |

---

## Troubleshooting

- **"Not allowed by CORS"**  
  Ensure `FRONTEND_URL` in `apps/api/.env` exactly matches the origin the browser uses (scheme + host + port). No trailing slash.

- **Login redirects or session lost on navigation**  
  Use the Vite proxy for `/api` (do not set `VITE_API_URL` to a full URL in dev). Cookies (refresh token) must be same-origin or correctly configured for your domain.

- **Database connection errors**  
  Check `DATABASE_URL`, PostgreSQL is running, and the user has access to the database. For a remote DB, ensure SSL and firewall allow the connection.

- **Prisma "schema not in sync" or migration errors**  
  Run `npm run db:generate` and then either `npx prisma migrate deploy` (production) or `npm run db:push` (dev only).

- **API listens on wrong interface**  
  The code may bind to a specific IP (e.g. `192.168.1.2`). For a server, change `app.listen(PORT, "0.0.0.0", ...)` in `apps/api/src/index.ts` so the API is reachable from your reverse proxy.

- **File upload / storage errors**  
  Verify B2 (or S3) env vars, bucket exists, and the bucket/user allow read/write. Check API logs for the exact error.

- **2FA / TOTP "Invalid code"**  
  Ensure device time is correct (TOTP is time-based). If you just enabled 2FA, use the current 6-digit code from the authenticator app.

---

## License

See the repository for license information, if applicable.
