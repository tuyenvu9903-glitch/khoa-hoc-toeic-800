// Canvas drawing shared by the chicken shooter games.
import { CHICKEN_W, H, SHIP_Y, W, type Fx } from "../../domain/shooter";

export type Star = { x: number; y: number; r: number; v: number; a: number };

export const EMOJI = '"Segoe UI Emoji","Apple Color Emoji","Noto Color Emoji",sans-serif';
export const TEXT = 'ui-sans-serif, system-ui, "Segoe UI", Roboto, sans-serif';

export function makeStars(): Star[] {
  return Array.from({ length: 70 }, () => ({
    x: Math.random() * W,
    y: Math.random() * H,
    r: 1 + Math.random() * 2,
    v: 8 + Math.random() * 30,
    a: 0.3 + Math.random() * 0.6,
  }));
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(/\s+/)) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxW) {
      lines.push(line);
      line = word;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

export type ChickenSprite = {
  id: number;
  x: number;
  y: number;
  label: string;
  /** "alive" covers any state not listed (e.g. locked). */
  state: string;
  t: number;
  /** Optional second line under the label (e.g. a spelling hint). */
  sub?: string | null;
  highlight?: boolean;
};

export function drawChicken(ctx: CanvasRenderingContext2D, c: ChickenSprite, time: number) {
  const alpha = c.state === "flee" ? Math.max(0, 1 - c.t * 1.6) : c.state === "wrong" ? Math.max(0, 1 - c.t * 0.9) : 1;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const bob = c.state !== "right" && c.state !== "wrong" && c.state !== "flee" ? Math.sin(time * 6 + c.id) * 3 : 0;
  if (c.state === "right") {
    if (c.t < 0.4) {
      ctx.font = `${56 + c.t * 120}px ${EMOJI}`;
      ctx.globalAlpha = 1 - c.t * 1.2;
      ctx.fillText("💥", c.x, c.y - 22);
    } else {
      ctx.font = `40px ${EMOJI}`;
      ctx.globalAlpha = Math.max(0, 1 - (c.t - 0.4) * 0.9);
      ctx.fillText("🍗", c.x, c.y - 22 - (c.t - 0.4) * 30);
    }
  } else {
    ctx.font = `46px ${EMOJI}`;
    ctx.save();
    ctx.translate(c.x, c.y - 22 + bob);
    if (c.state === "wrong") ctx.rotate(c.t * 6);
    ctx.fillText("🐔", 0, 0);
    ctx.restore();
  }

  // Label board
  let size = 15;
  let lines: string[] = [];
  for (; size >= 12; size -= 1) {
    ctx.font = `700 ${size}px ${TEXT}`;
    lines = wrapText(ctx, c.label, CHICKEN_W - 16);
    if (lines.length <= 2) break;
  }
  const lh = size + 3;
  const bh = lines.length * lh + 12;
  const bx = c.x - CHICKEN_W / 2;
  const by = c.y + 6;
  const subH = c.sub ? 20 : 0;
  roundRect(ctx, bx, by, CHICKEN_W, bh + subH, 12);
  ctx.fillStyle = c.state === "right" ? "#bbf7d0" : c.state === "wrong" ? "#fecaca" : "rgba(255,255,255,0.96)";
  ctx.shadowColor = "rgba(0,0,0,0.35)";
  ctx.shadowBlur = 10;
  ctx.fill();
  ctx.shadowBlur = 0;
  if (c.highlight) {
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#60a5fa";
    ctx.stroke();
  }
  ctx.fillStyle = "#1e1b4b";
  ctx.font = `700 ${size}px ${TEXT}`;
  lines.forEach((l, i) => ctx.fillText(l, c.x, by + 6 + lh * i + lh / 2));
  if (c.sub) {
    // Shrink the hint until it fits inside the board, so long words stay readable.
    let hintSize = 15;
    for (; hintSize > 8; hintSize -= 1) {
      ctx.font = `700 ${hintSize}px ui-monospace, Consolas, monospace`;
      if (ctx.measureText(c.sub).width <= CHICKEN_W - 16) break;
    }
    ctx.fillStyle = "#1d4ed8";
    ctx.fillText(c.sub, c.x, by + bh + subH / 2 - 4);
  }
  ctx.restore();
}

export function drawShip(ctx: CanvasRenderingContext2D, x: number, time: number, blink: boolean) {
  if (blink && Math.floor(time * 12) % 2 === 0) return;
  ctx.save();
  ctx.translate(x, SHIP_Y);
  const flicker = 6 + Math.sin(time * 40) * 3;
  const flame = ctx.createLinearGradient(0, 14, 0, 36 + flicker);
  flame.addColorStop(0, "#fde047");
  flame.addColorStop(1, "rgba(251,113,133,0)");
  ctx.fillStyle = flame;
  ctx.beginPath();
  ctx.moveTo(-9, 14);
  ctx.lineTo(0, 36 + flicker);
  ctx.lineTo(9, 14);
  ctx.closePath();
  ctx.fill();

  const body = ctx.createLinearGradient(-26, -30, 26, 24);
  body.addColorStop(0, "#e0e7ff");
  body.addColorStop(1, "#6d63f2");
  ctx.fillStyle = body;
  ctx.beginPath();
  ctx.moveTo(0, -30);
  ctx.lineTo(13, 4);
  ctx.lineTo(26, 22);
  ctx.lineTo(10, 16);
  ctx.lineTo(0, 24);
  ctx.lineTo(-10, 16);
  ctx.lineTo(-26, 22);
  ctx.lineTo(-13, 4);
  ctx.closePath();
  ctx.shadowColor = "rgba(129,140,248,0.8)";
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.fillStyle = "#38bdf8";
  ctx.beginPath();
  ctx.ellipse(0, -4, 6, 11, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#e879f9";
  ctx.fillRect(-3, 12, 6, 6);
  ctx.restore();
}

export function drawBackdrop(ctx: CanvasRenderingContext2D, time: number, stars: Star[]) {
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0f0c29");
  bg.addColorStop(0.6, "#2b1b6b");
  bg.addColorStop(1, "#5b2a9f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);
  for (const s of stars) {
    ctx.fillStyle = `rgba(255,255,255,${s.a})`;
    ctx.fillRect(s.x, (s.y + time * s.v) % H, s.r, s.r);
  }
}

export function drawDangerLine(ctx: CanvasRenderingContext2D, y: number) {
  ctx.strokeStyle = "rgba(251,113,133,0.35)";
  ctx.setLineDash([10, 10]);
  ctx.beginPath();
  ctx.moveTo(0, y);
  ctx.lineTo(W, y);
  ctx.stroke();
  ctx.setLineDash([]);
}

export function drawBullet(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.shadowColor = "#fde047";
  ctx.shadowBlur = 12;
  ctx.fillStyle = "#fef08a";
  roundRect(ctx, x - 3, y - 9, 6, 18, 3);
  ctx.fill();
  ctx.shadowBlur = 0;
}

export function drawFx(ctx: CanvasRenderingContext2D, fx: Fx[]) {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (const f of fx) {
    ctx.globalAlpha = Math.max(0, 1 - f.t / f.ttl);
    ctx.font = `800 20px ${TEXT}`;
    ctx.lineWidth = 4;
    ctx.strokeStyle = "rgba(15,12,41,0.85)";
    ctx.strokeText(f.text, f.x, f.y);
    ctx.fillStyle = f.color;
    ctx.fillText(f.text, f.x, f.y);
    ctx.globalAlpha = 1;
  }
}
