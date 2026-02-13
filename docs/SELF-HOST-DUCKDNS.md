# Self-host YourDrive with DuckDNS (Raspberry Pi / any Linux)

Full setup so your app is reachable at `https://yourapp.duckdns.org` from anywhere, using your Pi (or any machine) and home internet. No monthly cost.

---

## 1. DuckDNS – free hostname

1. Go to **https://www.duckdns.org** and sign in (e.g. with Google/GitHub).
2. Create a subdomain, e.g. `yourapp`. You’ll get: **`yourapp.duckdns.org`**.
3. Copy your **token** (shown on the DuckDNS page). You’ll use it so the hostname always points to your current IP.

---

## 2. Router – port forwarding

Your Pi will run the app; the internet reaches it through your router.

1. Find your Pi’s **local IP** (e.g. `192.168.1.10`):
   ```bash
   hostname -I
   ```
2. In your **router admin** (often `192.168.1.1` or `192.168.0.1`):
   - Find **Port forwarding** / **Virtual server** / **NAT**.
   - Add a rule:
     - **External port**: 80 (HTTP) → **Internal IP**: Pi IP, **Internal port**: 80
     - **External port**: 443 (HTTPS) → **Internal IP**: Pi IP, **Internal port**: 443
   - Save. Now traffic to your public IP on 80/443 goes to the Pi.

---

## 3. Pi (or Linux server) – install basics

SSH into the Pi (or use keyboard/monitor) and run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Node.js 20 LTS (adjust if your distro uses different method)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# PostgreSQL (for the API database)
sudo apt install -y postgresql postgresql-contrib

# Caddy (reverse proxy + free HTTPS)
sudo apt install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
sudo apt update && sudo apt install -y caddy
```

---

## 4. DuckDNS updater on the Pi

So `yourapp.duckdns.org` always points to your current home IP.

**Option A – use the script from the repo:**

```bash
cd ~/yourdrive
sudo mkdir -p /opt/duckdns
sudo cp deploy/duckdns-update.sh /opt/duckdns/duck.sh
sudo chmod 700 /opt/duckdns/duck.sh
# Set your subdomain and token (edit the file or use env in cron):
sudo sed -i 's/yourapp/YOUR_SUBDOMAIN/' /opt/duckdns/duck.sh
sudo sed -i 's/your-token-here/YOUR_DUCKDNS_TOKEN/' /opt/duckdns/duck.sh
```

**Option B – create script by hand:**

```bash
sudo mkdir -p /opt/duckdns
sudo tee /opt/duckdns/duck.sh << 'EOF'
echo url="https://www.duckdns.org/update?domains=YOUR_SUBDOMAIN&token=YOUR_TOKEN&ip=" | curl -k -o /tmp/duck.log -K -
EOF
sudo sed -i 's/YOUR_SUBDOMAIN/yourapp/' /opt/duckdns/duck.sh
sudo sed -i 's/YOUR_TOKEN/your-actual-duckdns-token/' /opt/duckdns/duck.sh
sudo chmod 700 /opt/duckdns/duck.sh
```

Run every 5 minutes:

```bash
sudo crontab -e
# Add line:
*/5 * * * * /opt/duckdns/duck.sh
```

Run once now:

```bash
sudo /opt/duckdns/duck.sh
```

---

## 5. Database (PostgreSQL)

```bash
sudo -u postgres psql -c "CREATE USER yourdrive WITH PASSWORD 'choose_a_strong_password';"
sudo -u postgres psql -c "CREATE DATABASE yourdrive_db OWNER yourdrive;"
```

Note the connection string (you’ll put it in `.env`):

`postgresql://yourdrive:choose_a_strong_password@localhost:5432/yourdrive_db`

---

## 6. Deploy the app on the Pi

Clone and build on the Pi (or build on your PC and copy `apps/api`, `apps/web/dist`, and `node_modules` – adjust paths if you use a different user/dir):

```bash
# Example: clone into home
cd ~
git clone https://github.com/YOUR_USER/yourdrive.git
cd yourdrive
```

Install dependencies and build:

```bash
npm install
cd apps/api && npm run build && npm run db:generate && cd ../..
cd apps/web && npm install && npm run build && cd ../..
```

---

## 7. API `.env` on the Pi

Create `apps/api/.env` (copy from `apps/api/.env.example` and set):

