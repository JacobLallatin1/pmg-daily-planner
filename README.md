# PMG Daily Planner

A daily planner app for LDS missionaries, styled after the Preach My Gospel app.
Built with React + Vite, deployable as a PWA (Progressive Web App).

---

## Project Structure

```
pmg-daily-planner/
├── public/
│   └── icons/
│       ├── icon.svg       ← Convert this to icon-192.png and icon-512.png (see below)
│       ├── icon-192.png   ← You need to generate this
│       └── icon-512.png   ← You need to generate this
├── src/
│   ├── main.jsx           ← Entry point
│   └── App.jsx            ← Main planner component (rename pmg-planner.jsx → App.jsx)
├── index.html
├── package.json
└── vite.config.js
```

---

## Setup

### 1. Create the project folder and add files

```bash
mkdir pmg-daily-planner
cd pmg-daily-planner
```

Copy all provided files into the correct locations shown above.
Rename `pmg-planner.jsx` → `src/App.jsx`.

### 2. Generate app icons

You need `icon-192.png` and `icon-512.png` in `public/icons/`.

**Easy option:** Go to https://svgtopng.com, upload `icon.svg`, and export at 192×192 and 512×512.

Or use any image editor to create a 192px and 512px PNG with the PMG look.

### 3. Install dependencies

```bash
npm install
```

### 4. Run locally

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### 5. Build for production

```bash
npm run build
```

---

## Deploy to Vercel (free)

1. Go to https://vercel.com and sign up (free)
2. Install Vercel CLI (optional): `npm i -g vercel`
3. Run `vercel` in your project folder, or:
   - Push to GitHub, then import the repo at https://vercel.com/new
   - Vercel auto-detects Vite — no config needed
4. Your app will be live at `your-app-name.vercel.app`

---

## Install on iPhone (PWA)

1. Friend opens the Vercel link in **Safari** (must be Safari, not Chrome)
2. Taps the **Share** button (box with arrow)
3. Taps **"Add to Home Screen"**
4. Taps **Add**

The app now appears on their home screen, opens full-screen with no browser bar,
and works offline after the first load.

---

## Customization

- **Colors:** Edit the constants at the top of `App.jsx` (CHURCH_NAVY, CHURCH_GOLD, etc.)
- **Hours:** Change the `HOURS` array to adjust the time range shown
- **Categories:** Edit the `CATEGORY_COLORS` array to rename or recolor appointment types
- **Scripture:** Replace the hardcoded verse in the Goals tab with a dynamic one
