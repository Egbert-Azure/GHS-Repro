// The site's own newsletter: subscribers live in Netlify Blobs (store "newsletter"),
// mail goes out through Resend. Every function in netlify/functions/newsletter-*.mjs
// is a thin wrapper around the code here, so it can be tested without Netlify.
//
// This file is the same on every site. Address, name, colours and wording come
// from newsletter-site.mjs.
//
// Store layout
//   sub/<sha256 of email>  {email, status: "pending"|"active", token, created, confirmed, source, movedNotice}
//   token/<token>          <sha256 of email>   (one token per subscriber: confirm and unsubscribe)
//   state/sent             {urls: [...], since}  (pages already announced)
//   state/day/<yyyy-mm-dd> number of confirmation emails sent that day (abuse limit)
import site from "./newsletter-site.mjs";

export const SITE = site.site;
export const NAME = site.name;
const T = site.text;
const C = site.colors;
const DAILY_CONFIRMATIONS = 25;      // confirmation emails per day, all addresses together
const RESEND_PENDING_AFTER = 24 * 3600 * 1000;
const REMEMBER_URLS = 5000;          // announced pages remembered (must exceed what newsletter.json lists)

export const normEmail = (value) => String(value || "").trim().toLowerCase();
export const validEmail = (email) =>
  email.length <= 254 && /^[^\s@<>()",;:\\]+@[^\s@<>()",;:\\]+\.[a-z]{2,}$/i.test(email);

export async function hashEmail(email) {
  const data = new TextEncoder().encode(normEmail(email));
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export const newToken = () =>
  (crypto.randomUUID() + crypto.randomUUID()).replace(/-/g, "").slice(0, 40);

export const validToken = (token) => /^[a-f0-9]{40}$/.test(String(token || ""));

export const sameSecret = (a, b) => {
  a = String(a || ""); b = String(b || "");
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
};

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const today = (now) => new Date(now).toISOString().slice(0, 10);

// A link in the site's accent colour, for the texts in newsletter-site.mjs.
const a = (href, label) => `<a href="${esc(href)}" style="color:${C.accent};">${esc(label)}</a>`;

// The plain-text version of a line of HTML: links become "label: address".
const plain = (html) => String(html)
  .replace(/<br\s*\/?>/g, "\n")
  .replace(/<a href="([^"]+)"[^>]*>([^<]+)<\/a>/g, "$2: $1")
  .replace(/<[^>]+>/g, "")
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");

/* ---------- Subscribers ---------- */

export async function getSubscriber(store, email) {
  return store.get(`sub/${await hashEmail(email)}`, { type: "json" });
}

async function saveSubscriber(store, record) {
  const key = await hashEmail(record.email);
  await store.setJSON(`sub/${key}`, record);
  await store.set(`token/${record.token}`, key);
}

async function byToken(store, token) {
  if (!validToken(token)) return null;
  const key = await store.get(`token/${token}`);
  if (!key) return null;
  const record = await store.get(`sub/${key}`, { type: "json" });
  return record ? { key, record } : null;
}

export async function allSubscribers(store) {
  const { blobs } = await store.list({ prefix: "sub/" });
  const out = [];
  for (const { key } of blobs) {
    const record = await store.get(key, { type: "json" });
    if (record) out.push(record);
  }
  return out;
}

export async function removeSubscriber(store, email) {
  const key = await hashEmail(email);
  const record = await store.get(`sub/${key}`, { type: "json" });
  if (!record) return false;
  await store.delete(`sub/${key}`);
  if (record.token) await store.delete(`token/${record.token}`);
  return true;
}

/* ---------- Mail ---------- */

export function unsubscribeLinks(token) {
  return {
    page: `${SITE}/newsletter/unsubscribe/?t=${token}`,
    oneClick: `${SITE}/api/unsubscribe?t=${token}`,
  };
}

