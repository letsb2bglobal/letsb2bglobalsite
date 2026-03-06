# GSAP + ScrollTrigger Homepage – Diagnosis & Fixes

## 1. Short diagnosis summary

**What’s broken**

- Scroll feels stuck or “reverses” because:
  - **Two tall “sticky” sections** (FeaturesSection 200vh + scrub, BorderlessTourismSection 350vh + CSS sticky) create long scroll ranges; combined with no `ScrollTrigger.refresh()` after images/fonts, layout shifts cause miscalculated positions and jump-backs.
  - **FeaturesSection** uses a scrub timeline whose `getX()` depends on `strip.scrollWidth`; when images or layout change, the target changes mid-scroll and the animation can jump or fight the user.
  - **No central refresh** after dynamic content (images, fonts), so ScrollTrigger’s cached positions become wrong.
- **Cleanup bugs** cause duplicate or orphan triggers on route change / remount:
  - **HowItWorksFlow**: `useEffect` does not return a cleanup; the `return` inside `Promise.then()` only returns from the promise callback, so ScrollTriggers are never killed. If it did run, `ScrollTrigger.getAll().forEach(t => t.kill())` would kill every trigger on the page.
  - **GlobalTourismTradeNetworkSection**: ST is created inside async `then()`; if the user navigates away before the promise resolves, `scrollTriggerRef.current` is still null and the trigger is never killed.
  - **FeaturesSection**: Cleanup is assigned inside `then()`; if unmount happens before the promise resolves, `cleanup` is still null and no cleanup runs.

**Why it happens**

- Scroll-driven storytelling is split across several components that each register ScrollTrigger (or use CSS sticky + scrub) without a single place that refreshes after load and without consistent `gsap.context()` + revert on unmount. Async GSAP loading plus missing/incorrect cleanup leads to triggers surviving remounts and wrong measurements after layout shifts.

---

## 2. Checklist vs common root causes

| Id | Issue | Present? | Where |
|----|--------|-----------|--------|
| **A** | Multiple ScrollTriggers pinning overlapping sections | **No** | No `pin: true` in codebase. Only CSS sticky + scrub in FeaturesSection and CSS sticky in BorderlessTourismSection. |
| **B** | Trigger start/end overlapping or too tight | **No** | FeaturesSection: `start: "top top"`, `end: "bottom top"` (200vh) – correct. Others use `start: "top 85%"`, `once: true` – fine. |
| **C** | Layout shifts after images/fonts → recalc/jump | **Yes** | No `ScrollTrigger.refresh()` after images or fonts. FeaturesSection strip width used in `getX()` can change when content loads. **FeaturesSection.tsx** (getX, timeline), **BorderlessTourismSection.tsx**, **WhyChooseLetsB2B.jsx**, **GlobalTourismTradeNetworkSection.tsx** (images). |
| **D** | Not calling `ScrollTrigger.refresh()` after dynamic content | **Yes** | Only resize listener in FeaturesSection. No refresh after image load or `document.fonts.ready`. **FeaturesSection.tsx** ~136, **page/layout** – no central refresh. |
| **E** | Missing `gsap.context()` cleanup in React → duplicate triggers | **Yes** | **FeaturesSection.tsx**: no `gsap.context()`, manual kill by `trigger === wrap`; cleanup set in async `then()` can be null on unmount. **HowItWorksFlow.jsx**: no cleanup returned from `useEffect`; ST never killed. **GlobalTourismTradeNetworkSection.tsx**: ST created in async `then()`, ref kill in effect return can run before ref is set. |
| **F** | Pinning inside overflow hidden/auto or transform | **No** | ScrollTrigger does not pin in this project. Sticky sections use `overflow-hidden` on the sticky element itself; trigger in FeaturesSection is the wrapper, not the overflow container. |
| **G** | Wrong scroll container without scrollerProxy | **No** | All use default window scroll; no custom scroller. |
| **H** | CSS `scroll-behavior: smooth` conflicting with ScrollTrigger | **No** | **globals.css** – no `scroll-behavior: smooth` on `html`/`body`. Other `scroll-smooth` / `scrollBehavior: 'smooth'` are on horizontal or sub-containers (PostCard, messages, enquiries), not main document. |
| **I** | Lenis/locomotive without correct integration | **No** | Not used. |
| **J** | Next.js route transitions mounting triggers multiple times | **Yes** | Aggravated by E: triggers not cleaned up on unmount, so revisiting the page can create duplicates. **HowItWorksFlow.jsx**, **FeaturesSection.tsx**, **GlobalTourismTradeNetworkSection.tsx**. |
| **K** | `position: sticky` alongside ScrollTrigger pin | **No** | No ScrollTrigger pin. Two sections use CSS sticky (FeaturesSection inner section, BorderlessTourismSection); no mixing with `pin: true`. |
| **L** | Mobile resize / address bar → refresh jitter | **Possible** | Only one resize listener (FeaturesSection). No `ScrollTrigger.defaults({ anticipatePin: 1 })` or debounced refresh. |
| **M** | `invalidateOnRefresh` incorrect or missing when needed | **Partial** | **FeaturesSection.tsx** line 116: `invalidateOnRefresh: true` is set (good). Other sections don’t use scrub timelines that would need it. |