```env
# Database (same as created above)
DATABASE_URL="postgresql://yourdrive:choose_a_strong_password@localhost:5432/yourdrive_db"

# Your DuckDNS hostname – use HTTPS
FRONTEND_URL="https://yourapp.duckdns.org"
BACKEND_URL="https://yourapp.duckdns.org"
VERT_URL="https://yourapp.duckdns.org"

# JWT – generate strong random strings (e.g. openssl rand -hex 32)
JWT_ACCESS_SECRET="your-long-random-secret"
JWT_REFRESH_SECRET="another-long-random-secret"
JWT_TEMP_SECRET="third-long-random-secret"

# Server
NODE_ENV=production
PORT=3001
HOST=127.0.0.1

# Optional: leave B2_* unset to use base64 avatars; set if you use Backblaze
# B2_ENDPOINT=...
# B2_BUCKET_NAME=...
# B2_KEY_ID=...
# B2_APPLICATION_KEY=...

# Optional: email (for verification etc.)
# SMTP_HOST=...
# SMTP_PORT=...
# SMTP_USER=...
# SMTP_PASS=...
```

Run migrations once:

```bash
cd apps/api && npx prisma migrate deploy && cd ../..
```

---

## 8. Caddy – reverse proxy + HTTPS

Caddy will:

- Serve the built web app (static files).
- Proxy `/api` to your Node API.
- Get a free HTTPS certificate for `yourapp.duckdns.org`.

Copy and edit the Caddyfile (or create from scratch):

```bash
cd ~/yourdrive
sudo cp deploy/Caddyfile.example /etc/caddy/Caddyfile
sudo nano /etc/caddy/Caddyfile
```

**Edit two things:**

- Replace `yourapp.duckdns.org` with your real DuckDNS hostname.
- Replace `/home/pi/yourdrive` with the path where you cloned the repo (e.g. `/home/pi/yourdrive`).

Then:

```bash
sudo systemctl reload caddy
# Or: sudo systemctl restart caddy
```

Caddy will request a certificate from Let’s Encrypt. Port 80 must be reachable from the internet (your port forward in step 2).

---

## 9. Run the API (PM2 so it survives reboots)

```bash
sudo npm install -g pm2
cd ~/yourdrive/apps/api
pm2 start dist/index.js --name yourdrive-api
pm2 save
pm2 startup
```

Use the command `pm2 startup` prints so the API starts on boot.

---

## 10. Web app build (use same origin for API)

So the frontend talks to the same host (and cookies work), build with **relative** API URL:

In `apps/web` we use `baseURL: "/api"` when `VITE_API_URL` is unset, so **do not** set `VITE_API_URL` when building for this setup. The built app will call `https://yourapp.duckdns.org/api/...` via Caddy proxy.

If you ever build with a different base URL:

```bash
cd apps/web
# Optional: force same-origin
# echo 'VITE_API_URL=/api' > .env.production
npm run build
```

---

## 11. Check from the internet

1. From **another network** (e.g. phone off Wi‑Fi), open: **https://yourapp.duckdns.org**
2. You should see the app; sign up / log in and use it.

If it doesn’t load:

- Confirm port 80 (and 443) is forwarded to the Pi.
- Run `sudo /opt/duckdns/duck.sh` and check DuckDNS page shows your current IP.
- Check: `sudo systemctl status caddy` and `pm2 status`.
- Check: `curl -I http://127.0.0.1:3001/api/health` on the Pi.

---

## 12. Optional: static IP for the Pi

In the router, set a **DHCP reservation** (or static IP) for the Pi’s MAC address so its local IP (e.g. `192.168.1.10`) never changes. Then your port-forward rule stays valid.

---

## Summary

| Step | What |
|------|------|
| 1 | DuckDNS: create `yourapp.duckdns.org`, get token |
| 2 | Router: forward 80 & 443 to Pi’s local IP |
| 3 | Pi: install Node, PostgreSQL, Caddy |
| 4 | Pi: DuckDNS updater script + cron every 5 min |
| 5 | Pi: create DB and user |
| 6 | Pi: clone repo, `npm install`, build api + web |
| 7 | Pi: `apps/api/.env` with DATABASE_URL, FRONTEND_URL, BACKEND_URL, JWT_*, PORT=3001, HOST=127.0.0.1 |
| 8 | Pi: Caddyfile with your hostname, root = web dist, reverse_proxy /api to 3001 |
| 9 | Pi: run API with PM2 and enable startup |
| 10 | Visit https://yourapp.duckdns.org from the internet |

All of this is free (DuckDNS, Let’s Encrypt, your Pi and home connection).
