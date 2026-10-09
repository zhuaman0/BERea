"use client";

import { useEffect, useRef } from "react";
import type { ConfiguratorTemplate, MaterialColor } from "./useConfiguratorStore";

const ISO_ANGLE  = Math.PI / 6;
const TILE_START = 56;
const TILE_MIN   = 28;
const TILE_MAX   = 140;

function toIso(x: number, y: number, z: number, rot: number, tile: number) {
  const rx =  x * Math.cos(rot) + z * Math.sin(rot);
  const rz = -x * Math.sin(rot) + z * Math.cos(rot);
  return {
    sx: (rx - rz) * Math.cos(ISO_ANGLE) * tile,
    sy: (rx + rz) * Math.sin(ISO_ANGLE) * tile - y * tile,
  };
}

function shadeHex(hex: string, factor: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v * factor)));
  return `rgb(${clamp(r)},${clamp(g)},${clamp(b)})`;
}

interface Box { x: number; y: number; z: number; w: number; h: number; d: number; color: string; }

function buildBoxes(bottomDoors: number, topDoors: number, hasIsland: boolean, color: string): Box[] {
  const boxes: Box[] = [];
  const bottom = Math.max(bottomDoors, 1);
  const uw = 1; const bh = 1.4; const depth = 0.9;
  boxes.push({ x: 0, y: 0, z: 0, w: bottom * uw, h: bh, d: depth, color });
  boxes.push({ x: 0, y: bh, z: -0.08, w: bottom * uw, h: 0.07, d: depth + 0.12, color: "#dde4ef" });
  if (topDoors > 0) {
    const tx = (bottom - topDoors) / 2;
    boxes.push({ x: tx, y: bh + 0.07 + 0.7, z: 0.15, w: topDoors * uw, h: 1.0, d: depth - 0.15, color });
  }
  if (hasIsland) {
    const iw = Math.max(bottom * uw * 0.6, 1);
    const ix = (bottom * uw - iw) / 2;
    boxes.push({ x: ix, y: 0,  z: depth + 1.5,  w: iw, h: bh,  d: depth,        color });
    boxes.push({ x: ix, y: bh, z: depth + 1.42, w: iw, h: 0.07, d: depth + 0.12, color: "#dde4ef" });
  }
  return boxes;
}

function drawSide(ctx: CanvasRenderingContext2D, box: Box, rot: number, tile: number) {
  const { x, y, z, w, h, d, color } = box;
  const pt = (px: number, py: number, pz: number) => toIso(px, py, pz, rot, tile);
  if (Math.sin(rot) >= 0) {
    const a = pt(x+w,y+h,z); const b = pt(x+w,y,z); const c = pt(x+w,y,z+d); const e = pt(x+w,y+h,z+d);
    ctx.beginPath(); ctx.moveTo(a.sx,a.sy); ctx.lineTo(b.sx,b.sy); ctx.lineTo(c.sx,c.sy); ctx.lineTo(e.sx,e.sy); ctx.closePath();
    ctx.fillStyle = shadeHex(color, 0.88); ctx.fill();
    ctx.strokeStyle = shadeHex(color, 0.7); ctx.lineWidth = 0.5; ctx.stroke();
  } else {
    const a = pt(x,y+h,z); const b = pt(x,y,z); const c = pt(x,y,z+d); const e = pt(x,y+h,z+d);
    ctx.beginPath(); ctx.moveTo(a.sx,a.sy); ctx.lineTo(b.sx,b.sy); ctx.lineTo(c.sx,c.sy); ctx.lineTo(e.sx,e.sy); ctx.closePath();
    ctx.fillStyle = shadeHex(color, 0.72); ctx.fill();
    ctx.strokeStyle = shadeHex(color, 0.6); ctx.lineWidth = 0.5; ctx.stroke();
  }
}