---

## 3. Prioritized fixes (code-level)

### P0 – Cleanup and no global kill (E, J)

**HowItWorksFlow.jsx**  
- Store the created ScrollTrigger in `scrollTriggerRef` and in the `useEffect` cleanup kill only that instance (and revert any gsap sets if you add context).  
- Do **not** call `ScrollTrigger.getAll().forEach(t => t.kill())` from this component.

**GlobalTourismTradeNetworkSection.tsx**  
- In the async `then()`, if `!mounted` return before creating the ST; in the `useEffect` cleanup, call `scrollTriggerRef.current?.kill()` so that when the promise resolves after unmount you don’t create a new trigger, and when unmount runs after the promise you still kill it.

**FeaturesSection.tsx**  
- Use `gsap.context()` and return its `revert` from the effect. Run all GSAP/ScrollTrigger setup inside that context. In cleanup, call the context revert (and remove the “kill by trigger === wrap” logic so only this component’s triggers are reverted).

### P1 – Refresh after images/fonts (C, D)

- After key images (e.g. in FeaturesSection cards, BorderlessTourismSection, WhyChooseLetsB2B, GlobalTourismTradeNetworkSection) and `document.fonts.ready`, call `ScrollTrigger.refresh()`.  
- Option A: One place (e.g. landing page wrapper or a small hook) that runs once when the page is ready (fonts + images loaded) and calls `ScrollTrigger.refresh()`.  
- Option B: In FeaturesSection, after the scrub timeline is created, add an `imagesLoaded`-style wait or a short `requestAnimationFrame` + `ScrollTrigger.refresh()` so the first layout is correct before the user scrolls much.

### P2 – Smoother scrub and defaults (L, M)

- Set `ScrollTrigger.defaults({ anticipatePin: 1 })` once (e.g. where you `registerPlugin(ScrollTrigger)` on the homepage) to reduce pin-related jitter.  
- Keep `invalidateOnRefresh: true` on the FeaturesSection timeline so that when you do call `ScrollTrigger.refresh()`, the scrub animation recalculates correctly.

### P3 – Single pinning strategy (recommendation)

- Keep the current approach: **no** ScrollTrigger pin; use **CSS sticky** for the long “sticky” sections (FeaturesSection, BorderlessTourismSection) and ScrollTrigger only for scrub (FeaturesSection) and one-shot reveals.  
- Do **not** add ScrollTrigger `pin: true` on top of the same sticky sections to avoid double “pinning” and conflict.

---

## 4. Gold-standard structure for this homepage

1. **One registration and defaults**  
   Wherever you first load GSAP/ScrollTrigger (e.g. in a single “homepage GSAP” init or the first section that uses it), do:
   - `gsap.registerPlugin(ScrollTrigger);`
   - `ScrollTrigger.defaults({ anticipatePin: 1 });`  
   Optionally set `ScrollTrigger.config({ limitCallbacks: true })` if you have many triggers.

