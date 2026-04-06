# YourDrive: Self-host with Cloudflare Tunnel (RPi5 – quickest)

No port forwarding, no DuckDNS, free HTTPS. ~10–15 minutes on a Raspberry Pi 5.

---

## Quick path (no Nginx – tunnel to Vite, works every time)

If you just need it working **fast** (e.g. for a demo), skip Nginx and tunnel straight to the Vite dev server. Do this **after** steps 1–4 below (PostgreSQL, clone+build, API `.env`, migrations).

**Terminal 1 – API (must be port 3001):**

```bash
cd /home/pi/yourdrive/apps/api
# or: cd /home/yourdrive/yourdrive/apps/api
npm run dev
# or: node dist/index.js
```

Wait until you see `API server running on http://localhost:3001` (or `127.0.0.1:3001`).

**Terminal 2 – Web (Vite, proxy to API):**

```bash
cd /home/pi/yourdrive/apps/web
API_PROXY_TARGET=http://localhost:3001 npm run dev
```

Wait until you see `Local: http://localhost:5173/`.

**Terminal 3 – Tunnel (use 127.0.0.1 so cloudflared uses IPv4):**

```bash
cloudflared tunnel --url http://127.0.0.1:5173
```

Copy the `https://xxx.trycloudflare.com` URL, open it in the browser. Set `FRONTEND_URL` (and optionally `BACKEND_URL`, `VERT_URL`) in `apps/api/.env` to that URL, then restart the API so links/emails use it.

- **If register returns 500:** Open DevTools → Network → click the failed `register` request → **Response** tab. The body will show `{ "success": false, "error": "<actual reason>" }`. Fix that (e.g. DB connection, duplicate email, validation). Also check the API terminal for `[auth/register] Error: ...`.

---

## 1. Install PostgreSQL

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib -y
sudo -u postgres psql -c "CREATE DATABASE yourdrive_db;"
sudo -u postgres psql -c "CREATE USER yourdrive WITH PASSWORD 'choose_a_strong_password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE yourdrive_db TO yourdrive;"
sudo -u postgres psql -c "ALTER DATABASE yourdrive_db OWNER TO yourdrive;"
```

Use the same password in step 3 for `DATABASE_URL`.

---

## 2. Clone repo and build

```bash
cd /home/pi
git clone https://github.com/YOUR_USER/yourdrive.git
cd yourdrive
npm install
cd apps/api && npm run build && npx prisma generate && cd ../..
cd apps/web && npm run build && cd ../..
```

Replace `YOUR_USER/yourdrive` with your actual repo URL. If you don’t use Git, copy the project to `/home/pi/yourdrive` and run the same `npm install` and build commands from the repo root.

**Important:** When building the web app, do **not** set `VITE_API_URL` to a full URL. Leave it unset (or set `VITE_API_URL=/api` in `apps/web/.env` before building) so the built app calls `/api` on the same origin; Nginx will proxy that to the API.

---

## 3. API `.env` (minimal for tunnel)

Create `apps/api/.env` (copy from `apps/api/.env.example` and trim, or create from scratch):

```bash
cd /home/pi/yourdrive
cp apps/api/.env.example apps/api/.env
nano apps/api/.env
```

Set at least these (replace with your DB password and generate real secrets):

```env
# Database (same user/password as step 1)
DATABASE_URL="postgresql://yourdrive:choose_a_strong_password@localhost:5432/yourdrive_db"

# JWT – use different long random strings in production
JWT_ACCESS_SECRET="your-long-random-access-secret"
JWT_REFRESH_SECRET="your-long-random-refresh-secret"
JWT_TEMP_SECRET="your-long-random-temp-secret"

# App URLs – we’ll set the real Cloudflare URL after first tunnel start (step 7)
FRONTEND_URL="https://REPLACE-WITH-YOUR-TUNNEL-URL"
BACKEND_URL="https://REPLACE-WITH-YOUR-TUNNEL-URL"
VERT_URL="https://REPLACE-WITH-YOUR-TUNNEL-URL"

# Server (behind nginx)
NODE_ENV=production
PORT=3001
HOST=127.0.0.1
```

Optional: leave B2_* unset (avatars stored as base64). Optional: SMTP, OAuth, WebAuthn – add later if needed.

Generate random secrets (run on Pi or your PC):

```bash
openssl rand -hex 32
```

Use three different outputs for the three JWT_* vars.

---

## 4. Run migrations

```bash
cd /home/pi/yourdrive/apps/api
npx prisma migrate deploy
cd ../..
```

---

## 5. Install Nginx and config

```bash
sudo apt install nginx -y
```

Create site config (path must match where you cloned the repo):

```bash
sudo tee /etc/nginx/sites-available/yourdrive << 'EOF'
server {
    listen 8080;
    server_name _;

    root /home/pi/yourdrive/apps/web/dist;
    index index.html;

    client_max_body_size 512m;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_connect_timeout 600s;
        proxy_send_timeout 600s;
        proxy_read_timeout 600s;
        send_timeout 600s;
    }
}
EOF
```

Enable it and disable default site:

```bash
sudo ln -sf /etc/nginx/sites-available/yourdrive /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

