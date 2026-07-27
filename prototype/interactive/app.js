(() => {
  "use strict";

  const STORAGE_KEY = "call-on-p0-prototype-state-v1";

  const INITIAL_STATE = {
    persona: "bruce",
    draftInput: "Hosting a backyard birthday Saturday. Looking for two folding tables, a big cooler, and maybe a pop-up shade tent. Setup is around 10 AM.",
    draft: null,
    selectedContribution: "lend",
    offerQuantity: 1,
    verificationSent: false,
    verified: false,
    offerSubmitted: false,
    offerAccepted: false,
    handoffMethod: "porch",
    handoffConfirmed: false,
    loanReturned: false,
    returnConfirmed: false,
    extensionRequested: false,
    extensionApproved: false,
    savedResourceChoice: null,
    quietMode: false,
    hints: ["basic-tools", "party-gear", "diy-guidance"],
    openPrototypeMenu: false,
    adminTab: "overview",
    planTab: "details",
    birthdayCoverage: {
      tables: 1,
      cooler: 1,
      canopy: 1
    },
    messages: [
      { id: 1, from: "janet", text: "Saturday morning works. The ladder is by my garage side door.", time: "5:42 PM" },
      { id: 2, from: "bruce", text: "Perfect — I can come by around 9:15 if that works.", time: "5:45 PM" },
      { id: 3, from: "janet", text: "That’s good. I’ll leave it out once you’re on the way.", time: "5:47 PM" }
    ]
  };

  const PEOPLE = {
    bruce: { id: "bruce", name: "Bruce", initials: "BP", tone: "green", context: "West side of Encanto Court" },
    janet: { id: "janet", name: "Janet", initials: "JM", tone: "coral", context: "Neighbor since 2021" },
    carlos: { id: "carlos", name: "Carlos", initials: "CR", tone: "gold", context: "Near the clubhouse" },
    priya: { id: "priya", name: "Priya", initials: "PS", tone: "blue", context: "North side of the community" },
    maria: { id: "maria", name: "Maria", initials: "MG", tone: "coral", context: "Encanto Court member" },
    sam: { id: "sam", name: "Sam", initials: "SL", tone: "blue", context: "Encanto Court member" }
  };

  const ICON_PATHS = {
    home: '<path d="M3 11.5 12 4l9 7.5"/><path d="M5 10.5V21h14V10.5"/><path d="M9 21v-7h6v7"/>',
    asks: '<path d="M4 4h16v12H8l-4 4V4Z"/><path d="M8 8h8M8 12h5"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c.7-4 3.4-6 8-6s7.3 2 8 6"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    bell: '<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/>',
    arrowLeft: '<path d="m15 18-6-6 6-6"/>',
    arrowRight: '<path d="m9 18 6-6-6-6"/>',
    chevronDown: '<path d="m6 9 6 6 6-6"/>',
    check: '<path d="m5 12 4 4L19 6"/>',
    checkCircle: '<circle cx="12" cy="12" r="9"/><path d="m8 12 2.6 2.6L16.5 8.8"/>',
    circle: '<circle cx="12" cy="12" r="9"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    calendar: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    mapPin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    share: '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 10.6 6.8-4.1M8.6 13.4l6.8 4.1"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.1.1l2-2a5 5 0 0 0-7.1-7.1l-1.1 1.1"/><path d="M14 11a5 5 0 0 0-7.1-.1l-2 2A5 5 0 0 0 12 20l1.1-1.1"/>',
    message: '<path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"/>',
    send: '<path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/>',
    hand: '<path d="M7 11V6a2 2 0 0 1 4 0v4-6a2 2 0 0 1 4 0v6-4a2 2 0 0 1 4 0v8c0 5-3 8-8 8-3 0-5-1-7-4L2 15a2 2 0 0 1 3-3l2 2"/>',
    gift: '<rect x="3" y="8" width="18" height="13" rx="2"/><path d="M12 8v13M3 12h18M7.5 8C5 8 4 6.5 4.5 5S7 3.5 12 8M16.5 8C19 8 20 6.5 19.5 5S17 3.5 12 8"/>',
    lightbulb: '<path d="M9 18h6M10 22h4"/><path d="M8.2 14.8A7 7 0 1 1 15.8 14.8c-.9.7-1.3 1.3-1.3 2.2h-5c0-.9-.4-1.5-1.3-2.2Z"/>',
    wrench: '<path d="M14.7 6.3a4 4 0 0 0-5-5L12 3.6 8.4 7.2 6.1 4.9a4 4 0 0 0 5 5L20 18.8a1.7 1.7 0 0 1-2.4 2.4l-8.9-8.9"/>',
    package: '<path d="m21 8-9-5-9 5 9 5 9-5Z"/><path d="m3 8 9 5 9-5v10l-9 5-9-5V8Z"/><path d="M12 13v10"/>',
    table: '<path d="M4 10h16M6 10l-1 11M18 10l1 11M3 6h18v4H3z"/>',
    ladder: '<path d="M8 3 5 21M16 3l3 18M7 7h10M6 12h12M5 17h14"/>',
    cooler: '<path d="M5 8h14l-1 13H6L5 8Z"/><path d="M7 8V5h10v3M9 12h6"/>',
    tent: '<path d="m3 21 9-18 9 18H3Z"/><path d="M12 3v18M8 21l4-8 4 8"/>',
    camera: '<path d="M4 7h4l2-3h4l2 3h4v13H4V7Z"/><circle cx="12" cy="13" r="4"/>',
    shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="m9 12 2 2 4-4"/>',
    lock: '<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    eyeOff: '<path d="m3 3 18 18"/><path d="M10.6 10.6a2 2 0 0 0 2.8 2.8M9.9 4.2A10.8 10.8 0 0 1 12 4c6 0 10 8 10 8a18 18 0 0 1-2.1 3.2M6.6 6.6C3.8 8.4 2 12 2 12s4 8 10 8c1.2 0 2.3-.3 3.3-.7"/>',
    alert: '<path d="M10.3 3.4 2.2 18a2 2 0 0 0 1.8 3h16a2 2 0 0 0 1.8-3L13.7 3.4a2 2 0 0 0-3.4 0Z"/><path d="M12 9v4M12 17h.01"/>',
    flag: '<path d="M5 22V4M5 5h11l-1 5 1 5H5"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4 11.5-11.5Z"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 15H6L5 6M10 11v6M14 11v6"/>',
    more: '<circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.6v-.2h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/>',
    refresh: '<path d="M20 11a8 8 0 1 0 2 5M20 4v7h-7"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><rect x="3" y="3" width="12" height="12" rx="2"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2A19.8 19.8 0 0 1 3.1 5.2 2 2 0 0 1 5.1 3h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L9.1 11a16 16 0 0 0 4 4l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/>',
    key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M17 6l3 3M14 9l3 3"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    volumeOff: '<path d="M11 5 6 9H2v6h4l5 4V5ZM22 9l-6 6M16 9l6 6"/>',
    sparkles: '<path d="m12 3 1.2 3.3L16.5 7.5l-3.3 1.2L12 12l-1.2-3.3-3.3-1.2 3.3-1.2L12 3Z"/><path d="m19 13 .8 2.2L22 16l-2.2.8L19 19l-.8-2.2L16 16l2.2-.8L19 13ZM5 14l.7 1.8 1.8.7-1.8.7L5 19l-.7-1.8-1.8-.7 1.8-.7L5 14Z"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    x: '<path d="m6 6 12 12M18 6 6 18"/>',
    archive: '<rect x="3" y="4" width="18" height="5" rx="1"/><path d="M5 9v11h14V9M10 13h4"/>',
    party: '<path d="m4 20 6-16 10 10-16 6Z"/><path d="M13 5c1.5-2 3-2.4 4.5-1.2 1.4 1.1.8 2.5-.2 3.8M17 10c2-1.2 3.7-.8 4.4.7"/><path d="m8 9 7 7M6 14l4 4"/>',
    leaf: '<path d="M20 3S7 3 4 14c-2 7 5 8 9 4 4-4 7-15 7-15Z"/><path d="M4 21c3-6 8-10 13-13"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
    filter: '<path d="M4 5h16M7 12h10M10 19h4"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M5 21h14"/>'
  };

  let state = loadState();
  let toastTimer = null;

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
      return stored ? { ...structuredClone(INITIAL_STATE), ...stored } : structuredClone(INITIAL_STATE);
    } catch {
      return structuredClone(INITIAL_STATE);
    }
  }

  function persist() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch { /* prototype may run in a sandboxed preview */ }
  }

  function resetState() {
    state = structuredClone(INITIAL_STATE);
    persist();
    showToast("Prototype reset", "success");
    navigate("/home");
  }

  function update(patch, shouldRender = true) {
    state = { ...state, ...patch };
    persist();
    if (shouldRender) render();
  }

  function icon(name, className = "icon") {
    const body = ICON_PATHS[name] || ICON_PATHS.circle;
    return `<svg class="${className}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }

  function escapeHtml(value = "") {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function avatar(personId, size = "") {
    const person = PEOPLE[personId] || PEOPLE.bruce;
    const tone = person.tone && person.tone !== "green" ? ` avatar--${person.tone}` : "";
    const sizeClass = size ? ` avatar--${size}` : "";
    return `<span class="avatar${tone}${sizeClass}" aria-label="${escapeHtml(person.name)}">${escapeHtml(person.initials)}</span>`;
  }

  function routeInfo() {
    const raw = (location.hash || "#/home").slice(1);
    const [pathPart, queryPart = ""] = raw.split("?");
    const path = pathPart.startsWith("/") ? pathPart : `/${pathPart}`;
    return { path, params: new URLSearchParams(queryPart), raw };
  }

  function navigate(path) {
    const target = path.startsWith("#") ? path.slice(1) : path;
    if ((location.hash || "").slice(1) === target) {
      render();
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    location.hash = target;
  }

  function showToast(message, kind = "default") {
    const region = document.getElementById("toast-region");
    if (!region) return;
    clearTimeout(toastTimer);
    region.innerHTML = `<div class="toast${kind !== "default" ? ` toast--${kind}` : ""}">${icon(kind === "success" ? "checkCircle" : "info")}<span>${escapeHtml(message)}</span></div>`;
    toastTimer = setTimeout(() => { region.innerHTML = ""; }, 3200);
  }

  function currentNav(path) {
    if (path.startsWith("/create") || path.startsWith("/draft") || path.startsWith("/share")) return "share";
    if (path.startsWith("/asks") || path.startsWith("/status")) return "asks";
    if (path.startsWith("/mine") || path.startsWith("/loan") || path.startsWith("/plan") || path.startsWith("/messages") || path.startsWith("/handoff") || path.startsWith("/return") || path.startsWith("/extension") || path.startsWith("/save-resource")) return "mine";
    if (path.startsWith("/circle") || path.startsWith("/settings") || path.startsWith("/hints") || path.startsWith("/admin")) return "circle";
    return "home";
  }

  function isPublicRoute(path) {
    return path.startsWith("/ask/") || path.startsWith("/contribute/") || path.startsWith("/offer-details") || path.startsWith("/verify") || path.startsWith("/offer-sent");
  }

  function brandMarkup(publicMode = false) {
    return `<button class="brand" data-nav="${publicMode ? "/ask/ladder?visitor=1" : "/home"}" aria-label="Call On home">
      <img class="brand__mark" src="assets/call-on-mark.svg" alt="" />
      <span>
        <span class="brand__name">Call On</span>
        <span class="brand__circle">${publicMode ? "Private neighbor sharing" : "Encanto Court Neighbors"}</span>
      </span>
    </button>`;
  }

  function topbar(path, publicMode = false) {
    const active = currentNav(path);
    if (publicMode) {
      return `<header class="topbar topbar--public">
        ${brandMarkup(true)}
        <div class="topbar__actions">
          <button class="icon-button icon-button--plain" data-action="show-how" aria-label="How Call On works">${icon("info")}</button>
        </div>
      </header>`;
    }
    const navItems = [
      ["home", "Home", "/home"],
      ["asks", "Asks", "/asks"],
      ["mine", "Mine", "/mine"],
      ["circle", "Circle", "/circle"]
    ];
    return `<header class="topbar">
      ${brandMarkup(false)}
      <nav class="desktop-nav" aria-label="Primary navigation">
        ${navItems.map(([key, label, href]) => `<button data-nav="${href}" aria-current="${active === key ? "page" : "false"}">${label}</button>`).join("")}
      </nav>
      <div class="topbar__actions">
        <button class="btn btn--coral btn--small" data-nav="/create">${icon("plus")} Make an Ask</button>
        <button class="icon-button" data-nav="/settings" aria-label="Notifications">${icon("bell")}</button>
        <button class="brand" data-nav="/settings" aria-label="Open Bruce's profile">${avatar("bruce")}</button>
      </div>
    </header>`;
  }

  function bottomNav(path) {
    const active = currentNav(path);
    const items = [
      ["home", "Home", "home", "/home", ""],
      ["asks", "Asks", "asks", "/asks", ""],
      ["share", "Share", "plus", "/create", " bottom-nav__item--share"],
      ["mine", "Mine", "package", "/mine", ""],
      ["circle", "Circle", "users", "/circle", ""]
    ];
    return `<nav class="bottom-nav" aria-label="Primary navigation">
      ${items.map(([key, label, iconName, href, extra]) => `<button class="bottom-nav__item${extra}" data-nav="${href}" aria-current="${active === key ? "page" : "false"}">${icon(iconName, "icon icon--lg")}<span>${label}</span></button>`).join("")}
    </nav>`;
  }

  function prototypeDock() {
    const screens = [
      ["Dashboard", "Member action home", "/home", "home"],
      ["Create Ask", "Natural-language composer", "/create", "sparkles"],
      ["Shared Ask", "WhatsApp landing page", "/ask/ladder?visitor=1", "link"],
      ["Contribute", "Five help types", "/contribute/ladder", "hand"],
      ["Owner status", "Coverage and offers", "/status/birthday", "chart"],
      ["Offer inbox", "Accept a lender", "/owner/offers", "asks"],
      ["Plan", "Private coordination", "/plan/ladder", "calendar"],
      ["Handoff", "Risk-adaptive checkout", "/handoff/ladder", "shield"],
      ["Active loan", "Return and extension", "/loan/ladder", "package"],
      ["Save item", "Progressive inventory", "/save-resource", "archive"],
      ["Completion", "Shareable gratitude", "/complete", "party"],
      ["Resource hints", "Private matching controls", "/hints", "eyeOff"],
      ["Incident flow", "Private issue reporting", "/incident", "flag"],
      ["Admin", "Scoped pilot console", "/admin", "settings"]
    ];
    return `<aside class="prototype-dock" aria-label="Prototype navigation">
      <div class="prototype-dock__menu" ${state.openPrototypeMenu ? "" : "hidden"}>
        <div class="row row--between" style="padding:.35rem .45rem .5rem">
          <div><strong>Prototype map</strong><small class="muted">Jump to any core screen</small></div>
          <button class="icon-button icon-button--plain" data-action="close-prototype-menu" aria-label="Close prototype menu">${icon("x")}</button>
        </div>
        ${screens.map(([label, desc, href, iconName]) => `<button data-nav="${href}"><span class="choice-card__icon" style="width:38px;height:38px;flex:0 0 auto">${icon(iconName)}</span><span><strong>${label}</strong><small>${desc}</small></span></button>`).join("")}
        <div class="divider"></div>
        <button data-action="reset-prototype"><span class="choice-card__icon" style="width:38px;height:38px;flex:0 0 auto">${icon("refresh")}</span><span><strong>Reset demo</strong><small>Restore the starting state</small></span></button>
      </div>
      <button class="prototype-dock__button" data-action="toggle-prototype-menu" aria-expanded="${state.openPrototypeMenu}">${icon("sparkles")} <span>Prototype map</span></button>
    </aside>`;
  }

  function shell(content, { publicMode = false, narrow = false, wide = false, hideDock = false } = {}) {
    const { path } = routeInfo();
    const pageClass = publicMode ? "page page--public" : `page${narrow ? " page--narrow" : ""}${wide ? " page--wide" : ""}`;
    return `<div class="app-shell">
      ${topbar(path, publicMode)}
      <main id="app-main" class="${pageClass}" tabindex="-1">${content}</main>
      ${publicMode ? "" : bottomNav(path)}
      ${hideDock || publicMode ? "" : prototypeDock()}
    </div>`;
  }

  function formatDateLabel() {
    return "Saturday, July 25";
  }

  function coveragePercent(covered, total) {
    return total ? Math.round((covered / total) * 100) : 0;
  }

  function renderHome() {
    return shell(`
      <section class="page-heading">
        <div>
          <p class="page-heading__eyebrow">Friday evening · 2 things need you</p>
          <h1>Good evening, Bruce.</h1>
          <p>What you promised, what your neighbors still need, and nothing designed to waste your time.</p>
        </div>
        <button class="btn btn--coral page-heading__action" data-nav="/create">${icon("plus")} Make an Ask</button>
      </section>

      <div class="desktop-grid">
        <div class="stack stack--lg">
          <section aria-labelledby="attention-title">
            <div class="section-heading"><h2 id="attention-title">Needs your attention</h2><span class="status-pill status-pill--active">2 actions</span></div>
            <div class="stack">
              <article class="card card--green attention-card">
                <span class="attention-card__label">Due tomorrow</span>
                <h2>Return Janet’s ladder</h2>
                <p>Due Saturday at noon. Need longer? Ask before it becomes awkward.</p>
                <div class="button-row">
                  <button class="btn btn--secondary btn--small" data-nav="/loan/ladder">Open loan</button>
                  <button class="btn btn--ghost btn--small" style="color:#fff" data-nav="/extension/ladder">Ask for more time</button>
                </div>
              </article>

              <article class="card ask-card" data-nav="/owner/offers" tabindex="0" role="link" aria-label="Review a new offer from Janet">
                <div class="ask-card__top">
                  ${avatar("janet", "lg")}
                  <div class="grow">
                    <div class="row row--between row--start"><div><h3>Janet can lend a 6-foot ladder</h3><p class="ask-card__meta">For your branch-trimming Ask · 6 minutes ago</p></div><span class="status-pill status-pill--open">New offer</span></div>
                    <p class="small muted" style="margin:.55rem 0 0">“Fiberglass, six foot. Saturday morning is fine.”</p>
                  </div>
                </div>
                <div class="ask-card__footer"><strong class="small">Review before anything is shared</strong><span>${icon("arrowRight")}</span></div>
              </article>
            </div>
          </section>

          <section aria-labelledby="your-asks-title">
            <div class="section-heading"><h2 id="your-asks-title">Your active Ask</h2><button class="section-heading__link" data-nav="/asks">See all</button></div>
            <article class="card ask-card" data-nav="/status/birthday" tabindex="0" role="link" aria-label="Open birthday setup Ask">
              <div class="row row--between row--start">
                <div><span class="eyebrow">Event · Tomorrow</span><h3>Help with Oliver’s backyard birthday</h3><p class="ask-card__meta">3 of 4 item slots covered</p></div>
                <span class="status-pill status-pill--open">1 table left</span>
              </div>
              <div class="coverage-summary">
                <div class="progress" aria-label="75 percent covered"><div class="progress__bar" style="width:75%"></div></div>
                <div class="coverage-summary__line"><span>Tables, cooler and shade</span><strong>75%</strong></div>
              </div>
              <div class="avatar-stack" aria-label="Three neighbors have contributed">
                ${avatar("janet")}${avatar("carlos")}${avatar("priya")}
              </div>
            </article>
          </section>

          <section aria-labelledby="help-title">
            <div class="section-heading"><h2 id="help-title">You may be able to help</h2><button class="section-heading__link" data-nav="/hints">Why these?</button></div>
            <div class="stack">
              <article class="card ask-card" data-nav="/ask/garden" tabindex="0" role="link">
                <div class="ask-card__top">
                  ${avatar("maria", "lg")}
                  <div class="grow"><span class="eyebrow">Yard project · Sunday</span><h3>Wheelbarrow for a raised garden bed</h3><p class="ask-card__meta">Maria · needs one for about two hours</p></div>
                </div>
                <div class="ask-card__footer"><span class="pill">Matched from: yard equipment</span><button class="btn btn--secondary btn--small" data-nav="/ask/garden">See what she needs</button></div>
              </article>
              <article class="card ask-card" data-nav="/ask/sprinkler" tabindex="0" role="link">
                <div class="ask-card__top">
                  ${avatar("sam", "lg")}
                  <div class="grow"><span class="eyebrow">Advice · This weekend</span><h3>What kind of sprinkler valve is this?</h3><p class="ask-card__meta">Sam · looking for 10 minutes of guidance</p></div>
                </div>
                <div class="ask-card__footer"><span class="pill">No item loan needed</span><button class="btn btn--secondary btn--small">I know how</button></div>
              </article>
            </div>
          </section>
        </div>

        <aside class="stack stack--lg">
          <section class="card card__body--lg">
            <span class="eyebrow">How Call On stays useful</span>
            <h2 style="font-size:1.65rem">Ask first. Inventory later.</h2>
            <p class="muted">No one needs to catalog their garage. A real need creates the moment to help; useful items are remembered only after they are actually shared.</p>
            <button class="btn btn--secondary btn--wide" data-nav="/create">Try the 60-second Ask</button>
          </section>

          <section>
            <div class="section-heading"><h3>Recently completed</h3></div>
            <article class="card card__body">
              <div class="row row--between row--start"><div><span class="status-pill status-pill--covered">Complete</span><h3 style="margin-top:.65rem">Neighborhood movie night</h3><p class="small muted">7 neighbors brought 9 things. Two people met for the first time.</p></div>${icon("party", "icon icon--lg")}</div>
              <button class="btn btn--ghost btn--small" data-nav="/complete">See the thank-you card ${icon("arrowRight")}</button>
            </article>
          </section>

          <section class="card card--soft-green card__body">
            <div class="row row--start"><span class="choice-card__icon">${icon("shield")}</span><div><h3>Private by default</h3><p class="small muted" style="margin:0">Exact addresses, quiet declines and match-only items stay between the people who need them.</p></div></div>
          </section>
        </aside>
      </div>
    `);
  }

  function renderAsks() {
    const tabs = `<div class="segmented" role="tablist" aria-label="Ask status"><button aria-selected="true">Active</button><button aria-selected="false">Completed</button><button aria-selected="false">Yours</button></div>`;
    return shell(`
      <section class="page-heading">
        <div><p class="page-heading__eyebrow">Encanto Court</p><h1>Current Asks</h1><p>Concrete needs with a finish line—not a neighborhood feed.</p></div>
        <button class="btn btn--coral page-heading__action" data-nav="/create">${icon("plus")} Make an Ask</button>
      </section>
      <div style="max-width:520px;margin-bottom:1.2rem">${tabs}</div>
      <div class="desktop-grid desktop-grid--equal">
        <div class="stack">
          <article class="card ask-card" data-nav="/status/birthday" tabindex="0" role="link">
            <div class="row row--between row--start"><span class="eyebrow">Event · Tomorrow</span><span class="status-pill status-pill--open">1 need left</span></div>
            <h3>Help with Oliver’s backyard birthday</h3><p class="small muted">Bruce · 3 neighbors have contributed</p>
            <div class="progress"><div class="progress__bar" style="width:75%"></div></div>
            <div class="need-list">
              <div class="need-row need-row--open"><span class="need-row__icon">${icon("table")}</span><div><div class="need-row__title">Folding tables</div><div class="need-row__detail">1 of 2 covered</div></div><div class="need-row__action"><strong>1 left</strong></div></div>
            </div>
          </article>
          <article class="card ask-card" data-nav="/ask/garden" tabindex="0" role="link">
            <div class="row row--between row--start"><span class="eyebrow">Yard project · Sunday</span><span class="status-pill status-pill--open">Open</span></div>
            <h3>Wheelbarrow for a raised garden bed</h3><p class="small muted">Maria · one item needed for about two hours</p>
            <div class="progress"><div class="progress__bar progress__bar--gold" style="width:0%"></div></div>
          </article>
        </div>
        <div class="stack">
          <article class="card ask-card" data-nav="/ask/sprinkler" tabindex="0" role="link">
            <div class="row row--between row--start"><span class="eyebrow">Advice · This weekend</span><span class="status-pill status-pill--active">1 reply</span></div>
            <h3>What kind of sprinkler valve is this?</h3><p class="small muted">Sam · looking for practical guidance, not a contractor pitch</p>
            <div class="notice notice--info"><span class="notice__icon">${icon("lightbulb")}</span><div><strong>No loan required</strong><p>Advice can be accepted and completed on its own.</p></div></div>
          </article>
          <article class="card ask-card" data-nav="/ask/ladder?visitor=1" tabindex="0" role="link">
            <div class="row row--between row--start"><span class="eyebrow">Quick need · Saturday</span><span class="status-pill status-pill--open">Open</span></div>
            <h3>Borrow a 6-foot ladder</h3><p class="small muted">Bruce · Saturday morning until noon</p>
            <div class="progress"><div class="progress__bar progress__bar--gold" style="width:${state.offerAccepted ? 100 : 0}%"></div></div>
          </article>
        </div>
      </div>
    `, { wide: true });
  }

  function renderCreate() {
    const prompt = escapeHtml(state.draftInput);
    return shell(`
      <div class="stepper" aria-label="Step 1 of 4"><span class="stepper__step is-current"></span><span class="stepper__step"></span><span class="stepper__step"></span><span class="stepper__step"></span></div>
      <section class="page-heading">
        <div><p class="page-heading__eyebrow">Make an Ask · About 60 seconds</p><h1>What are you trying to do or find?</h1><p>Write it the way you would text the group. Call On will organize it before anything is shared.</p></div>
      </section>
      <form id="create-ask-form" class="stack stack--lg">
        <div class="field">
          <label class="visually-hidden" for="ask-input">Describe what you need</label>
          <textarea id="ask-input" class="textarea composer-input" name="ask" placeholder="Example: Need a 6-foot ladder Saturday morning to trim a branch.">${prompt}</textarea>
          <p class="field__hint">Nothing publishes automatically. You will review the title, timing, needs and audience next.</p>
        </div>
        <div>
          <p class="small strong">Try a real-world starting point</p>
          <div class="row row--wrap">
            <button type="button" class="pill" data-sample="Need a 6-foot ladder Saturday morning to trim a branch. I can return it by noon.">${icon("ladder", "icon icon--sm")} Borrow something</button>
            <button type="button" class="pill" data-sample="Hosting a backyard birthday Saturday. Looking for two folding tables, a big cooler, and maybe a pop-up shade tent. Setup is around 10 AM.">${icon("party", "icon icon--sm")} Host an event</button>
            <button type="button" class="pill" data-sample="I’m mounting shelves on a concrete block garage wall Sunday and need someone to sanity-check which anchors to use.">${icon("lightbulb", "icon icon--sm")} Ask for guidance</button>
          </div>
        </div>
        <div class="notice notice--success"><span class="notice__icon">${icon("sparkles")}</span><div><strong>AI drafts; you decide.</strong><p>Dates, quantities and safety details stay editable and require confirmation.</p></div></div>
        <div class="sticky-action"><button type="submit" class="btn btn--primary">Make a draft ${icon("arrowRight")}</button></div>
        <button type="button" class="btn btn--ghost btn--wide" data-action="manual-draft">Skip the smart draft</button>
      </form>
    `, { narrow: true });
  }

  function inferDraft(input) {
    const lower = input.toLowerCase();
    if (lower.includes("birthday") || lower.includes("party") || lower.includes("hosting")) {
      return {
        type: "Event",
        title: "Help with a backyard birthday",
        date: "Saturday, July 25",
        time: "Setup around 10:00 AM",
        context: input,
        audience: "Encanto Court Neighbors",
        needs: [
          { id: "tables", title: "Folding tables", quantity: 2, category: "item", icon: "table", risk: "Low" },
          { id: "cooler", title: "Large cooler", quantity: 1, category: "item", icon: "cooler", risk: "Low" },
          { id: "canopy", title: "Pop-up canopy", quantity: 1, category: "item", icon: "tent", risk: "Moderate" }
        ]
      };
    }
    if (lower.includes("ladder")) {
      return {
        type: "Quick need",
        title: "Borrow a 6-foot ladder",
        date: "Saturday, July 25",
        time: "9:00 AM–12:00 PM",
        context: input,
        audience: "Encanto Court Neighbors",
        needs: [{ id: "ladder", title: "6-foot ladder", quantity: 1, category: "item", icon: "ladder", risk: "Elevated" }]
      };
    }
    if (lower.includes("anchor") || lower.includes("advice") || lower.includes("help")) {
      return {
        type: "Quick need",
        title: "Advice for mounting garage shelves",
        date: "Sunday, July 26",
        time: "Flexible",
        context: input,
        audience: "Encanto Court Neighbors",
        needs: [{ id: "advice", title: "Concrete-wall anchor guidance", quantity: 1, category: "advice", icon: "lightbulb", risk: "Guidance" }]
      };
    }
    return {
      type: "Quick need",
      title: input.trim().slice(0, 68) || "A little neighbor help",
      date: "This weekend",
      time: "Coordinate privately",
      context: input,
      audience: "Encanto Court Neighbors",
      needs: [{ id: "need-1", title: "One item or helping hand", quantity: 1, category: "item", icon: "package", risk: "Needs review" }]
    };
  }

  function renderDraft() {
    const draft = state.draft || inferDraft(state.draftInput);
    state.draft = draft;
    persist();
    return shell(`
      <div class="stepper" aria-label="Step 2 of 4"><span class="stepper__step is-complete"></span><span class="stepper__step is-current"></span><span class="stepper__step"></span><span class="stepper__step"></span></div>
      <section class="page-heading">
        <div><p class="page-heading__eyebrow">Review the draft</p><h1>Does this capture it?</h1><p>Change anything that feels too formal, too specific, or simply wrong.</p></div>
      </section>
      <form id="draft-review-form" class="stack stack--lg">
        <section class="card card__body--lg stack">
          <div class="row row--between row--start"><span class="status-pill status-pill--active">${escapeHtml(draft.type)}</span><button type="button" class="btn btn--ghost btn--small" data-nav="/create">${icon("edit")} Edit original</button></div>
          <div class="field"><label class="field__label" for="draft-title">Ask title</label><input class="input" id="draft-title" name="title" value="${escapeHtml(draft.title)}" /></div>
          <div class="desktop-grid desktop-grid--equal">
            <div class="field"><label class="field__label" for="draft-date">When</label><input class="input" id="draft-date" name="date" value="${escapeHtml(draft.date)}" /></div>
            <div class="field"><label class="field__label" for="draft-time">Timing</label><input class="input" id="draft-time" name="time" value="${escapeHtml(draft.time)}" /></div>
          </div>
          <div class="field"><label class="field__label" for="draft-context">A little context</label><textarea class="textarea" id="draft-context" name="context">${escapeHtml(draft.context)}</textarea></div>
        </section>

        <section>
          <div class="section-heading"><div><h2>What you need</h2><p class="small muted" style="margin:0">Each line can be covered independently.</p></div><button type="button" class="btn btn--secondary btn--small" data-action="add-need">${icon("plus")} Add one</button></div>
          <div class="stack" id="draft-needs">
            ${draft.needs.map((need, index) => `<article class="card draft-card" data-need-id="${need.id}">
              <div class="draft-card__head"><span class="draft-card__number">${index + 1}</span><div class="grow"><div class="field"><label class="field__label" for="need-${need.id}">Need</label><input class="input" id="need-${need.id}" data-need-title="${need.id}" value="${escapeHtml(need.title)}" /></div></div><div class="draft-card__actions"><button type="button" class="icon-button icon-button--plain icon-button--danger" data-remove-need="${need.id}" aria-label="Remove ${escapeHtml(need.title)}">${icon("trash")}</button></div></div>
              <div class="row row--between row--wrap"><div><span class="pill">${icon(need.icon, "icon icon--sm")} ${escapeHtml(need.category)}</span> <span class="pill">${icon("shield", "icon icon--sm")} ${escapeHtml(need.risk)}</span></div><div class="quantity-control" aria-label="Quantity for ${escapeHtml(need.title)}"><button type="button" data-quantity="decrease" data-need-id="${need.id}" aria-label="Decrease quantity">−</button><output>${need.quantity}</output><button type="button" data-quantity="increase" data-need-id="${need.id}" aria-label="Increase quantity">+</button></div></div>
            </article>`).join("")}
          </div>
        </section>

        <section class="card card__body">
          <div class="row row--between row--start"><div><h3>Who can see this?</h3><p class="small muted" style="margin:0">Only this Ask is visible from a shared link.</p></div><span class="status-pill status-pill--covered">Private circle</span></div>
          <div class="divider"></div>
          <label class="radio-row"><input type="radio" name="audience" checked /><span class="radio-row__copy"><strong>Encanto Court Neighbors</strong><span>Your exact address and phone stay hidden.</span></span></label>
        </section>

        <div class="button-row button-row--stack-mobile"><button type="submit" class="btn btn--primary">Looks right ${icon("arrowRight")}</button><button type="button" class="btn btn--ghost" data-nav="/create">Back</button></div>
      </form>
    `, { narrow: true });
  }

  function renderShare() {
    const draft = state.draft || inferDraft(state.draftInput);
    const openNeedText = draft.needs.map(n => `${n.quantity} ${n.title.toLowerCase()}`).join(", ");
    return shell(`
      <div class="stepper" aria-label="Step 4 of 4"><span class="stepper__step is-complete"></span><span class="stepper__step is-complete"></span><span class="stepper__step is-complete"></span><span class="stepper__step is-current"></span></div>
      <section class="page-heading">
        <div><p class="page-heading__eyebrow">Ready to share</p><h1>Your Ask is live.</h1><p>Share one useful message into the chat you already use. Call On will track what gets covered.</p></div>
      </section>
      <div class="desktop-grid">
        <section class="stack stack--lg">
          <article class="card card--soft-green card__body--lg">
            <div class="row row--start"><span class="success-mark" style="width:58px;height:58px;margin:0;border-radius:18px">${icon("check", "icon icon--lg")}</span><div><span class="eyebrow">Published to Encanto Court</span><h2 style="font-size:1.7rem">${escapeHtml(draft.title)}</h2><p class="muted" style="margin:0">${escapeHtml(draft.date)} · ${draft.needs.length} ${draft.needs.length === 1 ? "need" : "needs"}</p></div></div>
          </article>
          <section class="card card__body--lg stack">
            <div><h2 style="font-size:1.55rem">Share to WhatsApp</h2><p class="muted">The text still makes sense if the preview image fails.</p></div>
            <div class="button-row button-row--stack-mobile"><button class="btn btn--primary" data-action="share-whatsapp">${icon("message")} Share in WhatsApp</button><button class="btn btn--secondary" data-action="copy-ask-link">${icon("copy")} Copy link</button></div>
            <div class="divider"></div>
            <button class="btn btn--ghost btn--wide" data-nav="/status/birthday">See the live coverage page ${icon("arrowRight")}</button>
          </section>
        </section>
        <aside>
          <div class="chat-preview" aria-label="Preview of the WhatsApp message">
            <div class="chat-preview__header">${avatar("bruce")}<div><strong>Encanto Court Neighbors</strong><div class="tiny muted">You</div></div></div>
            <div class="chat-preview__bubble">
              <strong>${escapeHtml(draft.title)}</strong><br />
              I’m looking for ${escapeHtml(openNeedText)} for ${escapeHtml(draft.date)}. Tap below if you can help—no app download needed.
              <div class="chat-preview__link-card">
                <div class="chat-preview__image"><strong>${escapeHtml(draft.title)}</strong></div>
                <div class="chat-preview__link-copy"><strong>Can you help?</strong><div class="tiny muted">callon.local/ask/birthday</div></div>
              </div>
              <span class="chat-preview__time">8:18 PM ✓✓</span>
            </div>
          </div>
        </aside>
      </div>
    `, { narrow: false });
  }

  function renderSharedAsk(id) {
    if (id === "birthday") {
      const needs = birthdayNeeds();
      const total = needs.reduce((sum, need) => sum + need.quantity, 0);
      const covered = needs.reduce((sum, need) => sum + Math.min(need.covered, need.quantity), 0);
      const pct = coveragePercent(covered, total);
      return shell(`
        <article class="card public-hero">
          <div class="public-hero__owner">${avatar("bruce", "lg")}<div><strong>Bruce is asking Encanto Court</strong><span>Event Ask · shared from your neighborhood group</span></div></div>
          <span class="status-pill ${covered === total ? "status-pill--covered" : "status-pill--open"}">${covered === total ? "Everything covered" : `${total - covered} item left`}</span>
          <h1>Help with Oliver’s backyard birthday</h1>
          <p class="public-hero__context">“Hosting a backyard birthday Saturday. Looking for two folding tables, a big cooler, and a pop-up shade tent. Setup is around 10 AM.”</p>
          <div class="row row--wrap"><span class="pill">${icon("calendar", "icon icon--sm")} Saturday, July 25</span><span class="pill">${icon("mapPin", "icon icon--sm")} Encanto Court</span></div>
        </article>
        <section class="card card__body--lg stack">
          <div class="section-heading"><div><span class="eyebrow">Live coverage</span><h2>${covered} of ${total} item slots covered</h2></div><strong>${pct}%</strong></div>
          <div class="progress" aria-label="${pct} percent covered"><div class="progress__bar" style="width:${pct}%"></div></div>
          <div class="need-list">
            ${needs.map(need => {
              const complete = need.covered >= need.quantity;
              return `<div class="need-row ${complete ? "need-row--covered" : "need-row--open"}"><span class="need-row__icon">${icon(complete ? "check" : need.icon)}</span><div><div class="need-row__title">${need.title}</div><div class="need-row__detail">${need.covered} of ${need.quantity} covered</div></div><div class="need-row__action"><strong>${complete ? "Covered" : `${need.quantity - need.covered} left`}</strong></div></div>`;
            }).join("")}
          </div>
          <button class="btn btn--primary btn--wide" data-nav="/contribute/birthday">${icon("hand")} I can help</button>
        </section>
        <div class="trust-strip" style="margin-top:1rem">${icon("lock")}<div><strong>Help first; signup later.</strong> Choose what you can contribute before Call On asks for a verified first name and phone.</div></div>
      `, { publicMode: true });
    }
    if (id === "garden") {
      return shell(`
        <article class="card public-hero">
          <div class="public-hero__owner">${avatar("maria", "lg")}<div><strong>Maria is asking Encanto Court</strong><span>Shared from your neighborhood group</span></div></div>
          <span class="status-pill status-pill--open">Still needed</span>
          <h1>Wheelbarrow for a raised garden bed</h1>
          <p class="public-hero__context">“I’m moving soil into a new bed Sunday morning. I only need it for about two hours and can pick up nearby.”</p>
          <div class="row row--wrap"><span class="pill">${icon("calendar", "icon icon--sm")} Sunday, 9–11 AM</span><span class="pill">${icon("mapPin", "icon icon--sm")} Encanto Court</span></div>
        </article>
        <section class="card card__body--lg stack">
          <div class="section-heading"><div><span class="eyebrow">1 need</span><h2>What would help</h2></div><strong>0 of 1 covered</strong></div>
          <div class="need-list"><div class="need-row need-row--open"><span class="need-row__icon">${icon("package")}</span><div><div class="need-row__title">One wheelbarrow</div><div class="need-row__detail">For about two hours</div></div><div class="need-row__action"><strong>Still open</strong></div></div></div>
          <button class="btn btn--primary btn--wide" data-nav="/contribute/garden">${icon("hand")} I can help</button>
        </section>
        <div class="trust-strip" style="margin-top:1rem">${icon("shield")}<div><strong>Private by design.</strong> Your address and contact details are shared only if Maria accepts your offer.</div></div>
      `, { publicMode: true });
    }

    if (id === "sprinkler") {
      return shell(`
        <article class="card public-hero">
          <div class="public-hero__owner">${avatar("sam", "lg")}<div><strong>Sam is asking Encanto Court</strong><span>Practical advice · no public contractor pitches</span></div></div>
          <span class="status-pill status-pill--active">Advice request</span>
          <h1>What kind of sprinkler valve is this?</h1>
          <p class="public-hero__context">“One zone stopped running. I’m trying to identify this part before I decide whether it’s a simple repair or time to call someone.”</p>
          <div class="row row--wrap"><span class="pill">${icon("calendar", "icon icon--sm")} This weekend</span><span class="pill">${icon("lightbulb", "icon icon--sm")} 10 minutes of guidance</span></div>
        </article>
        <section class="card card__body--lg stack">
          <div class="notice notice--info"><span class="notice__icon">${icon("lightbulb")}</span><div><strong>You can help without taking on the job.</strong><p>Share a suggestion, offer a quick look, or recommend professional help if it crosses your comfort line.</p></div></div>
          <button class="btn btn--primary btn--wide" data-nav="/contribute/sprinkler">${icon("hand")} I know something about this</button>
        </section>
      `, { publicMode: true });
    }

    const covered = state.offerAccepted;
    return shell(`
      <article class="card public-hero">
        <div class="public-hero__owner">${avatar("bruce", "lg")}<div><strong>Bruce is asking Encanto Court</strong><span>Member since April 2025 · phone verified</span></div></div>
        <span class="status-pill ${covered ? "status-pill--covered" : "status-pill--open"}">${covered ? "Covered" : "Still needed"}</span>
        <h1>Borrow a 6-foot ladder</h1>
        <p class="public-hero__context">“I need to trim one branch Saturday morning. I can pick it up nearby and return it by noon.”</p>
        <div class="row row--wrap"><span class="pill">${icon("calendar", "icon icon--sm")} Saturday, 9 AM–noon</span><span class="pill">${icon("mapPin", "icon icon--sm")} Encanto Court</span><span class="pill">${icon("shield", "icon icon--sm")} Elevated-risk item</span></div>
      </article>

      <section class="card card__body--lg stack">
        <div class="section-heading"><div><span class="eyebrow">1 need</span><h2>What would help</h2></div><strong>${covered ? "1 of 1" : "0 of 1"} covered</strong></div>
        <div class="progress" aria-label="${covered ? 100 : 0} percent covered"><div class="progress__bar${covered ? "" : " progress__bar--gold"}" style="width:${covered ? 100 : 0}%"></div></div>
        <div class="need-list">
          <div class="need-row ${covered ? "need-row--covered" : "need-row--open"}">
            <span class="need-row__icon">${icon(covered ? "check" : "ladder")}</span>
            <div><div class="need-row__title">One 6-foot ladder</div><div class="need-row__detail">Fiberglass or aluminum is fine</div></div>
            <div class="need-row__action"><strong>${covered ? "Covered" : "Still open"}</strong><span>${covered ? "Janet is helping" : "Saturday morning"}</span></div>
          </div>
        </div>
        <div class="sticky-action"><button class="btn btn--primary" data-nav="/contribute/ladder">${icon("hand")} ${covered ? "I can help another way" : "I can help"}</button></div>
      </section>

      <section class="stack" style="margin-top:1rem">
        <div class="trust-strip">${icon("lock")}<div><strong>No signup wall.</strong> Choose how you can help first. We ask for a name and verified phone only when you send the offer.</div></div>
        <button class="btn btn--ghost btn--wide" data-action="show-how">How this works ${icon("arrowRight")}</button>
      </section>
    `, { publicMode: true });
  }

  function contributionOptions(askId) {
    const isAdvice = askId === "sprinkler";
    return [
      { id: "lend", title: "I can lend it", copy: isAdvice ? "Offer a tool that may help." : "Offer an item, listed or not.", icon: "package", className: "" },
      { id: "give", title: "I can give something", copy: "Materials or an item they can keep.", icon: "gift", className: "choice-card--coral" },
      { id: "help", title: "I can help", copy: "Offer a little time or a helping hand.", icon: "hand", className: "choice-card--gold" },
      { id: "know", title: "I know how", copy: "Share guidance or offer a quick look.", icon: "lightbulb", className: "choice-card--blue" },
      { id: "alternative", title: "I have another idea", copy: "Suggest a safer or easier alternative.", icon: "sparkles", className: "" }
    ];
  }

  function renderContribute(askId) {
    const title = askId === "garden" ? "Wheelbarrow for a raised garden bed" : askId === "sprinkler" ? "What kind of sprinkler valve is this?" : askId === "birthday" ? "Help with Oliver’s backyard birthday" : "Borrow a 6-foot ladder";
    const owner = askId === "garden" ? "Maria" : askId === "sprinkler" ? "Sam" : "Bruce";
    const options = contributionOptions(askId);
    return shell(`
      <div class="stepper" aria-label="Contribution step 1 of 3"><span class="stepper__step is-current"></span><span class="stepper__step"></span><span class="stepper__step"></span><span class="stepper__step"></span></div>
      <button class="btn btn--ghost btn--small" data-nav="/ask/${askId}?visitor=1">${icon("arrowLeft")} Back to the Ask</button>
      <section class="page-heading" style="margin-top:1rem">
        <div><p class="page-heading__eyebrow">Help ${owner}</p><h1>What can you contribute?</h1><p>Choose the closest fit. You can explain the details next.</p></div>
      </section>
      <div class="card card--soft-green card__body" style="margin-bottom:1rem"><div class="row row--start"><span class="choice-card__icon">${icon(askId === "ladder" ? "ladder" : askId === "garden" ? "package" : askId === "birthday" ? "party" : "lightbulb")}</span><div><strong>${escapeHtml(title)}</strong><div class="small muted">${askId === "ladder" ? "Saturday, 9 AM–noon" : askId === "garden" ? "Sunday, 9–11 AM" : askId === "birthday" ? "Saturday, setup at 10 AM" : "This weekend"}</div></div></div></div>
      <div class="choice-grid choice-grid--one-mobile" role="group" aria-label="Contribution type">
        ${options.map(option => `<button class="choice-card ${option.className}${state.selectedContribution === option.id ? " is-selected" : ""}" data-contribution="${option.id}" aria-pressed="${state.selectedContribution === option.id}"><span class="choice-card__icon">${icon(option.icon, "icon icon--lg")}</span><span class="choice-card__title">${option.title}</span><span class="choice-card__copy">${option.copy}</span></button>`).join("")}
      </div>
      <div class="sticky-action"><button class="btn btn--primary" data-nav="/offer-details/${askId}">Continue ${icon("arrowRight")}</button></div>
      <p class="center small muted" style="margin-top:1rem">No one will know if you change your mind before sending.</p>
    `, { publicMode: true });
  }

  function renderOfferDetails(askId) {
    const type = state.selectedContribution;
    const typeMeta = {
      lend: ["What can you lend?", "Describe only what matters for this request.", "Six-foot fiberglass ladder", "package"],
      give: ["What can you give?", "Say what they can keep and roughly how much.", "A spare pack of masonry anchors", "gift"],
      help: ["How can you help?", "Offer a bounded amount of time so expectations stay clear.", "I can stop by for about 20 minutes", "hand"],
      know: ["What do you know?", "Share a useful answer or offer a quick sanity check.", "I’ve replaced that valve before", "lightbulb"],
      alternative: ["What’s your alternative?", "Suggest another item, approach, or safer next step.", "I have a telescoping pole that may avoid the ladder", "sparkles"]
    }[type] || ["How can you help?", "A short description is enough.", "Here’s what I can offer", "hand"];
    const isPhysical = type === "lend" || type === "give";
    return shell(`
      <div class="stepper" aria-label="Contribution step 2 of 3"><span class="stepper__step is-complete"></span><span class="stepper__step is-current"></span><span class="stepper__step"></span><span class="stepper__step"></span></div>
      <button class="btn btn--ghost btn--small" data-nav="/contribute/${askId}">${icon("arrowLeft")} Change contribution type</button>
      <section class="page-heading" style="margin-top:1rem"><div><p class="page-heading__eyebrow">${typeMeta[0]}</p><h1>${typeMeta[0]}</h1><p>${typeMeta[1]}</p></div></section>
      <form id="offer-details-form" data-ask-id="${askId}" class="stack stack--lg">
        <section class="card card__body--lg stack">
          <div class="field"><label class="field__label" for="offer-description">${isPhysical ? "Item or contribution" : "Your note"}</label><input class="input" id="offer-description" name="description" placeholder="${typeMeta[2]}" value="${type === "lend" && askId === "ladder" ? "Six-foot fiberglass ladder" : ""}" required /></div>
          ${isPhysical ? `<div class="desktop-grid desktop-grid--equal"><div class="field"><label class="field__label" for="offer-quantity">How many?</label><select class="select" id="offer-quantity" name="quantity"><option>1</option><option>2</option><option>3</option></select></div><div class="field"><label class="field__label" for="offer-condition">Condition</label><select class="select" id="offer-condition" name="condition"><option>Good working condition</option><option>Works with normal wear</option><option>I’ll explain a known issue</option></select></div></div>` : ""}
          <div class="field"><label class="field__label" for="offer-availability">When would this work?</label><select class="select" id="offer-availability" name="availability"><option>${askId === "ladder" ? "Saturday morning" : "The requested time works"}</option><option>Before the requested time</option><option>Let us coordinate privately</option></select></div>
          <div class="field"><label class="field__label" for="offer-note">Optional note</label><textarea class="textarea" id="offer-note" name="note" placeholder="Anything ${askId === "ladder" ? "Bruce" : "the requester"} should know?">${type === "lend" && askId === "ladder" ? "It’s easy to carry. I need it back by Saturday afternoon." : ""}</textarea></div>
        </section>
        <div class="notice notice--success"><span class="notice__icon">${icon("eyeOff")}</span><div><strong>Your address is not part of the offer.</strong><p>Pickup details stay private until the requester accepts.</p></div></div>
        <div class="sticky-action"><button type="submit" class="btn btn--primary">Continue to send ${icon("arrowRight")}</button></div>
      </form>
    `, { publicMode: true });
  }

  function renderVerify(askId) {
    const sent = state.verificationSent;
    return shell(`
      <div class="stepper" aria-label="Contribution step 3 of 3"><span class="stepper__step is-complete"></span><span class="stepper__step is-complete"></span><span class="stepper__step is-current"></span><span class="stepper__step"></span></div>
      <button class="btn btn--ghost btn--small" data-nav="/offer-details/${askId}">${icon("arrowLeft")} Back</button>
      <section class="page-heading" style="margin-top:1rem"><div><p class="page-heading__eyebrow">One quick check</p><h1>Who should ${askId === "ladder" ? "Bruce" : "they"} thank?</h1><p>We verify a phone only when you are ready to send a real offer. No password or profile setup.</p></div></section>
      <form id="verify-form" data-ask-id="${askId}" class="stack stack--lg">
        <section class="card card__body--lg stack">
          <div class="field"><label class="field__label" for="first-name">First name</label><input class="input" id="first-name" name="firstName" value="Janet" autocomplete="given-name" required /></div>
          <div class="field"><label class="field__label" for="phone">Mobile number</label><input class="input" id="phone" name="phone" value="(561) 555-0142" inputmode="tel" autocomplete="tel" required /></div>
          ${sent ? `<div class="notice notice--success"><span class="notice__icon">${icon("phone")}</span><div><strong>Code sent</strong><p>For the prototype, use any six digits.</p></div></div><div class="field"><label class="field__label" for="otp">6-digit code</label><input class="input" id="otp" name="otp" value="246810" inputmode="numeric" autocomplete="one-time-code" maxlength="6" required /></div>` : ""}
          <label class="check-row"><input type="checkbox" name="age" checked required /><span class="check-row__copy"><strong>I’m at least 18</strong><span>Adults coordinate all lending and helping.</span></span></label>
        </section>
        <div class="notice"><span class="notice__icon">${icon("lock")}</span><div><strong>Minimal identity only.</strong><p>Your last name, exact address, photo and item inventory are not required.</p></div></div>
        <div class="sticky-action"><button type="submit" class="btn btn--primary">${sent ? `Verify and send offer ${icon("send")}` : `Text me a code ${icon("arrowRight")}`}</button></div>
      </form>
    `, { publicMode: true });
  }

  function renderOfferSent(askId) {
    return shell(`
      <section class="center" style="padding-top:clamp(1.5rem,8vw,4rem)">
        <div class="success-mark">${icon("check", "icon icon--lg")}</div>
        <p class="eyebrow">Offer sent</p>
        <h1 style="max-width:12ch;margin-left:auto;margin-right:auto">Bruce will confirm.</h1>
        <p class="muted" style="max-width:48ch;margin-left:auto;margin-right:auto">Your six-foot ladder offer is private. Your address and phone have not been shared with the whole group.</p>
      </section>
      <section class="card card__body--lg stack" style="margin-top:1.2rem">
        <div class="row row--start">${avatar("bruce", "lg")}<div><strong>What happens next</strong><p class="small muted" style="margin:.2rem 0 0">Bruce can accept, ask a question, or choose another offer. If accepted, the two of you choose a handoff method privately.</p></div></div>
        <div class="timeline">
          <div class="timeline-item is-complete"><span class="timeline-item__dot">${icon("check")}</span><div class="timeline-item__copy"><strong>Offer sent</strong><span>Just now</span></div></div>
          <div class="timeline-item is-current"><span class="timeline-item__dot">2</span><div class="timeline-item__copy"><strong>Bruce reviews it</strong><span>You will get a clear answer</span></div></div>
          <div class="timeline-item"><span class="timeline-item__dot">3</span><div class="timeline-item__copy"><strong>Coordinate pickup</strong><span>Only after acceptance</span></div></div>
        </div>
        <button class="btn btn--secondary btn--wide" data-nav="/home">Join Encanto Court later</button>
        <button class="btn btn--ghost btn--wide" data-nav="/ask/${askId}?visitor=1">Back to the Ask</button>
      </section>
    `, { publicMode: true });
  }

  function birthdayNeeds() {
    const c = state.birthdayCoverage;
    return [
      { id: "tables", title: "Folding tables", icon: "table", quantity: 2, covered: c.tables, helper: c.tables > 1 ? "Janet + Maria" : "Janet" },
      { id: "cooler", title: "Large cooler", icon: "cooler", quantity: 1, covered: c.cooler, helper: "Carlos" },
      { id: "canopy", title: "Pop-up canopy", icon: "tent", quantity: 1, covered: c.canopy, helper: "Priya" }
    ];
  }

  function renderStatus(id) {
    if (id !== "birthday") return renderSharedAsk(id);
    const needs = birthdayNeeds();
    const total = needs.reduce((sum, need) => sum + need.quantity, 0);
    const covered = needs.reduce((sum, need) => sum + Math.min(need.covered, need.quantity), 0);
    const pct = coveragePercent(covered, total);
    return shell(`
      <section class="page-heading">
        <div><p class="page-heading__eyebrow">Your Ask · Tomorrow</p><h1>Help with Oliver’s backyard birthday</h1><p>Setup starts around 10 AM. The shared page updates as each need is covered.</p></div>
        <button class="btn btn--secondary page-heading__action" data-nav="/share">${icon("share")} Share update</button>
      </section>

      <div class="desktop-grid">
        <section class="stack stack--lg">
          <article class="card card__body--lg stack">
            <div class="row row--between row--start"><div><span class="status-pill ${covered === total ? "status-pill--covered" : "status-pill--open"}">${covered === total ? "Everything covered" : `${total - covered} item left`}</span><h2 style="margin-top:.75rem">${covered} of ${total} item slots covered</h2></div><strong style="font-size:2rem">${pct}%</strong></div>
            <div class="progress" aria-label="${pct} percent covered"><div class="progress__bar" style="width:${pct}%"></div></div>
            <div class="need-list">
              ${needs.map(need => {
                const complete = need.covered >= need.quantity;
                return `<div class="need-row ${complete ? "need-row--covered" : "need-row--open"}"><span class="need-row__icon">${icon(complete ? "check" : need.icon)}</span><div><div class="need-row__title">${need.title}</div><div class="need-row__detail">${need.covered} of ${need.quantity} covered${need.covered ? ` · ${need.helper}` : ""}</div></div><div class="need-row__action"><strong>${complete ? "Covered" : `${need.quantity - need.covered} left`}</strong></div></div>`;
              }).join("")}
            </div>
            <div class="button-row button-row--stack-mobile"><button class="btn btn--primary" data-action="share-outstanding">${icon("message")} Share only what’s left</button><button class="btn btn--secondary" data-nav="/complete">Preview completion</button></div>
          </article>

          <section>
            <div class="section-heading"><h2>Offers and helpers</h2><button class="section-heading__link" data-nav="/owner/offers">Review all</button></div>
            <div class="stack">
              <article class="card offer-card"><div class="offer-card__headline">${avatar("janet", "lg")}<div class="grow"><h3>Janet is lending one table</h3><p class="small muted" style="margin:0">Six-foot folding table · Pickup Friday evening</p></div><span class="status-pill status-pill--covered">Accepted</span></div></article>
              <article class="card offer-card"><div class="offer-card__headline">${avatar("carlos", "lg")}<div class="grow"><h3>Carlos is lending a large cooler</h3><p class="small muted" style="margin:0">Available now · Return Sunday</p></div><span class="status-pill status-pill--covered">Accepted</span></div></article>
              <article class="card offer-card"><div class="offer-card__headline">${avatar("priya", "lg")}<div class="grow"><h3>Priya is lending a 10×10 canopy</h3><p class="small muted" style="margin:0">She also reminded you to use canopy weights.</p></div><span class="status-pill status-pill--covered">Accepted</span></div></article>
            </div>
          </section>
        </section>

        <aside class="stack stack--lg">
          <section class="card card__body--lg stack">
            <div class="row row--between"><div><span class="eyebrow">Shared link</span><h3>Live in the HOA WhatsApp</h3></div>${icon("message", "icon icon--lg")}</div>
            <p class="small muted">New visitors see this Ask only—not the member directory, your other Asks or any private coordination.</p>
            <button class="btn btn--secondary btn--wide" data-nav="/ask/birthday?visitor=1">Open visitor view</button>
          </section>
          <section class="card card--coral card__body">
            <div class="row row--start"><span class="choice-card__icon" style="background:#fff">${icon("sparkles")}</span><div><h3>Suggested missing detail</h3><p class="small muted" style="margin:0">Canopy owners may ask whether you have weights. Add that to the pickup note, not as another public need.</p></div></div>
          </section>
          <section class="card card__body">
            <h3>Ask controls</h3>
            <div class="stack stack--sm" style="margin-top:.75rem"><button class="btn btn--secondary btn--wide" data-nav="/draft">${icon("edit")} Edit Ask</button><button class="btn btn--ghost btn--wide">Pause new offers</button><button class="btn btn--subtle-danger btn--wide">Cancel Ask</button></div>
          </section>
        </aside>
      </div>
    `);
  }

  function renderOfferInbox() {
    const accepted = state.offerAccepted;
    return shell(`
      <section class="page-heading">
        <div><p class="page-heading__eyebrow">Your Ask · 3 offers</p><h1>Who should you coordinate with?</h1><p>Accepting one offer creates a private plan. Other people get a clear, gracious update.</p></div>
      </section>
      <div class="desktop-grid">
        <section class="stack">
          <article class="card offer-card ${accepted ? "card--soft-green" : ""}">
            <div class="offer-card__headline">${avatar("janet", "lg")}<div class="grow"><div class="row row--between row--start"><div><h3>Janet’s six-foot fiberglass ladder</h3><p class="small muted" style="margin:0">Saturday morning · needs it back by 3 PM</p></div>${accepted ? '<span class="status-pill status-pill--covered">Accepted</span>' : '<span class="status-pill status-pill--open">Best match</span>'}</div></div></div>
            <p>“It’s easy to carry. Normal wear, no known defects.”</p>
            <div class="offer-card__facts"><span class="pill">${icon("shield", "icon icon--sm")} Verified neighbor</span><span class="pill">${icon("checkCircle", "icon icon--sm")} 6 completed lends</span><span class="pill">${icon("clock", "icon icon--sm")} Replied in 4 min</span></div>
            <div class="offer-card__actions">${accepted ? `<button class="btn btn--primary" data-nav="/plan/ladder">Open plan ${icon("arrowRight")}</button>` : `<button class="btn btn--primary" data-action="accept-janet">Accept Janet</button><button class="btn btn--secondary" data-action="message-janet">Ask a question</button>`}</div>
          </article>

          <article class="card offer-card">
            <div class="offer-card__headline">${avatar("carlos", "lg")}<div class="grow"><h3>Carlos has an eight-foot aluminum ladder</h3><p class="small muted" style="margin:0">Available Saturday after 10 AM</p></div><span class="status-pill status-pill--neutral">Alternative</span></div>
            <p>“It’s taller than you asked for, but you’re welcome to use it if nothing else works.”</p>
            <div class="offer-card__actions"><button class="btn btn--secondary">Accept instead</button><button class="btn btn--ghost" data-action="decline-offer">Thank and decline</button></div>
          </article>

          <article class="card offer-card">
            <div class="offer-card__headline">${avatar("priya", "lg")}<div class="grow"><h3>Priya suggests a telescoping pole saw</h3><p class="small muted" style="margin:0">May avoid working from a ladder</p></div><span class="status-pill status-pill--active">Safer idea</span></div>
            <p>“Depending on the branch, mine may reach it from the ground. Happy to bring it over.”</p>
            <div class="offer-card__actions"><button class="btn btn--secondary">Explore this</button><button class="btn btn--ghost" data-action="decline-offer">Thank and decline</button></div>
          </article>
        </section>

        <aside class="stack stack--lg">
          <section class="card card__body--lg"><span class="eyebrow">Need</span><h2 style="font-size:1.55rem">Borrow a 6-foot ladder</h2><p class="muted">Saturday, 9 AM–noon · trimming one branch</p><button class="btn btn--ghost btn--small" data-nav="/ask/ladder?visitor=1">View shared Ask</button></section>
          <section class="notice notice--success"><span class="notice__icon">${icon("eyeOff")}</span><div><strong>Declines stay private.</strong><p>Contributors see a neutral “another offer was selected,” not a public ranking.</p></div></section>
        </aside>
      </div>
    `);
  }

  function planTimeline() {
    return `<div class="timeline">
      <div class="timeline-item is-complete"><span class="timeline-item__dot">${icon("check")}</span><div class="timeline-item__copy"><strong>Offer accepted</strong><span>Friday at 6:04 PM</span></div></div>
      <div class="timeline-item ${state.handoffConfirmed ? "is-complete" : "is-current"}"><span class="timeline-item__dot">${state.handoffConfirmed ? icon("check") : "2"}</span><div class="timeline-item__copy"><strong>Pick up ladder</strong><span>Saturday around 9:15 AM · porch pickup</span></div></div>
      <div class="timeline-item ${state.handoffConfirmed && !state.loanReturned ? "is-current" : state.loanReturned ? "is-complete" : ""}"><span class="timeline-item__dot">${state.loanReturned ? icon("check") : "3"}</span><div class="timeline-item__copy"><strong>Return by noon</strong><span>${state.extensionApproved ? "Extended to 3:00 PM" : "Saturday, July 25"}</span></div></div>
      <div class="timeline-item ${state.returnConfirmed ? "is-complete" : ""}"><span class="timeline-item__dot">${state.returnConfirmed ? icon("check") : "4"}</span><div class="timeline-item__copy"><strong>Janet confirms return</strong><span>${state.returnConfirmed ? "Everything okay" : "Closes the loan"}</span></div></div>
    </div>`;
  }

  function renderPlan() {
    const selected = state.handoffMethod;
    const methods = [
      ["porch", "Porch pickup", "Janet shares the pickup spot after confirmation", "home"],
      ["outside", "Meet outside", "Choose a short time window", "users"],
      ["clubhouse", "Clubhouse", "Use a neutral community location", "mapPin"],
      ["dropoff", "Drop-off", "Janet brings it if she prefers", "package"]
    ];
    return shell(`
      <section class="page-heading"><div><p class="page-heading__eyebrow">Private plan · Bruce + Janet</p><h1>Borrow Janet’s ladder</h1><p>The Ask is covered. Now only the two of you see logistics, location and condition details.</p></div></section>
      <div class="desktop-grid">
        <section class="stack stack--lg">
          <article class="card card--soft-green card__body--lg"><div class="row row--between row--start"><div class="row row--start">${avatar("janet", "lg")}<div><span class="eyebrow">Accepted offer</span><h2 style="font-size:1.55rem">Six-foot fiberglass ladder</h2><p class="small muted" style="margin:0">Good condition · no known defects · back by 3 PM at the latest</p></div></div><span class="status-pill status-pill--covered">Plan ready</span></div></article>

          <section class="card card__body--lg stack">
            <div><h2 style="font-size:1.55rem">How should the handoff work?</h2><p class="muted">This choice is private. The exact location appears only after both sides confirm.</p></div>
            <div class="choice-grid choice-grid--two choice-grid--one-mobile">
              ${methods.map(([id, title, copy, iconName]) => `<button class="choice-card${selected === id ? " is-selected" : ""}" data-handoff="${id}" aria-pressed="${selected === id}"><span class="choice-card__icon">${icon(iconName)}</span><span class="choice-card__title">${title}</span><span class="choice-card__copy">${copy}</span></button>`).join("")}
            </div>
            ${selected === "porch" ? `<div class="notice notice--success"><span class="notice__icon">${icon("lock")}</span><div><strong>Pickup spot unlocked for Bruce only</strong><p>Garage-side porch, west side. Janet’s exact street address is visible in the private plan, not the shared Ask.</p></div></div>` : ""}
            <div class="button-row button-row--stack-mobile"><button class="btn btn--primary" data-nav="/handoff/ladder">Review handoff ${icon("arrowRight")}</button><button class="btn btn--secondary" data-nav="/messages/ladder">${icon("message")} Coordinate privately</button></div>
          </section>
        </section>
        <aside class="stack stack--lg">
          <section class="card card__body--lg"><h3>Plan progress</h3>${planTimeline()}</section>
          <section class="card card__body"><div class="row row--between"><div><h3 style="margin:0">Saturday, 9:15 AM</h3><p class="small muted" style="margin:.2rem 0 0">Pickup reminder set</p></div>${icon("calendar", "icon icon--lg")}</div></section>
          <button class="btn btn--subtle-danger btn--wide" data-nav="/incident">${icon("flag")} Something feels wrong</button>
        </aside>
      </div>
    `);
  }

  function renderMessages() {
    return shell(`
      <section class="page-heading"><div><p class="page-heading__eyebrow">Private coordination</p><h1>Bruce + Janet</h1><p>Only the participants can see this thread unless a specific incident is escalated.</p></div></section>
      <div class="desktop-grid">
        <section>
          <div class="message-thread" id="message-thread" aria-label="Private message thread">
            ${state.messages.map(message => `<div class="message${message.from === "bruce" ? " message--mine" : ""}">${message.from !== "bruce" ? '<span class="message__name">Janet</span>' : ""}${escapeHtml(message.text)}<span class="message__time">${message.time}</span></div>`).join("")}
          </div>
          <form id="message-form" class="message-composer"><label class="visually-hidden" for="message-input">Write a private message</label><input id="message-input" class="input" name="message" placeholder="Write a private message…" autocomplete="off" /><button class="btn btn--primary btn--square" aria-label="Send message">${icon("send")}</button></form>
        </section>
        <aside class="stack stack--lg">
          <section class="card card__body--lg"><div class="row row--start">${avatar("janet", "lg")}<div><h3>Janet</h3><p class="small muted">Verified Encanto Court neighbor · 6 completed lends</p></div></div><div class="divider"></div><p class="small"><strong>Plan:</strong> Six-foot ladder<br /><strong>Pickup:</strong> Saturday around 9:15 AM<br /><strong>Due:</strong> Saturday at noon</p><button class="btn btn--secondary btn--wide" data-nav="/plan/ladder">Back to plan</button></section>
          <div class="trust-strip">${icon("shield")}<div>Circle admins cannot browse this thread as routine administration.</div></div>
        </aside>
      </div>
    `);
  }

  function renderHandoff() {
    return shell(`
      <div class="stepper" aria-label="Handoff step 1 of 2"><span class="stepper__step is-current"></span><span class="stepper__step"></span><span class="stepper__step"></span><span class="stepper__step"></span></div>
      <section class="page-heading"><div><p class="page-heading__eyebrow">Elevated-risk handoff</p><h1>Quick condition check</h1><p>A ladder deserves a little more care than a cooler. This is a shared factual record—not a legal performance.</p></div></section>
      <form id="handoff-form" class="stack stack--lg">
        <article class="card card__body--lg stack">
          <div class="row row--start"><span class="choice-card__icon">${icon("ladder", "icon icon--lg")}</span><div><h2 style="font-size:1.55rem">Janet’s six-foot fiberglass ladder</h2><p class="small muted" style="margin:0">One item · no accessories</p></div></div>
          <div class="divider"></div>
          <div class="field"><label class="field__label" for="condition">Current condition</label><select class="select" id="condition" name="condition"><option>Good condition with normal wear</option><option>Visible wear; details noted below</option><option>Do not hand off—something seems unsafe</option></select></div>
          <label class="check-row"><input type="checkbox" name="defects" checked required /><span class="check-row__copy"><strong>Known defects have been disclosed</strong><span>Janet reports no loose feet, cracks or bent rails.</span></span></label>
          <label class="check-row"><input type="checkbox" name="borrower" checked required /><span class="check-row__copy"><strong>I’ll decide whether I can use it safely</strong><span>I’ll follow manufacturer guidance and won’t let another person use it without permission.</span></span></label>
          <button type="button" class="btn btn--secondary btn--wide" data-action="condition-photo">${icon("camera")} Add optional condition photo</button>
        </article>
        <div class="notice notice--warning"><span class="notice__icon">${icon("alert")}</span><div><strong>Do not continue if it looks unsafe.</strong><p>Cancel the handoff privately. Call On does not certify the item or your ability to use it.</p></div></div>
        <div class="sticky-action"><button type="submit" class="btn btn--primary">Confirm handoff ${icon("checkCircle")}</button></div>
      </form>
    `, { narrow: true });
  }

  function renderLoan() {
    const due = state.extensionApproved ? "Today at 3:00 PM" : "Today at 12:00 PM";
    const status = state.returnConfirmed ? "Closed" : state.loanReturned ? "Return awaiting confirmation" : state.handoffConfirmed ? "Borrowed" : "Ready for pickup";
    return shell(`
      <section class="page-heading"><div><p class="page-heading__eyebrow">Your borrowed item</p><h1>Janet’s ladder</h1><p>${status}. One clear next action at a time.</p></div></section>
      <div class="desktop-grid">
        <section class="stack stack--lg">
          <article class="card card--green card__body--lg">
            <div class="row row--between row--start"><div><span class="attention-card__label">${state.returnConfirmed ? "Loan closed" : state.loanReturned ? "Marked returned" : "Due back"}</span><h2 style="font-size:2.1rem;margin-top:.45rem;color:#fff">${state.returnConfirmed ? "Everything is settled" : state.loanReturned ? "Waiting for Janet" : due}</h2><p style="color:rgba(255,255,255,.78);margin:0">Six-foot fiberglass ladder · porch return</p></div>${icon(state.returnConfirmed ? "checkCircle" : "clock", "icon icon--lg")}</div>
          </article>

          <section class="card card__body--lg stack">
            <div class="row row--start">${avatar("janet", "lg")}<div><h3>Return to Janet</h3><p class="small muted" style="margin:0">Garage-side porch · exact address in this private plan</p></div></div>
            ${state.loanReturned ? `<div class="notice notice--success"><span class="notice__icon">${icon("check")}</span><div><strong>You marked it returned.</strong><p>Janet received a one-tap confirmation request.</p></div></div>` : `<div class="button-row button-row--stack-mobile"><button class="btn btn--primary" data-nav="/return/ladder">${icon("checkCircle")} Mark returned</button><button class="btn btn--secondary" data-nav="/extension/ladder">${icon("clock")} Ask for more time</button></div>`}
            ${state.loanReturned && !state.returnConfirmed ? `<button class="btn btn--secondary btn--wide" data-action="simulate-owner-confirm">Simulate Janet confirming return</button>` : ""}
            ${state.returnConfirmed ? `<button class="btn btn--primary btn--wide" data-nav="/save-resource">Continue ${icon("arrowRight")}</button>` : ""}
          </section>

          <button class="btn btn--subtle-danger btn--wide" data-nav="/incident">${icon("flag")} Something went wrong</button>
        </section>
        <aside class="stack stack--lg">
          <section class="card card__body--lg"><h3>Loan ledger</h3>${planTimeline()}</section>
          <section class="card card__body"><h3>What came with it</h3><div class="row row--between"><span>Six-foot ladder</span><span class="status-pill status-pill--covered">1 item</span></div><div class="divider"></div><p class="small muted" style="margin:0">No charger, case or loose accessories to remember.</p></section>
        </aside>
      </div>
    `);
  }

  function renderExtension() {
    return shell(`
      <section class="page-heading"><div><p class="page-heading__eyebrow">Private request</p><h1>How much more time?</h1><p>Janet can approve or suggest another time. Asking before the deadline keeps this easy.</p></div></section>
      <form id="extension-form" class="stack stack--lg">
        <section class="card card__body--lg stack">
          <label class="radio-row"><input type="radio" name="extension" value="1" /><span class="radio-row__copy"><strong>One more hour</strong><span>Return by 1:00 PM</span></span></label>
          <label class="radio-row"><input type="radio" name="extension" value="3" checked /><span class="radio-row__copy"><strong>Until 3:00 PM</strong><span>Janet originally said this is her latest comfortable time.</span></span></label>
          <label class="radio-row"><input type="radio" name="extension" value="custom" /><span class="radio-row__copy"><strong>Suggest another time</strong><span>Coordinate privately.</span></span></label>
          <div class="field"><label class="field__label" for="extension-note">Optional note</label><textarea class="textarea" id="extension-note" name="note">The branch is taking a little longer than I expected. I can have it back by 3.</textarea></div>
        </section>
        <div class="sticky-action"><button class="btn btn--primary" type="submit">Ask Janet ${icon("send")}</button></div>
      </form>
    `, { narrow: true });
  }

  function renderReturn() {
    return shell(`
      <section class="page-heading"><div><p class="page-heading__eyebrow">Return the item</p><h1>Is the ladder back with Janet?</h1><p>Marking it returned tells Janet to confirm condition and closes the loop.</p></div></section>
      <form id="return-form" class="stack stack--lg">
        <article class="card card__body--lg stack">
          <div class="row row--start"><span class="choice-card__icon">${icon("ladder", "icon icon--lg")}</span><div><h2 style="font-size:1.55rem">Six-foot fiberglass ladder</h2><p class="small muted" style="margin:0">Return to garage-side porch</p></div></div>
          <label class="radio-row"><input type="radio" name="returnState" value="same" checked /><span class="radio-row__copy"><strong>Returned in the same condition</strong><span>Normal wear only; nothing missing.</span></span></label>
          <label class="radio-row"><input type="radio" name="returnState" value="issue" /><span class="radio-row__copy"><strong>Something changed or went wrong</strong><span>Start a private issue report instead of pretending it’s fine.</span></span></label>
          <div class="field"><label class="field__label" for="return-note">Optional note to Janet</label><textarea class="textarea" id="return-note">Thanks, Janet. It’s back in the same spot by the garage.</textarea></div>
        </article>
        <div class="sticky-action"><button class="btn btn--primary" type="submit">Mark returned ${icon("checkCircle")}</button></div>
      </form>
    `, { narrow: true });
  }

  function renderSaveResource() {
    const choice = state.savedResourceChoice;
    const choices = [
      ["match", "Save for private matching", "Call On can ask Janet privately when a similar need appears. No public listing.", "eyeOff"],
      ["circle", "Show it to the Circle", "Members can see that Janet may have a six-foot ladder and request it.", "users"],
      ["history", "Keep history only", "Remember this completed lend but do not match or show the item.", "archive"],
      ["none", "Don’t save it", "The loan closes without creating any reusable item record.", "x"]
    ];
    return shell(`
      <section class="center" style="padding-top:1rem"><div class="success-mark">${icon("check", "icon icon--lg")}</div><p class="eyebrow">Loan complete</p><h1 style="max-width:13ch;margin-left:auto;margin-right:auto">Would Janet be comfortable being asked again?</h1><p class="muted" style="max-width:52ch;margin-left:auto;margin-right:auto">This appears after a successful lend—not during setup. Janet remains free to say no every time.</p></section>
      <section class="choice-grid choice-grid--two choice-grid--one-mobile" style="margin-top:1.5rem">
        ${choices.map(([id, title, copy, iconName]) => `<button class="choice-card${choice === id ? " is-selected" : ""}" data-save-choice="${id}" aria-pressed="${choice === id}"><span class="choice-card__icon">${icon(iconName)}</span><span class="choice-card__title">${title}</span><span class="choice-card__copy">${copy}</span></button>`).join("")}
      </section>
      <div class="notice notice--success" style="margin-top:1rem"><span class="notice__icon">${icon("shield")}</span><div><strong>No permanent availability promise.</strong><p>“Happy to be asked” means a private invitation—not automatic booking.</p></div></div>
      <div class="sticky-action"><button class="btn btn--primary" data-action="save-resource" ${choice ? "" : "disabled"}>Save preference ${icon("arrowRight")}</button></div>
    `, { narrow: true });
  }

  function renderComplete() {
    return shell(`
      <section class="page-heading"><div><p class="page-heading__eyebrow">Completion moment</p><h1>Show the group what happened.</h1><p>A useful thank-you is the growth loop: it proves the system works without ranking generous people.</p></div></section>
      <div class="desktop-grid">
        <section>
          <article class="completion-poster">
            <div class="confetti" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
            <div><span class="eyebrow" style="color:#d9eadf">Encanto Court came through</span><h2>Birthday setup complete.</h2></div>
            <div class="completion-poster__stats"><div class="completion-poster__stat"><strong>4</strong><span>things shared</span></div><div class="completion-poster__stat"><strong>4</strong><span>neighbors helped</span></div><div class="completion-poster__stat"><strong>0</strong><span>new purchases</span></div></div>
            <div class="completion-poster__thanks"><div><strong>Thanks, Janet, Carlos, Priya + Maria.</strong><div class="small" style="color:rgba(255,255,255,.7)">Names appear only with consent.</div></div><div class="avatar-stack">${avatar("janet")}${avatar("carlos")}${avatar("priya")}${avatar("maria")}</div></div>
          </article>
        </section>
        <aside class="stack stack--lg">
          <section class="card card__body--lg stack"><h2 style="font-size:1.55rem">Share the closing loop</h2><p class="muted">The group sees what was accomplished and that nothing else is needed.</p><button class="btn btn--primary btn--wide" data-action="share-completion">${icon("message")} Share thank-you in WhatsApp</button><button class="btn btn--secondary btn--wide" data-action="copy-completion">${icon("copy")} Copy message</button></section>
          <section class="card card--soft-green card__body"><h3>One optional learning question</h3><p class="small muted">Did this help you meet or speak with a neighbor you did not know before?</p><div class="button-row"><button class="btn btn--secondary btn--small" data-action="survey-yes">Yes</button><button class="btn btn--ghost btn--small" data-action="survey-no">Not this time</button></div></section>
          <button class="btn btn--ghost btn--wide" data-nav="/home">Back to home</button>
        </aside>
      </div>
    `);
  }

  function renderMine() {
    return shell(`
      <section class="page-heading"><div><p class="page-heading__eyebrow">Your activity</p><h1>Mine</h1><p>Your commitments, borrowed items, saved signals and history in one calm place.</p></div></section>
      <div class="desktop-grid">
        <section class="stack stack--lg">
          <div>
            <div class="section-heading"><h2>Borrowed now</h2><span class="status-pill status-pill--active">1 active</span></div>
            <article class="card ask-card" data-nav="/loan/ladder" tabindex="0" role="link"><div class="ask-card__top"><span class="choice-card__icon">${icon("ladder", "icon icon--lg")}</span><div class="grow"><div class="row row--between row--start"><div><h3>Janet’s six-foot ladder</h3><p class="ask-card__meta">Due ${state.extensionApproved ? "today at 3 PM" : "today at noon"}</p></div><span class="status-pill ${state.loanReturned ? "status-pill--covered" : "status-pill--open"}">${state.loanReturned ? "Returned" : "Due soon"}</span></div></div></div><div class="ask-card__footer"><span class="small strong">${state.loanReturned ? "Waiting for Janet to confirm" : "Porch return"}</span>${icon("arrowRight")}</div></article>
          </div>

          <div>
            <div class="section-heading"><h2>Your commitments</h2></div>
            <article class="card card__body"><div class="row row--between row--start"><div class="row row--start">${avatar("maria", "lg")}<div><span class="eyebrow">You offered help</span><h3>Bring one folding table</h3><p class="small muted" style="margin:0">Maria’s block party · Sunday at 2 PM</p></div></div><span class="status-pill status-pill--active">Upcoming</span></div><div class="divider"></div><button class="btn btn--secondary btn--wide">Open plan</button></article>
          </div>

          <div>
            <div class="section-heading"><h2>Recent history</h2></div>
            <div class="card card__body stack stack--sm">
              <div class="row row--between"><div><strong>DeWalt drill from Carlos</strong><div class="small muted">Returned July 11</div></div><span class="status-pill status-pill--covered">Complete</span></div><div class="divider"></div><div class="row row--between"><div><strong>Your large cooler to Priya</strong><div class="small muted">Returned June 28</div></div><span class="status-pill status-pill--covered">Complete</span></div>
            </div>
          </div>
        </section>
        <aside class="stack stack--lg">
          <section class="card card__body--lg"><span class="eyebrow">Private matching</span><h2 style="font-size:1.55rem">3 things you’re open to being asked about</h2><p class="muted">Broad hints—not a public inventory.</p><button class="btn btn--secondary btn--wide" data-nav="/hints">Manage willingness</button></section>
          <section class="card card__body"><h3>Saved items</h3><div class="stack stack--sm" style="margin-top:.75rem"><div class="row row--between"><div class="row"><span class="choice-card__icon" style="width:38px;height:38px">${icon("cooler")}</span><div><strong>Large cooler</strong><div class="tiny muted">Private matching only</div></div></div>${icon("arrowRight")}</div><div class="divider"></div><div class="row row--between"><div class="row"><span class="choice-card__icon" style="width:38px;height:38px">${icon("table")}</span><div><strong>Folding table</strong><div class="tiny muted">Happy to be asked</div></div></div>${icon("arrowRight")}</div></div></section>
        </aside>
      </div>
    `);
  }

  function renderHints() {
    const categories = [
      ["basic-tools", "Basic tools", "Drills, levels, stud finders", "wrench"],
      ["ladders", "Ladders", "Step and extension ladders", "ladder"],
      ["yard-equipment", "Yard equipment", "Wheelbarrows, trimmers, spreaders", "leaf"],
      ["party-gear", "Party gear", "Tables, coolers, canopies", "party"],
      ["camping", "Camping gear", "Tents, chairs, lanterns", "tent"],
      ["diy-guidance", "DIY guidance", "A little practical experience", "lightbulb"]
    ];
    return shell(`
      <section class="page-heading"><div><p class="page-heading__eyebrow">Private matching</p><h1>What are you comfortable being asked about?</h1><p>These are quiet signals—not claims that you own something or promises that you will say yes.</p></div></section>
      <div class="desktop-grid">
        <section class="stack stack--lg">
          <article class="card card__body--lg stack">
            <div class="row row--between row--start"><div><h2 style="font-size:1.55rem">Matching status</h2><p class="muted" style="margin:0">Pause without telling anyone why or implying you are away.</p></div><label class="toggle" aria-label="Quiet mode"><input id="quiet-toggle" type="checkbox" ${state.quietMode ? "checked" : ""}/><span class="toggle__track"></span></label></div>
            ${state.quietMode ? `<div class="notice notice--warning"><span class="notice__icon">${icon("pause")}</span><div><strong>Matching is paused.</strong><p>Your saved items and history remain private. Essential transaction reminders still arrive.</p></div></div>` : `<div class="notice notice--success"><span class="notice__icon">${icon("checkCircle")}</span><div><strong>Open to occasional private matches.</strong><p>Call On rotates and caps prompts so the same helpful people are not overused.</p></div></div>`}
          </article>

          <section>
            <div class="section-heading"><div><h2>Willingness categories</h2><p class="small muted" style="margin:0">Select any, or leave everything blank.</p></div></div>
            <div class="choice-grid choice-grid--three choice-grid--one-mobile">
              ${categories.map(([id, title, copy, iconName]) => `<button class="choice-card${state.hints.includes(id) ? " is-selected" : ""}" data-hint="${id}" aria-pressed="${state.hints.includes(id)}"><span class="choice-card__icon">${icon(iconName)}</span><span class="choice-card__title">${title}</span><span class="choice-card__copy">${copy}</span></button>`).join("")}
            </div>
          </section>

          <section class="card card__body--lg stack">
            <h2 style="font-size:1.55rem">What a private match looks like</h2>
            <div class="notice notice--info"><span class="notice__icon">${icon("eyeOff")}</span><div><strong>“Maria needs a folding table Saturday.”</strong><p>You selected party gear. No one will know if you skip, say no, or turn this category off.</p></div></div>
            <div class="button-row"><button class="btn btn--secondary btn--small">Yes, I may help</button><button class="btn btn--ghost btn--small">Not this time</button><button class="btn btn--ghost btn--small">I don’t have this</button></div>
          </section>
        </section>
        <aside class="stack stack--lg">
          <section class="card card--soft-green card__body"><h3>What is never shown publicly</h3><ul class="small muted" style="padding-left:1.2rem;margin-bottom:0"><li>Who declined a match</li><li>Your exact inventory</li><li>Replacement values</li><li>Quiet-mode reasons</li><li>A generosity score</li></ul></section>
          <button class="btn btn--primary btn--wide" data-action="save-hints">Save preferences</button>
        </aside>
      </div>
    `);
  }

  function renderIncident() {
    return shell(`
      <section class="page-heading"><div><p class="page-heading__eyebrow">Private issue report</p><h1>What went wrong?</h1><p>This will not become a public neighborhood post. Start with the clearest factual category.</p></div></section>
      <form id="incident-form" class="stack stack--lg">
        <section class="card card__body--lg stack">
          <label class="radio-row"><input type="radio" name="incidentType" value="late" checked /><span class="radio-row__copy"><strong>Late return</strong><span>The due time passed or communication stopped.</span></span></label>
          <label class="radio-row"><input type="radio" name="incidentType" value="missing" /><span class="radio-row__copy"><strong>Something is missing</strong><span>An accessory, part, charger or case did not come back.</span></span></label>
          <label class="radio-row"><input type="radio" name="incidentType" value="damage" /><span class="radio-row__copy"><strong>Item damage</strong><span>The condition changed during the loan.</span></span></label>
          <label class="radio-row"><input type="radio" name="incidentType" value="unsafe" /><span class="radio-row__copy"><strong>Unsafe item or undisclosed defect</strong><span>Pause the transaction and flag a safety concern.</span></span></label>
          <label class="radio-row"><input type="radio" name="incidentType" value="harassment" /><span class="radio-row__copy"><strong>Harassment or unwanted contact</strong><span>Restrict direct contact while support reviews.</span></span></label>
          <label class="radio-row"><input type="radio" name="incidentType" value="spam" /><span class="radio-row__copy"><strong>Spam or commercial solicitation</strong><span>The person turned the Ask into an unsolicited sales pitch.</span></span></label>
          <div class="field"><label class="field__label" for="incident-details">What happened?</label><textarea class="textarea" id="incident-details" name="details" placeholder="Stick to what happened, when, and what outcome you need." required></textarea><p class="field__hint">Evidence stays private and is shown only to assigned reviewers when escalation is necessary.</p></div>
          <button type="button" class="btn btn--secondary btn--wide" data-action="add-evidence">${icon("camera")} Add private photo or evidence</button>
        </section>
        <div class="notice notice--danger"><span class="notice__icon">${icon("alert")}</span><div><strong>Immediate danger?</strong><p>Call emergency services. Call On is not an emergency-response service.</p></div></div>
        <div class="sticky-action"><button type="submit" class="btn btn--danger">Send private report ${icon("flag")}</button></div>
      </form>
    `, { narrow: true });
  }

  function renderCircle() {
    return shell(`
      <section class="page-heading"><div><p class="page-heading__eyebrow">Your private circle</p><h1>Encanto Court Neighbors</h1><p>42 verified adults coordinating practical, bounded help.</p></div><button class="btn btn--secondary page-heading__action" data-action="copy-invite">${icon("link")} Invite a neighbor</button></section>
      <div class="desktop-grid">
        <section class="stack stack--lg">
          <article class="card card--green card__body--lg"><div class="row row--between row--start"><div><span class="attention-card__label">This month</span><h2 style="font-size:2rem;color:#fff;margin-top:.4rem">18 neighbor assists completed</h2><p style="color:rgba(255,255,255,.76);margin:0">11 physical items · 4 advice replies · 3 helping hands</p></div>${icon("users", "icon icon--lg")}</div></article>
          <section><div class="section-heading"><h2>Members</h2><button class="section-heading__link">View all 42</button></div><div class="card card__body stack stack--sm">${["janet","carlos","priya","maria","sam"].map(id => `<div class="row row--between"><div class="row">${avatar(id)}<div><strong>${PEOPLE[id].name}</strong><div class="tiny muted">${PEOPLE[id].context}</div></div></div><span class="status-pill status-pill--covered">Verified</span></div>`).join('<div class="divider"></div>')}</div></section>
          <section class="card card__body--lg"><div class="row row--between row--start"><div><span class="eyebrow">How this circle works</span><h2 style="font-size:1.55rem">Practical asks, private logistics.</h2><p class="muted">No general discussion feed, public disputes, contractor pitches or automatic access to your possessions.</p></div>${icon("shield", "icon icon--lg")}</div><button class="btn btn--secondary" data-nav="/circle/rules">Read circle rules</button></section>
        </section>
        <aside class="stack stack--lg">
          <section class="card card__body"><h3>Your membership</h3><p class="small muted">Active since April 2025 · member</p><button class="btn btn--secondary btn--wide" data-nav="/settings">Profile and notifications</button></section>
          <section class="card card--soft-green card__body"><h3>Start with a real need</h3><p class="small muted">The empty-state action is never “complete your profile.”</p><button class="btn btn--primary btn--wide" data-nav="/create">Make an Ask</button></section>
          <button class="btn btn--ghost btn--wide" data-nav="/admin">Open admin prototype</button>
        </aside>
      </div>
    `);
  }

  function renderRules() {
    return shell(`
      <section class="page-heading"><div><p class="page-heading__eyebrow">Encanto Court</p><h1>Circle rules and privacy</h1><p>Plain language first. Detailed platform terms remain available separately.</p></div></section>
      <div class="stack stack--lg">
        <section class="card card__body--lg stack"><div class="row row--start"><span class="choice-card__icon">${icon("hand")}</span><div><h2 style="font-size:1.45rem">Ask for concrete help</h2><p class="muted">Items, guidance, time, materials and event needs should have a clear outcome and expiry.</p></div></div><div class="divider"></div><div class="row row--start"><span class="choice-card__icon">${icon("eyeOff")}</span><div><h2 style="font-size:1.45rem">Keep declines and disputes private</h2><p class="muted">No one is required to lend. Problems go through the transaction—not into a public pile-on.</p></div></div><div class="divider"></div><div class="row row--start"><span class="choice-card__icon">${icon("shield")}</span><div><h2 style="font-size:1.45rem">Know the safety boundary</h2><p class="muted">No firearms, medical devices, high-risk machinery, hazardous chemicals, unlicensed electrical/gas work or emergency requests.</p></div></div></section>
        <section class="notice notice--info"><span class="notice__icon">${icon("lock")}</span><div><strong>Admin privacy boundary</strong><p>Circle administrators can manage membership and assigned reports. They cannot routinely browse private messages, exact pickup locations or match-only inventory.</p></div></section>
        <button class="btn btn--secondary" data-nav="/circle">${icon("arrowLeft")} Back to circle</button>
      </div>
    `, { narrow: true });
  }

  function renderSettings() {
    return shell(`
      <section class="page-heading"><div><p class="page-heading__eyebrow">Your account</p><h1>Profile and notifications</h1><p>Only collect what makes coordination work.</p></div></section>
      <div class="desktop-grid">
        <section class="stack stack--lg">
          <article class="card card__body--lg stack"><div class="row row--start">${avatar("bruce", "xl")}<div><h2 style="font-size:1.55rem">Bruce</h2><p class="muted" style="margin:0">Verified phone · Encanto Court member</p></div></div><div class="field"><label class="field__label" for="neighbor-context">Optional neighbor context</label><input class="input" id="neighbor-context" value="West side of Encanto Court" /><p class="field__hint">Do not enter an exact address here.</p></div><button class="btn btn--secondary">Save profile</button></article>
          <section class="card card__body--lg stack"><h2 style="font-size:1.55rem">Notification channels</h2><label class="toggle-row"><div class="grow"><strong>Transaction reminders</strong><div class="small muted">Accepted offers, pickup, due and return</div></div><label class="toggle"><input type="checkbox" checked /><span class="toggle__track"></span></label></label><label class="toggle-row"><div class="grow"><strong>Private matching prompts</strong><div class="small muted">Occasional, rotated and easy to pause</div></div><label class="toggle"><input type="checkbox" ${state.quietMode ? "" : "checked"}/><span class="toggle__track"></span></label></label><label class="toggle-row"><div class="grow"><strong>Circle digest</strong><div class="small muted">Optional unresolved-needs summary</div></div><label class="toggle"><input type="checkbox" /><span class="toggle__track"></span></label></label></section>
        </section>
        <aside class="stack stack--lg"><section class="card card__body"><h3>Verified contact</h3><p class="small muted">(786) •••-5315</p><button class="btn btn--secondary btn--wide">Change securely</button></section><section class="card card__body"><h3>Privacy controls</h3><div class="stack stack--sm"><button class="btn btn--secondary btn--wide" data-nav="/hints">Manage private matching</button><button class="btn btn--secondary btn--wide">Blocked members</button><button class="btn btn--ghost btn--wide">Export my data</button><button class="btn btn--subtle-danger btn--wide">Leave circle</button></div></section></aside>
      </div>
    `);
  }

  function renderAdmin() {
    const tab = state.adminTab;
    const adminNav = [
      ["overview", "Overview", "chart"],
      ["members", "Membership", "users"],
      ["reports", "Reports", "flag"],
      ["invites", "Invite links", "link"],
      ["audit", "Audit log", "archive"]
    ];
    let body = "";
    if (tab === "overview") {
      body = `<div class="metric-grid"><div class="metric"><span class="metric__value">18</span><span class="metric__label">Completed assists</span><span class="metric__trend">+7 vs. prior month</span></div><div class="metric"><span class="metric__value">82%</span><span class="metric__label">Asks receiving an offer</span><span class="metric__trend">Pilot target ≥70%</span></div><div class="metric"><span class="metric__value">14 min</span><span class="metric__label">Median first response</span><span class="metric__trend">Down 6 min</span></div><div class="metric"><span class="metric__value">0</span><span class="metric__label">Unresolved serious incidents</span><span class="metric__trend">Guardrail healthy</span></div></div><section class="card card__body--lg" style="margin-top:1rem"><div class="section-heading"><h2 style="font-size:1.45rem">Pilot health</h2><span class="status-pill status-pill--covered">Healthy</span></div><div class="stack"><div><div class="coverage-summary__line"><span>Ask liquidity</span><strong>82%</strong></div><div class="progress"><div class="progress__bar" style="width:82%"></div></div></div><div><div class="coverage-summary__line"><span>On-time return rate</span><strong>96%</strong></div><div class="progress"><div class="progress__bar" style="width:96%"></div></div></div><div><div class="coverage-summary__line"><span>Second-Ask rate</span><strong>38%</strong></div><div class="progress"><div class="progress__bar progress__bar--coral" style="width:38%"></div></div></div></div></section><div class="notice notice--info" style="margin-top:1rem"><span class="notice__icon">${icon("eyeOff")}</span><div><strong>Aggregate only.</strong><p>This dashboard does not expose private declines, detailed possessions, exact pickup locations or message content.</p></div></div>`;
    } else if (tab === "members") {
      body = `<section class="card card__body--lg"><div class="section-heading"><div><h2 style="font-size:1.45rem">Pending membership</h2><p class="small muted" style="margin:0">Only the minimum approval context.</p></div><span class="status-pill status-pill--open">2 pending</span></div><div class="stack"><article class="offer-card card card--flat"><div class="offer-card__headline"><span class="avatar avatar--gold avatar--lg">DL</span><div class="grow"><h3>Daniel</h3><p class="small muted" style="margin:0">Phone verified · invited by Janet · says “new owner on the north side”</p></div></div><div class="offer-card__actions"><button class="btn btn--primary">Approve</button><button class="btn btn--ghost">Reject</button></div></article><article class="offer-card card card--flat"><div class="offer-card__headline"><span class="avatar avatar--blue avatar--lg">AR</span><div class="grow"><h3>Ana</h3><p class="small muted" style="margin:0">Phone verified · invitation link · says “renter near clubhouse”</p></div></div><div class="offer-card__actions"><button class="btn btn--primary">Approve</button><button class="btn btn--ghost">Reject</button></div></article></div></section>`;
    } else if (tab === "reports") {
      body = `<section class="card card__body--lg"><div class="section-heading"><div><h2 style="font-size:1.45rem">Incident queue</h2><p class="small muted" style="margin:0">Access to evidence requires assignment and is logged.</p></div><span class="status-pill status-pill--open">1 open</span></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Incident</th><th>Category</th><th>Severity</th><th>Status</th><th>Access</th></tr></thead><tbody><tr><td><strong>#INC-014</strong><br><span class="tiny muted">Ladder loan · 34 min ago</span></td><td>Late return</td><td><span class="status-pill status-pill--neutral">Low</span></td><td>Waiting on borrower</td><td><button class="btn btn--secondary btn--small" data-action="assign-incident">Assign to me</button></td></tr></tbody></table></div></section><div class="notice notice--warning" style="margin-top:1rem"><span class="notice__icon">${icon("lock")}</span><div><strong>No routine private-message access.</strong><p>Once assigned, the moderator sees only evidence scoped to this incident and every access is audited.</p></div></div>`;
    } else if (tab === "invites") {
      body = `<section class="card card__body--lg stack"><div class="section-heading"><div><h2 style="font-size:1.45rem">Invite links</h2><p class="small muted" style="margin:0">Revocable, expiring and usage-limited.</p></div><button class="btn btn--primary btn--small">${icon("plus")} New link</button></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Link</th><th>Created</th><th>Uses</th><th>Expires</th><th></th></tr></thead><tbody><tr><td><strong>HOA WhatsApp pilot</strong><br><span class="tiny muted">callon.local/join/encanto-a7f2</span></td><td>Jul 20</td><td>17 / 30</td><td>Aug 15</td><td><button class="btn btn--subtle-danger btn--small">Revoke</button></td></tr><tr><td><strong>Janet’s neighbor invite</strong><br><span class="tiny muted">callon.local/join/encanto-c4d9</span></td><td>Jul 23</td><td>1 / 3</td><td>Jul 30</td><td><button class="btn btn--subtle-danger btn--small">Revoke</button></td></tr></tbody></table></div></section>`;
    } else {
      body = `<section class="card card__body--lg"><div class="section-heading"><div><h2 style="font-size:1.45rem">Audit summary</h2><p class="small muted" style="margin:0">Sensitive actions, not every ordinary tap.</p></div><button class="btn btn--secondary btn--small">${icon("download")} Export</button></div><div class="data-table-wrap"><table class="data-table"><thead><tr><th>Time</th><th>Actor</th><th>Action</th><th>Scope</th></tr></thead><tbody><tr><td>8:02 PM</td><td>Marianne (admin)</td><td>Approved member</td><td>Daniel · membership only</td></tr><tr><td>7:48 PM</td><td>System</td><td>Blocked prohibited Ask</td><td>Hazardous equipment rule</td></tr><tr><td>6:31 PM</td><td>Chris (moderator)</td><td>Closed incident</td><td>#INC-013 · assigned evidence</td></tr></tbody></table></div></section>`;
    }
    return shell(`
      <section class="page-heading"><div><p class="page-heading__eyebrow">Admin prototype · Encanto Court</p><h1>Pilot console</h1><p>Membership, safety and aggregate health without turning neighborhood sharing into surveillance.</p></div></section>
      <div class="desktop-grid desktop-grid--admin">
        <aside class="card card__body" style="position:sticky;top:84px"><nav class="stack stack--xs" aria-label="Admin sections">${adminNav.map(([id, label, iconName]) => `<button class="btn ${tab === id ? "btn--primary" : "btn--ghost"} btn--wide" style="justify-content:flex-start" data-admin-tab="${id}">${icon(iconName)} ${label}</button>`).join("")}</nav></aside>
        <section>${body}</section>
      </div>
    `, { wide: true });
  }

  function renderNotFound() {
    return shell(`<section class="empty-state card"><div class="empty-state__icon">${icon("mapPin", "icon icon--lg")}</div><h2>This prototype screen is not mapped yet.</h2><p>Use the prototype map to jump into a complete core flow.</p><button class="btn btn--primary" data-nav="/home">Back home</button></section>`, { narrow: true });
  }

  function render() {
    const app = document.getElementById("app");
    if (!app) return;
    const { path } = routeInfo();
    let markup;

    if (path === "/home" || path === "/") markup = renderHome();
    else if (path === "/asks") markup = renderAsks();
    else if (path === "/create") markup = renderCreate();
    else if (path === "/draft") markup = renderDraft();
    else if (path === "/share") markup = renderShare();
    else if (path.startsWith("/ask/")) markup = renderSharedAsk(path.split("/")[2] || "ladder");
    else if (path.startsWith("/contribute/")) markup = renderContribute(path.split("/")[2] || "ladder");
    else if (path.startsWith("/offer-details/")) markup = renderOfferDetails(path.split("/")[2] || "ladder");
    else if (path.startsWith("/verify/")) markup = renderVerify(path.split("/")[2] || "ladder");
    else if (path.startsWith("/offer-sent/")) markup = renderOfferSent(path.split("/")[2] || "ladder");
    else if (path.startsWith("/status/")) markup = renderStatus(path.split("/")[2] || "birthday");
    else if (path === "/owner/offers") markup = renderOfferInbox();
    else if (path.startsWith("/plan/")) markup = renderPlan();
    else if (path.startsWith("/messages/")) markup = renderMessages();
    else if (path.startsWith("/handoff/")) markup = renderHandoff();
    else if (path.startsWith("/loan/")) markup = renderLoan();
    else if (path.startsWith("/extension/")) markup = renderExtension();
    else if (path.startsWith("/return/")) markup = renderReturn();
    else if (path === "/save-resource") markup = renderSaveResource();
    else if (path === "/complete") markup = renderComplete();
    else if (path === "/mine") markup = renderMine();
    else if (path === "/hints") markup = renderHints();
    else if (path === "/incident") markup = renderIncident();
    else if (path === "/circle") markup = renderCircle();
    else if (path === "/circle/rules") markup = renderRules();
    else if (path === "/settings") markup = renderSettings();
    else if (path === "/admin") markup = renderAdmin();
    else markup = renderNotFound();

    app.innerHTML = markup;
    document.title = titleForPath(path);
    requestAnimationFrame(() => {
      const main = document.getElementById("app-main");
      if (main && window.__routeChanged) main.focus({ preventScroll: true });
      window.__routeChanged = false;
      if (path.startsWith("/messages/")) {
        const thread = document.getElementById("message-thread");
        if (thread) thread.scrollTop = thread.scrollHeight;
      }
    });
  }

  function titleForPath(path) {
    if (path.startsWith("/ask/")) return "Can you help? · Call On";
    if (path === "/create") return "Make an Ask · Call On";
    if (path === "/draft") return "Review your Ask · Call On";
    if (path === "/share") return "Share your Ask · Call On";
    if (path.startsWith("/loan/")) return "Your loan · Call On";
    if (path === "/admin") return "Pilot console · Call On";
    return "Call On — Neighbor sharing prototype";
  }

  function setSample(text) {
    state.draftInput = text;
    state.draft = null;
    persist();
    const input = document.getElementById("ask-input");
    if (input) {
      input.value = text;
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }

  function copyText(text, successMessage) {
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(() => showToast(successMessage, "success")).catch(() => fallbackCopy(text, successMessage));
    } else {
      fallbackCopy(text, successMessage);
    }
  }

  function fallbackCopy(text, successMessage) {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    try { document.execCommand("copy"); showToast(successMessage, "success"); }
    catch { showToast("Copy the link from the address bar", "warning"); }
    textarea.remove();
  }

  function shareAsk(kind = "ask") {
    const draft = state.draft || inferDraft(state.draftInput);
    const url = `${location.origin}${location.pathname}#/ask/${kind === "completion" ? "birthday" : "birthday"}?visitor=1`;
    const text = kind === "completion"
      ? "Birthday setup complete — four neighbors contributed four things, and nothing else is needed. Thank you, Encanto Court!"
      : `${draft.title} — ${draft.date}. We still need ${draft.needs.map(n => `${n.quantity} ${n.title.toLowerCase()}`).join(", ")}. Tap if you can help: ${url}`;
    if (navigator.share) {
      navigator.share({ title: kind === "completion" ? "Encanto Court came through" : draft.title, text, url }).catch(() => {});
    } else {
      copyText(text, "Share message copied");
    }
  }

  function updateDraftFromForm(form) {
    const draft = state.draft || inferDraft(state.draftInput);
    draft.title = form.elements.title?.value.trim() || draft.title;
    draft.date = form.elements.date?.value.trim() || draft.date;
    draft.time = form.elements.time?.value.trim() || draft.time;
    draft.context = form.elements.context?.value.trim() || draft.context;
    draft.needs = draft.needs.map(need => {
      const input = document.querySelector(`[data-need-title="${need.id}"]`);
      return { ...need, title: input?.value.trim() || need.title };
    });
    state.draft = draft;
    persist();
  }

  document.addEventListener("click", (event) => {
    const navTarget = event.target.closest("[data-nav]");
    if (navTarget) {
      event.preventDefault();
      window.__routeChanged = true;
      state.openPrototypeMenu = false;
      persist();
      navigate(navTarget.dataset.nav);
      return;
    }

    const sample = event.target.closest("[data-sample]");
    if (sample) { setSample(sample.dataset.sample); return; }

    const contribution = event.target.closest("[data-contribution]");
    if (contribution) { update({ selectedContribution: contribution.dataset.contribution }); return; }

    const handoff = event.target.closest("[data-handoff]");
    if (handoff) { update({ handoffMethod: handoff.dataset.handoff }); return; }

    const saveChoice = event.target.closest("[data-save-choice]");
    if (saveChoice) { update({ savedResourceChoice: saveChoice.dataset.saveChoice }); return; }

    const hint = event.target.closest("[data-hint]");
    if (hint) {
      const id = hint.dataset.hint;
      const next = state.hints.includes(id) ? state.hints.filter(item => item !== id) : [...state.hints, id];
      update({ hints: next });
      return;
    }

    const adminTab = event.target.closest("[data-admin-tab]");
    if (adminTab) { update({ adminTab: adminTab.dataset.adminTab }); return; }

    const removeNeed = event.target.closest("[data-remove-need]");
    if (removeNeed) {
      const draft = state.draft || inferDraft(state.draftInput);
      if (draft.needs.length <= 1) { showToast("An Ask needs at least one need", "warning"); return; }
      draft.needs = draft.needs.filter(need => need.id !== removeNeed.dataset.removeNeed);
      update({ draft });
      return;
    }

    const quantity = event.target.closest("[data-quantity]");
    if (quantity) {
      const draft = state.draft || inferDraft(state.draftInput);
      draft.needs = draft.needs.map(need => {
        if (need.id !== quantity.dataset.needId) return need;
        const delta = quantity.dataset.quantity === "increase" ? 1 : -1;
        return { ...need, quantity: Math.max(1, Math.min(20, need.quantity + delta)) };
      });
      update({ draft });
      return;
    }

    const action = event.target.closest("[data-action]");
    if (!action) return;
    const name = action.dataset.action;

    if (name === "toggle-prototype-menu") update({ openPrototypeMenu: !state.openPrototypeMenu });
    else if (name === "close-prototype-menu") update({ openPrototypeMenu: false });
    else if (name === "reset-prototype") resetState();
    else if (name === "manual-draft") {
      const input = document.getElementById("ask-input");
      const value = input?.value.trim() || state.draftInput;
      state.draftInput = value;
      state.draft = inferDraft(value);
      persist();
      navigate("/draft");
    }
    else if (name === "add-need") {
      const draft = state.draft || inferDraft(state.draftInput);
      const id = `need-${Date.now()}`;
      draft.needs.push({ id, title: "Another need", quantity: 1, category: "item", icon: "package", risk: "Low" });
      update({ draft });
    }
    else if (name === "accept-janet") {
      update({ offerAccepted: true, persona: "bruce" }, false);
      showToast("Janet’s offer accepted", "success");
      setTimeout(() => navigate("/plan/ladder"), 450);
    }
    else if (name === "message-janet") navigate("/messages/ladder");
    else if (name === "decline-offer") showToast("Private thank-you sent", "success");
    else if (name === "condition-photo") showToast("Photo attached for this prototype", "success");
    else if (name === "simulate-owner-confirm") {
      update({ returnConfirmed: true }, false);
      showToast("Janet confirmed the return", "success");
      setTimeout(render, 300);
    }
    else if (name === "save-resource") {
      showToast(state.savedResourceChoice === "match" ? "Saved for private matching" : "Preference saved", "success");
      setTimeout(() => navigate("/complete"), 400);
    }
    else if (name === "save-hints") showToast("Private matching preferences saved", "success");
    else if (name === "share-whatsapp" || name === "share-outstanding") shareAsk("ask");
    else if (name === "copy-ask-link") copyText(`${location.origin}${location.pathname}#/ask/birthday?visitor=1`, "Ask link copied");
    else if (name === "share-completion") shareAsk("completion");
    else if (name === "copy-completion") copyText("Birthday setup complete. Four neighbors contributed four things, and nothing else is needed. Thank you, Encanto Court!", "Thank-you message copied");
    else if (name === "survey-yes") showToast("Noted: you met or spoke with someone new", "success");
    else if (name === "survey-no") showToast("Thanks — no extra survey", "success");
    else if (name === "show-how") showToast("WhatsApp gets attention; Call On tracks needs, private plans and returns.", "success");
    else if (name === "copy-invite") copyText("https://callon.local/join/encanto-a7f2", "Invite link copied");
    else if (name === "add-evidence") showToast("Private evidence attachment simulated", "success");
    else if (name === "assign-incident") showToast("Incident assigned; evidence access logged", "success");
  });

  document.addEventListener("change", (event) => {
    if (event.target.id === "quiet-toggle") update({ quietMode: event.target.checked });
  });

  document.addEventListener("submit", (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    event.preventDefault();

    if (form.id === "create-ask-form") {
      const value = form.elements.ask.value.trim();
      if (!value) { showToast("Describe what you need first", "warning"); return; }
      state.draftInput = value;
      state.draft = inferDraft(value);
      persist();
      navigate("/draft");
    }
    else if (form.id === "draft-review-form") {
      updateDraftFromForm(form);
      navigate("/share");
    }
    else if (form.id === "offer-details-form") {
      const askId = form.dataset.askId || "ladder";
      navigate(`/verify/${askId}`);
    }
    else if (form.id === "verify-form") {
      const askId = form.dataset.askId || "ladder";
      if (!state.verificationSent) {
        update({ verificationSent: true });
        showToast("Verification code sent", "success");
      } else {
        const otp = form.elements.otp?.value || "";
        if (otp.length !== 6) { showToast("Enter the six-digit code", "warning"); return; }
        state.verified = true;
        state.offerSubmitted = true;
        state.persona = "janet";
        persist();
        navigate(`/offer-sent/${askId}`);
      }
    }
    else if (form.id === "message-form") {
      const value = form.elements.message.value.trim();
      if (!value) return;
      state.messages.push({ id: Date.now(), from: "bruce", text: value, time: "Now" });
      persist();
      render();
    }
    else if (form.id === "handoff-form") {
      state.handoffConfirmed = true;
      persist();
      showToast("Handoff confirmed", "success");
      navigate("/loan/ladder");
    }
    else if (form.id === "extension-form") {
      state.extensionRequested = true;
      state.extensionApproved = true;
      persist();
      showToast("Janet approved 3:00 PM", "success");
      navigate("/loan/ladder");
    }
    else if (form.id === "return-form") {
      const returnState = new FormData(form).get("returnState");
      if (returnState === "issue") { navigate("/incident"); return; }
      state.loanReturned = true;
      persist();
      showToast("Marked returned; Janet will confirm", "success");
      navigate("/loan/ladder");
    }
    else if (form.id === "incident-form") {
      showToast("Private report received", "success");
      setTimeout(() => navigate("/loan/ladder"), 650);
    }
  });

  document.addEventListener("keydown", (event) => {
    if ((event.key === "Enter" || event.key === " ") && event.target.matches('[role="link"][data-nav]')) {
      event.preventDefault();
      navigate(event.target.dataset.nav);
    }
  });

  window.addEventListener("hashchange", () => {
    window.__routeChanged = true;
    render();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  if (!("structuredClone" in window)) {
    window.structuredClone = value => JSON.parse(JSON.stringify(value));
  }

  render();
})();