2. **Per-component**  
   - Use **one** `gsap.context(() => { ... }, containerRef)` per component that creates animations/triggers.  
   - All `gsap.set`, `gsap.to`, `gsap.timeline`, `ScrollTrigger.create` (or timeline `scrollTrigger`) inside that callback.  
   - In the `useEffect` cleanup, call **only** `ctx.revert()` (and any non-GSAP cleanup). Do not call `ScrollTrigger.getAll().forEach(t => t.kill())` from a component.

3. **Async loading**  
   - If you load GSAP in a `Promise.all([import("gsap"), import("gsap/ScrollTrigger")]).then(...)`:  
     - Keep a `mounted` flag; set to `false` in the effect cleanup.  
     - Inside `then()`, if `!mounted` return immediately and do not create triggers.  
     - Assign the created ST (if any) to a ref and in the effect cleanup do `ref.current?.kill()` so that late resolution still cleans up.

4. **Single refresh after dynamic content**  
   - On the landing page, after fonts and key images are loaded (or after a short delay if you don’t want to wait for every image), call `ScrollTrigger.refresh()` once.  
   - **Implemented:** `LandingScrollTriggerRefresh` runs on landing mount and calls `ScrollTrigger.refresh()` after `document.fonts.ready` and after 1200ms (`page.tsx` + `src/components/LandingScrollTriggerRefresh.tsx`).  
   - Optionally also call `ScrollTrigger.refresh()` in the resize listener (debounced, e.g. 150ms) to avoid jitter on mobile (L).

5. **One “pinning” system**  
   - Use **either** CSS sticky **or** ScrollTrigger pin for a given section, not both. Currently you use only CSS sticky + scrub; keep it that way and avoid adding pin to the same sections.

---

## 5. Quick test plan

- **Stickiness / jump-back**  
  - Scroll slowly from top to past FeaturesSection and BorderlessTourismSection several times.  
  - Reload, wait 2–3 seconds (let images start loading), then scroll again.  
  - Confirm no sudden jump-backs and no feeling of scroll “reversing” when you release.

- **Cleanup / duplicates**  
  - Open homepage (landing), scroll until at least one ScrollTrigger has fired (e.g. Features scrub, or How it Works / Why Choose us).  
  - Navigate away (e.g. to /pricing or /signin) then back to `/`.  
  - Repeat 2–3 times. Scroll again and confirm no double animations and no console errors.

- **Mobile**  
  - Resize the window or use DevTools device mode; scroll; confirm no large jump when the address bar shows/hides and that ScrollTrigger still fires at the right place (e.g. “top 85%” sections).

- **Images**  
  - Throttle network (e.g. Slow 3G), reload homepage, then scroll as images load.  
  - After a few seconds, call `ScrollTrigger.refresh()` in the console and scroll again; behavior should stay correct and improve if it was jumping before.

---

## 6. File reference summary

| File | ScrollTrigger / pin | Main issue |
|------|---------------------|------------|
| **FeaturesSection.tsx** | Timeline scrub on wrap (200vh); inner section is CSS sticky | No gsap.context(); cleanup async; no refresh after load; getX() depends on layout |
| **BorderlessTourismSection.tsx** | None (IntersectionObserver + scroll handler) | 350vh + sticky; layout shift from images |
| **GlobalTourismTradeNetworkSection.tsx** | ScrollTrigger.create, once: true | ST created in async then(); cleanup can run before ref set |
| **HowItWorksFlow.jsx** | ScrollTrigger.create, once: true | useEffect returns no cleanup; ST never killed |
| **MembershipTiersSection.jsx** | Timeline + scrollTrigger, once: true | Uses gsap.context() + revert – OK |
| **WhyChooseLetsB2B.jsx** | Timeline + scrollTrigger, once: true | Uses gsap.context() + revert – OK |
