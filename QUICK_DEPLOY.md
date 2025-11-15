# 🚀 Quick Deploy to Vercel - 5 Minutes

## Step 1: Push to GitHub (2 minutes)

```bash
# Navigate to project
cd /Users/machupalligovardhinidevi/Desktop/game

# Initialize Git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "FreeFire Team Splitter - Ready for Vercel"

# Create repo on GitHub.com, then:
git remote add origin https://github.com/YOUR_USERNAME/freefire-team-splitter.git
git branch -M main
git push -u origin main
```

## Step 2: Deploy to Vercel (3 minutes)

1. **Go to**: https://vercel.com
2. **Sign up/Login** with GitHub
3. **Click**: "Add New..." → "Project"
4. **Import** your GitHub repository
5. **Settings**:
   - Framework Preset: **Other**
   - Build Command: *(leave empty)*
   - Output Directory: *(leave empty)*
   - Install Command: *(leave empty)*
6. **Click**: "Deploy"
7. **Wait**: 1-2 minutes
8. **Done!** 🎉 Your site is live!

## Your Live URL

You'll get: `https://your-project.vercel.app`

## That's It!

No build process, no configuration needed. Vercel automatically:
- ✅ Serves your static files
- ✅ Handles routing (SPA support)
- ✅ Provides HTTPS
- ✅ Auto-deploys on every Git push

---

**Need more details?** See `DEPLOYMENT.md`

