const INK = "#222B36";
const CREAM = "#FFF1D7";
const GOLD = "#F6BE49";

function makePainter(ctx, w, h) {
  const sx = w / 300;
  const sy = h / 200;
  const api = {
    ctx,
    w,
    h,
    sx,
    sy,
    X(n) {
      return n * sx;
    },
    Y(n) {
      return n * sy;
    },
    sky(stops) {
      const gradient = ctx.createLinearGradient(0, 0, 0, h);
      if (Array.isArray(stops[0])) stops.forEach(([offset, color]) => gradient.addColorStop(offset, color));
      else stops.forEach((color, index) => gradient.addColorStop(stops.length === 1 ? 0 : index / (stops.length - 1), color));
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, w, h);
    },
    rect(color, x, y, rw, rh) {
      ctx.fillStyle = color;
      ctx.fillRect(api.X(x), api.Y(y), rw * sx, rh * sy);
    },
    poly(color, pts) {
      ctx.beginPath();
      pts.forEach(([x, y], index) => {
        const px = api.X(x);
        const py = api.Y(y);
        if (index === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    },
    ellipse(color, x, y, rx, ry) {
      ctx.beginPath();
      ctx.ellipse(api.X(x), api.Y(y), Math.abs(rx * sx), Math.abs(ry * sy), 0, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    },
    stroke(color, width, pts) {
      ctx.beginPath();
      pts.forEach(([x, y], index) => {
        const px = api.X(x);
        const py = api.Y(y);
        if (index === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(1, width * sx);
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();
    },
    path(color, draw) {
      ctx.beginPath();
      draw(ctx, (n) => n * sx, (n) => n * sy);
      ctx.fillStyle = color;
      ctx.fill();
    },
  };
  return api;
}

function finish(ctx, w, h) {
  const glow = ctx.createRadialGradient(w * 0.5, h * 0.42, w * 0.15, w * 0.5, h * 0.45, w * 0.72);
  glow.addColorStop(0, "rgba(16,27,44,0)");
  glow.addColorStop(1, "rgba(16,27,44,0.16)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, w, h);

  ctx.save();
  ctx.globalAlpha = 0.05;
  ctx.fillStyle = INK;
  const step = Math.max(4, Math.round(w / 150));
  for (let y = 0; y < h; y += step) {
    const shift = (y / step) % 2 ? step / 2 : 0;
    for (let x = shift; x < w; x += step) {
      if (((x * 3 + y * 7) >> 3) % 3 === 0) ctx.fillRect(x, y, 1, 1);
    }
  }
  ctx.restore();
}

function reflect(p, waterY, draw) {
  p.ctx.save();
  p.ctx.beginPath();
  p.ctx.rect(0, p.Y(waterY), p.w, p.h - p.Y(waterY));
  p.ctx.clip();
  p.ctx.globalAlpha = 0.34;
  p.ctx.translate(0, p.Y(waterY) * 2);
  p.ctx.scale(1, -1);
  draw();
  p.ctx.restore();
}

function palm(p, x, top, bottom) {
  p.path("#1C342C", (c, X, Y) => {
    c.moveTo(X(x), Y(bottom));
    c.quadraticCurveTo(X(x + 12), Y((top + bottom) / 2), X(x + 2), Y(top));
    c.lineTo(X(x + 8), Y(top + 5));
    c.quadraticCurveTo(X(x + 16), Y((top + bottom) / 2 + 8), X(x + 7), Y(bottom));
    c.closePath();
  });
  [
    [[x + 4, top + 2], [x - 26, top - 10], [x - 4, top + 12]],
    [[x + 6, top], [x + 32, top - 14], [x + 14, top + 10]],
    [[x + 5, top + 3], [x - 16, top + 18], [x, top + 12]],
    [[x + 8, top + 2], [x + 28, top + 16], [x + 12, top + 12]],
    [[x + 5, top], [x + 4, top - 20], [x + 12, top + 4]],
  ].forEach((shape, index) => p.poly(index % 2 ? "#163028" : "#24503C", shape));
}

function stiltBody(p, x, y, w, h) {
  p.rect("#6B3A2A", x, y, w, h);
  p.poly("#2A1814", [
    [x - 3, y + 1],
    [x + w * 0.5, y - h * 0.45],
    [x + w + 3, y + 1],
  ]);
  p.rect(GOLD, x + w * 0.15, y + h * 0.3, w * 0.16, h * 0.28);
  p.rect(GOLD, x + w * 0.62, y + h * 0.34, w * 0.16, h * 0.24);
}

const scenes = {
  johor(p) {
    p.sky(["#14375F", "#6E97C4", "#F4E7CC"]);
    p.rect("#E7D3A8", 0, 156, 300, 44);
    const minaret = (x) => {
      p.rect("#1E4E86", x, 62, 12, 86);
      p.poly("#1E4E86", [[x - 2, 62], [x + 6, 42], [x + 14, 62]]);
      p.rect("#F7F1E4", x + 2, 78, 8, 4);
      p.ellipse("#F7F1E4", x + 6, 48, 3.2, 2.2);
    };
    minaret(58);
    minaret(230);
    p.rect("#1E4E86", 86, 112, 128, 46);
    p.ellipse("#1E4E86", 112, 112, 16, 12);
    p.ellipse("#1E4E86", 188, 112, 16, 12);
    p.ellipse("#1E4E86", 150, 98, 34, 24);
    p.ellipse("#174472", 150, 92, 20, 12);
    p.rect("#F7F1E4", 148, 70, 4, 16);
    p.ellipse("#F7F1E4", 150, 68, 4, 4);
    for (let i = 0; i < 4; i += 1) {
      const x = 104 + i * 26;
      p.path("#F4E7CC", (c, X, Y) => {
        c.moveTo(X(x - 7), Y(158));
        c.lineTo(X(x - 7), Y(138));
        c.quadraticCurveTo(X(x), Y(124), X(x + 7), Y(138));
        c.lineTo(X(x + 7), Y(158));
        c.closePath();
      });
    }
  },

  kedah(p) {
    p.sky(["#F8E7A8", "#F3C56A", "#D7E7A4"]);
    p.ellipse(GOLD, 52, 70, 15, 15);
    p.ctx.save();
    p.ctx.globalAlpha = 0.28;
    p.ellipse("#FFF1D7", 52, 70, 26, 26);
    p.ctx.restore();
    p.poly("#8FA888", [[0, 128], [40, 96], [78, 112], [120, 84], [168, 108], [220, 90], [300, 120], [300, 140], [0, 140]]);
    p.poly("#5E7C68", [[0, 140], [50, 112], [96, 128], [150, 104], [210, 126], [300, 112], [300, 150], [0, 150]]);
    const bands = ["#2F6A38", "#7DAA45", "#D7E08A", "#3E7A32", "#C6A43A"];
    bands.forEach((color, index) => {
      const y = 146 + index * 8;
      p.path(color, (c, X, Y) => {
        c.moveTo(0, Y(y));
        c.quadraticCurveTo(X(150), Y(y - 6), X(300), Y(y + 2));
        c.lineTo(X(300), Y(y + 12));
        c.quadraticCurveTo(X(140), Y(y + 4), 0, Y(y + 10));
        c.closePath();
      });
    });
  },

  kelantan(p, _dest, t = 0) {
    p.sky(["#241456", "#8E3058", "#E8896A"]);
    p.poly("#1A1440", [[0, 162], [300, 150], [300, 200], [0, 200]]);
    const sway = Math.sin(t * 1.25) * 0.1;
    p.ctx.save();
    p.ctx.translate(p.X(168), p.Y(168));
    p.ctx.rotate(sway);
    p.ctx.translate(-p.X(168), -p.Y(168));
    p.path("#F4E2C4", (c, X, Y) => {
      c.moveTo(X(176), Y(112));
      c.quadraticCurveTo(X(198), Y(138), X(184), Y(170));
      c.lineTo(X(194), Y(170));
      c.quadraticCurveTo(X(210), Y(136), X(186), Y(108));
      c.closePath();
    });
    [[180, 128], [186, 146], [184, 164]].forEach(([x, y], index) => {
      p.poly(index % 2 ? "#9E2A3C" : "#2C2A72", [[x, y], [x + 12, y + 7], [x, y + 14], [x - 12, y + 7]]);
    });
    p.ctx.save();
    p.ctx.beginPath();
    p.ctx.ellipse(p.X(142), p.Y(86), 48 * p.sx, 50 * p.sy, 0, 0, Math.PI * 2);
    p.ctx.ellipse(p.X(162), p.Y(84), 34 * p.sx, 36 * p.sy, 0, 0, Math.PI * 2);
    p.ctx.fillStyle = "#F6E7C8";
    p.ctx.fill("evenodd");
    p.ctx.clip("evenodd");
    p.ctx.fillStyle = "#9E2A3C";
    for (let i = 0; i < 6; i += 1) {
      p.ctx.beginPath();
      p.ctx.arc(p.X(118 + i * 10), p.Y(78 + (i % 2) * 16), 4.2 * p.sx, 0, Math.PI * 2);
      p.ctx.fill();
    }
    p.ctx.fillStyle = "#2C2A72";
    p.ctx.fillRect(p.X(108), p.Y(84), p.X(70), Math.max(2, 3 * p.sy));
    p.ctx.restore();
    p.poly("#9E2A3C", [[142, 28], [156, 52], [142, 44], [128, 52]]);
    p.ellipse("#2C2A72", 142, 30, 5, 7);
    p.ellipse(GOLD, 142, 30, 2, 2.4);
    p.ctx.restore();
  },

  melaka(p, _dest, t = 0) {
    p.sky([[0, "#1A3358"], [0.48, "#B84332"], [0.78, "#F09A4A"], [1, "#F6C56E"]]);
    p.ellipse(GOLD, 232, 86, 15, 15);
    p.ctx.save();
    p.ctx.globalAlpha = 0.3;
    p.ellipse("#F6BE49", 232, 86, 28, 28);
    p.ctx.restore();
    p.poly("#4A3044", [[0, 124], [46, 112], [90, 122], [140, 108], [210, 120], [300, 104], [300, 136], [0, 136]]);
    const water = p.ctx.createLinearGradient(0, p.Y(132), 0, p.h);
    water.addColorStop(0, "#1A4464");
    water.addColorStop(1, "#0C1C30");
    p.ctx.fillStyle = water;
    p.ctx.fillRect(0, p.Y(132), p.w, p.h);
    const houses = () => {
      stiltBody(p, 26, 90, 64, 40);
      stiltBody(p, 100, 100, 48, 32);
      stiltBody(p, 156, 108, 36, 24);
    };
    houses();
    reflect(p, 134, houses);
    p.rect("#4A2C22", 34, 130, 2.2, 16);
    p.rect("#4A2C22", 80, 130, 2.2, 18);
    p.rect("#4A2C22", 112, 132, 2, 14);
    p.rect("#4A2C22", 140, 132, 2, 16);
    p.rect("#4A2C22", 164, 132, 2, 12);
    p.rect("#4A2C22", 184, 132, 2, 14);
    p.ctx.save();
    p.ctx.translate(p.X(254), p.Y(150));
    p.ctx.rotate(Math.sin(t * 1.15) * 0.07);
    p.ctx.translate(-p.X(254), -p.Y(150));
    palm(p, 250, 74, 150);
    p.ctx.restore();
    [[46, 128], [124, 130], [196, 126]].forEach(([x, y], index) => {
      p.rect("#2A1814", x, y - 14, 1.5, 16);
      p.ctx.save();
      p.ctx.globalAlpha = 0.4 + 0.6 * (0.5 + 0.5 * Math.sin(t * 3.2 + index * 1.4));
      p.ellipse(GOLD, x + 0.8, y - 16, 2.8, 2.8);
      p.ctx.restore();
    });
  },

  "negeri-sembilan"(p) {
    p.sky(["#E4E8D4", "#C9D7C4"]);
    p.poly("#16382C", [[0, 150], [40, 118], [110, 132], [180, 108], [250, 128], [300, 112], [300, 200], [0, 200]]);
    p.poly("#2F6B45", [[0, 168], [70, 136], [150, 156], [230, 128], [300, 148], [300, 200], [0, 200]]);
    const roof = (color, yTip, yValley, yPeak, inset) => {
      p.path(color, (c, X, Y) => {
        c.moveTo(X(34 + inset), Y(yTip));
        c.quadraticCurveTo(X(86), Y(yValley + 12), X(118), Y(yValley));
        c.quadraticCurveTo(X(150), Y(yPeak), X(182), Y(yValley));
        c.quadraticCurveTo(X(214), Y(yValley + 12), X(266 - inset), Y(yTip));
        c.lineTo(X(252 - inset), Y(yTip + 11));
        c.quadraticCurveTo(X(206), Y(yValley + 20), X(182), Y(yValley + 10));
        c.quadraticCurveTo(X(150), Y(yPeak + 14), X(118), Y(yValley + 10));
        c.quadraticCurveTo(X(92), Y(yValley + 22), X(48 + inset), Y(yTip + 11));
        c.closePath();
      });
    };
    roof("#8C4E24", 78, 104, 70, 0);
    roof("#C4783A", 96, 118, 86, 8);
    p.rect("#F3E6D0", 92, 124, 116, 32);
    p.rect("#3A2A22", 104, 156, 4, 18);
    p.rect("#3A2A22", 192, 156, 4, 18);
    p.rect("#6B3A2A", 138, 136, 18, 20);
    p.poly("#3A2A22", [[128, 156], [150, 172], [172, 156], [166, 156], [150, 166], [134, 156]]);
  },

  pahang(p, _dest, t = 0) {
    p.sky(["#E7F2EC", "#F7F4EA"]);
    const hill = (color, peak, base) => {
      p.ctx.save();
      p.ctx.beginPath();
      p.ctx.moveTo(0, p.Y(base));
      p.ctx.quadraticCurveTo(p.X(90), p.Y(peak), p.X(170), p.Y(base - 10));
      p.ctx.quadraticCurveTo(p.X(240), p.Y(peak + 16), p.w, p.Y(base + 4));
      p.ctx.lineTo(p.w, p.h);
      p.ctx.lineTo(0, p.h);
      p.ctx.closePath();
      p.ctx.fillStyle = color;
      p.ctx.fill();
      p.ctx.clip();
      p.ctx.strokeStyle = "rgba(255,241,215,0.38)";
      p.ctx.lineWidth = Math.max(1.2, p.sx * 1.3);
      for (let y = peak + 8; y < 210; y += 7) {
        p.ctx.beginPath();
        p.ctx.moveTo(0, p.Y(y));
        p.ctx.quadraticCurveTo(p.X(150), p.Y(y - 10), p.w, p.Y(y + 6));
        p.ctx.stroke();
      }
      p.ctx.restore();
    };
    const drift = Math.sin(t * 0.45) * 28;
    hill("#0E5C4E", 78, 150);
    p.ctx.save();
    p.ctx.globalAlpha = 0.55;
    p.rect("#F7F3EA", drift - 40, 96, 380, 18);
    p.ctx.restore();
    hill("#1F8A6E", 98, 168);
    p.ctx.save();
    p.ctx.globalAlpha = 0.5;
    p.rect("#F7F3EA", -drift - 20, 128, 380, 14);
    p.ctx.restore();
    hill("#146B56", 118, 188);
    p.rect("#F6F1E6", 214, 122, 22, 14);
    p.poly("#6B3A2A", [[210, 122], [225, 112], [240, 122]]);
  },

  perak(p) {
    p.sky(["#F6E7D4", "#F3D7C0"]);
    p.poly("#D5C4B0", [[8, 168], [24, 78], [46, 46], [68, 70], [86, 40], [108, 86], [124, 168]]);
    p.poly("#B7A08C", [[96, 168], [128, 62], [156, 34], [176, 58], [168, 96], [196, 168]]);
    p.poly("#8C7A6C", [[176, 168], [198, 84], [230, 52], [258, 78], [248, 168]]);
    p.stroke("rgba(255,241,215,0.35)", 1.4, [[48, 52], [44, 130]]);
    p.stroke("rgba(255,241,215,0.28)", 1.4, [[156, 42], [150, 120]]);
    const shops = [
      [18, 78, 58, "#F3E6D0"],
      [78, 86, 52, "#F6EFE2"],
      [132, 70, 48, "#E7C8B0"],
      [182, 80, 44, "#F3E6D0"],
    ];
    shops.forEach(([x, h, w, wall]) => {
      const y = 156 - h;
      p.rect(wall, x, y, w, h);
      p.rect("#C4654A", x - 2, y - 7, w + 4, 8);
      p.rect("#3A342C", x + w * 0.18, y + 8, w * 0.2, 12);
      p.rect("#3A342C", x + w * 0.58, y + 8, w * 0.2, 12);
      p.rect("#6B3A2A", x + w * 0.36, y + h * 0.48, w * 0.26, h * 0.52);
    });
  },

  perlis(p) {
    p.sky(["#F8E7B0", "#F6D48A", "#F3E2B4"]);
    p.ellipse("#FFF6D8", 64, 62, 12, 12);
    p.poly("#E7D3B0", [[168, 168], [188, 86], [206, 62], [236, 58], [252, 78], [248, 112], [270, 168]]);
    p.poly("#D2BC98", [[214, 168], [228, 96], [246, 74], [262, 108], [258, 168]]);
    p.rect("#C6D98A", 0, 150, 300, 22);
    p.rect("#E6C85A", 0, 168, 300, 32);
    p.stroke("rgba(255,241,215,0.45)", 1, [[0, 160], [300, 158]]);
  },

  "pulau-pinang"(p) {
    p.sky(["#24315C", "#4C6294"]);
    p.rect("#1C2444", 0, 156, 300, 44);
    const houses = [
      [8, 86, 54, "#F2C1C1"],
      [64, 74, 50, "#F6E3A1"],
      [116, 90, 52, "#B7D8C8"],
      [170, 68, 58, "#F0D2BA"],
      [230, 82, 62, "#C9D4F2"],
    ];
    houses.forEach(([x, h, w, wall]) => {
      const y = 156 - h;
      p.rect(wall, x, y, w, h);
      p.rect("#2A3148", x, y, w, 6);
      p.rect("#24315C", x + 6, y + 14, 12, 16);
      p.rect("#24315C", x + w - 20, y + 14, 12, 16);
      p.rect("#1C2444", x + w * 0.38, y + h - 28, 14, 28);
      p.rect("#F6BE49", x + 8, y + h - 18, 6, 8);
    });
  },

  sabah(p, _dest, t = 0) {
    p.sky(["#3A2158", "#8E5C8C", "#E7B4C8"]);
    p.poly("#D5E2EE", [[0, 150], [40, 126], [90, 138], [150, 116], [220, 134], [300, 120], [300, 200], [0, 200]]);
    p.poly("#8AA4BE", [[0, 162], [36, 132], [80, 148], [130, 118], [190, 146], [250, 124], [300, 142], [300, 200], [0, 200]]);
    p.poly("#4E6A8A", [[0, 172], [28, 146], [70, 132], [96, 146], [120, 112], [146, 128], [168, 78], [186, 104], [210, 92], [236, 126], [270, 140], [300, 132], [300, 200], [0, 200]]);
    const mist = Math.sin(t * 0.4) * 26;
    p.ctx.save();
    p.ctx.globalAlpha = 0.45;
    p.rect("#F3E4EE", mist - 30, 128, 360, 16);
    p.ctx.restore();
    p.poly("#2A2344", [[0, 186], [20, 160], [48, 148], [74, 156], [98, 132], [124, 146], [148, 96], [166, 118], [184, 62], [200, 96], [220, 88], [246, 130], [278, 150], [300, 142], [300, 200], [0, 200]]);
  },

  sarawak(p) {
    p.sky([[0, "#083E42"], [0.55, "#0E6E6A"], [1, "#E1B44A"]]);
    const river = p.ctx.createLinearGradient(0, p.Y(136), 0, p.h);
    river.addColorStop(0, "#0A4C50");
    river.addColorStop(1, "#062E32");
    p.ctx.fillStyle = river;
    p.ctx.fillRect(0, p.Y(136), p.w, p.h);
    const hall = () => {
      p.rect("#E7D3A8", 46, 124, 208, 8);
      for (let x = 62; x < 236; x += 18) p.rect("#F3E6C8", x, 108, 5, 18);
      p.rect("#0E4F55", 72, 92, 156, 28);
      p.path("#E1B44A", (c, X, Y) => {
        c.moveTo(X(36), Y(102));
        c.quadraticCurveTo(X(100), Y(62), X(154), Y(74));
        c.quadraticCurveTo(X(214), Y(52), X(272), Y(96));
        c.lineTo(X(252), Y(104));
        c.quadraticCurveTo(X(204), Y(78), X(154), Y(90));
        c.quadraticCurveTo(X(104), Y(84), X(54), Y(112));
        c.closePath();
      });
      p.poly("#C4922A", [[148, 74], [154, 40], [160, 74]]);
    };
    hall();
    reflect(p, 138, hall);
    p.stroke("rgba(255,241,215,0.28)", 0.8, [[0, 156], [300, 152]]);
    p.stroke("rgba(225,180,74,0.35)", 0.8, [[0, 170], [300, 166]]);
  },

  selangor(p) {
    p.sky(["#F6E2C8", "#E7C8A4"]);
    p.poly("#D9CBB6", [[20, 176], [48, 70], [86, 36], [140, 24], [186, 42], [170, 90], [210, 70], [236, 108], [220, 176]]);
    p.poly("#B7A58E", [[150, 176], [176, 78], [214, 40], [258, 64], [246, 120], [270, 176]]);
    p.path("#2C2824", (c, X, Y) => {
      c.moveTo(X(132), Y(118));
      c.quadraticCurveTo(X(156), Y(64), X(184), Y(112));
      c.quadraticCurveTo(X(160), Y(104), X(132), Y(118));
      c.closePath();
    });
    const colors = ["#F6BE49", "#C4654A", "#1F7A74", "#F3E6D0"];
    for (let i = 0; i < 16; i += 1) {
      const y = 164 - i * 5.4;
      const x = 108 + i * 1.15;
      const rw = 84 - i * 2.6;
      p.rect(colors[i % 4], x, y, rw, 4.1);
    }
    p.ellipse("#3E6B45", 78, 150, 10, 6);
    p.ellipse("#2F6B45", 250, 146, 12, 7);
  },

  terengganu(p, _dest, t = 0) {
    p.sky(["#F6E7CF", "#F2D2A8", "#8FE0D8"]);
    p.rect("#7EDAD4", 0, 108, 300, 22);
    p.rect("#3EC6C1", 0, 126, 300, 18);
    p.rect("#148C98", 0, 142, 300, 16);
    p.rect("#F0D7A4", 0, 156, 300, 44);
    p.ellipse("#1F6A62", 214, 104, 28, 10);
    p.ellipse("#174E48", 228, 104, 16, 6);
    p.ctx.save();
    p.ctx.translate(p.X(40), p.Y(168));
    p.ctx.rotate(Math.sin(t * 1.05) * 0.06);
    p.ctx.translate(-p.X(40), -p.Y(168));
    palm(p, 36, 78, 168);
    p.ctx.restore();
    p.ctx.save();
    p.ctx.globalAlpha = 0.28;
    p.ellipse("#C4922A", 96, 168, 54, 8);
    p.ctx.restore();
  },

  "kuala-lumpur"(p, _dest, t = 0) {
    p.sky(["#101B2C", "#1C335C"]);
    const stars = [[24, 28], [70, 18], [120, 36], [250, 22], [280, 48], [40, 60], [200, 16]];
    stars.forEach(([x, y]) => p.ellipse("#F6E7C8", x, y, 0.8, 0.8));
    p.rect("#10182A", 0, 162, 300, 38);
    const blocks = [[12, 118, 28, 44, "#243656"], [250, 108, 34, 54, "#1A2744"], [214, 126, 24, 36, "#8E97A8"]];
    blocks.forEach(([x, y, w, h, color]) => p.rect(color, x, y, w, h));
    const tower = (x) => {
      p.poly("#E7E9EE", [[x, 18], [x - 3, 34], [x + 3, 34]]);
      p.rect("#D5D8E0", x - 7, 34, 14, 26);
      p.rect("#9AA3B2", x - 9, 58, 18, 8);
      p.rect("#E7E9EE", x - 8, 66, 16, 78);
      p.poly("#C9CED6", [[x - 12, 144], [x + 12, 144], [x + 16, 164], [x - 16, 164]]);
      for (let y = 74; y < 138; y += 8) {
        p.ctx.save();
        p.ctx.globalAlpha = 0.25 + 0.75 * Math.abs(Math.sin(t * 2.4 + y * 0.35 + x));
        p.rect(GOLD, x - 5, y, 2.2, 3);
        p.rect(GOLD, x + 2.4, y, 2.2, 3);
        p.ctx.restore();
      }
    };
    tower(132);
    tower(168);
    p.rect("#F4F6FA", 140, 62, 20, 6);
    p.poly("#D5D8E0", [[140, 68], [150, 76], [160, 68]]);
  },

  putrajaya(p) {
    p.sky(["#F6D5D8", "#E7C2D4", "#A9C6E8"]);
    const lake = p.ctx.createLinearGradient(0, p.Y(128), 0, p.h);
    lake.addColorStop(0, "#8FB4DC");
    lake.addColorStop(1, "#4E78B0");
    p.ctx.fillStyle = lake;
    p.ctx.fillRect(0, p.Y(128), p.w, p.h);
    const mosque = () => {
      p.rect("#E7A0B0", 46, 78, 10, 52);
      p.ellipse("#E7A0B0", 51, 74, 8, 8);
      p.rect("#F7F1EA", 48, 96, 6, 8);
      p.rect("#F7F1EA", 78, 104, 150, 26);
      for (let i = 0; i < 6; i += 1) {
        p.path("#E7A0B0", (c, X, Y) => {
          const x = 96 + i * 22;
          c.moveTo(X(x), Y(130));
          c.lineTo(X(x), Y(116));
          c.quadraticCurveTo(X(x + 8), Y(108), X(x + 16), Y(116));
          c.lineTo(X(x + 16), Y(130));
          c.closePath();
        });
      }
      p.ellipse("#E7A0B0", 168, 86, 34, 24);
      p.ellipse("#F3C3CC", 168, 80, 18, 12);
      p.rect("#F7F1EA", 166, 58, 4, 14);
      p.ellipse(GOLD, 168, 56, 3, 3);
    };
    mosque();
    reflect(p, 130, mosque);
  },

  labuan(p, _dest, t = 0) {
    p.sky([[0, "#1E5C92"], [0.62, "#3E88B0"], [1, "#F6C99A"]]);
    p.rect("#2E6F9E", 0, 118, 300, 28);
    p.rect("#1E587F", 0, 140, 300, 18);
    p.rect("#F2D7B5", 0, 156, 300, 44);
    p.stroke("rgba(255,241,215,0.35)", 0.8, [[0, 128], [300, 126]]);
    p.stroke("rgba(255,241,215,0.22)", 0.8, [[0, 146], [300, 150]]);
    const bob = Math.sin(t * 1.7) * 2.4;
    p.ctx.save();
    p.ctx.translate(Math.sin(t * 0.6) * 6 * p.sx, bob * p.sy);
    p.poly("#C46B3A", [[196, 112], [236, 112], [230, 122], [202, 122]]);
    p.rect("#F6E7C8", 212, 104, 12, 8);
    p.poly("#2A3148", [[224, 104], [224, 92], [234, 104]]);
    p.ctx.restore();
  },
};

function malaysiaDate(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Kuala_Lumpur",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  }).formatToParts(date);
  const pick = (type) => parts.find((part) => part.type === type)?.value || "";
  return `${pick("day")}.${pick("month")}.${pick("year")}`;
}

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + w, y, x + w, y + h, radius);
  ctx.arcTo(x + w, y + h, x, y + h, radius);
  ctx.arcTo(x, y + h, x, y, radius);
  ctx.arcTo(x, y, x + w, y, radius);
  ctx.closePath();
}

function motifPainter(ctx, x, y, w, h) {
  const X = (n) => x + (n / 100) * w;
  const Y = (n) => y + (n / 100) * h;
  return {
    poly(color, pts) {
      ctx.beginPath();
      pts.forEach(([px, py], index) => {
        const dx = X(px);
        const dy = Y(py);
        if (index === 0) ctx.moveTo(dx, dy);
        else ctx.lineTo(dx, dy);
      });
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    },
    rect(color, px, py, pw, ph) {
      ctx.fillStyle = color;
      ctx.fillRect(X(px), Y(py), (pw / 100) * w, (ph / 100) * h);
    },
    ell(color, px, py, rx, ry) {
      ctx.beginPath();
      ctx.ellipse(X(px), Y(py), (rx / 100) * w, (ry / 100) * h, 0, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    },
  };
}

function drawMotif(ctx, dest, x, y, w, h) {
  const m = motifPainter(ctx, x, y, w, h);
  const accent = dest.accent;
  switch (dest.id) {
    case "johor":
      m.rect(accent, 18, 28, 8, 62);
      m.rect(accent, 74, 28, 8, 62);
      m.poly(accent, [[16, 30], [22, 12], [28, 30]]);
      m.poly(accent, [[72, 30], [78, 12], [84, 30]]);
      m.ell(accent, 50, 48, 22, 16);
      m.rect(accent, 28, 58, 44, 28);
      break;
    case "kedah":
      m.rect(accent, 32, 28, 6, 62);
      m.rect(accent, 62, 36, 6, 54);
      m.ell(GOLD, 35, 24, 10, 14);
      m.ell(GOLD, 65, 30, 10, 14);
      break;
    case "kelantan":
      m.ell(accent, 42, 48, 28, 30);
      m.ell(CREAM, 58, 46, 20, 22);
      m.poly(accent, [[42, 8], [52, 28], [32, 28]]);
      m.rect(accent, 70, 48, 8, 46);
      break;
    case "melaka":
      m.rect(accent, 22, 42, 56, 36);
      m.poly(accent, [[16, 44], [50, 18], [84, 44]]);
      m.rect(GOLD, 32, 54, 10, 12);
      m.rect(GOLD, 58, 54, 10, 12);
      m.rect(accent, 30, 78, 4, 16);
      m.rect(accent, 66, 78, 4, 16);
      break;
    case "negeri-sembilan":
      m.poly(accent, [[8, 46], [28, 62], [50, 28], [72, 62], [92, 46], [80, 58], [50, 40], [20, 58]]);
      m.rect(accent, 28, 64, 44, 22);
      break;
    case "pahang":
      m.poly(accent, [[6, 82], [28, 40], [58, 70], [78, 30], [100, 82]]);
      m.rect(CREAM, 18, 58, 64, 3);
      m.rect(CREAM, 24, 68, 64, 3);
      break;
    case "perak":
      m.poly("#CDB8A4", [[8, 80], [22, 28], [40, 18], [52, 36], [48, 80]]);
      m.rect(accent, 50, 40, 36, 40);
      m.rect(INK, 58, 48, 8, 10);
      m.rect(INK, 72, 48, 8, 10);
      break;
    case "perlis":
      m.poly(accent, [[28, 84], [40, 28], [62, 18], [78, 36], [74, 84]]);
      m.rect("#7EA34A", 8, 72, 84, 12);
      break;
    case "pulau-pinang":
      m.rect("#F2C1C1", 8, 28, 24, 58);
      m.rect("#F6E3A1", 36, 18, 24, 68);
      m.rect("#B7D8C8", 64, 34, 26, 52);
      m.rect(accent, 14, 36, 8, 10);
      m.rect(accent, 44, 28, 8, 10);
      m.rect(accent, 72, 42, 8, 10);
      break;
    case "sabah":
      m.poly("#8AA4BE", [[4, 80], [28, 48], [50, 62], [70, 36], [100, 70], [100, 84], [0, 84]]);
      m.poly(accent, [[8, 84], [30, 58], [48, 70], [62, 28], [78, 52], [96, 84]]);
      break;
    case "sarawak":
      m.poly(GOLD, [[6, 48], [30, 28], [50, 36], [78, 20], [96, 46], [82, 52], [50, 44], [24, 56]]);
      m.rect(accent, 22, 56, 56, 18);
      m.rect(CREAM, 18, 74, 64, 6);
      break;
    case "selangor":
      m.poly("#CDB8A4", [[18, 88], [30, 24], [70, 16], [62, 88]]);
      [0, 1, 2, 3, 4].forEach((i) => m.rect(["#F6BE49", "#C4654A", "#1F7A74", "#F3E6D0"][i % 4], 34 + i * 2, 70 - i * 10, 36 - i * 3, 8));
      break;
    case "terengganu":
      m.rect("#E6C98A", 0, 74, 100, 18);
      m.rect(accent, 22, 30, 8, 50);
      m.poly(accent, [[26, 30], [4, 18], [22, 36]]);
      m.poly(accent, [[30, 28], [58, 12], [34, 38]]);
      m.poly(accent, [[28, 32], [8, 46], [24, 42]]);
      break;
    case "kuala-lumpur":
      m.rect(accent, 22, 18, 16, 70);
      m.rect(accent, 58, 18, 16, 70);
      m.rect(accent, 34, 36, 28, 6);
      m.poly(accent, [[24, 18], [30, 6], [36, 18]]);
      m.poly(accent, [[60, 18], [66, 6], [72, 18]]);
      break;
    case "putrajaya":
      m.rect(accent, 18, 28, 10, 58);
      m.ell(accent, 23, 24, 8, 8);
      m.ell(accent, 62, 48, 24, 18);
      m.rect(accent, 38, 62, 48, 20);
      break;
    default:
      m.poly(accent, [[18, 58], [70, 58], [62, 72], [26, 72]]);
      m.rect(accent, 40, 44, 14, 14);
      m.poly(INK, [[54, 44], [54, 28], [66, 44]]);
      break;
  }
}

function stampLines(name) {
  const words = name.toUpperCase().split(" ");
  if (words.length <= 2) return words;
  return [words.slice(0, -1).join(" "), words.at(-1)];
}

function punchHoles(ctx, x, y, w, h, radius) {
  ctx.save();
  ctx.globalCompositeOperation = "destination-out";
  ctx.fillStyle = "#000";
  const cols = Math.max(6, Math.round(w / (radius * 2.35)));
  const rows = Math.max(7, Math.round(h / (radius * 2.35)));
  const stepX = w / cols;
  const stepY = h / rows;
  const dot = (px, py) => {
    ctx.beginPath();
    ctx.arc(px, py, radius, 0, Math.PI * 2);
    ctx.fill();
  };
  for (let i = 0; i <= cols; i += 1) {
    dot(x + stepX * i, y);
    dot(x + stepX * i, y + h);
  }
  for (let i = 1; i < rows; i += 1) {
    dot(x, y + stepY * i);
    dot(x + w, y + stepY * i);
  }
  ctx.restore();
}

function cloud(p, x, y, scale, color, alpha) {
  p.ctx.save();
  p.ctx.globalAlpha = alpha;
  p.ellipse(color, x, y, 18 * scale, 7 * scale);
  p.ellipse(color, x + 14 * scale, y + 1, 12 * scale, 6 * scale);
  p.ellipse(color, x - 12 * scale, y + 2, 10 * scale, 5 * scale);
  p.ctx.restore();
}

function bird(p, x, y, color, flap) {
  const lift = Math.sin(flap) * 3.5;
  p.stroke(color, 1.35, [[x - 8, y + lift], [x, y], [x + 8, y + lift]]);
}

function shimmer(p, t, y) {
  p.ctx.save();
  p.ctx.globalAlpha = 0.55;
  const shift = (t * 42) % 46;
  for (let i = -1; i < 9; i += 1) {
    const x = i * 46 + shift;
    p.stroke("rgba(255,241,215,0.95)", 1.3, [[x, y], [x + 16, y - 1.2]]);
  }
  p.ctx.restore();
}

function bringToLife(p, id, t) {
  const salt = [...id].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const night = id === "kuala-lumpur";
  if (id !== "kelantan") {
    const travel = ((t * 16 + salt) % 420) - 60;
    const color = night ? "rgba(214,220,232,0.9)" : "#FFF8EA";
    cloud(p, travel, night ? 22 : 26, 1, color, night ? 0.22 : 0.72);
    cloud(p, travel - 150, 18, 0.7, color, night ? 0.16 : 0.5);
  }
  if (!night && id !== "kelantan") {
    const x = ((t * 28 + salt * 0.5) % 360) - 30;
    const y = 34 + (salt % 12);
    const darkSky = id === "johor" || id === "pulau-pinang" || id === "sabah" || id === "sarawak";
    const birdColor = darkSky ? "#F4E7C8" : "#2A3148";
    bird(p, x, y, birdColor, t * 7 + salt);
    bird(p, x - 22, y + 8, birdColor, t * 7 + 1.2);
  }
  const water = {
    melaka: 142,
    sarawak: 146,
    terengganu: 124,
    labuan: 132,
    putrajaya: 142,
  };
  if (water[id]) shimmer(p, t, water[id]);
  if (id === "kedah") {
    p.ctx.save();
    p.ctx.globalAlpha = 0.18 + 0.16 * Math.sin(t * 1.8);
    p.ellipse("#FFF6D2", 52, 70, 30, 30);
    p.ctx.restore();
  }
}

export function drawScene(ctx, dest, w, h, time = 0) {
  const scene = scenes[dest.id];
  if (!scene) return;
  const painter = makePainter(ctx, w, h);
  scene(painter, dest, time);
  bringToLife(painter, dest.id, time);
  finish(ctx, w, h);
}

export function hasScene(id) {
  return typeof scenes[id] === "function";
}

export function drawStamp(ctx, dest, w, h) {
  ctx.clearRect(0, 0, w, h);
  const radius = Math.min(w, h) * 0.038;
  const x = radius + 1;
  const y = radius + 1;
  const sw = w - (radius + 1) * 2;
  const sh = h - (radius + 1) * 2;
  roundRectPath(ctx, x, y, sw, sh, radius);
  ctx.fillStyle = dest.accent;
  ctx.fill();

  const inset = radius * 2.3;
  const ix = x + inset;
  const iy = y + inset;
  const iw = sw - inset * 2;
  const ih = sh - inset * 2;
  roundRectPath(ctx, ix, iy, iw, ih, radius * 0.8);
  ctx.fillStyle = CREAM;
  ctx.fill();
  drawMotif(ctx, dest, ix + iw * 0.1, iy + ih * 0.04, iw * 0.8, ih * 0.5);
  punchHoles(ctx, x, y, sw, sh, radius * 0.72);

  const lines = stampLines(dest.menu);
  const longest = lines.reduce((a, b) => (a.length > b.length ? a : b), "");
  let size = Math.floor(iw * (lines.length > 1 ? 0.12 : 0.14));
  ctx.fillStyle = INK;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  do {
    ctx.font = `700 ${size}px "Source Sans 3", "Segoe UI", sans-serif`;
    if (ctx.measureText(longest).width <= iw * 0.9) break;
    size -= 1;
  } while (size > 8);
  const block = lines.length * size * 1.05;
  const textTop = iy + ih * 0.6 + (ih * 0.34 - block) / 2;
  lines.forEach((line, index) => {
    ctx.fillText(line, ix + iw / 2, textTop + index * size * 1.05);
  });
}

function arcText(ctx, text, cx, cy, radius, center, spread, bottom) {
  const chars = [...text];
  if (!chars.length) return;
  const step = chars.length > 1 ? spread / (chars.length - 1) : 0;
  const start = bottom ? center + spread / 2 : center - spread / 2;
  const direction = bottom ? -1 : 1;
  const size = Math.max(8, Math.min(radius * 0.145, (radius * spread) / (chars.length * 0.62)));
  ctx.save();
  ctx.fillStyle = "#7C2D2A";
  ctx.font = `700 ${size}px "Source Sans 3", "Segoe UI", sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  chars.forEach((char, index) => {
    const angle = start + direction * step * index;
    ctx.save();
    ctx.translate(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius);
    ctx.rotate(bottom ? angle - Math.PI / 2 : angle + Math.PI / 2);
    ctx.fillText(char, 0, 0);
    ctx.restore();
  });
  ctx.restore();
}

export function drawPostmark(ctx, dest, w, h) {
  ctx.clearRect(0, 0, w, h);
  const cx = w * 0.5;
  const cy = h * 0.5;
  const radius = Math.min(w, h) * 0.38;
  ctx.strokeStyle = "#7C2D2A";
  ctx.fillStyle = "#7C2D2A";
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1.5, radius * 0.055);
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = Math.max(1, radius * 0.028);
  ctx.beginPath();
  ctx.arc(cx, cy, radius * 0.82, 0, Math.PI * 2);
  ctx.stroke();

  const place = dest.menu.toUpperCase();
  const topSpread = Math.min(1.55, 0.11 * place.length + 0.45);
  arcText(ctx, place, cx, cy, radius * 0.61, -Math.PI / 2, topSpread, false);
  arcText(ctx, "MALAYSIA", cx, cy, radius * 0.61, Math.PI / 2, 1.25, true);

  ctx.fillStyle = "#7C2D2A";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `700 ${Math.max(10, radius * 0.16)}px "Source Sans 3", "Segoe UI", sans-serif`;
  ctx.fillText(malaysiaDate(), cx, cy - radius * 0.02);

  ctx.lineWidth = Math.max(1, radius * 0.035);
  ctx.beginPath();
  const waveY = cy + radius * 0.24;
  for (let x = cx - radius * 1.15; x <= cx + radius * 1.2; x += 3) {
    const y = waveY + Math.sin((x - cx) * 0.09) * radius * 0.07;
    if (x === cx - radius * 1.15) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
}
