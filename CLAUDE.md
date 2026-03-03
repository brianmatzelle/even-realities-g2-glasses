# Even Realities G2 Glasses — Plugin Development

## Architecture

Plugins are web apps (TypeScript + Vite) that run on your own server. The iPhone Even App loads your URL in a WebView and relays messages to the glasses over BLE. No code runs on the glasses — they are a display + input peripheral.

```
[Your Server] <--HTTPS--> [iPhone WebView] <--BLE--> [G2 Glasses]
```

## Reference Documentation

The best resource for development is the community-maintained docs repo:
**https://github.com/nickustinov/even-g2-notes**

Key docs in that repo:
- `docs/architecture.md` — system overview, SDK init, message flow
- `docs/display-ui.md` — containers, text, images, layout constraints
- `docs/input-events.md` — tap, swipe, ring, event delivery
- `docs/page-lifecycle.md` — createStartUpPageContainer, rebuild, upgrade, shutdown
- `docs/packaging.md` — app.json manifest, CLI commands, QR sideloading, .ehpk format
- `docs/simulator.md` — even-dev simulator setup
- `docs/ui-patterns.md` — buttons, selection highlights, progress bars, navigation

Reference apps in that repo: Chess, Reddit, Weather, Tesla, Pong, Snake.

## Hardware Constraints

- Display: 576×288 pixels per eye, 4-bit greyscale (16 shades of green)
- Max 4 containers per page (TextContainer, ListContainer, ImageContainer)
- Exactly one container must have `isEventCapture: 1`
- Text limits: 1000 chars on startup/rebuild, 2000 chars on upgrade
- Image size: 20–200px width, 20–100px height
- Single built-in font, no size/style control
- No camera, no speaker. Has microphone.
- Input: temple touch gestures + R1 control ring via BLE

## SDK

```typescript
import { waitForEvenAppBridge } from '@evenrealities/even_hub_sdk'
const bridge = await waitForEvenAppBridge()
```

Key methods on `bridge`:
- `createStartUpPageContainer(config)` — initial page (call once at startup)
- `rebuildPageContainer(config)` — full page replace (causes flicker)
- `textContainerUpgrade(config)` — update text in-place (no flicker, preferred)
- `updateImageRawData(config)` — update image container
- `shutDownPageContainer(mode)` — cleanup (0=immediate, 1=confirm dialog)
- `onEvenHubEvent(callback)` — register event listener

## Event Types (OsEventTypeList)

- `CLICK_EVENT` (0) — single tap (SDK may normalize to `undefined`)
- `SCROLL_TOP_EVENT` (1) — swipe up / scroll to top boundary
- `SCROLL_BOTTOM_EVENT` (2) — swipe down / scroll to bottom boundary
- `DOUBLE_CLICK_EVENT` (3) — double tap
- `FOREGROUND_ENTER_EVENT` (4) — app enters foreground
- `FOREGROUND_EXIT_EVENT` (5) — app exits foreground
- Ring events: `RING_CLOCKWISE_EVENT`, `RING_COUNTER_CLOCKWISE_EVENT`, `RING_CLICK_EVENT`

## Container Properties

All containers share: `xPosition`, `yPosition`, `width`, `height`, `containerID`, `containerName`.
TextContainer adds: `content`, `borderWidth` (0–5), `borderColor` (0–15), `borderRdaius` (string, note typo), `paddingLength` (0–32), `isEventCapture` (0 or 1).

## Dev Workflow

```bash
npm run dev          # Start Vite dev server on 0.0.0.0:5173
npm run qr           # Generate QR code to scan in Even App
npm run build        # Production build
npm run pack         # Build + package into .ehpk
```

Use your machine's local network IP for QR codes, not localhost. Hot reload works during dev.

## Quirks & Gotchas

- `borderRdaius` is a typo in the SDK — use the misspelled version, it's a string not number
- SDK normalizes `CLICK_EVENT` (0) to `undefined` in `eventType` — handle both
- Text containers with `isEventCapture: 1` consume scroll gestures internally (firmware scrolls overflow text); use `SCROLL_TOP_EVENT`/`SCROLL_BOTTOM_EVENT` to detect boundaries
- `createStartUpPageContainer` must be called exactly once; use `rebuildPageContainer` after
- Image data can't be sent during `createStartUpPageContainer` — call `updateImageRawData` after
- Throttle rapid scroll events (~300ms cooldown)
- Simulator behavior differs from hardware (sends `sysEvent` instead of `textEvent`)
