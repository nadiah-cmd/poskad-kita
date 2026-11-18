import { drawScene, drawStamp, drawPostmark } from "./art.js";

const CARD_W = 1500;
const CARD_H = 1000;

function roundRect(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function withCard(ctx, x, y, w, h, draw) {
  const radius = Math.round(w * 0.018);
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 26;
  ctx.shadowOffsetY = 12;
  roundRect(ctx, x, y, w, h, radius);
  ctx.fillStyle = "#FFF1D7";
  ctx.fill();
  ctx.restore();

  ctx.save();
  roundRect(ctx, x, y, w, h, radius);
  ctx.clip();
  ctx.translate(x, y);
  draw(ctx);
  ctx.restore();
}

function wrapWords(ctx, text, maxWidth) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines = [];
  let line = "";
  words.forEach((word) => {
    const trial = line ? `${line} ${word}` : word;
    if (ctx.measureText(trial).width <= maxWidth) {
      line = trial;
    } else {
      if (line) lines.push(line);
      line = word;
    }
  });
  if (line) lines.push(line);
  return lines.length ? lines : [""];
}

function drawCaption(ctx, dest, w, h) {
  const band = Math.round(h * 0.25);
  const top = h - band;
  ctx.fillStyle = "#FFF1D7";
  ctx.fillRect(0, top, w, band);
  ctx.fillStyle = dest.accent;
  ctx.fillRect(0, top, w, Math.max(4, h * 0.012));

  const pad = w * 0.055;
  ctx.fillStyle = "#222B36";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  const kicker = Math.max(16, Math.round(w * 0.028));
  ctx.font = `700 ${kicker}px "Source Sans 3", "Segoe UI", sans-serif`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0.14em";
  ctx.fillText(dest.menu.toUpperCase(), pad, top + band * 0.18);
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

  const maxWidth = w - pad * 2;
  let size = Math.round(w * 0.058);
  let lines = [dest.title];
  while (size > 22) {
    ctx.font = `650 ${size}px Fraunces, "Palatino Linotype", Palatino, Georgia, serif`;
    lines = wrapWords(ctx, dest.title, maxWidth);
    const tooWide = lines.some((line) => ctx.measureText(line).width > maxWidth);
    if (lines.length <= 2 && !tooWide) break;
    size -= 2;
  }
  const lineHeight = size * 1.05;
  lines.forEach((line, index) => {
    ctx.fillText(line, pad, top + band * 0.4 + index * lineHeight);
  });
}

function breakLong(ctx, word, maxWidth) {
  if (ctx.measureText(word).width <= maxWidth) return [word];
  const parts = [];
  let current = "";
  for (const char of word) {
    const trial = current + char;
    if (ctx.measureText(trial).width <= maxWidth) current = trial;
    else {
      if (current) parts.push(current);
      current = char;
    }
  }
  if (current) parts.push(current);
  return parts;
}

function wrapMessage(ctx, text, maxWidth) {
  const lines = [];
  String(text)
    .replace(/\r\n/g, "\n")
    .split("\n")
    .forEach((paragraph) => {
      if (paragraph === "") {
        lines.push("");
        return;
      }
      const words = paragraph.split(/\s+/).filter(Boolean);
      let line = "";
      words.forEach((word) => {
        breakLong(ctx, word, maxWidth).forEach((piece) => {
          const trial = line ? `${line} ${piece}` : piece;
          if (ctx.measureText(trial).width <= maxWidth) line = trial;
          else {
            if (line) lines.push(line);
            line = piece;
          }
        });
      });
      if (line) lines.push(line);
    });
  return lines;
}

