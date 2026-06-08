"use client";

import { useEffect, useRef } from "react";
import { useConfiguratorStore } from "./useConfiguratorStore";

// Isometric 3D furniture renderer — pure Canvas 2D, zero external deps

const ISO_ANGLE = Math.PI / 6; // 30 degrees
const TILE = 60;               // base unit in pixels

function toIso(x: number, y: number, z: number) {
  return {
    sx: (x - z) * Math.cos(ISO_ANGLE) * TILE,
    sy: (x + z) * Math.sin(ISO_ANGLE) * TILE - y * TILE,
  };
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return { r, g, b };
}

function shadeHex(hex: string, factor: number) {
  const { r, g, b } = hexToRgb(hex);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v * factor)));
  return `rgb(${clamp(r)},${clamp(g)},${clamp(b)})`;
}

interface Box {
  x: number; y: number; z: number;
  w: number; h: number; d: number;
  color: string;
  isHandle?: boolean;
}

function drawBox(ctx: CanvasRenderingContext2D, box: Box, alpha = 1) {
  const { x, y, z, w, h, d, color } = box;
  ctx.globalAlpha = alpha;

  // Top face
  const tl = toIso(x,     y + h, z);
  const tr = toIso(x + w, y + h, z);
  const br = toIso(x + w, y + h, z + d);
  const bl = toIso(x,     y + h, z + d);
  ctx.beginPath();
  ctx.moveTo(tl.sx, tl.sy);
  ctx.lineTo(tr.sx, tr.sy);
  ctx.lineTo(br.sx, br.sy);
  ctx.lineTo(bl.sx, bl.sy);
  ctx.closePath();
  ctx.fillStyle = shadeHex(color, 1.15);
  ctx.fill();
  ctx.strokeStyle = shadeHex(color, 0.75);
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Left face
  const ll_tl = toIso(x, y + h, z);
  const ll_bl = toIso(x, y,     z);
  const ll_br = toIso(x, y,     z + d);
  const ll_tr = toIso(x, y + h, z + d);
  ctx.beginPath();
  ctx.moveTo(ll_tl.sx, ll_tl.sy);
  ctx.lineTo(ll_bl.sx, ll_bl.sy);
  ctx.lineTo(ll_br.sx, ll_br.sy);
  ctx.lineTo(ll_tr.sx, ll_tr.sy);
  ctx.closePath();
  ctx.fillStyle = shadeHex(color, 0.72);
  ctx.fill();
  ctx.strokeStyle = shadeHex(color, 0.6);
  ctx.lineWidth = 0.5;
  ctx.stroke();

  // Right face
  const rl_tl = toIso(x + w, y + h, z);
  const rl_bl = toIso(x + w, y,     z);
  const rl_br = toIso(x + w, y,     z + d);
  const rl_tr = toIso(x + w, y + h, z + d);
  ctx.beginPath();
  ctx.moveTo(rl_tl.sx, rl_tl.sy);
  ctx.lineTo(rl_bl.sx, rl_bl.sy);
  ctx.lineTo(rl_br.sx, rl_br.sy);
  ctx.lineTo(rl_tr.sx, rl_tr.sy);
  ctx.closePath();
  ctx.fillStyle = shadeHex(color, 0.88);
  ctx.fill();
  ctx.strokeStyle = shadeHex(color, 0.7);
  ctx.lineWidth = 0.5;
  ctx.stroke();

  ctx.globalAlpha = 1;
}

