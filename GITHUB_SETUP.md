# GitHub Repository Setup Guide

This guide will help you push the CHL App to GitHub and set it up as a repository.

## Prerequisites

- Git installed
- GitHub account
- Repository created on GitHub (or you'll create one)

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `chlapp` (or your preferred name)
3. Description: "Full-stack habit tracking application with FastAPI and React"
4. Choose Public or Private
5. **DO NOT** initialize with README, .gitignore, or license (we already have these)
6. Click "Create repository"

## Step 2: Add Remote and Push

After creating the repository, GitHub will show you commands. Use these:

```bash
cd /Users/gke/Desktop/Github/CTCHack/chlapp

# Add the remote (replace YOUR_USERNAME with your GitHub username)
git remote add origin https://github.com/YOUR_USERNAME/chlapp.git

# Rename branch to main (if needed)
git branch -M main

# Push to GitHub
git push -u origin main
```

## Step 3: Verify

1. Visit your repository on GitHub
2. Verify all files are present
3. Check that README.md displays correctly

## Alternative: Using SSH

If you prefer SSH:

```bash
git remote add origin git@github.com:YOUR_USERNAME/chlapp.git
git branch -M main
git push -u origin main
```

## Setting Up Branch Protection (Optional)

For production repositories, consider:

1. Go to Settings → Branches
2. Add branch protection rule for `main`
3. Enable:
   - Require pull request reviews
   - Require status checks to pass
   - Require branches to be up to date

## Setting Up GitHub Actions Secrets (If Needed)

If your app needs environment variables:

1. Go to Settings → Secrets and variables → Actions
2. Add secrets like:
   - `MONGODB_URL`
   - `LLM_API_KEY`
   - etc.

## Repository Settings

### Topics
Add topics to help discoverability:
- `habit-tracking`
- `fastapi`
- `react`
- `mongodb`
- `full-stack`
- `vite`

### Description
"Full-stack habit tracking application combining FastAPI backend with MongoDB and React frontend with Vite"

### Website
If you deploy:
- Frontend: Your deployed frontend URL
- Backend: Your deployed API URL

## Next Steps

After pushing to GitHub:

1. ✅ Enable GitHub Actions (if using CI)
2. ✅ Set up branch protection (recommended)
3. ✅ Add repository topics
4. ✅ Configure repository settings
5. ⏭️ Set up deployment (Vercel, Railway, etc.)
6. ⏭️ Add badges to README (optional)

## Badges (Optional)

You can add badges to your README:

```markdown
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Python](https://img.shields.io/badge/python-3.11+-blue.svg)
![Node](https://img.shields.io/badge/node-18+-green.svg)
![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-green.svg)
![React](https://img.shields.io/badge/React-18.2-blue.svg)
```

## Troubleshooting

### Authentication Issues

If you get authentication errors:

**HTTPS:**
```bash
# Use personal access token instead of password
git remote set-url origin https://YOUR_TOKEN@github.com/YOUR_USERNAME/chlapp.git
```

**SSH:**
```bash
# Generate SSH key if needed
ssh-keygen -t ed25519 -C "your_email@example.com"
# Add to GitHub: Settings → SSH and GPG keys
```

### Large Files

If you have large files (venv, node_modules):

1. Ensure `.gitignore` is correct
2. Remove from git if already tracked:
   ```bash
   git rm -r --cached backend/venv
   git rm -r --cached frontend/node_modules
   git commit -m "Remove large directories from git"
   ```

### Push Rejected

If push is rejected:
```bash
# Pull first
git pull origin main --rebase
# Then push
git push -u origin main
```
