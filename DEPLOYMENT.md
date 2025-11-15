# Deployment Guide - Vercel

This guide will help you deploy the FreeFire Team Splitter to Vercel.

## Prerequisites

1. A GitHub account (free)
2. A Vercel account (free) - Sign up at https://vercel.com

## Step 1: Prepare Your Code

✅ All files are already prepared for deployment:
- ✅ All paths are relative (no localhost references)
- ✅ All assets use relative paths
- ✅ No build process required (static files)

## Step 2: Push to GitHub

1. **Initialize Git** (if not already done):
   ```bash
   cd /Users/machupalligovardhinidevi/Desktop/game
   git init
   git add .
   git commit -m "Initial commit - FreeFire Team Splitter"
   ```

2. **Create a GitHub Repository**:
   - Go to https://github.com/new
   - Create a new repository (e.g., `freefire-team-splitter`)
   - **Don't** initialize with README (you already have files)

3. **Push to GitHub**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/freefire-team-splitter.git
   git branch -M main
   git push -u origin main
   ```
   Replace `YOUR_USERNAME` with your GitHub username.

## Step 3: Deploy to Vercel

### Option A: Via Vercel Website (Recommended)

1. **Go to Vercel**:
   - Visit https://vercel.com
   - Sign up/Login with GitHub

2. **Import Project**:
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository you just created

3. **Configure Project**:
   - **Framework Preset**: Other
   - **Root Directory**: `./` (leave as default)
   - **Build Command**: Leave empty (no build needed)
   - **Output Directory**: Leave empty
   - **Install Command**: Leave empty

4. **Environment Variables** (Optional):
   - If you want to use environment variables for EmailJS config later, you can add them here
   - For now, the config is in `js/email-config.js`

5. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete (usually 1-2 minutes)

6. **Get Your URL**:
   - Once deployed, you'll get a URL like: `https://your-project.vercel.app`
   - Your site is now live! 🎉

### Option B: Via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Deploy**:
   ```bash
   cd /Users/machupalligovardhinidevi/Desktop/game
   vercel
   ```

4. **Follow the prompts**:
   - Link to existing project or create new
   - Confirm settings
   - Deploy!

## Step 4: Verify Deployment

1. Visit your Vercel URL
2. Test the application:
   - Admin login
   - Player login
   - OTP sending (EmailJS should work)
   - All features

## Important Notes

### EmailJS Configuration

Your EmailJS configuration is in `js/email-config.js`. This file contains your API keys.

**Security Note**: For production, consider:
- Using environment variables (optional)
- Keeping the file as-is is fine for this use case
- The keys are public anyway (client-side)

### Custom Domain (Optional)

1. Go to your project in Vercel dashboard
2. Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions

### Updates

To update your deployed site:
1. Make changes locally
2. Commit and push to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
3. Vercel will automatically redeploy! ✨

## Troubleshooting

### Issue: 404 errors on refresh
- **Solution**: The `vercel.json` file handles this with SPA routing

### Issue: Assets not loading
- **Solution**: Check that all paths are relative (they already are)

### Issue: EmailJS not working
- **Solution**: 
  - Check browser console for errors
  - Verify EmailJS keys in `js/email-config.js`
  - Ensure EmailJS service is active

### Issue: localStorage not persisting
- **Note**: This is expected - localStorage is per-browser/device
- For shared data across devices, you'd need a backend (future upgrade)

## File Structure for Deployment

```
game/
├── index.html          ✅ Main entry point
├── vercel.json         ✅ Vercel configuration
├── .gitignore          ✅ Git ignore file
├── css/
│   └── styles.css      ✅ Styles
├── js/
│   ├── admin.js        ✅ Admin logic
│   ├── app.js          ✅ Player logic
│   ├── email-config.js ✅ EmailJS config
│   ├── router.js       ✅ Navigation
│   ├── storage.js      ✅ localStorage
│   └── teamgen.js      ✅ Team algorithm
├── README.md           ✅ Documentation
└── DEPLOYMENT.md        ✅ This file
```

## Support

If you encounter any issues:
1. Check Vercel deployment logs
2. Check browser console (F12)
3. Verify all files are committed to Git

---

**Your app is ready for deployment! 🚀**

