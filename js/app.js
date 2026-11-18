import { DESTINATIONS, FEATURED_IDS, getDestination } from "./data.js";
import { drawPostmark, drawScene, drawStamp, hasScene } from "./art.js";
import { renderPostcardBlob } from "./export.js";

const missing = DESTINATIONS.filter((item) => !hasScene(item.id)).map((item) => item.id);
if (missing.length) throw new Error(`Ilustrasi belum lengkap: ${missing.join(", ")}`);

const state = { id: "melaka", ready: false };
let sceneTime = 0;
const mobileQuery = window.matchMedia("(max-width: 899px)");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const select = document.getElementById("destinasi");
const textarea = document.getElementById("pesanan");
const counter = document.getElementById("kiraan");
const flipInner = document.getElementById("flip-inner");
const faceBack = document.getElementById("face-back");
const btnDepan = document.getElementById("btn-depan");
const btnBelakang = document.getElementById("btn-belakang");
const downloadButton = document.getElementById("muat-turun");
const downloadStatus = document.getElementById("status-muat");
const destinationStatus = document.getElementById("status-destinasi");
const fallback = document.getElementById("eksport-ralat");
const fallbackMessage = document.getElementById("eksport-mesej");
const openLink = document.getElementById("buka-png");
const previewImage = document.getElementById("pratonton-png");
const postmark = document.getElementById("cop-pos");

let side = "depan";
let flipping = false;
let objectUrl = null;
let paintFrame = 0;

function buildSelect() {
  const groups = [
    ["negeri", "Negeri"],
    ["wilayah", "Wilayah Persekutuan"],
  ];
  groups.forEach(([key, label]) => {
    const group = document.createElement("optgroup");
    group.label = label;
    DESTINATIONS.filter((item) => item.group === key).forEach((item) => {
      const option = document.createElement("option");
      option.value = item.id;
      option.textContent = item.menu;
      if (item.id === "melaka") option.selected = true;
      group.append(option);
    });
    select.append(group);
  });
}

function buildPreviews() {
  const root = document.getElementById("pratonton");
  FEATURED_IDS.forEach((id) => {
    const dest = getDestination(id);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "preview";
    button.dataset.id = id;
    button.setAttribute("aria-label", `Pilih ${dest.menu}, ${dest.title}`);
    const card = document.createElement("article");
    card.className = "postcard postcard-front";
    card.style.setProperty("--accent", dest.accent);
    const canvas = document.createElement("canvas");
    canvas.dataset.draw = "scene";
    canvas.dataset.id = id;
    canvas.width = 900;
    canvas.height = 600;
    canvas.setAttribute("aria-hidden", "true");
    const caption = document.createElement("div");
    caption.className = "caption";
    const kicker = document.createElement("p");
    kicker.className = "postcard-kicker";
    kicker.textContent = dest.menu;
    const title = document.createElement("p");
    title.className = "postcard-title";
    title.textContent = dest.title;
    caption.append(kicker, title);
    card.append(canvas, caption);
    button.append(card);
    button.addEventListener("click", () => setDestination(id, { scroll: true }));
    root.append(button);
  });
}

function drawToCanvas(canvas, time = 0) {
  const cssWidth = canvas.clientWidth;
  const cssHeight = canvas.clientHeight;
  if (cssWidth < 2 || cssHeight < 2) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(cssWidth * dpr));
  const height = Math.max(1, Math.round(cssHeight * dpr));
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
  }
  const ctx = canvas.getContext("2d");
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  const id = canvas.dataset.id === "editor" ? state.id : canvas.dataset.id;
  const dest = getDestination(id);
  if (canvas.dataset.draw === "stamp") drawStamp(ctx, dest, width, height);
  else if (canvas.dataset.draw === "postmark") drawPostmark(ctx, dest, width, height);
  else drawScene(ctx, dest, width, height, time);
}

