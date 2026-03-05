# ScrollTrigger Leak Audit

## Files with ScrollTrigger usage

| File | ScrollTrigger.create | pin/scrub/timeline | gsap.context | useEffect cleanup | mounted guard | getAll().forEach(kill) |
|------|----------------------|--------------------|--------------|-------------------|---------------|------------------------|
| **FeaturesSection.tsx** | No (timeline ST) | scrub, pin | ✅ wrap | ✅ cleanupRef + revert | ✅ | No |
| **HowItWorksFlow.jsx** | ✅ | timeline in onEnter | ❌ | ✅ kill ref | ✅ | No |
| **GlobalTourismTradeNetworkSection.tsx** | ✅ | timeline in onEnter | ❌ | ✅ kill ref + resize | ✅ | No |
| **MembershipTiersSection.jsx** | No (timeline ST) | timeline | ✅ sectionRef | ⚠️ cleanupRef (async) | ❌ | No |
| **WhyChooseLetsB2B.jsx** | No (timeline ST) | timeline | ✅ sectionRef | ⚠️ cleanupRef (async) | ❌ | No |

## Potential leaks

1. **HowItWorksFlow.jsx** – No `gsap.context()`. `gsap.set()` on heading, subtitle, cards, paths is not reverted on unmount; only the ScrollTrigger is killed. If component unmounts before promise resolves, no trigger is created (mounted guard). **Fix:** Wrap all GSAP/ST work in `gsap.context(() => { ... }, sectionRef)` and call `ctx.revert()` in cleanup.

2. **GlobalTourismTradeNetworkSection.tsx** – No `gsap.context()`. Same: `gsap.set()` on label, heading, lines, cards not reverted; only ScrollTrigger ref is killed. **Fix:** Wrap in `gsap.context(() => { ... }, sectionRef)` and revert in cleanup.

3. **MembershipTiersSection.jsx** – Uses `gsap.context` and `cleanupRef.current = () => ctx.revert()`, but **no mounted guard** in the async `.then()`. If the user navigates away before the promise resolves, `cleanupRef.current` is still null when the effect cleanup runs, so `ctx.revert()` is never called. If the promise then resolves *after* unmount, it creates a new context and ScrollTrigger (no guard), and nothing will revert them → **leak**. **Fix:** Add `let mounted = true` and at the start of `.then()` do `if (!mounted) return`. In effect return do `mounted = false; cleanupRef.current?.()`.

4. **WhyChooseLetsB2B.jsx** – Same as MembershipTiersSection: no mounted guard, cleanupRef set in async. **Fix:** Same as above.

5. **Nested pin** – Only FeaturesSection uses `pin: true` (on the wrap). No other section uses ScrollTrigger pin. No overlapping pin sections.

## Debug (development)

- In **LandingScrollTriggerRefresh.tsx**, after each `ScrollTrigger.refresh()` call, in development log: `Active Triggers: ScrollTrigger.getAll().length`.
- Ensures trigger count is visible when landing mounts and when refresh runs (fonts, fallback, resize).

## Fixes applied

- **HowItWorksFlow.jsx** – Wrapped all GSAP/ScrollTrigger in `gsap.context(() => { ... }, section)`; cleanup calls `cleanupRef.current?.()` which runs `ctx.revert()` and clears `scrollTriggerRef`. No more scoped kill only; full revert.
- **GlobalTourismTradeNetworkSection.tsx** – Wrapped in `gsap.context(() => { ... }, section)`; stored context in `contextRef`; cleanup calls `contextRef.current?.revert()` and clears ref. Canvas 2d context renamed to `ctx2` to avoid clash with `ctx` (gsap.context). Resize and ticker cleanup unchanged.
- **MembershipTiersSection.jsx** – Added `let mounted = true` and `if (!mounted) return` at start of `.then()`; effect return runs `mounted = false; cleanupRef.current?.()`.
- **WhyChooseLetsB2B.jsx** – Same mounted guard and effect return as MembershipTiersSection.
- **LandingScrollTriggerRefresh.tsx** – In development, after each `refresh()` call: `console.log("Active Triggers:", ScrollTrigger.getAll().length)`.

## Trigger count stability (after fixes)

- Landing page mounts: FeaturesSection (1 pin ST), HowItWorksFlow (1), GlobalTourismTradeNetworkSection (1), MembershipTiersSection (1), WhyChooseLetsB2B (1) → **5 triggers** when all sections have mounted and GSAP loaded.
- Navigate to /pricing: landing unmounts, all five components unmount and run cleanup. After fixes, each cleanup reverts or kills its trigger → **0 triggers** (or only any non-landing triggers if present).
- Navigate back to /: landing mounts again, same five components create triggers → **5 triggers** again.
- Test path: `/` → `/pricing` → `/` → `/contact` (or similar) → `/`. Trigger count should go 5 → 0 → 5 → 0 → 5 (assuming /contact doesn’t mount landing sections).
