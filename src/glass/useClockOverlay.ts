import { useEffect, useRef } from 'react';
import {
  RebuildPageContainer,
  TextContainerProperty,
  TextContainerUpgrade,
  ImageContainerProperty,
} from '@evenrealities/even_hub_sdk';

// G2 display constants (mirrors even-toolkit/glasses/layout)
const DISPLAY_W = 576;
const DISPLAY_H = 288;

// Clock container config
const CLOCK_ID = 6;
const CLOCK_NAME = 'clock';
const CLOCK_WIDTH = 80;   // enough for "HH:MM" at default font
const CLOCK_HEIGHT = 40;  // single line height (enough to avoid scrollbar)

function getClockText(): string {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

/**
 * Monkey-patch the EvenHubBridge to include a clock text container
 * in the top-right corner of the G2 display.
 *
 * - showHomePage is replaced to include the clock in rebuildPageContainer
 * - updateHomeText is wrapped to also update the clock via textContainerUpgrade
 */
function showHomePageWithClock(hub: any, menuText: string, imageTiles?: any[]): Promise<void> {
  return (async () => {
    if (!hub.rawBridge || !hub._pageReady) return;

    // Render dummy page first (same as original)
    await hub.sdk.renderPage(hub.chartDummyPage);

    const tiles = imageTiles && imageTiles.length > 0 ? imageTiles : [];
    const textY = tiles.length > 0 ? tiles[0].y + tiles[0].h : 0;

    await hub.rawBridge.rebuildPageContainer(new RebuildPageContainer({
      containerTotalNum: 3 + tiles.length, // overlay + menu + clock + images
      textObject: [
        new TextContainerProperty({
          containerID: 1, containerName: 'overlay',
          xPosition: 0, yPosition: 0, width: DISPLAY_W, height: DISPLAY_H,
          borderWidth: 0, borderColor: 0, paddingLength: 0,
          content: '', isEventCapture: 1,
        }),
        new TextContainerProperty({
          containerID: 5, containerName: 'menu',
          xPosition: 0, yPosition: textY, width: DISPLAY_W, height: DISPLAY_H - textY,
          borderWidth: 0, borderColor: 0, paddingLength: 6,
          content: menuText, isEventCapture: 0,
        }),
        new TextContainerProperty({
          containerID: CLOCK_ID, containerName: CLOCK_NAME,
          xPosition: DISPLAY_W - CLOCK_WIDTH, yPosition: textY,
          width: CLOCK_WIDTH, height: CLOCK_HEIGHT,
          borderWidth: 0, borderColor: 0, paddingLength: 6,
          content: getClockText(), isEventCapture: 0,
        }),
      ],
      imageObject: tiles.map((t: any) => new ImageContainerProperty({
        containerID: t.id, containerName: t.name,
        xPosition: t.x, yPosition: t.y, width: t.w, height: t.h,
      })),
    }));
    hub._currentMode = 'home';
  })();
}

function patchBridge(hub: any): void {
  if (hub.__clockPatched) return;

  const origShowHomePage = hub.showHomePage.bind(hub);
  const origUpdateHomeText = hub.updateHomeText.bind(hub);

  hub.__clockOrigShowHomePage = origShowHomePage;
  hub.__clockOrigUpdateHomeText = origUpdateHomeText;

  // Replace showHomePage to include clock container in rebuild
  hub.showHomePage = async (menuText: string, imageTiles?: any[]) => {
    hub.__clockNeedsRebuild = false; // clock container is being set up
    await showHomePageWithClock(hub, menuText, imageTiles);
  };

  // Wrap updateHomeText to also update clock.
  // On the FIRST call after patching (__clockNeedsRebuild), do a full rebuild
  // instead — this guarantees the clock container exists regardless of startup
  // timing between useClockOverlay and useGlasses.
  hub.updateHomeText = async (content: string) => {
    if (hub.__clockNeedsRebuild) {
      hub.__clockNeedsRebuild = false;
      await showHomePageWithClock(hub, content);
      return;
    }
    await origUpdateHomeText(content);
    if (hub.rawBridge && hub._currentMode === 'home') {
      try {
        await hub.rawBridge.textContainerUpgrade(new TextContainerUpgrade({
          containerID: CLOCK_ID, containerName: CLOCK_NAME,
          contentOffset: 0, contentLength: 10, content: getClockText(),
        }));
      } catch {
        // Clock update failed — non-critical, skip silently
      }
    }
  };

  hub.__clockPatched = true;
  hub.__clockNeedsRebuild = true;
}

function unpatchBridge(hub: any): void {
  if (!hub.__clockPatched) return;

  hub.showHomePage = hub.__clockOrigShowHomePage;
  hub.updateHomeText = hub.__clockOrigUpdateHomeText;
  delete hub.__clockPatched;
  delete hub.__clockOrigShowHomePage;
  delete hub.__clockOrigUpdateHomeText;
}

/**
 * Force a page rebuild so the clock container is added/removed.
 * Resets currentMode so the next sendDisplay triggers showHomePage.
 */
function forceRebuild(hub: any): void {
  hub._currentMode = null;
}

/**
 * Hook: overlay a clock text container on the G2 glass display.
 * Patches the EvenHubBridge when enabled, restores when disabled.
 */
export function useClockOverlay(enabled: boolean): void {
  const patchedRef = useRef(false);

  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | null = null;

    function tryPatch() {
      const hub = (window as any).__evenBridge;
      if (!hub?.rawBridge) return;

      if (enabled && !patchedRef.current) {
        patchBridge(hub);
        forceRebuild(hub);
        patchedRef.current = true;
      } else if (!enabled && patchedRef.current) {
        unpatchBridge(hub);
        forceRebuild(hub);
        patchedRef.current = false;
      }

      // Once patched/unpatched, stop polling
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    // Bridge may not be ready yet — poll briefly
    tryPatch();
    if ((enabled && !patchedRef.current) || (!enabled && patchedRef.current)) {
      timer = setInterval(tryPatch, 200);
    }

    return () => {
      if (timer) clearInterval(timer);
    };
  }, [enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      const hub = (window as any).__evenBridge;
      if (hub && patchedRef.current) {
        unpatchBridge(hub);
        patchedRef.current = false;
      }
    };
  }, []);
}