**Important:** Replace `/home/pi/yourdrive` in the `root` line with your **actual** repo path (e.g. `/home/yourdrive/yourdrive`). If the path is wrong, you get **500 on the main page** when using the tunnel to 8080. Check with:

```bash
ls /home/pi/yourdrive/apps/web/dist/index.html
# or: ls /home/yourdrive/yourdrive/apps/web/dist/index.html
```

If that file doesn’t exist, fix the path in the Nginx config and run `sudo nginx -t && sudo systemctl restart nginx`.

---

## 6. Install Cloudflare Tunnel (RPi5 = arm64)

```bash
cd /tmp
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64.deb
sudo dpkg -i cloudflared-linux-arm64.deb
cd -
```

If you’re on a different Pi/arch, check: https://github.com/cloudflare/cloudflared/releases (e.g. armhf for Pi 3/4 32-bit).

---

## 7. Start API and tunnel (first time)

Start the API (so nginx can proxy to it):

```bash
cd /home/pi/yourdrive/apps/api
node dist/index.js &
cd ../..
```

Or with PM2 (recommended so API restarts on crash/reboot):

```bash
sudo npm install -g pm2
cd /home/pi/yourdrive/apps/api
pm2 start dist/index.js --name yourdrive-api
pm2 save
pm2 startup
cd ../..
```

Start the tunnel (quick mode – you get a random URL):

```bash
cloudflared tunnel --url http://localhost:8080
```

In the output you’ll see a line like:

`https://random-words-here.trycloudflare.com`

Copy that URL.

---

## 8. Set real URL in `.env` and restart API

Edit `apps/api/.env` and set:

- `FRONTEND_URL="https://YOUR-ACTUAL-URL.trycloudflare.com"`
- `BACKEND_URL="https://YOUR-ACTUAL-URL.trycloudflare.com"`
- `VERT_URL="https://YOUR-ACTUAL-URL.trycloudflare.com"`

Then restart the API:

```bash
pm2 restart yourdrive-api
# or if you ran node manually: kill the node process and run again:
# cd /home/pi/yourdrive/apps/api && node dist/index.js &
```

---

## 9. Done

Open `https://YOUR-URL.trycloudflare.com` in a browser. You should see YourDrive; sign up and use it.

- Frontend: served by Nginx from `apps/web/dist`
- API: Nginx proxies `/api` to `http://127.0.0.1:3001`
- HTTPS: provided by Cloudflare Tunnel (no port forwarding needed)

---

## 10. Keep tunnel running (optional)

The `cloudflared tunnel --url ...` command stops when you close the terminal. To keep it running:

**Option A – run in background**

```bash
nohup cloudflared tunnel --url http://localhost:8080 > /tmp/cloudflared.log 2>&1 &
```

**Option B – systemd service (recommended)**

```bash
sudo tee /etc/systemd/system/cloudflared-tunnel.service << 'EOF'
[Unit]
Description=Cloudflare Tunnel for YourDrive
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/cloudflared tunnel --url http://localhost:8080
Restart=on-failure
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable cloudflared-tunnel
sudo systemctl start cloudflared-tunnel
```

Note: In quick mode the URL can change when the tunnel restarts. For a stable URL, use a free Cloudflare account and a named tunnel (see Cloudflare docs).

---

## Troubleshooting

| Symptom | What to do |
|--------|------------|
| **500 on the main page** (tunnel to 8080) | Nginx is returning 500. Fix the `root` path in `/etc/nginx/sites-available/yourdrive` so it points to your real repo path (e.g. `/home/yourdrive/yourdrive/apps/web/dist`). Run `sudo nginx -t && sudo systemctl restart nginx`. Or use the **Quick path** (tunnel to 5173, no Nginx). |
| **500 on `/api/auth/register`** | The API is throwing. In the browser: DevTools → Network → click the failed request → **Response** tab; the body has `error: "<reason>"`. On the Pi: check the API terminal for `[auth/register] Error: ...`. Common causes: wrong `DATABASE_URL`, DB not running, migrations not applied, or duplicate email (use a different email). |
| **Connection refused** (tunnel) | Use `http://127.0.0.1:5173` or `http://127.0.0.1:8080` instead of `localhost` so cloudflared uses IPv4. |

---

## Checklist

| Step | What |
|------|------|
| 1 | PostgreSQL: create DB `yourdrive_db`, user `yourdrive`, password |
| 2 | Clone `yourdrive`, `npm install`, build `apps/api` and `apps/web` |
| 3 | `apps/api/.env`: DATABASE_URL, JWT_* (3), FRONTEND_URL/BACKEND_URL/VERT_URL (placeholder), PORT=3001, HOST=127.0.0.1, NODE_ENV=production |
| 4 | `cd apps/api && npx prisma migrate deploy` |
| 5 | Nginx on 8080: root = `apps/web/dist`, proxy `/api` → 127.0.0.1:3001 |
| 6 | Install `cloudflared` (arm64 for RPi5) |
| 7 | Start API (PM2 or `node dist/index.js`), run `cloudflared tunnel --url http://localhost:8080`, copy URL |
| 8 | Put real tunnel URL in .env, restart API |
| 9 | Open tunnel URL in browser |
| 10 | (Optional) systemd or nohup so tunnel survives logout |

This matches your app: same-origin `/api`, Prisma, and env from `.env.example` (minimal set for this setup).
