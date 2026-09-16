# VXL Protocol — Swap Interface UI

A working frontend prototype of the **Swap Interface UI Design Concepts**
(UI inspired by [Arina's shot series on Dribbble](https://dribbble.com/shots/22266291-Swap-Interface-Ui-Design-Concepts)).

Dark glassmorphism crypto-landing aesthetic: iridescent blobs, glass cards, a live
token list with sparklines, and a fully functional **swap panel** — all vanilla
HTML/CSS/JS, no build step, no backend. All imagery is generated locally.

## Features

- **Landing** — hero headline, watch-video pill, Certik badge, animated *total
  transactions* counter, live token list (Uniswap / Binance / Blockmine / Bite)
  with real-time updating **sparkline charts**, and a carousel-style node-network
  card. Prices random-walk every ~2s.
- **Swap panel** — sell/buy inputs with live quotes, token picker modal with
  search, flip-button animation, MAX button, slippage selector, price-impact and
  route lines, balance validation ("Insufficient balance" state).
- **Confirmation flow** — confirm modal → spinner → success checkmark, balances
  update, swap is appended to the **Recent swaps** history.
- **Theme toggle** — moon button switches between dark and light glass themes.
- Fully responsive.

## Run locally

```bash
npx serve .
# or
python -m http.server 3000
```

## Deploy to GitHub + Vercel

```bash
git init
git add .
git commit -m "VXL swap interface prototype"
git branch -M main
git remote add origin https://github.com/<your-username>/vxl-swap.git
git push -u origin main
```

Then on Vercel: **Add New → Project → Import** the repo — it's detected as a
static site automatically (no build command). Every push redeploys.

## Structure

```
├── index.html        # landing + swap views
├── styles.css        # glassmorphism design system (dark/light)
├── app.js            # token data, live sparklines, swap engine
└── assets/
    ├── bg-blobs.jpg  # generated iridescent background
    └── node-tile.jpg # generated node-network artwork
```

## Credits

Design reference: *Swap Interface UI Design Concepts* by Arina (Product UX/UI) on
Dribbble. All code and images in this repo are original recreations for portfolio
purposes. Token prices are simulated.
