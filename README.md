# BarbaMini

A lightweight, zero-dependency client-side router and page transition library for building fast, smooth, SPA-like navigation experiences.

---

## Overview

BarbaMini enables seamless page transitions by intercepting link clicks and fetching page content via AJAX. It automatically handles:

- Dynamic content replacement inside a root container (`#app`)
- Page asset management (CSS & JS injection/removal)
- Browser history and scroll restoration
- Prefetching pages on hover
- Configurable animated transitions
- Rich lifecycle hooks for custom logic
- Intelligent caching of fetched pages

---

## Features

### 1. SPA-style Navigation

- Intercepts `<a data-router-link href="...">` clicks inside `#app`.
- Loads new pages via AJAX with custom header `X-Requested-With: barba-mini`.
- Updates browser URL and history using `pushState`.
- Supports back/forward navigation.
- Scrolls to top on navigation.
- Caches last 10 pages to speed up repeat visits.

### 2. Page Asset Management

- Tracks and removes old page-specific CSS and JS assets (`data-init`).
- Injects new page-specific stylesheets and scripts on navigation.
- Supports deferred script loading.
- Prevents duplicate asset injection.

### 3. Prefetching on Hover

- Automatically prefetches page content when hovering over links for >80ms.
- Caches prefetched pages for instant loading.

### 4. Lifecycle Hooks

Allows hooking into the navigation process:

| Hook         | When It Fires                                  |
|--------------|-----------------------------------------------|
| `before`     | Before navigation starts                       |
| `beforeLeave`| Before old content is removed                   |
| `afterLeave` | After old content is removed                    |
| `beforeEnter`| Before new content is added                     |
| `afterEnter` | After new content is added                      |
| `after`      | After navigation fully completes                |

Hooks receive context objects and support async functions, enabling rich control over navigation.

### 5. Transitions

- Built-in transition presets: `fade`, `overlay`, `slideLeft`, `zoom`, `overlaySlideUp`.
- Define fully custom transitions using `.setTransitions(leaveFn, enterFn)`.
- Transitions are Promise-based to ensure smooth async animations.
- CSS-in-JS style objects supported for declarative animations.
- Easily extend or replace with animation libraries (GSAP, Anime.js, etc.).

---

## Installation

Simply include the `BarbaMini.js` script on your page:

```html
<script src="BarbaMini.js"></script>
