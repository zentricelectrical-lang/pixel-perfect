/** One document model rendered both on screen (DocView) and as an A4 PDF (DocPdf). */
export type Biz = { company_name: string; tagline: string; phone?: string | null; email?: string | null; address?: string | null; payment_instructions?: string | null };
export type DocModel = {
  title: string;
  number: string;
  date: string;
  status?: string;
  demo?: boolean;
  meta: [string, string][];
  parties: { label: string; lines: string[] }[];
  table?: { head: string[]; rows: string[][]; numeric?: number[] };
  totals?: [string, string, boolean?][];
  sections: { heading: string; body: string }[];
  signatures?: { label: string; name?: string | null; image?: string | null; date?: string | null }[];
};
export const kes = (v: number | string | null | undefined) => `KSh ${Number(v ?? 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
export const dmy = (v?: string | null) => (v ? new Date(v).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" }) : "");
export const FOOTER = "Professional Electrical Solutions. Done Right.";