function drawTop(ctx: CanvasRenderingContext2D, box: Box, rot: number, tile: number) {
  const { x, y, z, w, h, d, color } = box;
  const pt = (px: number, py: number, pz: number) => toIso(px, py, pz, rot, tile);
  const tl = pt(x,y+h,z); const tr = pt(x+w,y+h,z); const br = pt(x+w,y+h,z+d); const bl = pt(x,y+h,z+d);
  ctx.beginPath(); ctx.moveTo(tl.sx,tl.sy); ctx.lineTo(tr.sx,tr.sy); ctx.lineTo(br.sx,br.sy); ctx.lineTo(bl.sx,bl.sy); ctx.closePath();
  ctx.fillStyle = shadeHex(color, 1.15); ctx.fill();
  ctx.strokeStyle = shadeHex(color, 0.75); ctx.lineWidth = 0.5; ctx.stroke();
}

function drawFrontFace(ctx: CanvasRenderingContext2D, x: number, y: number, zVal: number, w: number, h: number, rot: number, tile: number, color: string) {
  const pt = (px: number, py: number) => toIso(px, py, zVal, rot, tile);
  const INSET = 0.09;
  const bl = pt(x,y); const br = pt(x+w,y); const tr = pt(x+w,y+h); const tl = pt(x,y+h);
  ctx.beginPath(); ctx.moveTo(bl.sx,bl.sy); ctx.lineTo(br.sx,br.sy); ctx.lineTo(tr.sx,tr.sy); ctx.lineTo(tl.sx,tl.sy); ctx.closePath();
  ctx.fillStyle = shadeHex(color, 0.84); ctx.fill();
  if (w > INSET*2 && h > INSET*2) {
    const ibl = pt(x+INSET,y+INSET); const ibr = pt(x+w-INSET,y+INSET);
    const itr = pt(x+w-INSET,y+h-INSET); const itl = pt(x+INSET,y+h-INSET);
    ctx.beginPath(); ctx.moveTo(ibl.sx,ibl.sy); ctx.lineTo(ibr.sx,ibr.sy); ctx.lineTo(itr.sx,itr.sy); ctx.lineTo(itl.sx,itl.sy); ctx.closePath();
    ctx.fillStyle = color; ctx.fill();
    ctx.strokeStyle = shadeHex(color, 0.7); ctx.lineWidth = 0.4; ctx.stroke();
  }
}

function drawHandle(ctx: CanvasRenderingContext2D, x: number, y: number, z: number, rot: number, tile: number) {
  const p = toIso(x, y, z, rot, tile);
  ctx.beginPath(); ctx.arc(p.sx, p.sy, 4, 0, Math.PI*2);
  ctx.fillStyle = "#C0C0C0"; ctx.fill();
  ctx.strokeStyle = "#999"; ctx.lineWidth = 0.8; ctx.stroke();
}

interface Props {
  template: ConfiguratorTemplate;
  color: MaterialColor;
}

