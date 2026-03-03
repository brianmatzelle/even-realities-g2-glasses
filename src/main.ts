import {
  waitForEvenAppBridge,
  EvenAppBridge,
  CreateStartUpPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
  OsEventTypeList,
} from '@evenrealities/even_hub_sdk'
import type { EvenHubEvent } from '@evenrealities/even_hub_sdk'

// ─── Messages to cycle through ───────────────────────────────
const messages = [
  '■ Hello from G2! ■\n\nTap to cycle messages\nSwipe ← → to navigate\nDouble-tap to reset',
  '■ Display Info ■\n\n576 × 288 pixels per eye\n4-bit greyscale\n16 shades of green',
  '■ Input Events ■\n\nTap · Long Press\nSwipe ← → ↑ ↓\nRing ↻ ↺ Click',
  '■ Architecture ■\n\nYour server → iPhone → G2\nWebView bridge over BLE\nJust a web app!',
  '■ Next Steps ■\n\nEdit src/main.ts\nAdd your own features\nHave fun building!',
]

// ─── State ───────────────────────────────────────────────────
let bridge: EvenAppBridge
let currentIndex = 0

const CONTAINER_ID = 1
const CONTAINER_NAME = 'main'

// ─── Display helpers ─────────────────────────────────────────
async function showStartupPage(): Promise<void> {
  await bridge.createStartUpPageContainer(
    new CreateStartUpPageContainer({
      containerTotalNum: 1,
      textObject: [
        new TextContainerProperty({
          containerID: CONTAINER_ID,
          containerName: CONTAINER_NAME,
          content: messages[currentIndex],
          xPosition: 20,
          yPosition: 20,
          width: 536,
          height: 248,
          borderWidth: 2,
          borderColor: 10,
          borderRdaius: '5',
          paddingLength: 12,
          isEventCapture: 1,
        }),
      ],
    })
  )
}

async function updateText(): Promise<void> {
  const content = messages[currentIndex]
  await bridge.textContainerUpgrade(
    new TextContainerUpgrade({
      containerID: CONTAINER_ID,
      containerName: CONTAINER_NAME,
      content,
    })
  )
}

// ─── Event handling ──────────────────────────────────────────
function resolveEventType(event: EvenHubEvent): number | undefined {
  if (event.textEvent) return event.textEvent.eventType
  if (event.sysEvent) return event.sysEvent.eventType
  if (event.listEvent) return event.listEvent.eventType
  return undefined
}

function onEvent(event: EvenHubEvent): void {
  const eventType = resolveEventType(event)

  switch (eventType) {
    // Tap — next message
    case OsEventTypeList.CLICK_EVENT:
    case undefined: // SDK normalizes 0 (CLICK) to undefined
      currentIndex = (currentIndex + 1) % messages.length
      updateText()
      break

    // Double-tap — reset to first message
    case OsEventTypeList.DOUBLE_CLICK_EVENT:
      currentIndex = 0
      updateText()
      break

    // Scroll/swipe down or right — next message
    case OsEventTypeList.SCROLL_BOTTOM_EVENT:
      currentIndex = (currentIndex + 1) % messages.length
      updateText()
      break

    // Scroll/swipe up or left — previous message
    case OsEventTypeList.SCROLL_TOP_EVENT:
      currentIndex = (currentIndex - 1 + messages.length) % messages.length
      updateText()
      break
  }
}

// ─── Bootstrap ───────────────────────────────────────────────
async function main(): Promise<void> {
  bridge = await waitForEvenAppBridge()

  bridge.onEvenHubEvent((event: EvenHubEvent) => {
    onEvent(event)
  })

  await showStartupPage()
}

main()
