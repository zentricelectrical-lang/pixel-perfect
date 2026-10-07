import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

/** Finger/mouse signature capture. Emits a PNG data URL (or null when cleared). */
export function SignaturePad({ value, onChange, disabled }: { value?: string | null; onChange: (v: string | null) => void; disabled?: boolean }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height);
    if (value) { const img = new Image(); img.onload = () => ctx.drawImage(img, 0, 0, c.width, c.height); img.src = value; }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const pos = (e: React.PointerEvent) => { const r = ref.current!.getBoundingClientRect(); return [(e.clientX - r.left) * (ref.current!.width / r.width), (e.clientY - r.top) * (ref.current!.height / r.height)]; };
  if (disabled) return value ? <img src={value} alt="Signature" className="h-24 rounded border border-border bg-white object-contain" /> : <p className="text-sm text-muted-foreground">Not signed</p>;
  return <div className="space-y-2">
    <canvas ref={ref} width={600} height={180} className="h-32 w-full touch-none rounded border border-border bg-white"
      onPointerDown={(e) => { drawing.current = true; const ctx = ref.current!.getContext("2d")!; ctx.lineWidth = 3; ctx.lineCap = "round"; ctx.strokeStyle = "#0b1a33"; ctx.beginPath(); const [x, y] = pos(e); ctx.moveTo(x, y); ref.current!.setPointerCapture(e.pointerId); }}
      onPointerMove={(e) => { if (!drawing.current) return; const ctx = ref.current!.getContext("2d")!; const [x, y] = pos(e); ctx.lineTo(x, y); ctx.stroke(); }}
      onPointerUp={() => { drawing.current = false; onChange(ref.current!.toDataURL("image/png")); }} />
    <Button type="button" size="sm" variant="outline" onClick={() => { const c = ref.current!; const ctx = c.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, c.width, c.height); onChange(null); }}>Clear signature</Button>
  </div>;
}