function frame({ heading, bodyHtml, footerHtml }) {
  // The charset is declared here too, not only in the mail header, so umlauts survive
  // forwarding and "view in browser".
  return `<!doctype html><html lang="${esc(site.lang || "en")}"><head><meta http-equiv="Content-Type" content="text/html; charset=utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${esc(heading)}</title></head><body style="margin:0;padding:0;background:${C.page};">
<div style="max-width:560px;margin:0 auto;padding:28px 20px;font-family:Georgia,'Times New Roman',serif;color:${C.text};font-size:16px;line-height:1.55;">
<p style="margin:0 0 20px;font-family:Arial,sans-serif;font-weight:700;font-size:14px;letter-spacing:0.04em;text-transform:uppercase;color:${C.accent};">${esc(NAME)}</p>
<h1 style="margin:0 0 16px;font-family:Arial,sans-serif;font-size:22px;line-height:1.3;">${esc(heading)}</h1>
${bodyHtml}
<hr style="border:0;border-top:1px solid ${C.rule};margin:28px 0 16px;">
<p style="margin:0;font-size:13px;color:${C.muted};">${footerHtml}</p>
</div></body></html>`;
}

const button = (href, label) =>
  `<p style="margin:20px 0;"><a href="${esc(href)}" style="display:inline-block;background:${C.button};color:#ffffff;text-decoration:none;font-family:Arial,sans-serif;font-weight:700;padding:11px 18px;border-radius:4px;">${esc(label)}</a></p>`;

const para = (html, extra = "") => `<p style="margin:0 0 12px;${extra}">${html}</p>`;

const subscriberFooter = (token) => {
  const unsubscribeUrl = unsubscribeLinks(token).page;
  return { html: T.subscriberFooter({ a, unsubscribeUrl }), text: T.subscriberFooterText({ unsubscribeUrl }) };
};