function drawMessage(ctx, text, x, y, maxWidth, maxHeight) {
  const content = String(text).slice(0, 180);
  if (!content) return;
  let size = Math.floor(maxWidth * 0.052);
  const min = Math.max(20, Math.floor(maxWidth * 0.03));
  let lines = [];
  let lineHeight = size * 1.28;
  while (size >= min) {
    ctx.font = `400 ${size}px "Patrick Hand", "Segoe Print", cursive`;
    lines = wrapMessage(ctx, content, maxWidth);
    lineHeight = size * 1.28;
    if (lines.length * lineHeight <= maxHeight) break;
    size -= 2;
  }
  ctx.fillStyle = "#222B36";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, maxWidth, maxHeight);
  ctx.clip();
  lines.forEach((line, index) => {
    if (line) ctx.fillText(line, x, y + index * lineHeight);
  });
  ctx.restore();
}

function stampBitmap(dest, w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  drawStamp(canvas.getContext("2d"), dest, canvas.width, canvas.height);
  return canvas;
}

function postmarkBitmap(dest, w, h) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w));
  canvas.height = Math.max(1, Math.round(h));
  drawPostmark(canvas.getContext("2d"), dest, canvas.width, canvas.height);
  return canvas;
}

function drawBack(ctx, dest, message, w, h) {
  ctx.fillStyle = "#FFF1D7";
  ctx.fillRect(0, 0, w, h);
  ctx.fillStyle = "#222B36";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = `650 ${Math.round(w * 0.034)}px Fraunces, "Palatino Linotype", Palatino, Georgia, serif`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0.08em";
  ctx.fillText("POSKAD KITA", w * 0.055, h * 0.07);
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

  const stampW = w * 0.155;
  const stampH = stampW * 1.2;
  const stampX = w * 0.94 - stampW;
  const stampY = h * 0.05;
  ctx.drawImage(stampBitmap(dest, stampW, stampH), stampX, stampY);

  const postW = stampW * 1.38;
  const postH = stampH * 1.18;
  const postX = stampX - stampW * 0.34;
  const postY = stampY + stampH * 0.02;
  const mark = postmarkBitmap(dest, postW, postH);
  ctx.save();
  ctx.translate(postX + postW / 2, postY + postH / 2);
  ctx.rotate((-14 * Math.PI) / 180);
  ctx.drawImage(mark, -postW / 2, -postH / 2);
  ctx.restore();

  const msgX = w * 0.06;
  const msgY = stampY + stampH * 1.22 + h * 0.02;
  const msgW = w * 0.88;
  const lineY = h * 0.86;
  drawMessage(ctx, message, msgX, msgY, msgW, lineY - msgY - h * 0.03);

  ctx.strokeStyle = "rgba(34,43,54,0.28)";
  ctx.lineWidth = Math.max(2, h * 0.003);
  ctx.beginPath();
  ctx.moveTo(w * 0.055, lineY);
  ctx.lineTo(w * 0.945, lineY);
  ctx.stroke();

  ctx.fillStyle = "#222B36";
  ctx.font = `700 ${Math.round(w * 0.026)}px "Source Sans 3", "Segoe UI", sans-serif`;
  ctx.textBaseline = "middle";
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0.12em";
  const footY = lineY + (h - lineY) * 0.48;
  ctx.textAlign = "left";
  ctx.fillText(dest.menu.toUpperCase(), w * 0.055, footY);
  ctx.textAlign = "right";
  ctx.fillText("MALAYSIA", w * 0.945, footY);
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
}

export async function renderPostcardBlob(dest, message) {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  const pad = 64;
  const gap = 72;
  const canvas = document.createElement("canvas");
  canvas.width = pad * 2 + CARD_W * 2 + gap;
  canvas.height = pad * 2 + CARD_H;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.fillStyle = "#101B2C";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  withCard(ctx, pad, pad, CARD_W, CARD_H, (card) => {
    drawScene(card, dest, CARD_W, CARD_H);
    drawCaption(card, dest, CARD_W, CARD_H);
  });
  withCard(ctx, pad + CARD_W + gap, pad, CARD_W, CARD_H, (card) => {
    drawBack(card, dest, message, CARD_W, CARD_H);
  });

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("png");
  return blob;
}