export function FurniturePreview({ template, color }: Props) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rotRef     = useRef(Math.PI / 6);
  const zoomRef    = useRef(TILE_START);
  const frameRef   = useRef(0);
  const dragging   = useRef(false);
  const lastX      = useRef(0);
  const pinchDist  = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      const dpr = window.devicePixelRatio;
      canvas!.width  = parent.clientWidth  * dpr;
      canvas!.height = parent.clientHeight * dpr;
      canvas!.style.width  = parent.clientWidth  + "px";
      canvas!.style.height = parent.clientHeight + "px";
      ctx!.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    const hex    = color.hex;
    const bottom = Math.max(template.bottomDoors, 1);
    const topDrs = template.topDoors;
    const uw     = 1; const bh = 1.4; const depth = 0.9;
    const topCabY = bh + 0.07 + 0.7;
    const topCabZ = 0.15;

    const boxes = buildBoxes(template.bottomDoors, template.topDoors, template.hasIsland, hex);

    function render() {
      const W = canvas!.clientWidth;
      const H = canvas!.clientHeight;
      const rot  = rotRef.current;
      const tile = zoomRef.current;
      ctx!.clearRect(0, 0, W, H);

      const grad = ctx!.createLinearGradient(0, H*0.4, 0, H);
      grad.addColorStop(0, "#f5f4f2");
      grad.addColorStop(1, "#ece9e4");
      ctx!.fillStyle = grad;
      ctx!.fillRect(0, 0, W, H);

      ctx!.save();
      const centroid = toIso((bottom*uw)/2, 0, depth/2, rot, tile);
      ctx!.translate(W/2 - centroid.sx, H*0.62 - centroid.sy);

      // Floor shadow
      const fl  = toIso(-0.4,       0, -0.4, rot, tile);
      const fr  = toIso(bottom+0.4, 0, -0.4, rot, tile);
      const fbr = toIso(bottom+0.4, 0,  1.8, rot, tile);
      const fbl = toIso(-0.4,       0,  1.8, rot, tile);
      ctx!.beginPath(); ctx!.moveTo(fl.sx,fl.sy); ctx!.lineTo(fr.sx,fr.sy);
      ctx!.lineTo(fbr.sx,fbr.sy); ctx!.lineTo(fbl.sx,fbl.sy); ctx!.closePath();
      ctx!.fillStyle = "rgba(15,23,42,0.06)"; ctx!.fill();

      for (const box of boxes) drawSide(ctx!, box, rot, tile);

      if (Math.cos(rot) >= 0) {
        for (let i = 0; i < bottom; i++) drawFrontFace(ctx!, i*uw, 0, 0, uw, bh, rot, tile, hex);
        for (let i = 0; i < topDrs; i++) {
          const tx = (bottom - topDrs)/2 + i*uw;
          drawFrontFace(ctx!, tx, topCabY, topCabZ, uw, 1.0, rot, tile, hex);
        }
        for (let i = 0; i < bottom; i++) drawHandle(ctx!, i+0.5, 0.4, 0, rot, tile);
      }

      for (const box of boxes) drawTop(ctx!, box, rot, tile);
      ctx!.restore();
    }

    function animate() {
      frameRef.current = requestAnimationFrame(animate);
      if (!dragging.current) rotRef.current += 0.004;
      render();
    }
    frameRef.current = requestAnimationFrame(animate);

    const onDown = (e: MouseEvent) => { dragging.current = true; lastX.current = e.clientX; canvas!.style.cursor = "grabbing"; };
    const onUp   = () => { dragging.current = false; canvas!.style.cursor = "grab"; };
    const onMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      rotRef.current += (e.clientX - lastX.current) * 0.012;
      lastX.current = e.clientX;
    };
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomRef.current = Math.max(TILE_MIN, Math.min(TILE_MAX, zoomRef.current * (e.deltaY < 0 ? 1.08 : 0.93)));
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        pinchDist.current = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
        dragging.current = false;
      } else { dragging.current = true; lastX.current = e.touches[0].clientX; }
    };
    const onTouchEnd  = () => { dragging.current = false; };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        const dist = Math.hypot(e.touches[0].clientX-e.touches[1].clientX, e.touches[0].clientY-e.touches[1].clientY);
        zoomRef.current = Math.max(TILE_MIN, Math.min(TILE_MAX, zoomRef.current + (dist-pinchDist.current)*0.4));
        pinchDist.current = dist;
      } else if (dragging.current) {
        rotRef.current += (e.touches[0].clientX - lastX.current) * 0.012;
        lastX.current = e.touches[0].clientX;
      }
    };

    canvas.addEventListener("mousedown",  onDown);
    canvas.addEventListener("mousemove",  onMove);
    canvas.addEventListener("wheel",      onWheel, { passive: false });
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    canvas.addEventListener("touchmove",  onTouchMove,  { passive: true });
    canvas.addEventListener("touchend",   onTouchEnd);
    window.addEventListener("mouseup",    onUp);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mouseup", onUp);
      canvas.removeEventListener("mousedown",  onDown);
      canvas.removeEventListener("mousemove",  onMove);
      canvas.removeEventListener("wheel",      onWheel);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("touchmove",  onTouchMove);
      canvas.removeEventListener("touchend",   onTouchEnd);
    };
  }, [template, color]);

  return (
    <canvas
      ref={canvasRef}
      style={{ display: "block", cursor: "grab", width: "100%", height: "100%" }}
    />
  );
}