function drawHandle(ctx: CanvasRenderingContext2D, x: number, y: number, z: number) {
  const p = toIso(x, y, z);
  ctx.beginPath();
  ctx.arc(p.sx, p.sy, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#C0C0C0";
  ctx.fill();
  ctx.strokeStyle = "#999";
  ctx.lineWidth = 0.8;
  ctx.stroke();
}

function buildBoxes(
  bottomDoors: number,
  topDoors: number,
  hasIsland: boolean,
  color: string,
): Box[] {
  const boxes: Box[] = [];
  const bottom = Math.max(bottomDoors, 1);
  const uw = 1; const bh = 1.4; const depth = 0.9;

  // Bottom cabinets
  for (let i = 0; i < bottom; i++) {
    boxes.push({ x: i * uw, y: 0, z: 0, w: uw, h: bh, d: depth, color });
    // Door line detail (slightly inset box)
    boxes.push({ x: i * uw + 0.06, y: 0.06, z: 0, w: uw - 0.12, h: bh - 0.12, d: 0.06, color: shadeHex(color, 0.92) });
  }

  // Countertop
  boxes.push({ x: -0.05, y: bh, z: -0.05, w: bottom * uw + 0.1, h: 0.07, d: depth + 0.1, color: "#dde4ef" });

  // Top cabinets
  for (let i = 0; i < topDoors; i++) {
    const tx = (bottom - topDoors) / 2 + i * uw;
    boxes.push({ x: tx, y: bh + 0.07 + 0.7, z: 0.15, w: uw, h: 1.0, d: depth - 0.15, color });
    boxes.push({ x: tx + 0.06, y: bh + 0.07 + 0.76, z: 0.15, w: uw - 0.12, h: 0.88, d: 0.06, color: shadeHex(color, 0.92) });
  }

  // Island
  if (hasIsland) {
    const iw = Math.max(bottom * uw * 0.6, 1);
    const ix = (bottom * uw - iw) / 2;
    boxes.push({ x: ix, y: 0, z: depth + 1.5, w: iw, h: bh, d: depth, color });
    boxes.push({ x: ix - 0.05, y: bh, z: depth + 1.45, w: iw + 0.1, h: 0.07, d: depth + 0.1, color: "#dde4ef" });
  }

  return boxes;
}

export function FurnitureScene() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotRef    = useRef(0);
  const frameRef  = useRef(0);
  const dragging  = useRef(false);
  const lastX     = useRef(0);

  const { selectedTemplate, selectedColor } = useConfiguratorStore();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      canvas!.width  = parent.clientWidth  * window.devicePixelRatio;
      canvas!.height = parent.clientHeight * window.devicePixelRatio;
      canvas!.style.width  = parent.clientWidth + "px";
      canvas!.style.height = parent.clientHeight + "px";
      ctx!.scale(window.devicePixelRatio, window.devicePixelRatio);
    }
    resize();
    window.addEventListener("resize", resize);

    const boxes = buildBoxes(
      selectedTemplate.bottomDoors,
      selectedTemplate.topDoors,
      selectedTemplate.hasIsland,
      selectedColor.hex,
    );

    const bottom = Math.max(selectedTemplate.bottomDoors, 1);
    const centerX = (bottom / 2);
    const centerZ = 0.45;

    function render() {
      const W = canvas!.clientWidth;
      const H = canvas!.clientHeight;
      ctx!.clearRect(0, 0, W, H);

      // Floor gradient
      const grad = ctx!.createLinearGradient(0, H * 0.45, 0, H);
      grad.addColorStop(0, "#f1f5f9");
      grad.addColorStop(1, "#e2e8f0");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, W, H);

      ctx!.save();
      ctx!.translate(W / 2, H * 0.62);

      // Draw floor shadow
      ctx!.beginPath();
      const fl = toIso(-0.4, 0, -0.4);
      const fr = toIso(bottom + 0.4, 0, -0.4);
      const fbr = toIso(bottom + 0.4, 0, 1.8);
      const fbl = toIso(-0.4, 0, 1.8);
      ctx!.moveTo(fl.sx, fl.sy);
      ctx!.lineTo(fr.sx, fr.sy);
      ctx!.lineTo(fbr.sx, fbr.sy);
      ctx!.lineTo(fbl.sx, fbl.sy);
      ctx!.closePath();
      ctx!.fillStyle = "rgba(15,23,42,0.06)";
      ctx!.fill();

      // Draw all boxes
      for (const box of boxes) {
        drawBox(ctx!, box);
      }

      // Draw handles on bottom cabinets
      for (let i = 0; i < bottom; i++) {
        drawHandle(ctx!, i + 0.5, 0.4, 0);
      }

      ctx!.restore();
    }

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      if (!dragging.current) {
        rotRef.current += 0.003;
      }
      // Oscillate TILE scale for subtle breathing effect
      const scale = 60 + Math.sin(rotRef.current * 2) * 1.5;
      Object.assign(window, { __TILE_OVERRIDE__: scale });
      render();
    }
    frameRef.current = requestAnimationFrame(animate);

    // Mouse drag to rotate (adjust Y offset for visual effect)
    const onDown = (e: MouseEvent) => { dragging.current = true; lastX.current = e.clientX; };
    const onUp   = () => { dragging.current = false; };
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const dx = e.clientX - lastX.current;
      lastX.current = e.clientX;
      rotRef.current += dx * 0.01;
    };
    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    canvas.addEventListener("mousemove", onMove);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("mousedown", onDown);
      canvas.removeEventListener("mousemove", onMove);
    };
  }, [selectedTemplate, selectedColor]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", cursor: "grab", width: "100%", height: "100%" }}
    />
  );
}
