# Complete Guide: GitHub → Vercel Deployment

Follow these steps in order to deploy your FreeFire Team Splitter to Vercel.

---

## Part 1: Upload to GitHub

### Step 1: Create GitHub Repository

1. **Go to GitHub**: https://github.com
2. **Sign in** (or create account if needed)
3. **Click** the "+" icon (top right) → "New repository"
4. **Repository settings**:
   - **Repository name**: `freefire-team-splitter` (or any name you like)
   - **Description**: "FreeFire Team Splitter Web App"
   - **Visibility**: 
     - ✅ **Public** (free, recommended)
     - ⚠️ Private (requires paid GitHub plan)
   - **DO NOT** check:
     - ❌ Add a README file
     - ❌ Add .gitignore
     - ❌ Choose a license
   - (Leave all unchecked - you already have these files)
5. **Click** "Create repository"

### Step 2: Upload Files to GitHub

**Option A: Using GitHub Website (Easiest for beginners)**

1. After creating the repo, GitHub will show you a page with instructions
2. **Scroll down** to "uploading an existing file"
3. **Or** click "uploading an existing file" link
4. **Drag and drop** all files from your `game` folder:
   - `index.html`
   - `vercel.json`
   - `package.json`
   - `README.md`
   - `css/` folder (drag the entire folder)
   - `js/` folder (drag the entire folder)
   - All `.md` files
5. **Scroll down** and click "Commit changes"
6. **Done!** Your code is on GitHub

**Option B: Using Git Commands (Recommended)**

Open Terminal and run:

```bash
# Navigate to your project folder
cd /Users/machupalligovardhinidevi/Desktop/game

# Initialize Git (if not already done)
git init

# Add all files
git add .

# Commit files
git commit -m "Initial commit - FreeFire Team Splitter"

# Add GitHub repository as remote
# Replace YOUR_USERNAME with your GitHub username
# Replace REPO_NAME with your repository name
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

**If asked for credentials:**
- Use a **Personal Access Token** (not password)
- Create one at: https://github.com/settings/tokens
- Select scope: `repo` (full control)

---

## Part 2: Deploy to Vercel

### Step 1: Sign Up for Vercel

1. **Go to**: https://vercel.com
2. **Click** "Sign Up" (top right)
3. **Choose**: "Continue with GitHub"
4. **Authorize** Vercel to access your GitHub account
5. **Complete** the signup process

### Step 2: Import Your Repository

1. **In Vercel Dashboard**, click "Add New..." → "Project"
2. **You'll see** a list of your GitHub repositories
3. **Find** your `freefire-team-splitter` repository
4. **Click** "Import" next to it

### Step 3: Configure Project

**Important Settings:**

1. **Project Name**: 
   - Keep default or change to `freefire-team-splitter`
   - This becomes part of your URL

2. **Framework Preset**: 
   - Select **"Other"** from dropdown
   - (Don't select React, Next.js, etc.)

3. **Root Directory**: 
   - Leave as `./` (default)

4. **Build and Output Settings**:
   - **Build Command**: *(Leave EMPTY)*
   - **Output Directory**: *(Leave EMPTY)*
   - **Install Command**: *(Leave EMPTY)*

5. **Environment Variables**: 
   - *(Leave empty for now - not needed)*

### Step 4: Deploy

1. **Click** the blue "Deploy" button
2. **Wait** 1-2 minutes while Vercel:
   - Clones your repository
   - Analyzes your files
   - Deploys your site
3. **You'll see** a progress bar
4. **When done**, you'll see: "Congratulations! Your project has been deployed."

### Step 5: Get Your Live URL

After deployment, you'll see:
- **Production URL**: `https://your-project-name.vercel.app`
- **Click** the URL to open your live site!

---

## Part 3: Test Your Deployment

1. **Visit** your Vercel URL
2. **Test Admin Panel**:
   - Click "Admin Panel"
   - Complete setup (if first time)
   - Add players, create rooms
3. **Test Player Flow**:
   - Click "Player Login"
   - Enter shared password
   - Select profile, request OTP
   - Verify OTP, join matches
4. **Everything should work!** ✅

---

## Part 4: Future Updates

To update your deployed site:

1. **Make changes** to your local files
2. **Commit and push** to GitHub:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
3. **Vercel automatically redeploys!** ✨
   - Usually takes 1-2 minutes
   - You'll get a notification when done

---

## Troubleshooting

### Issue: "Build Failed"
- **Solution**: Make sure Build Command is **empty**
- Check that `vercel.json` is correct

### Issue: "404 on refresh"
- **Solution**: Already fixed with `vercel.json` rewrites

### Issue: "Assets not loading"
- **Solution**: All paths are relative - should work automatically

### Issue: "EmailJS not working"
- **Solution**: 
  - Check browser console (F12)
  - Verify EmailJS keys in `js/email-config.js`
  - Ensure EmailJS service is active

---

## Your Deployment Checklist

- [ ] Created GitHub repository
- [ ] Uploaded all files to GitHub
- [ ] Signed up for Vercel
- [ ] Imported repository to Vercel
- [ ] Configured project (Framework: Other)
- [ ] Deployed successfully
- [ ] Tested admin panel
- [ ] Tested player flow
- [ ] Tested OTP sending
- [ ] Everything works! 🎉

---

## Quick Reference

**GitHub Repository**: `https://github.com/YOUR_USERNAME/freefire-team-splitter`

**Vercel Dashboard**: `https://vercel.com/dashboard`

**Your Live Site**: `https://your-project.vercel.app`

---

**Need help?** Check the browser console (F12) for any errors.

**Ready to deploy?** Follow the steps above! 🚀

