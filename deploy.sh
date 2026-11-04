#!/bin/bash

# CivicFix Deployment Script
# This script helps deploy CivicFix to production

echo "CivicFix Deployment Script"
echo "=========================="
echo ""

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "Initializing git repository..."
    git init
    git add .
    git commit -m "Initial commit - CivicFix Smart City Complaint Management System"
else
    echo "Git repository already initialized"
fi

# Check if remote is set
if ! git remote get-url origin > /dev/null 2>&1; then
    echo "Adding remote repository..."
    read -p "Enter your GitHub repository URL: " repo_url
    git remote add origin $repo_url
    git branch -M main
    git push -u origin main
else
    echo "Remote repository already configured"
    read -p "Push to GitHub? (y/n): " push
    if [ "$push" = "y" ]; then
        git push origin main
    fi
fi

echo ""
echo "Deployment steps:"
echo "1. Backend: Deploy to Render using the GitHub repository"
echo "2. Frontend: Deploy to Vercel using the GitHub repository"
echo "3. Database: Set up PostgreSQL on Neon or Render"
echo "4. Cloudinary: Configure Cloudinary for image storage"
echo ""
echo "See DEPLOYMENT.md for detailed instructions"
