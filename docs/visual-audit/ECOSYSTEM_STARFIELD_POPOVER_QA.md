# Ecosystem Starlight and Point Popovers

Date: 2026-08-27. Scope: the home-page ecosystem only.
This follows the client video replacement and supersedes the earlier
below-stage detail-panel decision. HIBRID hero and MONA are unchanged.

## Visual Changes

- Procedural, natural-looking starlight: 220 stars on desktop, 110 on compact
  scenes, mostly white with subtle cool/warm white variation. This is not a
  mapped astronomical catalogue. Brand yellow/fuchsia remain on service dots.
- Cached light sprites, small bright cores, and restrained diffraction on a
  few bright stars replace uniformly drawn colored dots. Three smooth waves
  give independent scintillation; bounded drift stays around a pixel.
- Native crystal playback is `1x`; the previously approved `0.85` size stays.
  Selection eases into at most 4.5% additional crystal magnification.
- Slower service orbits and at most 1.2px/0.6px ambient scene displacement.
  An open popover freezes scene parallax so its controls do not move.
- Particle lifetime is 3.8-5.4 seconds. Pools are capped at 128 particles per
  desktop point, 64 per compact point (1024/512 total), with no extra library.
  Traces still follow actual motion and react to the pointer.
- A 248px nonmodal popover replaces the bottom detail band. It chooses a clear
  side near the active point, flips/clamps inside the stage, and prioritizes
  keeping the crystal visible. On narrow screens it may use a clear corner.
  Distant placements have no long connector drawn across the central stone.
- The stage has an explicit 100% width, max 1100px, and min 480px height. This
  prevents aspect-ratio/min-height sizing from widening the mobile viewport.

## Interaction and Accessibility

Each point exposes `aria-haspopup="dialog"`, `aria-controls` and expanded
state. The popover receives focus, has a title and description, and retains
real locale-aware service links. It closes on Escape, the close control,
outside pointer input or focus leaving the active control/popover. Keyboard
focus returns to the point on explicit dismissal. No modal focus trap.

The active point remains still; other service points continue to orbit.
Popover placement has hysteresis, avoiding flips from tiny pointer movement.
Manual pause, hidden/offscreen suspension, reduced motion and poster fallback
remain in place. Reduced motion also disables star drift/twinkle, particles,
selection zoom and the popover entry animation.

## Verification Scope

Unit coverage includes bounded star motion/brightness, static reduced motion,
long-lived pooled trails, normal video speed, and popover placement over full
orbits at 273/343/608/640/736/1100px stage widths.

Browser checks cover real Canvas pixels, twinkling, hover/scroll playback,
dragging, keyboard focus, nonmodal dismissal, crystal zoom, mobile tap,
popover/crystal non-overlap, and 390/768/1440px clipping and screenshots.
Loop checks sample three full video playbacks for blank frames; they do not
claim to repair the supplied source video's reflection change at its seam.

No dependencies, generated stock imagery, commits, push or deployment added
by this UI revision. Physical iOS Safari and low-power devices are unverified.

## Results

- Unit tests: 108/108 passed; lint and typecheck clean.
- Full Chromium/WebKit ecosystem run: 33 passed, 1 skipped. The skip is the
  Chromium-only CDP touch-drag injector, not the native WebKit tap test.
- After suppressing long popover connectors, the focused popover/viewport
  rerun passed 8/8 tests across both browsers.
- Both engines completed three normal-speed video playbacks without sampled
  blank crystal frames. No whole-site E2E or Lighthouse rerun in this revision.
- Build passed: 66 static pages; home First Load JS 143 kB (previously 142 kB).
- 1440px desktop and 390px mobile visual checks covered the star field,
  particles, compact windows and absence of horizontal overflow.
- Early failures exposed aspect-ratio-driven mobile widening and an automation
  attempt to click a moving point. Explicit stage width fixed the former;
  pointer-based aiming/clicking fixed the test, without force-clicking.
