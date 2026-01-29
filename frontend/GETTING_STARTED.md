# Step-by-Step Guide: Running the React Frontend Application

This guide assumes you have **never installed or run React before**. Follow these steps in order.

## Prerequisites: Install Node.js

Before you can run a React application, you need to install **Node.js**, which includes:
- **Node.js** - The JavaScript runtime
- **npm** (Node Package Manager) - Used to install React and other dependencies

### Step 1: Check if Node.js is Already Installed

Open your terminal (Terminal on macOS, Command Prompt or PowerShell on Windows) and run:

```bash
node --version
```

If you see a version number (like `v18.17.0` or `v20.10.0`), Node.js is already installed! Skip to **Step 3**.

If you see an error like `command not found` or `'node' is not recognized`, continue to **Step 2**.

### Step 2: Install Node.js

**For macOS:**
1. Visit [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS (Long Term Support)** version (recommended)
3. Run the installer and follow the installation wizard
4. Restart your terminal after installation

**Alternative for macOS (using Homebrew):**
If you have Homebrew installed, you can run:
```bash
brew install node
```

**For Windows:**
1. Visit [https://nodejs.org/](https://nodejs.org/)
2. Download the **LTS (Long Term Support)** version (recommended)
3. Run the installer (.msi file) and follow the installation wizard
4. Make sure to check the box that says "Automatically install the necessary tools"
5. Restart your terminal/command prompt after installation

**For Linux:**
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or using your package manager
sudo apt update
sudo apt install nodejs npm
```

### Step 3: Verify Installation

After installing Node.js, verify both Node.js and npm are installed:

```bash
node --version
npm --version
```

You should see version numbers for both commands. If you do, you're ready to proceed!

---

## Running the React Application

### Step 4: Navigate to the Frontend Directory

Open your terminal and navigate to the project's frontend folder:

```bash
cd /Users/gman/Documents/code/chlapp/frontend
```

**Note:** If you're already in the project root (`chlapp`), you can use:
```bash
cd frontend
```

### Step 5: Install Project Dependencies

This is the first time setup step. It downloads all the React libraries and tools needed for this project.

Run this command:

```bash
npm install
```

**What this does:**
- Reads the `package.json` file
- Downloads React, Vite, and all other dependencies listed
- Creates a `node_modules` folder with all the packages
- This may take 1-3 minutes depending on your internet connection

**What you'll see:**
- A progress indicator
- Various package names being downloaded
- A message like "added 150 packages" when complete

**If you see errors:**
- Make sure you're in the `frontend` directory
- Check your internet connection
- Try running `npm install` again

### Step 6: Start the Development Server

Once installation is complete, start the React development server:

```bash
npm run dev
```

**What this does:**
- Starts a local web server
- Compiles your React code
- Opens the application in your browser automatically

**What you'll see:**
- Terminal output showing:
  ```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ```
- Your default web browser should automatically open to `http://localhost:3000`

### Step 7: View Your Application

The React application should now be running! You should see:

- **If the browser opened automatically:** The app should be visible
- **If the browser didn't open:** Open your browser and go to `http://localhost:3000`

You should see the CHL App interface with either:
- The onboarding flow (if you're on `/` or `/onboarding`)
- The daily check-in interface (if you're on `/checkin`)

### Step 8: Keep the Terminal Open

**Important:** Keep the terminal window open while you're using the app. The `npm run dev` command keeps running and:
- Watches for file changes
- Automatically refreshes the browser when you save code changes
- Shows any errors in the terminal

To stop the server, press `Ctrl + C` (or `Cmd + C` on macOS) in the terminal.

---

## Common Commands Reference

Here are the main commands you'll use:

| Command | What it does |
|---------|-------------|
| `npm install` | Install all dependencies (run once, or when dependencies change) |
| `npm run dev` | Start the development server |
| `npm run build` | Create a production build (for deployment) |
| `npm run preview` | Preview the production build locally |

---

## Troubleshooting

### Problem: "command not found: node" or "node: command not found"

**Solution:** Node.js is not installed or not in your PATH. Go back to **Step 2** and install Node.js.

### Problem: "npm: command not found"

**Solution:** npm should come with Node.js. Try reinstalling Node.js or restart your terminal.

### Problem: "Port 3000 is already in use"

**Solution:** Another application is using port 3000. You can either:
- Stop the other application using port 3000
- Or modify `vite.config.js` to use a different port (e.g., 3001)

### Problem: "Cannot find module" errors

**Solution:** You may need to reinstall dependencies:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problem: The page shows "Cannot GET /" or a blank page

**Solution:** 
- Make sure the development server is running (`npm run dev`)
- Check the terminal for any error messages
- Try refreshing the browser
- Check that you're going to `http://localhost:3000` (not 3001 or another port)

### Problem: Changes to code don't appear in the browser

**Solution:**
- Make sure you saved the file
- Check the terminal for compilation errors
- Try manually refreshing the browser (Ctrl+R or Cmd+R)
- The browser should auto-refresh, but sometimes a manual refresh helps

---

## Next Steps

Once the app is running:

1. **Explore the application** - Navigate between the onboarding and check-in pages
2. **Make changes** - Edit files in `src/` and see them update automatically
3. **Read the code** - Check out `src/App.jsx` to see how the app is structured
4. **Check the README** - See `README.md` for more details about the project structure

---

## Summary Checklist

- [ ] Node.js is installed (`node --version` works)
- [ ] npm is installed (`npm --version` works)
- [ ] Navigated to the `frontend` directory
- [ ] Ran `npm install` successfully
- [ ] Ran `npm run dev` successfully
- [ ] Browser opened to `http://localhost:3000`
- [ ] Application is visible and working

If you've checked all these boxes, congratulations! You've successfully set up and run your first React application! 🎉
