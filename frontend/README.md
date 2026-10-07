# NERD Frontend

Modern, high-performance web dashboard for the NSL-KDD network intrusion detection system. Built with React, Vite, and Tailwind CSS adhering strictly to the design specifications in [`DESIGN.md`](./DESIGN.md).

---

## Key Features

- **Design System Fidelity:** Calm pearl-and-peach ombré palette, Bricolage Grotesque display headings, Public Sans body, dark/light theme toggle, and Motion/Still accessibility controls.
- **Contract-Driven API Client:** Robust typed client handling 422 field validation mapping, confusion matrix row-normalization, class display ordering, and Render free-tier cold start backoff.
- **Honest ML Presentation:** Real probabilities from the API, XGBoost log-odds margin contributions ("pushes toward/away"), and transparent callouts on R2L/U2R class detection limitations.
- **Ultra-lightweight Bundle:** ~75 kB JS gzipped (well under the 1.5 MB ceiling), zero WebGL, pure transform/opacity animations.

---

## Environment Variables

| Variable | Default | Purpose |
| :--- | :--- | :--- |
| `VITE_API_URL` | `http://localhost:8000` | Backend API base URL |

Copy `.env.example` to create your local `.env`:
```bash
cp .env.example .env
```

---

## Local Development

### 1. Install Dependencies
```bash
cd frontend
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
The local server runs on `http://localhost:3000`.

### 3. Run Unit Tests
```bash
npm test
```
Tests run with Vitest in node environment, validating the contract client rules and data normalization.

### 4. Build for Production
```bash
npm run build
```
Production output is generated in `frontend/dist/`.

---

## Deploying to Static Hosting

The build output in `frontend/dist/` is completely static and ready for deployment to any CDN:

### Deploy to Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run deployment:
   ```bash
   cd frontend
   vercel --prod
   ```
3. Set the Environment Variable `VITE_API_URL` in the Vercel dashboard to your deployed backend URL.

### Deploy to Netlify
1. Build the frontend: `npm run build`
2. Run Netlify CLI or drag-and-drop `frontend/dist` to Netlify.
3. Configure `VITE_API_URL` in Site settings > Environment variables.

### Deploy to Cloudflare Pages
1. Build command: `npm run build`
2. Build output directory: `dist`
3. Root directory: `frontend`
4. Set environment variable `VITE_API_URL` to your production API URL.
