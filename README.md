# UNMINDY

Scroll-interrupt + lock-in commitment app. Catches autopilot scrolling, asks one honest question, and gets you started on what you're avoiding — in two minutes.

## Structure

```
unmindy/
├── brand/              # Logo + brand assets
│   └── logo.svg
├── landing/            # Landing page (v1)
│   ├── index.html
│   ├── styles.css
│   └── scripts.js
├── app/                # App v0 (self-contained)
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── scripts/
│   └── deploy.sh       # Deploy helper
├── package.json
└── README.md
```

## Phase Plan

1. **Build** — landing page + app v0 (this repo)
2. **Validate** — use app, gather feedback
3. **Launch** — host landing, share link
4. **Grow** — short-form content about the problem
5. **Earn** — after real traction

## Tech

- Pure HTML/CSS/JS (no framework, no build step)
- Dark Vercel B&W design system
- Glassmorphism + subtle depth effects
- Geist typography
- localStorage for stats

## Status

- ✅ Logo (reticle/crosshair mark)
- ✅ Landing page v2 (dark, glass, asymmetric)
- ✅ App v0 (core loop: input → step → timer → done)
- 🔄 GitHub + Vercel MCP connected

## License

MIT
