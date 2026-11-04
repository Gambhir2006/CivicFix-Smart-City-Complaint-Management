@echo off
REM CivicFix Deployment Script for Windows

echo CivicFix Deployment Script
echo ============================
echo.

REM Check if git is initialized
if not exist ".git" (
    echo Initializing git repository...
    git init
    git add .
    git commit -m "Initial commit - CivicFix Smart City Complaint Management System"
) else (
    echo Git repository already initialized
)

REM Check if remote is set
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo Adding remote repository...
    set /p repo_url="Enter your GitHub repository URL: "
    git remote add origin %repo_url%
    git branch -M main
    git push -u origin main
) else (
    echo Remote repository already configured
    set /p push="Push to GitHub? (y/n): "
    if /i "%push%"=="y" (
        git push origin main
    )
)

echo.
echo Deployment steps:
echo 1. Backend: Deploy to Render using the GitHub repository
echo 2. Frontend: Deploy to Vercel using the GitHub repository
echo 3. Database: Set up PostgreSQL on Neon or Render
echo 4. Cloudinary: Configure Cloudinary for image storage
echo.
echo See DEPLOYMENT.md for detailed instructions
pause
