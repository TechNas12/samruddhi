# 🚀 Hosting Guide — Samruddhi Organics

**Bare-metal deployment** using PM2, PostgreSQL, Cloudflare Tunnel, and GitHub Actions CI/CD.

| Service  | Domain                              | Local Port |
|----------|-------------------------------------|------------|
| Frontend | `https://www.samruddhiorganics.shop` | 3000       |
| Backend  | `https://www.api.samruddhiorganics.shop` | 8000   |

---

## Step 1: Server Prerequisites

Install on your Linux server:
```bash
# Node.js (v18+), npm, PM2
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2

# Python 3.11+
sudo apt install -y python3 python3-venv python3-pip

# PostgreSQL
sudo apt install -y postgresql postgresql-contrib
```

---

## Step 2: Database Setup

```bash
# Switch to postgres user and create the database
sudo -u postgres psql

# Inside psql:
CREATE USER sanket WITH PASSWORD 'sanket12';
CREATE DATABASE samruddhi OWNER sanket;
GRANT ALL PRIVILEGES ON DATABASE samruddhi TO sanket;
\q
```

---

## Step 3: Configure `backend/.env`

```env
DATABASE_URL=postgresql://sanket:sanket12@localhost:5432/samruddhi
SECRET_KEY=fa6f044def8c5ce94fec6cf43018132d923ee11f139a2818ff1aa61c5461ff77
ALLOWED_ORIGINS=https://www.samruddhiorganics.shop,https://www.api.samruddhiorganics.shop,http://localhost:3000
FRONTEND_URL=https://www.samruddhiorganics.shop

SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=samruddhiorganics12@gmail.com
SMTP_PASSWORD=ineefpzysrwltyqr
ADMIN_EMAIL=samruddhiorganics12@gmail.com
```

> [!IMPORTANT]
> DB host is `localhost` (bare-metal), not `db` (Docker).

---

## Step 4: First-Time Manual Deploy

```bash
# Clone the repo
git clone https://github.com/YOUR_USER/samruddhi_organics.git
cd samruddhi_organics

# Backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
pm2 start "$(pwd)/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000" --name "samruddhi-api" --cwd "$(pwd)"

# Frontend
cd ../frontend
npm install
NEXT_PUBLIC_API_URL=https://www.api.samruddhiorganics.shop npm run build
pm2 start "npm run start" --name "samruddhi-web" --cwd "$(pwd)"

# Save PM2 config & enable startup on reboot
pm2 save
pm2 startup
```

---

## Step 5: CI/CD Pipeline (GitHub Actions)

After the first manual deploy, subsequent pushes to `master` trigger automatic deployment via `.github/workflows/deploy.yml`.

**Setup the self-hosted runner:**
1. Go to **GitHub Repo → Settings → Actions → Runners → New self-hosted runner**
2. Follow the Linux setup instructions on your server
3. Start the runner as a service:
   ```bash
   sudo ./svc.sh install
   sudo ./svc.sh start
   ```

Every push to `master` will now:
1. Pull latest code
2. Install backend dependencies & restart via PM2
3. Build frontend with production API URL & restart via PM2

---

## Step 6: Cloudflare Tunnel

Add two **Public Hostnames** to your existing tunnel in Cloudflare Dashboard:

| Hostname | Service |
|---|---|
| `www.samruddhiorganics.shop` | `http://localhost:3000` |
| `www.api.samruddhiorganics.shop` | `http://localhost:8000` |

Cloudflare handles DNS and SSL automatically.

---

## Useful Commands

```bash
# Check status
pm2 status

# View logs
pm2 logs samruddhi-api
pm2 logs samruddhi-web

# Restart services
pm2 restart samruddhi-api
pm2 restart samruddhi-web

# Database backup
pg_dump -U sanket samruddhi > backup_$(date +%F).sql
```

---

## Troubleshooting

| Issue | Fix |
|---|---|
| CORS errors | Check `ALLOWED_ORIGINS` in `backend/.env` matches frontend domain exactly |
| API 404 from frontend | Verify `NEXT_PUBLIC_API_URL` was set during `npm run build` |
| DB connection refused | Ensure PostgreSQL is running: `sudo systemctl status postgresql` |
| Port already in use | `pm2 stop all` then restart, or `lsof -i :8000` to find the process |
| CI/CD not triggering | Check runner status: `sudo ./svc.sh status` in the runner directory |