function paintScenes(time) {
  document.querySelectorAll('canvas[data-draw="scene"]').forEach((canvas) => drawToCanvas(canvas, time));
}

function paintAll() {
  document.querySelectorAll("canvas[data-draw]").forEach((canvas) => drawToCanvas(canvas, sceneTime));
}

function schedulePaint() {
  if (paintFrame) return;
  paintFrame = requestAnimationFrame(() => {
    paintFrame = 0;
    paintAll();
    fitMessage();
  });
}

function fitMessage() {
  if (textarea.clientHeight < 36) return;
  let size = 22;
  const min = 16;
  textarea.style.fontSize = `${size}px`;
  while (size > min && textarea.scrollHeight > textarea.clientHeight + 1) {
    size -= 1;
    textarea.style.fontSize = `${size}px`;
  }
}

function syncCount() {
  const count = textarea.value.length;
  counter.textContent = `${count}/180 aksara`;
  counter.dataset.full = count >= 180 ? "true" : "false";
}

function updateCopy(dest) {
  document.getElementById("kicker-depan").textContent = dest.menu;
  document.getElementById("tajuk-depan").textContent = dest.title;
  document.getElementById("asal-pos").textContent = dest.menu;
  document.getElementById("poskad-depan").style.setProperty("--accent", dest.accent);
  document.querySelectorAll(".preview").forEach((button) => {
    if (button.dataset.id === dest.id) button.setAttribute("aria-current", "true");
    else button.removeAttribute("aria-current");
  });
}

function playStamp() {
  if (reduceMotion.matches) return;
  postmark.classList.remove("is-tekap");
  void postmark.offsetWidth;
  postmark.classList.add("is-tekap");
}

function setDestination(id, { scroll = false } = {}) {
  const dest = getDestination(id);
  const changed = dest.id !== state.id;
  state.id = dest.id;
  if (select.value !== dest.id) select.value = dest.id;
  updateCopy(dest);
  paintAll();
  if (changed && state.ready) {
    playStamp();
    downloadStatus.textContent = "";
    destinationStatus.textContent = `Destinasi ditukar ke ${dest.menu}, ${dest.title}.`;
  }
  if (scroll) {
    const section = document.getElementById("editor");
    section.scrollIntoView({ behavior: reduceMotion.matches ? "auto" : "smooth" });
    window.setTimeout(() => section.focus({ preventScroll: true }), 0);
  }
}

function applySide() {
  flipInner.dataset.side = side;
  btnDepan.setAttribute("aria-pressed", side === "depan" ? "true" : "false");
  btnBelakang.setAttribute("aria-pressed", side === "belakang" ? "true" : "false");
  const hideBack = mobileQuery.matches && side !== "belakang";
  faceBack.inert = hideBack;
  if (hideBack && faceBack.contains(document.activeElement)) btnDepan.focus();
}

function showSide(next) {
  if (next === side || flipping) return;
  if (next === "depan" && document.activeElement === textarea) textarea.blur();
  const animate = mobileQuery.matches && !reduceMotion.matches;
  if (!animate) {
    side = next;
    applySide();
    schedulePaint();
    return;
  }

  flipping = true;
  let stage = 0;
  const finish = () => {
    window.clearTimeout(backup);
    flipInner.removeEventListener("transitionend", onEnd);
    flipping = false;
    if (side !== next) {
      side = next;
      applySide();
    }
    flipInner.style.transition = "";
    flipInner.style.transform = "rotateY(0deg)";
    schedulePaint();
  };
  const onEnd = (event) => {
    if (event.target !== flipInner || event.propertyName !== "transform") return;
    if (stage === 0) {
      stage = 1;
      side = next;
      applySide();
      flipInner.style.transition = "transform 0.28s ease-out";
      flipInner.style.transform = "rotateY(0deg)";
      return;
    }
    finish();
  };
  const backup = window.setTimeout(finish, 900);
  flipInner.addEventListener("transitionend", onEnd);
  flipInner.style.transition = "transform 0.26s ease-in";
  void flipInner.offsetWidth;
  flipInner.style.transform = "rotateY(90deg)";
}

