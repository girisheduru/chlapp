# Frontend Troubleshooting Guide

## Common Issues and Solutions

### Issue: Cannot find module 'vite/cli.js' or similar errors

**Symptoms:**
- Error: `Cannot find module '/path/to/node_modules/dist/node/cli.js'`
- Error: `Cannot find module 'vite'`
- Vite binary not found

**Solution:**
```bash
cd frontend

# Remove corrupted dependencies
rm -rf node_modules package-lock.json

# Clear npm cache
npm cache clean --force

# Reinstall dependencies
npm install

# Try again
npm run dev
```

### Issue: Port 3000 already in use

**Solution:**
Update `vite.config.js`:
```js
server: {
  port: 3001, // or any other available port
  // ...
}
```

### Issue: Module resolution errors

**Solution:**
```bash
# Clear all caches and reinstall
rm -rf node_modules package-lock.json .vite
npm cache clean --force
npm install
```

### Issue: React Router errors

**Solution:**
Ensure `react-router-dom` is installed:
```bash
npm install react-router-dom
```

### Issue: CORS errors when calling API

**Solution:**
1. Verify backend is running on port 8000
2. Check Vite proxy configuration in `vite.config.js`
3. Ensure API calls use `/api` prefix (automatically proxied)

### Issue: Build errors

**Solution:**
```bash
# Clean build
rm -rf dist .vite

# Rebuild
npm run build
```

## Node Version Issues

If you're using Node v25+ and experiencing issues, you might need to use Node 18 or 20:

```bash
# Using nvm (Node Version Manager)
nvm install 18
nvm use 18
npm install
npm run dev
```

## Complete Reset

If nothing else works:

```bash
cd frontend

# Remove everything
rm -rf node_modules package-lock.json .vite dist

# Clear npm cache
npm cache clean --force

# Reinstall
npm install

# Try again
npm run dev
```

## Getting Help

1. Check the browser console for errors
2. Check terminal output for build errors
3. Verify Node.js and npm versions
4. Check that all dependencies are installed correctly
