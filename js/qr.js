import qrcode from "./qrcode.js";

qrcode.stringToBytes = qrcode.stringToBytesFuncs["UTF-8"];

const INK = "#222B36";
const CREAM = "#FFF1D7";
const NIGHT = "#101B2C";

export function postcardText(dest, message) {
  const body = String(message || "").trim() || "(Belum ada pesanan.)";
  return `POSKAD KITA\n${dest.menu} — ${dest.title}\n${body}`;
}

function makeQr(text) {
  const qr = qrcode(0, "M");
  qr.addData(text, "Byte");
  qr.make();
  return qr;
}

function drawModules(ctx, qr, x, y, size) {
  const count = qr.getModuleCount();
  const cell = size / count;
  ctx.fillStyle = INK;
  for (let row = 0; row < count; row += 1) {
    for (let col = 0; col < count; col += 1) {
      if (!qr.isDark(row, col)) continue;
      ctx.fillRect(x + col * cell, y + row * cell, cell + 0.35, cell + 0.35);
    }
  }
}

export function paintQr(canvas, text) {
  const qr = makeQr(text);
  const count = qr.getModuleCount();
  const quiet = 4;
  const scale = 8;
  const modules = count + quiet * 2;
  canvas.width = modules * scale;
  canvas.height = modules * scale;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = CREAM;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  drawModules(ctx, qr, quiet * scale, quiet * scale, count * scale);
}

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

function wrapLines(ctx, text, maxWidth) {
  const lines = [];
  String(text).split("\n").forEach((paragraph) => {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) return;
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
  });
  return lines.length ? lines : [""];
}

export async function renderQrCardBlob(dest, message) {
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  const text = postcardText(dest, message);
  const qr = makeQr(text);
  const width = 1200;
  const height = 1600;
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = NIGHT;
  ctx.fillRect(0, 0, width, height);

  const cardX = 72;
  const cardY = 72;
  const cardW = width - 144;
  const cardH = height - 144;
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 28;
  ctx.shadowOffsetY = 14;
  roundRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fillStyle = CREAM;
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = dest.accent;
  ctx.fillRect(cardX, cardY + 18, cardW, 10);

  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";
  ctx.font = '700 34px "Source Sans 3", "Segoe UI", sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0.16em";
  ctx.fillText("POSKAD KITA", width / 2, cardY + 58);
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

  ctx.font = '700 26px "Source Sans 3", "Segoe UI", sans-serif';
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0.12em";
  ctx.fillText(dest.menu.toUpperCase(), width / 2, cardY + 112);
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

  ctx.font = '650 64px Fraunces, "Palatino Linotype", Palatino, Georgia, serif';
  const titleLines = wrapLines(ctx, dest.title, cardW - 120).slice(0, 2);
  titleLines.forEach((line, index) => {
    ctx.fillText(line, width / 2, cardY + 158 + index * 72);
  });

  const qrSize = 760;
  const qrX = (width - qrSize) / 2;
  const qrY = cardY + 168 + titleLines.length * 72;
  ctx.fillStyle = CREAM;
  ctx.fillRect(qrX - 28, qrY - 28, qrSize + 56, qrSize + 56);
  drawModules(ctx, qr, qrX, qrY, qrSize);

  ctx.font = '700 28px "Source Sans 3", "Segoe UI", sans-serif';
  ctx.fillText("Imbas untuk baca pesanan.", width / 2, qrY + qrSize + 36);

  const body = String(message || "").trim();
  if (body) {
    ctx.font = '400 40px "Patrick Hand", "Segoe Print", cursive';
    ctx.textAlign = "left";
    const maxWidth = cardW - 140;
    const lines = wrapLines(ctx, body, maxWidth).slice(0, 4);
    lines.forEach((line, index) => {
      ctx.fillText(line, cardX + 70, qrY + qrSize + 96 + index * 50);
    });
  }

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("png");
  return blob;
}
