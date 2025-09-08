// kinda all fixed/ but not instant scroll back on 1st #back

(function() {
    const ROOT_SELECTOR = '#app';
    const LINK_SELECTOR = 'a';
    const CACHE_SIZE = 10;
    const ENABLE_PREFETCH = true;

    class LRUCache {
        constructor(limit = 10) {
            this.limit = limit;
            this.map = new Map();
        }
        get(key) {
            if (!this.map.has(key)) return null;
            const v = this.map.get(key);
            this.map.delete(key);
            this.map.set(key, v);
            return v;
        }
        set(key, val) {
            if (this.map.has(key)) this.map.delete(key);
            this.map.set(key, val);
            if (this.map.size > this.limit) {
                const first = this.map.keys().next().value;
                this.map.delete(first);
            }
        }
    }

    const Router = {
        cache: new LRUCache(CACHE_SIZE),
        hooks: {
            before: [],
            after: [],
            beforeEnter: [],
            afterEnter: [],
            beforeLeave: [],
            afterLeave: []
        },
        currentURL: location.pathname + location.search,
        loadedAssets: {
            css: new Set(),
            js: new Set()
        },

        scrollPositions: {},
        // Preset trendy transitions rewritten for CSS-in-JS only (no gsap/anime)
        transitions: {
            fade: {
                leave: (node) => new Promise(resolve => {
                    node.style.opacity = '1';
                    node.style.transition = 'opacity 0.3s ease';
                    void node.offsetWidth;
                    node.style.opacity = '0';
                    node.addEventListener('transitionend', function handler(e) {
                        if (e.propertyName === 'opacity') {
                            node.removeEventListener('transitionend', handler);
                            resolve();
                        }
                    });
                }),
                enter: (node) => new Promise(resolve => {
                    node.style.opacity = '0';
                    node.style.transition = 'opacity 0.3s ease';
                    void node.offsetWidth;
                    node.style.opacity = '1';
                    node.addEventListener('transitionend', function handler(e) {
                        if (e.propertyName === 'opacity') {
                            node.removeEventListener('transitionend', handler);
                            resolve();
                        }
                    });
                })
            },

            overlay: {
                leave: (node) => new Promise(resolve => {
                    let overlay = document.getElementById('flowza-overlay');
                    if (!overlay) {
                        overlay = document.createElement('div');
                        overlay.id = 'flowza-overlay';
                        Object.assign(overlay.style, {
                            position: 'fixed',
                            top: '0',
                            left: '0',
                            width: '100vw',
                            height: '100vh',
                            backgroundColor: '#111',
                            zIndex: '9999',
                            pointerEvents: 'none',
                            opacity: '0',
                            transition: 'opacity 0.5s ease'
                        });
                        document.body.appendChild(overlay);
                    }
                    overlay.style.opacity = '0';
                    void overlay.offsetWidth;
                    overlay.style.opacity = '1';
                    overlay.addEventListener('transitionend', function handler(e) {
                        if (e.propertyName === 'opacity') {
                            overlay.removeEventListener('transitionend', handler);
                            resolve();
                        }
                    });
                }),
                enter: (node) => new Promise(resolve => {
                    const overlay = document.getElementById('flowza-overlay');
                    if (!overlay) {
                        resolve();
                        return;
                    }
                    overlay.style.transition = 'opacity 0.5s ease';
                    overlay.style.opacity = '1';
                    void overlay.offsetWidth;
                    overlay.style.opacity = '0';
                    overlay.addEventListener('transitionend', function handler(e) {
                        if (e.propertyName === 'opacity') {
                            overlay.removeEventListener('transitionend', handler);
                            overlay.remove();
                            resolve();
                        }
                    });
                })
            },

            slideLeft: {
                leave: (node) => new Promise(resolve => {
                    node.style.transform = 'translateX(0%)';
                    node.style.transition = 'transform 0.4s ease-in';
                    void node.offsetWidth;
                    node.style.transform = 'translateX(-100%)';
                    node.addEventListener('transitionend', function handler(e) {
                        if (e.propertyName === 'transform') {
                            node.removeEventListener('transitionend', handler);
                            resolve();
                        }
                    });
                }),
                enter: (node) => new Promise(resolve => {
                    node.style.transform = 'translateX(100%)';
                    node.style.transition = 'transform 0.4s ease-out';
                    void node.offsetWidth;
                    node.style.transform = 'translateX(0%)';
                    node.addEventListener('transitionend', function handler(e) {
                        if (e.propertyName === 'transform') {
                            node.removeEventListener('transitionend', handler);
                            resolve();
                        }
                    });
                })
            },

            zoom: {
                leave: (node) => new Promise(resolve => {
                    node.style.transform = 'scale(1)';
                    node.style.opacity = '1';
                    node.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
                    void node.offsetWidth;
                    node.style.transform = 'scale(0.8)';
                    node.style.opacity = '0';
                    let count = 0;

                    function onEnd(e) {
                        if (e.propertyName === 'transform' || e.propertyName === 'opacity') {
                            count++;
                            if (count >= 2) {
                                node.removeEventListener('transitionend', onEnd);
                                resolve();
                            }
                        }
                    }
                    node.addEventListener('transitionend', onEnd);
                }),
                enter: (node) => new Promise(resolve => {
                    node.style.transform = 'scale(1.2)';
                    node.style.opacity = '0';
                    node.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
                    void node.offsetWidth;
                    node.style.transform = 'scale(1)';
                    node.style.opacity = '1';
                    let count = 0;

                    function onEnd(e) {
                        if (e.propertyName === 'transform' || e.propertyName === 'opacity') {
                            count++;
                            if (count >= 2) {
                                node.removeEventListener('transitionend', onEnd);
                                resolve();
                            }
                        }
                    }
                    node.addEventListener('transitionend', onEnd);
                })
            },

            // Your custom slide-up overlay transition with #flowza-overlay
            overlaySlideUp: {
                leave: (node) => new Promise(resolve => {
                    let overlay = document.getElementById('flowza-overlay');
                    if (!overlay) {
                        overlay = document.createElement('div');
                        overlay.id = 'flowza-overlay';
                        Object.assign(overlay.style, {
                            position: 'fixed',
                            top: '-100vh', // start offscreen top
                            left: '0',
                            width: '100vw',
                            height: '100vh',
                            backgroundColor: '#111',
                            zIndex: '9999',
                            pointerEvents: 'none',
                            opacity: '1',
                            transition: 'top 0.5s ease, opacity 0.5s ease'
                        });
                        document.body.appendChild(overlay);
                    }
                    overlay.style.top = '-100vh';
                    overlay.style.opacity = '1';

                    void overlay.offsetWidth;

                    // Animate to visible position
                    overlay.style.top = '0vh';

                    overlay.addEventListener('transitionend', function handler(e) {
                        if (e.propertyName === 'top') {
                            overlay.removeEventListener('transitionend', handler);
                            resolve();
                        }
                    });
                }),
                enter: (node) => new Promise(resolve => {
                    const overlay = document.getElementById('flowza-overlay');
                    if (!overlay) {
                        resolve();
                        return;
                    }
                    overlay.style.transition = 'top 0.5s ease, opacity 0.5s ease';
                    overlay.style.top = '0vh';
                    overlay.style.opacity = '1';

                    void overlay.offsetWidth;

                    // Animate offscreen top
                    overlay.style.top = '-100vh';

                    overlay.addEventListener('transitionend', function handler(e) {
                        if (e.propertyName === 'top') {
                            overlay.removeEventListener('transitionend', handler);
                            overlay.remove();
                            resolve();
                        }
                    });
                })
            }
        },

        on(hook, fn) {
            if (this.hooks[hook]) this.hooks[hook].push(fn);
            else throw Error('Unknown hook ' + hook);
        },

        async init() {
            if ('scrollRestoration' in history) {
                history.scrollRestoration = 'manual';
            }
            this.app = document.querySelector(ROOT_SELECTOR);
            if (!this.app) throw Error('Root selector not found: ' + ROOT_SELECTOR);
            this.trackAssets(document);
            this.bindLinks();
            //-----
            

            //-----
            window.addEventListener('popstate', () => {
                const key = location.pathname + location.search + location.hash;
                //-----

                console.log(currentPage);

                let to = location.pathname + location.search
                console.log(to);

                let isSamePage = currentPage === to;
                console.log(isSamePage);
                currentPage = window.location.pathname;
                //------

                const saved = this.scrollPositions[key];
                this.go(key, {
                    history: false
                }).then(() => {
                    if (typeof saved === 'number') {
                        window.scrollTo({
                            top: saved,
                            left: 0,
                            behavior: isSamePage ? "auto" : "instant"
                        });
                    }
                }).catch(console.error);
            });

            if (ENABLE_PREFETCH) this.bindPrefetch();
        },

        bindLinks() {
            document.addEventListener('click', (e) => {
                const a = e.target.closest('a');
                if (!a) return;

                const url = a.getAttribute('href');
                if (!url) return;
                // Special case: href="#" → scroll to top
                if (url === '#') {
                    e.preventDefault();

                    // Save scroll position of current page before jump
                    if (this.currentURL) this.scrollPositions[location.pathname + location.search + location.hash] = window.scrollY;

                    // Scroll to top
                    window.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: "auto"
                    });
                                    //--------
                 currentPage = window.location.pathname;
                 //--------

                    if (history) window.history.pushState({}, '', url);

                    // Update currentURL with hash
                    this.currentURL = location.pathname + location.search + '#';
                    return;
                }

                // Handle in-page hash links (href="#id")
                if (url.startsWith('#')) {
                    e.preventDefault();

                    if (this.currentURL) this.scrollPositions[location.pathname + location.search + location.hash] = window.scrollY;

                    const target = document.querySelector(url);
                    if (target) target.scrollIntoView({
                        behavior: "auto"
                    });
                    else window.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: "auto"
                    });
                    //------       
                    currentPage = window.location.pathname;
                    //------

                    if (history) window.history.pushState({}, '', url);

                    this.currentURL = location.pathname + location.search + url;
                    return;
                }
                // External links -> ignore
                if (url.startsWith('http') && new URL(url, location.href).origin !== location.origin) return;

                // Hash-only links -> ignore here (scroll handled by go)
                // Or let go() detect hash anchors automatically
                e.preventDefault();

                this.go(url).catch(err => {
                    console.error(err);
                    location.href = url; // fallback
                });
            });
        },

        bindPrefetch() {
            let timer = null;
            document.addEventListener('mouseover', (e) => {
                const a = e.target.closest(LINK_SELECTOR);
                if (!a) return;
                const url = a.getAttribute('href');
                if (!url) return;
                timer = setTimeout(() => {
                    this.prefetch(url);
                }, 80);
            });
            document.addEventListener('mouseout', () => {
                if (timer) clearTimeout(timer);
            });
        },

        async prefetch(url) {
            if (this.cache.get(url)) return;
            try {
                const res = await fetch(url, {
                    headers: {
                        'X-Requested-With': 'flowza'
                    }
                });
                if (!res.ok) return;
                const html = await res.text();
                const frag = this.parseHTML(html);
                this.cache.set(url, frag);
            } catch (e) {}
        },

        parseHTML(html) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const node = doc.querySelector(ROOT_SELECTOR);
            if (!node) throw Error('Response did not contain ' + ROOT_SELECTOR);
            return {
                html: node.innerHTML,
                title: doc.title || document.title,
                view: node.getAttribute('data-view') || '',
                css: Array.from(doc.querySelectorAll('link[rel="stylesheet"]')).map(l => ({
                    href: l.href,
                    init: l.hasAttribute('data-init')
                })),
                js: Array.from(doc.querySelectorAll('script[src]')).map(s => ({
                    src: s.src,
                    init: s.hasAttribute('data-init')
                }))
            };
        },

        async go(url, {
            history = true
        } = {}) {
            // Save previous scroll position keyed by exact currentURL (including hash)
            if (this.currentURL) {
                this.scrollPositions[location.pathname + location.search + location.hash] = window.scrollY;
            }
            const fullUrl = new URL(url, location.href);
            const newPath = fullUrl.pathname + fullUrl.search;
            const newHash = fullUrl.hash;

            const currentFull = this.currentURL;
            const currentPath = this.currentURL.split('#')[0];

            // ===== CASE A: Same page + new hash =====
            if (newPath === currentPath && newHash) {
                // Save scroll position of the old location before jumping
                if (this.currentURL) this.scrollPositions[location.pathname + location.search + location.hash] = window.scrollY;

                if (history) window.history.pushState({}, '', fullUrl.href);

                // Scroll to element (or top if not found)
                const target = document.querySelector(newHash);
                if (target)  target.scrollIntoView({
                    behavior: "auto"
                });

                
                else window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "auto"
                });
                                //--------
                currentPage = window.location.pathname;
                //--------

                // Update currentURL with hash
                this.currentURL = newPath + newHash;
                return;
            }

            // ===== CASE A2: Same page + remove hash =====
            if (newPath === currentPath && !newHash && currentFull.includes('#')) {
                if (this.currentURL) this.scrollPositions[location.pathname + location.search + location.hash] = window.scrollY;

                if (history) window.history.pushState({}, '', fullUrl.href);

                // Check if we have a stored scroll position
                const prevScroll = this.scrollPositions[newPath + (currentFull.includes('#') ? currentFull.split('#')[1] : '')];
                if (prevScroll !== undefined) {
                    window.scrollTo({
                        top: prevScroll,
                        left: 0,
                        behavior: "auto"
                    });
                } else {
                    window.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: "auto"
                    });
                }
                this.currentURL = newPath;
                return;
            }

            // ===== CASE B: Back/forward navigation =====
            if (history === false) {
                await this._navigatePage(fullUrl, history, {
                    disableTransition: true
                });
                return;
            }

            // ===== CASE C/D: Different page =====
            await this._navigatePage(fullUrl, history, {
                hash: newHash
            });
        },

        // Helper function for actual page change + hooks + transitions
        async _navigatePage(fullUrl, history, {
            disableTransition = false,
            hash = ''
        } = {}) {
            const full = fullUrl.pathname + fullUrl.search;

            // ===== Run "before" hooks =====
            await this.runHooks('before', {
                from: this.currentURL,
                to: full
            });

            // ===== Fetch or get from cache =====
            let frag = this.cache.get(full);
            if (!frag) {
                const res = await fetch(full, {
                    headers: {
                        'X-Requested-With': 'flowza'
                    }
                });
                if (!res.ok) throw new Error('Failed to fetch ' + full);
                frag = this.parseHTML(await res.text());
                this.cache.set(full, frag);
            }

            // ===== Leave transition (skip if disableTransition) =====
            if (!disableTransition) {
                await this.runHooks('beforeLeave', {
                    from: this.currentURL,
                    to: full
                });
                await this.transitionLeave(this.app);
                await this.runHooks('afterLeave', {
                    from: this.currentURL,
                    to: full
                });
            }

            // ===== Replace DOM =====
            document.title = frag.title;
            this.app.setAttribute('data-view', frag.view);
            this.app.innerHTML = frag.html;

            // ===== Scroll restoration logic =====
            if (disableTransition) {
                // 🔹 Case B: Back/Forward navigation
                const saved = this.scrollPositions[full + (hash || '')];
                if (typeof saved === 'number') {
                    window.scrollTo({
                        top: saved,
                        left: 0,
                        behavior: "instant"
                    });
                } else {
                    window.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: "auto"
                    });
                }
            } else if (!hash) {
                // 🔹 Case C: Normal forward navigation (new page, no hash)
                window.scrollTo({
                    top: 0,
                    left: 0,
                    behavior: "instant"
                });
            } else {
                // 🔹 Case D: New page + hash
                const target = document.querySelector(hash);
                if (target) {
                    target.scrollIntoView({
                        behavior: "instant"
                    });
                } else {
                    // Fallback: top if no element exists
                    window.scrollTo({
                        top: 0,
                        left: 0,
                        behavior: "instant"
                    });
                }
            }

            // ===== Handle assets (CSS/JS) =====
            document.querySelectorAll('link[rel="stylesheet"][data-init]').forEach(link => {
                if (!frag.css.some(c => c.href === link.href)) {
                    link.remove();
                    this.loadedAssets.css.delete(link.href);
                }
            });
            document.querySelectorAll('script[src][data-init]').forEach(script => {
                if (!frag.js.some(j => j.src === script.src)) {
                    script.remove();
                    this.loadedAssets.js.delete(script.src);
                }
            });
            this.injectAssets(frag.css, frag.js);

            // ===== Push history state =====
            if (history) window.history.pushState({}, '', fullUrl.href);
            this.currentURL = full + (hash || '');

            // ===== Enter transition (skip if disableTransition) =====
            if (!disableTransition) {
                await this.runHooks('beforeEnter', {
                    from: this.currentURL,
                    to: full
                });
                await this.transitionEnter(this.app);
                await this.runHooks('afterEnter', {
                    from: this.currentURL,
                    to: full
                });
            }

            // ===== Run "after" hooks =====
            await this.runHooks('after', {
                from: this.currentURL,
                to: full
            });
        },

        trackAssets(doc) {
            doc.querySelectorAll('link[rel="stylesheet"]').forEach(l => this.loadedAssets.css.add(l.href));
            doc.querySelectorAll('script[src]').forEach(s => this.loadedAssets.js.add(s.src));
        },

        injectAssets(cssFiles, jsFiles) {
            cssFiles.forEach(({
                href,
                init
            }) => {
                if (!this.loadedAssets.css.has(href)) {
                    const link = document.createElement('link');
                    link.rel = 'stylesheet';
                    link.href = href;
                    if (init) link.setAttribute('data-init', 'true');
                    document.head.appendChild(link);
                    this.loadedAssets.css.add(href);
                }
            });

            jsFiles.forEach(({
                src,
                init
            }) => {
                const alreadyLoaded = this.loadedAssets.js.has(src);
                if (!alreadyLoaded || init) {
                    const script = document.createElement('script');
                    script.src = src;
                    script.defer = true;
                    if (init) script.setAttribute('data-init', 'true');
                    document.body.appendChild(script);
                    if (!alreadyLoaded) this.loadedAssets.js.add(src);
                }
            });
        },

        async runHooks(name, ctx) {
            for (const fn of this.hooks[name] || []) await fn(ctx);
        },

        // Run CSS-in-JS transitions only
        runCSSTransition(transitionsObj) {
            return new Promise(resolve => {
                const promises = [];

                for (const key in transitionsObj) {
                    const val = transitionsObj[key];

                    // If value is a function — treat as animation lib
                    if (typeof val === 'function') {
                        promises.push(val());
                        continue;
                    }

                    // Otherwise assume CSS-in-JS style object for a selector
                    const selector = key;
                    const rules = val;

                    if (!rules || typeof rules !== 'object') continue;

                    const duration = Number(rules.duration) || 0.3;
                    const delay = Number(rules.delay) || 0;
                    const props = {
                        ...rules
                    };
                    delete props.duration;
                    delete props.delay;

                    const elems = selector === 'head' ?
                        [document.head] :
                        Array.from(document.querySelectorAll(selector));
                    if (elems.length === 0) continue;

                    elems.forEach(el => {
                        const p = new Promise(res => {
                            // Store original inline styles
                            const originalStyles = {};
                            for (const prop in props) {
                                originalStyles[prop] = el.style[prop] || '';
                            }

                            const propNames = Object.keys(props).join(', ');
                            el.style.transition = propNames
                                .split(', ')
                                .map(pn => `${pn} ${duration}s ease ${delay}s`)
                                .join(', ');

                            // Trigger reflow
                            void el.offsetWidth;

                            for (const prop in props) {
                                el.style[prop] = props[prop];
                            }

                            setTimeout(() => {
                                // Restore original styles
                                for (const prop in props) {
                                    el.style[prop] = originalStyles[prop];
                                }
                                el.style.transition = '';
                                res();
                            }, (duration + delay) * 1000);
                        });

                        promises.push(p);
                    });
                }

                Promise.all(promises).then(() => resolve());
            });
        },

        setTransitions(leaveFn, enterFn) {
            if (leaveFn && typeof leaveFn === 'object' && !(leaveFn instanceof Function)) {
                this.transitionLeave = () => this.runCSSTransition(leaveFn);
            } else if (leaveFn instanceof Function) {
                this.transitionLeave = leaveFn;
            } else {
                this.transitionLeave = () => Promise.resolve();
            }

            if (enterFn && typeof enterFn === 'object' && !(enterFn instanceof Function)) {
                this.transitionEnter = () => this.runCSSTransition(enterFn);
            } else if (enterFn instanceof Function) {
                this.transitionEnter = enterFn;
            } else {
                this.transitionEnter = () => Promise.resolve();
            }
        },

        useTransition(name) {
            if (!this.transitions[name]) throw Error('Unknown transition: ' + name);
            const {
                leave,
                enter
            } = this.transitions[name];
            this.setTransitions(leave, enter);
        }
    };

    window.flowza = {
        init: () => Router.init(),
        go: (url) => Router.go(url),
        on: (hook, fn) => Router.on(hook, fn),
        prefetch: (url) => Router.prefetch(url),
        setTransitions: (leaveFn, enterFn) => Router.setTransitions(leaveFn, enterFn),
        useTransition: (name) => Router.useTransition(name)
    };
    flowza.on('after', () => {
        //---
        currentPage = window.location.pathname;
        console.log('updated current' + currentPage);
        //---
    })
    document.addEventListener('DOMContentLoaded', () => {
        flowza.init().catch(console.error);
        
    });
    window.flowza._Router = Router;
})();
