import type { ReactNode } from "react";
import { toneFor, label } from "@/lib/zec";

export function Chip({ s }: { s: string }) {
  return <span className={`inline-block whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${toneFor(s)}`}>{label(s)}</span>;
}
export function Box({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-border bg-card p-4 sm:p-5 ${className}`}>{title || action ? <div className="mb-3 flex flex-wrap items-center justify-between gap-2">{title ? <h2 className="font-semibold">{title}</h2> : <span />}{action}</div> : null}{children}</section>;
}
export function Field({ label: l, children, className = "" }: { label: string; children: ReactNode; className?: string }) {
  return <label className={`block space-y-1.5 text-sm ${className}`}><span className="font-medium">{l}</span>{children}</label>;
}
export function PageTitle({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return <div className="mb-6 flex flex-wrap items-end justify-between gap-3"><div>{eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}<h1 className="mt-1 text-2xl font-bold sm:text-3xl">{title}</h1></div>{action}</div>;
}
export function DemoTag({ show }: { show?: boolean | null }) {
  return show ? <span className="rounded bg-destructive/20 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-destructive">Demo data</span> : null;
}
