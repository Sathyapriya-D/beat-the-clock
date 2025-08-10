# beat-the-clock
beat the clock
# Live Quotes — Dynamic Quote Generator

This is a simple static site that fetches random quotes from https://api.quotable.io/random.

## Run locally
- Option A: Just open `index.html` in your browser (works but some browsers block fetch from file://).
- Option B (recommended): run a local static server:
  - `npx serve .` (install `serve` if needed)
  - open http://localhost:3000

## Deploy to Vercel
1. Create a GitHub repo and push this project.
2. Go to https://vercel.com, sign in, click "Add New Project", import your repo.
3. Use defaults and Deploy. The site will be live in seconds.
