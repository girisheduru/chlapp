# Capacitor (Android & iOS)

The web app is wrapped with [Capacitor](https://capacitorjs.com/). **Vercel** still deploys the same Vite build; native projects live under `frontend/android` and `frontend/ios`.

**Important:** `ios/App/App/public` (and the copied web assets) are **generated** by `npx cap sync` and are typically **gitignored**. Xcode runs whatever JS is in that folder—**not** `frontend/dist` until you sync. After any change to source or `.env`, run `npm run build:mobile:ios` (or `npm run build && npx cap sync ios`) before Run in Xcode, or you will keep seeing old errors and old `index-*.js` filenames.

## Environment variables

Native builds bake in env at **`vite build`** time. Create `frontend/.env` (or `.env.production`) with the same variables as Vercel, especially:

- `VITE_API_URL` — your Railway (or other) backend base URL, e.g. `https://your-api.railway.app`
- All `VITE_FIREBASE_*` keys used for web

Then run the build commands below so API and Firebase calls work in the app.

**After any change to `frontend/.env`**, run `npm run build:mobile` (Android) or `npm run build:mobile:ios` (iOS) so the new values are compiled into `dist` and copied into the native app. Xcode does not read `.env` at launch.

If you still see `[api.js] VITE_API_URL is not set` in the simulator, the app is running an **old** web bundle: run `npm run build:mobile:ios` from `frontend/`, then in Xcode **Product → Clean Build Folder** (⇧⌘K) and Run again. The Vite config pins `root`/`envDir` to `frontend/` so `.env` is found even when the build command runs from another directory.

For a **local backend** on the simulator, `VITE_API_URL=http://127.0.0.1:8000` or `http://localhost:8000` is typical; on a **physical device**, use your Mac’s LAN IP (e.g. `http://192.168.1.x:8000`) instead of `localhost`.

## Android

1. Install [Android Studio](https://developer.android.com/studio).
2. From repo root: `cd frontend && npm run build:mobile` (or `npm run build:mobile` from root).
3. Open `frontend/android` in Android Studio, run on a device or emulator.

## iOS (macOS + full Xcode)

**Command Line Tools are not enough.** `pod install` / `cap sync ios` call `xcodebuild`, which requires the full **Xcode** app from the Mac App Store (several GB).

If you see:

`xcode-select: error: tool 'xcodebuild' requires Xcode, but active developer directory '...CommandLineTools' is a command line tools instance`

then either Xcode is not installed, or the active developer path is wrong. Fix:

1. Install **Xcode** from the App Store and open it once (accept license, let components finish).
2. Point the tools at Xcode:

```bash
sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
```

3. Then from `frontend/`:

```bash
cd ios/App && pod install && cd ../..
npm run build:mobile:ios   # runs a pre-check, then vite build && npx cap sync ios
open ios/App/App.xcworkspace
```

**`[CP] Embed Pods Frameworks` / `Sandbox: bash deny file-read-data Pods-App-frameworks.sh`:** Xcode’s **User Script Sandboxing** (`ENABLE_USER_SCRIPT_SANDBOXING`) blocks the CocoaPods embed script from reading under `Pods/`. This project sets that to **NO** in the App target (and re-applies it in the `Podfile` after `pod install`). If Xcode “recommended settings” turn it back on, set **Build Settings → User Script Sandboxing → No** for the **App** target.

## Sync both platforms (Mac with Xcode)

```bash
cd frontend && npm run build:mobile:all
```

## Backend CORS

Production/staging backends should allow Capacitor origins. Defaults in the API include `https://localhost`, `http://localhost`, and `capacitor://localhost`. Override with `CORS_ORIGINS` if you use a custom scheme or domain.

## Firebase / Google Sign-In

The app uses **`signInWithPopup`** in the browser, with **redirect** fallback if the popup is blocked. On **Capacitor** (simulator/device), it uses **`signInWithRedirect`** only.

Google often **blocks or limits** OAuth inside embedded WebViews—if sign-in fails on iOS/Android, add **authorized domains** in Firebase and consider a **native Google Sign-In plugin** (separate setup; not configured in this repo).

In **Firebase Console → Authentication → Settings → Authorized domains**, include your auth host, `localhost`, and `127.0.0.1`.