function showFallback(url, message, dest) {
  fallbackMessage.textContent = message;
  if (url) {
    openLink.href = url;
    openLink.hidden = false;
    previewImage.src = url;
    previewImage.hidden = false;
    previewImage.alt = `Poskad ${dest.menu}, depan dan belakang.`;
  } else {
    openLink.hidden = true;
    previewImage.removeAttribute("src");
    previewImage.hidden = true;
    previewImage.alt = "";
  }
  fallback.hidden = false;
}

async function downloadPostcard() {
  const dest = getDestination(state.id);
  const message = textarea.value.slice(0, 180);
  downloadButton.disabled = true;
  try {
    const blob = await renderPostcardBlob(dest, message);
    if (objectUrl) URL.revokeObjectURL(objectUrl);
    objectUrl = URL.createObjectURL(blob);
    const filename = `poskad-kita-${dest.id}.png`;
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = filename;
    document.body.append(link);
    link.click();
    link.remove();
    const blocked = /iP(hone|ad|od)/.test(navigator.userAgent);
    if (blocked) {
      downloadStatus.textContent = "";
      showFallback(objectUrl, "Pelayar ini menyekat muat turun automatik. Buka imej PNG dan simpan ke peranti anda.", dest);
      return;
    }
    fallback.hidden = true;
    downloadStatus.textContent = "Poskad dimuat turun.";
  } catch (error) {
    downloadStatus.textContent = "";
    showFallback(
      objectUrl,
      objectUrl
        ? "Muat turun tidak berjaya. Buka imej PNG dan simpan ke peranti anda."
        : "Imej PNG tidak dapat dijana. Cuba lagi.",
      dest
    );
  } finally {
    downloadButton.disabled = false;
  }
}

function bind() {
  select.addEventListener("change", () => setDestination(select.value));
  textarea.addEventListener("input", () => {
    if (textarea.value.length > 180) textarea.value = textarea.value.slice(0, 180);
    syncCount();
    fitMessage();
  });
  btnDepan.addEventListener("click", () => showSide("depan"));
  btnBelakang.addEventListener("click", () => showSide("belakang"));
  downloadButton.addEventListener("click", downloadPostcard);
  mobileQuery.addEventListener("change", () => {
    flipping = false;
    flipInner.style.transform = "";
    flipInner.style.transition = "";
    applySide();
    schedulePaint();
  });
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", () => {
      const target = document.getElementById(link.getAttribute("href").slice(1));
      if (!target) return;
      window.setTimeout(() => {
        if (target.hasAttribute("tabindex")) target.focus({ preventScroll: true });
      }, 0);
    });
  });

  const navLinks = document.querySelectorAll(".nav-links a");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          if (link.getAttribute("href") === `#${entry.target.id}`) link.setAttribute("aria-current", "true");
          else link.removeAttribute("aria-current");
        });
      });
    },
    { rootMargin: "-45% 0px -45% 0px" }
  );
  ["utama", "destinasi"].forEach((id) => observer.observe(document.getElementById(id)));

  const resizeObserver = new ResizeObserver(() => schedulePaint());
  document.querySelectorAll("canvas[data-draw]").forEach((canvas) => resizeObserver.observe(canvas));
  window.addEventListener("resize", schedulePaint);
}

buildSelect();
buildPreviews();
bind();
applySide();
syncCount();
setDestination("melaka");
state.ready = true;
document.fonts?.ready?.then(() => schedulePaint());

function playScenes(now) {
  if (!reduceMotion.matches && !document.hidden) {
    sceneTime = now / 1000;
    paintScenes(sceneTime);
  }
  requestAnimationFrame(playScenes);
}

requestAnimationFrame(playScenes);
reduceMotion.addEventListener("change", () => {
  if (reduceMotion.matches) paintScenes(0);
});
