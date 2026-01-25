#!/bin/zsh

# Script to create GitHub repository and push code
# Usage: ./setup_github.sh <repository-name> [github-username]

REPO_NAME="${1:-chlapi}"
GITHUB_USER="${2}"

echo "🚀 Setting up GitHub repository: $REPO_NAME"

# Check if GitHub CLI is installed
if command -v gh &> /dev/null; then
    echo "✅ GitHub CLI found. Creating repository..."
    gh repo create "$REPO_NAME" --public --source=. --remote=origin --push
    echo "✅ Repository created and pushed!"
    exit 0
fi

# If GitHub CLI is not available, provide manual instructions
echo ""
echo "📋 GitHub CLI not found. Please follow these steps:"
echo ""
echo "1. Go to https://github.com/new"
echo "2. Repository name: $REPO_NAME"
echo "3. Description: FastAPI application with MongoDB integration using Motor"
echo "4. Select: Public"
echo "5. DO NOT initialize with README, .gitignore, or license (we already have these)"
echo "6. Click 'Create repository'"
echo ""
echo "7. Then run these commands:"
echo ""
echo "   git remote add origin https://github.com/${GITHUB_USER:-YOUR_USERNAME}/$REPO_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
echo "Or if you prefer SSH:"
echo "   git remote add origin git@github.com:${GITHUB_USER:-YOUR_USERNAME}/$REPO_NAME.git"
echo "   git branch -M main"
echo "   git push -u origin main"
echo ""
