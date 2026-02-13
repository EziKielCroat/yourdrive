# Raspberry Pi: Fix “Disallowed by CORS” with Cloudflare Tunnel

Use these steps **on the Raspberry Pi** so the tunnel URL works without CORS errors.

---

## 1. Point the frontend at the proxy (same origin)

So the browser sends API requests to the tunnel (and Vite proxies them to the API), not directly to the API.

On the Pi:

```bash
cd /home/yourdrive/yourdrive/apps/web
nano .env
```

Set or ensure:

```env
VITE_API_URL=/api
```

(Remove or comment out any line like `VITE_API_URL=http://192.168.1.8:3001` or similar.)

Save (Ctrl+O, Enter, Ctrl+X). Restart the web app after changing (see step 4).

---

## 2. Point Vite’s proxy at port 3001

Your API runs on **3001**, but Vite’s proxy defaults to **3000**. Proxy must target 3001.

When you start the web app, set the proxy target:

```bash
cd /home/yourdrive/yourdrive/apps/web
API_PROXY_TARGET=http://localhost:3001 npm run dev
```

Or add to `apps/web/.env` so you don’t have to type it each time:

```env
API_PROXY_TARGET=http://localhost:3001
```

Then `npm run dev` will use 3001 for `/api`.

---

## 3. Ensure the API allows the tunnel origin (CORS)

The API must allow `Origin: https://sea-glen-due-backed.trycloudflare.com` (and any `*.trycloudflare.com`).

**Option A – Code is up to date**

If you’ve pulled the latest repo and the API was built after the CORS changes, the API already allows `*.trycloudflare.com`. Skip to step 4.

**Option B – Manually add CORS for the tunnel**

If you still get “disallowed by CORS”, add the tunnel check by hand:

```bash
cd /home/yourdrive/yourdrive/apps/api
nano src/index.ts
```

Find the `cors({ origin: function (origin, callback) { ... }` block. **Before** the line that says:

```ts
callback(new Error("Not allowed by CORS"));
```

add this block:

```ts
      // Allow Cloudflare quick tunnels (e.g. https://xxx.trycloudflare.com)
      try {
        const host = new URL(origin).hostname.toLowerCase();
        if (host.endsWith(".trycloudflare.com")) return callback(null, true);
      } catch {
        // ignore
      }
```

So the flow is: `if (!origin) return ...` → check allowedOrigins → check isAllowedOriginHost → **then this trycloudflare block** → then `callback(new Error(...))`.

Save the file, then rebuild/restart the API (step 4).

**Option C – Allow the current tunnel URL via env**

In `apps/api/.env` add (replace with your current tunnel URL if it changed):

```env
CORS_ORIGINS=https://sea-glen-due-backed.trycloudflare.com
```

Restart the API. If you use a new tunnel URL later, update this or add it: `CORS_ORIGINS=https://url1.trycloudflare.com,https://url2.trycloudflare.com`.

---

## 4. Restart services in order

1. **Stop** the web app and the API (Ctrl+C in each terminal).

2. **Start API:**
   ```bash
   cd /home/yourdrive/yourdrive/apps/api
   npm run dev
   ```
   Wait until you see “API server running on http://localhost:3001”.

3. **Start web** (with proxy target 3001):
   ```bash
   cd /home/yourdrive/yourdrive/apps/web
   API_PROXY_TARGET=http://localhost:3001 npm run dev
   ```
   Or, if you added `API_PROXY_TARGET` to `apps/web/.env`:
   ```bash
   npm run dev
   ```

4. **Start tunnel:**
   ```bash
   cd /home/yourdrive/yourdrive
   cloudflared tunnel --url http://localhost:5173
   ```

5. Open the **tunnel URL** in the browser (e.g. `https://sea-glen-due-backed.trycloudflare.com`). Use that URL for both the app and API (via `/api`).

---

## 5. Optional: set FRONTEND_URL on the API

In `apps/api/.env` set the tunnel URL so links/emails use it:

```env
FRONTEND_URL=https://sea-glen-due-backed.trycloudflare.com
```

Update this when you start a new tunnel and get a new URL.

---

## Checklist

- [ ] `apps/web/.env`: `VITE_API_URL=/api` (no direct API URL when using tunnel).
- [ ] `apps/web`: start with `API_PROXY_TARGET=http://localhost:3001` (or in .env).
- [ ] `apps/api`: CORS allows `.trycloudflare.com` (code or manual patch) and/or `CORS_ORIGINS` includes your tunnel URL.
- [ ] API listening on **3001**, web on **5173**, tunnel `--url http://localhost:5173`.
- [ ] Restart API and web after any .env or code change, then test the tunnel URL.

If CORS still appears, in the browser DevTools → Network open the failing request and check the **Response headers**: if there is no `Access-Control-Allow-Origin`, the API is rejecting the origin; confirm the API on the Pi has the trycloudflare CORS block or `CORS_ORIGINS` set and was restarted.

---

## 6. If you get 500 on register (or login)

A **500 Internal Server Error** on `/api/auth/register` means the API threw an error. CORS is working (the request reached the server).

1. **Check the API terminal** on the Pi. You should see a line like:
   ```text
   [auth/register] Error: <message or code>
   ```
   That tells you the real cause (e.g. database, validation, Prisma).

2. **Common causes:**
   - **Database:** `DATABASE_URL` wrong, PostgreSQL not running, or migrations not applied (`npx prisma migrate deploy` in `apps/api`).
   - **Prisma schema / DB out of sync:** Run `npx prisma generate` and `npx prisma migrate deploy` in `apps/api`.
   - **Port mismatch:** API must be on the port Vite proxies to (e.g. 3001). Start the API with the same port as in `API_PROXY_TARGET` (or `.env`).

3. After fixing, **restart the API** and try register again. The API now returns 400/409 with a clear `error` message for validation and duplicate-email cases, and only returns 500 for unexpected errors (with a generic message and a log line).
