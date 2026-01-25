# GitHub Repository Setup Instructions

## Option 1: Using GitHub CLI (Recommended)

If you have GitHub CLI installed:

```zsh
# Install GitHub CLI if not installed
brew install gh

# Authenticate (if not already done)
gh auth login

# Create repository and push
gh repo create chlapi --public --source=. --remote=origin --push
```

## Option 2: Manual Setup (Web Interface)

1. **Create the repository on GitHub:**
   - Go to https://github.com/new
   - Repository name: `chlapi`
   - Description: `FastAPI application with MongoDB integration using Motor`
   - Select: **Public**
   - **DO NOT** check "Initialize this repository with a README" (we already have one)
   - Click **"Create repository"**

2. **Connect and push your code:**

   After creating the repo, GitHub will show you commands. Use these:

   ```zsh
   git remote add origin https://github.com/YOUR_USERNAME/chlapi.git
   git branch -M main
   git push -u origin main
   ```

   Replace `YOUR_USERNAME` with your actual GitHub username.

   Or if you prefer SSH:

   ```zsh
   git remote add origin git@github.com:YOUR_USERNAME/chlapi.git
   git branch -M main
   git push -u origin main
   ```

## Option 3: Using the Setup Script

Run the provided script:

```zsh
./setup_github.sh chlapi YOUR_GITHUB_USERNAME
```

---

**Note:** Make sure you're authenticated with GitHub before pushing.