function withListHeaders(mail, token) {
  const { oneClick } = unsubscribeLinks(token);
  return {
    ...mail,
    headers: { "List-Unsubscribe": `<${oneClick}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" },
  };
}

export function confirmationMail(record) {
  const link = `${SITE}/newsletter/confirm/?t=${record.token}`;
  const t = T.confirm;
  return {
    to: record.email,
    subject: t.subject,
    html: frame({
      heading: t.heading,
      bodyHtml: para(esc(t.intro)) + button(link, t.button) + para(esc(t.ignore), `font-size:14px;color:${C.muted};`),
      footerHtml: t.footer({ a }),
    }),
    text: `${t.intro}\n\n${t.button}:\n${link}\n\n${t.ignore}`,
  };
}

// Newest first, so the newest posts are never the ones cut off.
const newestFirst = (items) => [...items].sort((x, y) => Date.parse(y.date) - Date.parse(x.date));

function itemBlocks(items, { now, withTitle = items.length > 1, label = (item) => T.label(item, now) } = {}) {
  const picture = (item) => item.image
    ? `<a href="${esc(item.url)}"><img src="${esc(item.image)}" width="520" alt="" style="display:block;width:100%;max-width:520px;height:auto;border:0;border-radius:6px;margin:8px 0 14px;"></a>`
    : "";
  return items.map((item) => `${picture(item)}
<p style="margin:20px 0 4px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:0.05em;text-transform:uppercase;color:${C.accent};">${esc(label(item))}</p>
${withTitle ? `<p style="margin:0 0 6px;font-family:Arial,sans-serif;font-weight:700;font-size:18px;">${esc(item.title)}</p>` : ""}
<p style="margin:0;">${esc(item.description)}</p>
${button(item.url, T.readButton)}`).join("");
}

export function updateMail(record, items, now = Date.now()) {
  items = newestFirst(items);
  const max = site.maxItemsPerMail || items.length;
  const shown = items.slice(0, max);
  const rest = items.length - shown.length;
  const subject = items.length === 1 ? items[0].title : T.subjectMany(items.length);
  const heading = items.length === 1 ? items[0].title : T.headingMany;
  const more = rest ? para(esc(T.more(rest)), "margin-top:24px;") + button(site.moreUrl, T.moreButton) : "";
  const footer = subscriberFooter(record.token);
  const text = shown.map((item) => `${T.label(item, now)}: ${item.title}\n${item.description}\n${item.url}`).join("\n\n") +
    (rest ? `\n\n${T.more(rest)}\n${site.moreUrl}` : "");
  return withListHeaders({
    to: record.email,
    subject,
    html: frame({ heading, bodyHtml: itemBlocks(shown, { now }) + more, footerHtml: footer.html }),
    text: `${text}\n\n--\n${footer.text}`,
  }, record.token);
}

// The "newsletter has moved" note, with the latest post below it.
export function movedMail(record, latest = []) {
  const t = T.moved;
  const footer = subscriberFooter(record.token);
  const body = t.paragraphs({ a, detailsUrl: t.detailsUrl });
  return withListHeaders({
    to: record.email,
    subject: t.subject,
    html: frame({
      heading: t.heading,
      bodyHtml: body.map((p) => para(p)).join("") +
        (latest.length
          ? `<hr style="border:0;border-top:1px solid ${C.rule};margin:24px 0 4px;">${itemBlocks(latest, { withTitle: true, label: () => t.latestLabel })}`
          : button(`${SITE}/`, t.visitButton)),
      footerHtml: footer.html,
    }),
    text: `${body.map(plain).join("\n\n")}\n\n` +
      (latest.length ? latest.map((i) => `${t.latestLabel}: ${i.title}\n${i.description}\n${i.url}`).join("\n\n") : `${SITE}/`) +
      `\n\n--\n${footer.text}`,
  }, record.token);
}

// Resend: one call per email, or a batch of up to 100 different emails.
export function resendSender({ apiKey, from, replyTo, fetchImpl = fetch }) {
  const shape = (mail) => ({
    from, to: [mail.to], subject: mail.subject, html: mail.html, text: mail.text,
    ...(replyTo ? { reply_to: replyTo } : {}),
    ...(mail.headers ? { headers: mail.headers } : {}),
  });
  const post = async (path, body) => {
    const response = await fetchImpl(`https://api.resend.com${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (!response.ok) throw new Error(`Resend ${path} answered ${response.status}: ${(await response.text()).slice(0, 300)}`);
    return response.json();
  };
  return {
    one: (mail) => post("/emails", shape(mail)),
    batch: async (mails) => {
      for (let i = 0; i < mails.length; i += 100) await post("/emails/batch", mails.slice(i, i + 100).map(shape));
    },
  };
}

/* ---------- Flows ---------- */

// Returns where to send the visitor: a state for /newsletter/?state=...
export async function subscribe({ store, send, email, honeypot, now = Date.now() }) {
  if (honeypot) return "check-your-inbox";            // a bot filled the hidden field
  email = normEmail(email);
  if (!validEmail(email)) return "error-email";
  const existing = await getSubscriber(store, email);
  if (existing?.status === "active") return "check-your-inbox";   // don't reveal who is subscribed
  if (existing?.status === "pending" && now - Date.parse(existing.created) < RESEND_PENDING_AFTER) return "check-your-inbox";
  const dayKey = `state/day/${today(now)}`;
  const sentToday = Number(await store.get(dayKey)) || 0;
  if (sentToday >= DAILY_CONFIRMATIONS) return "error-busy";
  const record = existing || { email, status: "pending", token: newToken(), source: "site" };
  record.created = new Date(now).toISOString();
  await saveSubscriber(store, record);
  await store.set(dayKey, String(sentToday + 1));
  await send.one(confirmationMail(record));
  return "check-your-inbox";
}

export async function confirm({ store, token, now = Date.now() }) {
  const found = await byToken(store, token);
  if (!found) return "error-link";
  if (found.record.status !== "active") {
    found.record.status = "active";
    found.record.confirmed = new Date(now).toISOString();
    await store.setJSON(`sub/${found.key}`, found.record);
  }
  return "welcome";
}

export async function unsubscribe({ store, token }) {
  const found = await byToken(store, token);
  if (!found) return "unsubscribed";       // already gone: same answer
  await store.delete(`sub/${found.key}`);
  await store.delete(`token/${token}`);
  return "unsubscribed";
}

// Everything newsletter.json lists, whatever the groups are called (posts, puzzles, ...).
export const feedItems = (feed) =>
  Object.values(feed || {}).filter(Array.isArray).flat()
    .filter((item) => item && item.url && item.title && item.date);

// Announce new pages. The first run only remembers what is already on the site,
// so nothing that was there before is ever mailed out.
export async function announce({ store, send, feed, now = Date.now(), dryRun = false }) {
  const items = feedItems(feed).sort((x, y) => Date.parse(x.date) - Date.parse(y.date));
  const state = await store.get("state/sent", { type: "json" });
  if (!state) {
    await store.setJSON("state/sent", { urls: items.map((i) => i.url), since: new Date(now).toISOString() });
    return { initialized: true, sent: 0, items: [] };
  }
  const known = new Set(state.urls);
  const days = site.announceWithinDays;
  const fresh = items.filter((item) => !known.has(item.url) && (days == null || now - Date.parse(item.date) < days * 864e5));
  if (!fresh.length) return { sent: 0, items: [] };
  const readers = (await allSubscribers(store)).filter((r) => r.status === "active");
  if (!dryRun) {
    if (readers.length) await send.batch(readers.map((r) => updateMail(r, fresh, now)));
    state.urls = [...new Set([...state.urls, ...fresh.map((i) => i.url)])].slice(-REMEMBER_URLS);
    await store.setJSON("state/sent", state);
  }
  return { sent: dryRun ? 0 : readers.length, readers: readers.length, items: fresh.map((i) => i.title) };
}

// Import follow.it's CSV export (or one address per line). Imported readers count as
// confirmed: they confirmed with follow.it. Nobody is emailed here.
export async function importList({ store, csv, exclude = [], now = Date.now() }) {
  const skip = new Set(exclude.map(normEmail));
  const lines = String(csv || "").split(/\r?\n/).filter((l) => l.trim());
  const rows = [];
  if (lines.length && /email/i.test(lines[0]) && lines[0].includes(",")) {
    const head = parseCsvLine(lines[0]);
    const col = (name) => head.findIndex((h) => h.toLowerCase() === name.toLowerCase());
    const iEmail = head.findIndex((h) => /email/i.test(h));
    const iStatus = col("User status"), iConfirmed = col("Confirmed?");
    for (const line of lines.slice(1)) {
      const cells = parseCsvLine(line);
      rows.push({
        email: cells[iEmail],
        ok: (iStatus < 0 || cells[iStatus] === "Active") && (iConfirmed < 0 || cells[iConfirmed] === "yes"),
      });
    }
  } else {
    for (const line of lines) rows.push({ email: line, ok: true });
  }
  const result = { imported: 0, already: 0, skipped: 0, invalid: 0 };
  for (const row of rows) {
    const email = normEmail(row.email);
    if (!row.ok || skip.has(email)) { result.skipped++; continue; }
    if (!validEmail(email)) { result.invalid++; continue; }
    const existing = await getSubscriber(store, email);
    if (existing?.status === "active") { result.already++; continue; }
    await saveSubscriber(store, {
      email, status: "active", token: existing?.token || newToken(), source: "follow.it",
      created: new Date(now).toISOString(), confirmed: new Date(now).toISOString(),
    });
    result.imported++;
  }
  return result;
}

// One-time note to readers imported from follow.it. Each reader gets it only once.
export async function sendMovedNotice({ store, send, latest = [], now = Date.now() }) {
  const readers = (await allSubscribers(store)).filter((r) => r.status === "active" && r.source === "follow.it" && !r.movedNotice);
  if (!readers.length) return { sent: 0 };
  await send.batch(readers.map((r) => movedMail(r, latest)));
  for (const record of readers) {
    record.movedNotice = new Date(now).toISOString();
    await store.setJSON(`sub/${await hashEmail(record.email)}`, record);
  }
  return { sent: readers.length };
}

export function parseCsvLine(line) {
  const out = []; let cell = ""; let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (quoted) {
      if (c === '"' && line[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { out.push(cell); cell = ""; }
    else cell += c;
  }
  out.push(cell);
  return out.map((s) => s.trim());
}

export async function fetchFeed(fetchImpl = fetch) {
  const response = await fetchImpl(`${SITE}/newsletter.json?ts=${Date.now()}`, { headers: { "Cache-Control": "no-cache" } });
  if (!response.ok) throw new Error(`newsletter.json answered ${response.status}`);
  return response.json();
}
