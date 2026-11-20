const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
const $ = (s) => document.querySelector(s);
$("#y").textContent = new Date().getFullYear();

// Neural-network canvas: drifting nodes, linked when close, pulled toward the cursor
const cv = $("#bg"), ctx = cv.getContext("2d");
let W, H, nodes = [], mouse = { x: -999, y: -999 };
function resize() {
  const d = Math.min(devicePixelRatio || 1, 2);
  W = cv.width = innerWidth * d; H = cv.height = innerHeight * d;
  ctx.setTransform(d, 0, 0, d, 0, 0);
  const n = Math.min(90, Math.floor(innerWidth * innerHeight / 17000));
  nodes = Array.from({ length: n }, () => ({
    x: Math.random() * innerWidth, y: Math.random() * innerHeight,
    vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
  }));
}
function frame() {
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of nodes) {
    p.x += p.vx; p.y += p.vy;
    if (p.x < 0 || p.x > innerWidth) p.vx *= -1;
    if (p.y < 0 || p.y > innerHeight) p.vy *= -1;
    const dx = mouse.x - p.x, dy = mouse.y - p.y, d = Math.hypot(dx, dy);
    if (d < 160) { p.x += dx * .006; p.y += dy * .006; }
  }
  for (let i = 0; i < nodes.length; i++) {
    const a = nodes[i];
    ctx.fillStyle = "rgba(182,255,59,.7)";
    ctx.beginPath(); ctx.arc(a.x, a.y, 1.6, 0, 7); ctx.fill();
    for (let j = i + 1; j < nodes.length; j++) {
      const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 130) {
        ctx.strokeStyle = `rgba(77,226,255,${(1 - d / 130) * .28})`;
        ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
      }
    }
  }
  requestAnimationFrame(frame);
}
resize(); addEventListener("resize", resize);
if (still) { frame = () => {}; }
requestAnimationFrame(frame);

const glow = $(".glow");
addEventListener("pointermove", (e) => {
  mouse.x = e.clientX; mouse.y = e.clientY;
  glow.style.left = e.clientX + "px"; glow.style.top = e.clientY + "px";
});
addEventListener("pointerleave", () => (mouse.x = mouse.y = -999));

// Spotlight on cards
document.querySelectorAll(".card").forEach((c) =>
  c.addEventListener("pointermove", (e) => {
    const r = c.getBoundingClientRect();
    c.style.setProperty("--mx", e.clientX - r.left + "px");
    c.style.setProperty("--my", e.clientY - r.top + "px");
  }));

// Typed hero line
function type(el, text, speed, done) {
  if (still) { el.textContent = text; return done && done(); }
  let i = 0;
  (function step() {
    el.textContent = text.slice(0, ++i);
    if (i < text.length) setTimeout(step, speed);
    else done && done();
  })();
}
const lines = [
  "extract(rate_confirmation.pdf) → structured load, 98% fields filled",
  "assistant.ask(\"where is my load?\") → answers from live data",
  "ship(ai_feature) → staging → production, zero downtime",
];
let li = 0;
(function loop() {
  type($("#typed"), lines[li++ % lines.length], 28, () => setTimeout(loop, 2600));
})();

// Scroll reveal + count-up
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  e.target.classList.add("in");
  e.target.querySelectorAll("[data-to]").forEach(count);
  io.unobserve(e.target);
}), { threshold: .12 });
document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
function count(el) {
  const to = +el.dataset.to, suf = el.dataset.suffix || "";
  if (still) { el.textContent = to + suf; return; }
  const t0 = performance.now();
  (function tick(t) {
    const k = Math.min((t - t0) / 1200, 1);
    el.textContent = Math.round(to * (1 - Math.pow(1 - k, 3))) + suf;
    if (k < 1) requestAnimationFrame(tick);
  })(t0);
}

// "Ask me": canned answers typed out
const answers = {
  what: "I build AI assistants, document-extraction pipelines and AI features inside existing SaaS products, with the secure backend and integrations they need to run in production.",
  how: "1. Send me a sample document or describe the workflow.\n2. I reply with a scope and a fixed price.\n3. You get a working demo early, then a clean handover.\n\nEmail: dev.muhammedov@gmail.com",
  tech: "AI: OpenAI API, structured output, retrieval.\nBackend: Java 21 / Spring Boot 3, NestJS, Node.\nFrontend: React 19 / TypeScript.\nInfra: PostgreSQL, Redis, Docker, GitHub Actions, AWS.",
  where: "Remote. I work with teams and clients across time zones, in English (professional), Russian and Turkmen.",
};
let timer;
document.querySelectorAll(".chips button").forEach((b) =>
  b.addEventListener("click", () => {
    document.querySelectorAll(".chips button").forEach((x) => x.classList.toggle("on", x === b));
    clearTimeout(timer);
    const out = $("#out"); out.textContent = "";
    const txt = answers[b.dataset.q]; let i = 0;
    if (still) { out.textContent = txt; return; }
    (function s() { out.textContent = txt.slice(0, ++i); if (i < txt.length) timer = setTimeout(s, 12); })();
  }));
