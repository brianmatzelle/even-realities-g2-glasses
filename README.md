# Even Realities G2 — Plugin Template

A starter template for building plugins for [Even Realities G2](https://www.evenrealities.com/) smart glasses. Built with TypeScript and Vite.

## How It Works

G2 plugins are web apps. Your code runs on a server, the iPhone Even App loads it in a WebView, and relays display/input over BLE to the glasses. No code runs on the glasses themselves.

```
[Your Server] ←HTTPS→ [iPhone WebView] ←BLE→ [G2 Glasses]
```

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- Even Realities G2 glasses paired with the [Even App](https://apps.apple.com/app/even-app/id6738030153) on iPhone
- Your dev machine and iPhone on the same local network

## Quick Start

1. **Use this template** — click "Use this template" on GitHub, or clone it directly:

   ```bash
   git clone https://github.com/brianmatzelle/even-realities-g2-glasses.git my-g2-plugin
   cd my-g2-plugin
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Start the dev server:**

   ```bash
   npm run dev
   ```

4. **Load on your glasses** — generate a QR code and scan it in the Even App:

   ```bash
   npm run qr
   ```

   > Use your machine's local network IP, not `localhost`. The QR command handles this for you.

5. **Edit `src/main.ts`** and see changes hot-reload on the glasses.

## Project Structure

```
├── src/
│   └── main.ts          # Plugin entry point — start here
├── app.json             # Plugin manifest (name, ID, version)
├── index.html           # HTML shell loaded by the WebView
├── vite.config.ts       # Vite dev server config
├── tsconfig.json        # TypeScript config
├── CLAUDE.md            # AI-assisted development context
└── package.json
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server on `0.0.0.0:5173` |
| `npm run qr` | Generate QR code to sideload via Even App |
| `npm run build` | Production build to `dist/` |
| `npm run pack` | Build + package into `.ehpk` for distribution |

## Customizing

1. **Update `app.json`** with your plugin's name, ID, and description
2. **Edit `src/main.ts`** — the template includes a working example that cycles through messages on tap/swipe
3. Build your UI using the SDK's container system (see below)

## Display & Input

**Display:** 576×288 pixels per eye, 4-bit greyscale (16 shades of green), single built-in font.

**Containers:** Up to 4 per page — `TextContainer`, `ListContainer`, `ImageContainer`. Exactly one must have `isEventCapture: 1`.

**Input events:**
- **Tap** — `CLICK_EVENT` (also fires as `undefined` due to SDK normalization)
- **Double-tap** — `DOUBLE_CLICK_EVENT`
- **Swipe up** — `SCROLL_TOP_EVENT`
- **Swipe down** — `SCROLL_BOTTOM_EVENT`
- **Ring** — `RING_CLOCKWISE_EVENT`, `RING_COUNTER_CLOCKWISE_EVENT`, `RING_CLICK_EVENT`

## SDK Basics

```typescript
import { waitForEvenAppBridge } from '@evenrealities/even_hub_sdk'

const bridge = await waitForEvenAppBridge()

// Show initial page (call once)
await bridge.createStartUpPageContainer(config)

// Update text without flicker (preferred)
await bridge.textContainerUpgrade(config)

// Full page replace (causes flicker)
await bridge.rebuildPageContainer(config)

// Listen for gestures
bridge.onEvenHubEvent((event) => { /* handle taps, swipes, ring */ })
```

## Known Quirks

- `borderRdaius` is a typo in the SDK — use the misspelled version (it's a string, not a number)
- `CLICK_EVENT` (0) gets normalized to `undefined` by the SDK — handle both
- `createStartUpPageContainer` must be called exactly once; use `rebuildPageContainer` after
- Images can't be sent during startup — call `updateImageRawData` after the initial page renders
- Throttle rapid scroll events (~300ms cooldown recommended)

## Resources

- [Community docs & reference apps](https://github.com/nickustinov/even-g2-notes) — architecture, UI patterns, example plugins (Chess, Reddit, Weather, Pong, and more)
- [Even Realities](https://www.evenrealities.com/) — official site
- [`@evenrealities/even_hub_sdk`](https://www.npmjs.com/package/@evenrealities/even_hub_sdk) — SDK on npm

## License

MIT
