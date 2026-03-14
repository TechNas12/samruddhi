# 🌿 Samruddhi Organics

An e-commerce web application for Samruddhi Organics — a platform for premium organic products including composts, fruits, foods, compost liquids, garden tools, and seeds.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (React) |
| Backend | FastAPI (Python) |
| Database | PostgreSQL |
| Process Manager | PM2 |
| Tunnel / CDN | Cloudflare Tunnel |
| CI/CD | GitHub Actions (Self-Hosted Runner) |

---

## 🌐 Live URLs

| Service | URL |
|---------|-----|
| Website | https://www.samruddhiorganics.shop |
| API | https://api.samruddhiorganics.shop |
| API Docs | https://api.samruddhiorganics.shop/docs |

---

## 📁 Project Structure

```
samruddhi/
├── frontend/               # Next.js app
│   ├── app/                # App router pages
│   ├── components/         # React components
│   └── .env.local          # Frontend environment variables
├── backend/                # FastAPI app
│   ├── main.py             # App entry point
│   ├── models.py           # SQLAlchemy models
│   ├── schemas.py          # Pydantic schemas
│   ├── auth.py             # Authentication logic
│   ├── database.py         # DB connection
│   ├── routers/            # API route handlers
│   ├── utils/              # Utility functions
│   ├── uploads/            # Uploaded product images
│   ├── seed.py             # Database seeder
│   ├── requirements.txt    # Python dependencies
│   └── .env                # Backend environment variables
├── .github/
│   └── workflows/
│       └── deploy.yml      # CI/CD pipeline
└── ecosystem.config.js     # PM2 process config
```

---

## ⚙️ Local Development

### Prerequisites
- Node.js 18+
- Python 3.11+
- PostgreSQL

### Backend

```bash
cd backend
python3 -m venv venv
source venv/bin/activate       # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env           # Fill in your values
uvicorn main:app --reload --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local     # Fill in your values
npm run dev
```

---

## 🔑 Environment Variables

### Backend (`backend/.env`)

```env
DATABASE_URL=postgresql://user:password@localhost:5432/samruddhi
SECRET_KEY=your_secret_key
ALLOWED_ORIGINS=https://www.samruddhiorganics.shop,https://samruddhiorganics.shop,http://localhost:3000
FRONTEND_URL=https://www.samruddhiorganics.shop
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
ADMIN_EMAIL=your_email@gmail.com
```

### Frontend (`frontend/.env.local`)

```env
NEXT_PUBLIC_API_URL=https://api.samruddhiorganics.shop
```

> ⚠️ Never commit `.env` files to version control.

---

## 🗄️ Database

Tables are created automatically on first startup via `Base.metadata.create_all()`.

To seed the database with sample products and users:

```bash
cd backend
source venv/bin/activate
python seed.py
```

Default credentials after seeding:

| Role | Email | Password |
|------|-------|----------|
| Admin | dahotresanket12@gmail.com | @Sanket12 |
| User | user@test.com | samruddhi09 |

---

## 🚀 Production Deployment

The app is hosted on a home server using **Cloudflare Tunnel** (no open ports required).

### Architecture

```
Browser → Cloudflare → Cloudflare Tunnel → Home Server
                                          ├── PM2 → Next.js (:3000)
                                          └── PM2 → FastAPI (:8000)
```

### Services

| Service | Local Port | Public Domain |
|---------|-----------|---------------|
| Frontend | 3000 | www.samruddhiorganics.shop |
| Backend | 8000 | api.samruddhiorganics.shop |

### PM2 Process Management

```bash
pm2 start ecosystem.config.js   # Start all services
pm2 status                       # Check status
pm2 logs                         # View logs
pm2 restart all                  # Restart all
```

### Cloudflare Tunnel

The tunnel is managed as a systemd service:
```bash
sudo systemctl status cloudflared
sudo systemctl restart cloudflared
```

Config: `/etc/cloudflared/config.yml`

---

## 🔄 CI/CD Pipeline

Every push to `master` triggers an automatic deployment via GitHub Actions using a **self-hosted runner** on the production server.

### Pipeline Steps
1. Checkout latest code
2. Install backend Python dependencies
3. Restart backend via PM2
4. Install frontend dependencies & build
5. Restart frontend via PM2

### Runner Status
Check runner health at:
`GitHub Repo → Settings → Actions → Runners`

---

## 🐛 Troubleshooting

### CORS errors in browser
- Ensure the visiting domain is listed in `ALLOWED_ORIGINS` in `backend/.env`
- Restart backend after any `.env` changes: `pm2 restart samruddhi-api`

### Backend not starting after reboot
- PM2 must be started via `ecosystem.config.js` so the correct working directory is set
- Run: `pm2 start ~/apps/samruddhi/ecosystem.config.js && pm2 save`

### Check live logs
```bash
pm2 logs samruddhi-api --lines 50
pm2 logs samruddhi-web --lines 50
```

---

## 📄 License

Private project — Samruddhi Organics © 2026