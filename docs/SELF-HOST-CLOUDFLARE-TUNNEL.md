# YourDrive: Self-host with Cloudflare Tunnel (RPi5 – quickest)

No port forwarding, no DuckDNS, free HTTPS. ~10–15 minutes on a Raspberry Pi 5.

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

If your repo is not at `/home/pi/yourdrive`, edit the `root` path in the config above.

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
