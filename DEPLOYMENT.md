# CivicFix Deployment Guide

This guide covers deploying CivicFix to production using Vercel (frontend) and Render (backend).

## Prerequisites

- GitHub account
- Vercel account
- Render account
- Neon PostgreSQL account (or Render PostgreSQL)
- Cloudinary account

## Step 1: Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit - CivicFix Smart City Complaint Management System"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/CivicFix.git
git push -u origin main
```

## Step 2: Set up PostgreSQL Database

### Option A: Neon (Recommended)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project named `civicfix-db`
3. Copy the connection string
4. Format for SQLAlchemy: `postgresql+psycopg://USER:PASSWORD@HOST/DBNAME?sslmode=require`

### Option B: Render PostgreSQL

1. Go to Render Dashboard
2. Create New → PostgreSQL
3. Name it `civicfix-db`
4. Copy the internal database URL

## Step 3: Deploy Backend to Render

1. Go to [render.com](https://render.com)
2. Click "New Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `civicfix-api`
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

5. Add Environment Variables:
   ```
   DATABASE_URL=your_postgresql_connection_string
   SECRET_KEY=your_production_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

6. Click "Deploy Web Service"
7. Wait for deployment and note the API URL (e.g., `https://civicfix-api.onrender.com`)

## Step 4: Configure Cloudinary

1. Sign up at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → Settings
3. Note down:
   - Cloud Name
   - API Key
   - API Secret

Add these to your Render backend environment variables.

## Step 5: Deploy Frontend to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your GitHub repository
4. Configure:
   - **Project Name**: `civicfix`
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite

5. Add Environment Variable:
   ```
   VITE_API_URL=https://your-render-api-url/api/v1
   ```

6. Click "Deploy"
7. Wait for deployment and note the frontend URL (e.g., `https://civicfix.vercel.app`)

## Step 6: Update CORS

Update `backend/app/main.py` to allow your Vercel domain:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://civicfix.vercel.app",
        "http://localhost:5173"  # Keep for local development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Commit and push this change to trigger a redeploy on Render.

## Step 7: Run Database Migrations

Since we're using SQLAlchemy with SQLite in development, you'll need to:

1. SSH into your Render backend (optional)
2. Or add a startup script in `main.py` to create tables:

```python
# This is already in main.py:
Base.metadata.create_all(bind=engine)
```

The tables will be created automatically on first deployment.

## Step 8: Test Production

1. Visit your Vercel frontend URL
2. Test registration and login
3. Submit a complaint
4. Check if it appears in the database
5. Test admin and staff workflows

## Environment Variables Reference

### Backend (Render)
- `DATABASE_URL`: PostgreSQL connection string
- `SECRET_KEY`: Long random string for JWT signing
- `CLOUDINARY_CLOUD_NAME`: Cloudinary cloud name
- `CLOUDINARY_API_KEY`: Cloudinary API key
- `CLOUDINARY_API_SECRET`: Cloudinary API secret

### Frontend (Vercel)
- `VITE_API_URL`: Your Render backend URL with `/api/v1` suffix

## Monitoring

### Render
- View logs in Render dashboard
- Monitor CPU, memory, and response times
- Set up alerts for errors

### Vercel
- View deployment logs
- Monitor build times
- Set up analytics

## Troubleshooting

### Backend Not Starting
- Check Render logs for errors
- Verify all environment variables are set
- Ensure Python version is compatible

### Frontend API Errors
- Verify VITE_API_URL is correct
- Check CORS configuration
- Verify backend is running

### Database Connection Issues
- Check DATABASE_URL format
- Verify PostgreSQL is running
- Check SSL settings (Neon requires sslmode=require)

### Image Upload Failures
- Verify Cloudinary credentials
- Check file size limits
- Ensure Cloudinary is accessible

## Security Notes

- Use strong SECRET_KEY in production
- Never commit .env files
- Enable HTTPS (automatic on Vercel/Render)
- Consider adding rate limiting
- Add input validation on all endpoints
- Implement proper error handling

## Scaling

### When to Scale
- High traffic volume
- Many concurrent users
- Large database size

### Scaling Options
- **Backend**: Upgrade Render plan, add load balancer
- **Database**: Upgrade PostgreSQL plan, add read replicas
- **Frontend**: Vercel automatically scales

## Backup Strategy

- Enable automatic backups on Render PostgreSQL
- Regular database exports
- Cloudinary automatically stores images
- Git repository for code backup

## Cost Estimation

### Free Tier (Development)
- Render: Free tier available
- Vercel: Free tier available
- Neon: Free tier available
- Cloudinary: Free tier available

### Production (Estimates)
- Render: ~$7-25/month depending on plan
- Vercel: $20-40/month for Pro plan
- Neon: ~$19-47/month depending on size
- Cloudinary: $89+/month for Pro plan

## Next Steps

1. Set up custom domain (optional)
2. Configure SSL certificates (automatic)
3. Set up monitoring and alerts
4. Implement email notifications
5. Add analytics (Google Analytics, etc.)
6. Set up CI/CD pipeline
