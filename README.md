# FlowzaJS

A lightweight, zero-dependency client-side router and page transition library for building fast, smooth, SPA-like navigation experiences.

---

## Overview

FlowzaJS enables seamless page transitions by intercepting link clicks and fetching page content via AJAX. It automatically handles:

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
- Loads new pages via AJAX with custom header `X-Requested-With: flowza`.
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

Simply include the `Flowza.js` script on your page:

```html
<script src="https://flowzajs.netlify.app/flowza.min.core.js"></script>
````

---

## Usage

### HTML Setup

```html
<div id="app" data-view="home">
  <!-- Your page content here -->
  <a data-router-link href="/about">About</a>
</div>
```


### Using `data-init` Attribute 

- Add `data-init` to `<link>` and `<script>` tags for **page-specific** CSS and JS assets.

```html
<link rel="stylesheet" href="/css/page.css" data-init>
<script src="/js/page.js" data-init></script>
```
- Flowza injects these assets on page navigation when needed.

- It removes previously loaded data-init assets if they’re not required on the new page.

- This ensures page-specific scripts/styles load fresh without cluttering the app.


Use data-init to keep your dynamic navigation efficient and clean.

---
## Prefetching & Caching

### Prefetching

- FlowzaJS prefetches linked pages automatically when a user hovers over links with `data-router-link` for more than 80ms.
- Prefetching loads and caches the page content to speed up subsequent navigation.

### Caching

- Last 10 visited pages are cached to improve performance.
- Cached pages are served instantly without additional network requests.
- Cache size and eviction can be customized by modifying internal constants.

This behavior is automatic and requires no additional configuration.

---

## Advanced Usage

- Integrate animation libraries (GSAP, Anime.js) for complex transitions.
- Use lifecycle hooks to add analytics, authorization checks, or UI updates.
- Customize asset injection/removal for fonts or additional resources.
- Extend navigation logic by overriding `Flowza.go(url)` method.
- Handle API data fetching combined with page transitions.

---

## Example

```html
<div id="app" data-view="home">
  <h1>Home Page</h1>
  <a data-router-link href="/about">Go to About</a>
</div>

<script src="Flowza.js"></script>
<script>
  Flowza.useTransition('slideLeft');

  Flowza.on('beforeEnter', (ctx) => {
    console.log('Entering view:', ctx.view);
  });
</script>
```

---




## License

This project is licensed under the MIT License.

---

## Contribution

Contributions, issues, and feature requests are welcome!

Feel free to check [issues page](https://github.com/06antor/FlowzaJS/issues).

You can contribute by:

- Reporting bugs
- Suggesting features
- Submitting pull requests

Please follow the code style and write tests when applicable.

---

## Thanks

FlowzaJS is inspired by modern SPA routers and page transition libraries, focusing on zero dependencies and minimal overhead.

Thank you for using FlowzaJS — enjoy smooth navigation! 🚀
