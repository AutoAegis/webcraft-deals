// AutoCode static-site shared runtime
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export const SUPABASE_URL = "https://jdgjynxsrcditgyhydcv.supabase.co";
export const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpkZ2p5bnhzcmNkaXRneWh5ZGN2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgxODIxMTQsImV4cCI6MjA5Mzc1ODExNH0.yJ0gGt0zrOZZfsB3LcCxzwcTeocfKJCckAWTT4WxPqU";
export const ADMIN_EMAIL = "autocode.business@gmail.com";

export const sb = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { storage: localStorage, persistSession: true, autoRefreshToken: true },
});

/* ---------- Toasts ---------- */
let toastHost;
function ensureToastHost() {
  if (!toastHost) {
    toastHost = document.createElement("div");
    toastHost.id = "toast-host";
    document.body.appendChild(toastHost);
  }
  return toastHost;
}
export function toast(msg, kind = "") {
  const host = ensureToastHost();
  const el = document.createElement("div");
  el.className = "toast " + kind;
  el.textContent = msg;
  host.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}
export const ok = (m) => toast(m, "ok");
export const err = (m) => toast(m, "err");

/* ---------- HTML escape ---------- */
export const esc = (s) =>
  String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

/* ---------- Auth state ---------- */
let _user = null;
let _isAdmin = false;
const _listeners = new Set();
export function onAuthChange(fn) { _listeners.add(fn); fn({ user: _user, isAdmin: _isAdmin }); return () => _listeners.delete(fn); }
function emit() { _listeners.forEach((f) => f({ user: _user, isAdmin: _isAdmin })); }

async function refreshAdmin() {
  if (!_user) { _isAdmin = false; return; }
  const { data } = await sb.from("user_roles").select("role").eq("user_id", _user.id).eq("role", "admin").maybeSingle();
  _isAdmin = !!data;
}

(async () => {
  const { data } = await sb.auth.getSession();
  _user = data.session?.user ?? null;
  await refreshAdmin();
  emit();
  sb.auth.onAuthStateChange(async (_e, sess) => {
    _user = sess?.user ?? null;
    await refreshAdmin();
    emit();
  });
})();

export function getAuth() { return { user: _user, isAdmin: _isAdmin }; }

/* ---------- Nav ---------- */
export function renderNav(active = "") {
  const root = document.getElementById("nav-root");
  if (!root) return;
  function paint() {
    const { user, isAdmin } = getAuth();
    const link = (href, label, key) =>
      `<a href="${href}"${active === key ? ' class="active"' : ""}>${label}</a>`;
    root.innerHTML = `
      <nav class="nav">
        <div class="nav-inner">
          <a class="brand" href="index.html"><span class="brand-mark"></span> AUTOCODE</a>
          <div class="nav-links">
            ${link("index.html", "Home", "home")}
            ${link("portfolio.html", "Portfolio", "portfolio")}
            ${link("announcements.html", "News", "news")}
          </div>
          <div style="display:flex;gap:.5rem;align-items:center">
            ${user
              ? `${isAdmin ? '<span class="font-mono uppercase" style="font-size:.7rem;color:var(--primary)">Admin</span>' : ""}
                 <button class="btn btn-outline btn-sm" id="signout-btn">Sign out</button>`
              : `<a class="btn btn-hero btn-sm" href="auth.html">Sign in</a>`}
          </div>
        </div>
      </nav>`;
    const sob = document.getElementById("signout-btn");
    if (sob) sob.onclick = async () => { await sb.auth.signOut(); ok("Signed out."); location.href = "index.html"; };
  }
  paint();
  onAuthChange(paint);
}

/* ---------- Footer ---------- */
export function renderFooter() {
  const root = document.getElementById("footer-root");
  if (!root) return;
  root.innerHTML = `
    <footer>
      <div class="row">
        <div>© 2025 AutoCode — Built by hand</div>
        <div style="display:flex;gap:1.5rem">
          <a href="terms.html">Terms</a>
          <a href="privacy.html">Data Policy</a>
          <a href="mailto:${ADMIN_EMAIL}">${ADMIN_EMAIL}</a>
        </div>
      </div>
    </footer>`;
}

/* ---------- Display name profanity ---------- */
const banned = ["fuck","shit","bitch","asshole","cunt","dick","pussy","cock","nigger","nigga","faggot","fag","retard","slut","whore","bastard","wank","twat","piss","damn","hell","admin","administrator","autocode","mod","moderator","support","owner","root","system"];
export function isCleanDisplayName(name) {
  const t = (name || "").trim();
  if (t.length < 2) return { ok: false, reason: "Display name is too short." };
  if (t.length > 40) return { ok: false, reason: "Display name is too long." };
  if (!/^[a-zA-Z0-9 _.\-]+$/.test(t)) return { ok: false, reason: "Only letters, numbers, spaces, _ . - allowed." };
  const lower = t.toLowerCase().replace(/[^a-z]/g, "");
  for (const w of banned) if (lower.includes(w)) return { ok: false, reason: "Please choose a respectful display name." };
  return { ok: true };
}

/* ---------- Image upload (Supabase storage bucket: uploads) ---------- */
export function bindImageUpload({ inputId, urlInputId, previewId, removeId }) {
  const fi = document.getElementById(inputId);
  const urlI = document.getElementById(urlInputId);
  const prev = document.getElementById(previewId);
  const rm = document.getElementById(removeId);
  function paint() {
    if (urlI.value) { prev.innerHTML = `<img src="${esc(urlI.value)}" alt="">`; rm.style.display = ""; }
    else { prev.innerHTML = ""; rm.style.display = "none"; }
  }
  paint();
  fi.onchange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { err("Image must be under 5MB."); return; }
    const ext = file.name.split(".").pop() || "png";
    const path = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error } = await sb.storage.from("uploads").upload(path, file, { contentType: file.type });
    if (error) { err(error.message); return; }
    const { data } = sb.storage.from("uploads").getPublicUrl(path);
    urlI.value = data.publicUrl;
    paint();
    ok("Image uploaded.");
  };
  rm.onclick = () => { urlI.value = ""; fi.value = ""; paint(); };
}

/* ---------- Lucide-ish flame icon ---------- */
export const flameSvg = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`;
export const adminSig = `<span class="flame">${flameSvg} Auto</span>`;

/* ---------- Star helper ---------- */
export function starSvg(filled) {
  return `<svg width="18" height="18" viewBox="0 0 24 24" fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
}
export function starsHtml(value, interactive = false) {
  let h = `<span class="stars" data-stars>`;
  for (let i = 1; i <= 5; i++) {
    h += `<button type="button" data-star="${i}" ${interactive ? "" : "disabled"} style="background:none;border:none;color:${i <= value ? "var(--primary)" : "var(--muted-foreground)"};cursor:${interactive ? "pointer" : "default"};padding:0">${starSvg(i <= value)}</button>`;
  }
  return h + "</span>";
}

/* ---------- Search params helper ---------- */
export const qs = () => Object.fromEntries(new URLSearchParams(location.search));
