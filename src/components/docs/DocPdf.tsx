import { Document, Page, Text, View, StyleSheet, Svg, Path, Image } from "@react-pdf/renderer";
import { FOOTER, type Biz, type DocModel } from "./model";

// Brand colours (PDF renderer cannot read CSS variables).
const NAVY = "#0b1a33", GOLD = "#f2b81d", CYAN = "#22c7d6", INK = "#1d2433", MUTED = "#5b6475", LINE = "#d9dee7";

const s = StyleSheet.create({
  page: { paddingTop: 28, paddingBottom: 56, paddingHorizontal: 34, fontSize: 10, color: INK, fontFamily: "Helvetica", lineHeight: 1.35 },
  head: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", backgroundColor: NAVY, color: "#fff", margin: -28, marginHorizontal: -34, marginBottom: 18, paddingVertical: 18, paddingHorizontal: 34 },
  brand: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { fontSize: 15, fontFamily: "Helvetica-Bold", letterSpacing: 0.5 },
  tag: { fontSize: 8.5, color: GOLD, marginTop: 2 },
  contact: { fontSize: 8.5, textAlign: "right", color: "#dbe3f0" },
  titleRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", borderBottomWidth: 2, borderBottomColor: CYAN, paddingBottom: 6, marginBottom: 12 },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", color: NAVY, textTransform: "uppercase" },
  num: { fontSize: 10.5, fontFamily: "Helvetica-Bold" },
  meta: { fontSize: 9, color: MUTED, textAlign: "right" },
  parties: { flexDirection: "row", gap: 12, marginBottom: 12 },
  party: { flex: 1, borderWidth: 1, borderColor: LINE, borderRadius: 3, padding: 8 },
  plabel: { fontSize: 8, color: MUTED, textTransform: "uppercase", marginBottom: 3, fontFamily: "Helvetica-Bold" },
  th: { flexDirection: "row", backgroundColor: NAVY, color: "#fff", fontFamily: "Helvetica-Bold", fontSize: 9 },
  tr: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: LINE, fontSize: 9.5 },
  cell: { padding: 5, flex: 1 },
  totals: { alignSelf: "flex-end", width: 230, marginTop: 8 },
  trow: { flexDirection: "row", justifyContent: "space-between", paddingVertical: 2.5 },
  section: { marginTop: 10 },
  sh: { fontSize: 10, fontFamily: "Helvetica-Bold", color: NAVY, marginBottom: 2 },
  sigs: { flexDirection: "row", gap: 16, marginTop: 18 },
  sig: { flex: 1, borderTopWidth: 1, borderTopColor: INK, paddingTop: 4, fontSize: 9 },
  foot: { position: "absolute", bottom: 22, left: 34, right: 34, borderTopWidth: 1, borderTopColor: LINE, paddingTop: 6, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: MUTED },
  demo: { position: "absolute", top: 330, left: 90, fontSize: 64, color: "#e5484d", opacity: 0.12, transform: "rotate(-30deg)", fontFamily: "Helvetica-Bold" },
});

export function DocPdf({ doc, biz }: { doc: DocModel; biz: Biz }) {
  const num = new Set(doc.table?.numeric ?? []);
  return <Document title={`${doc.title} ${doc.number}`} author={biz.company_name}>
    <Page size="A4" style={s.page}>
      {doc.demo ? <Text style={s.demo} fixed>DEMO DATA</Text> : null}
      <View style={s.head}>
        <View style={s.brand}>
          <Svg width={26} height={30} viewBox="0 0 24 24"><Path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" fill={GOLD} /></Svg>
          <View><Text style={s.name}>{biz.company_name.toUpperCase()}</Text><Text style={s.tag}>{biz.tagline}</Text></View>
        </View>
        <View><Text style={s.contact}>{[biz.phone, biz.email, biz.address].filter(Boolean).join("\n")}</Text></View>
      </View>
      <View style={s.titleRow}>
        <View><Text style={s.title}>{doc.title}</Text><Text style={s.num}>{doc.number}</Text></View>
        <View>{[["Date", doc.date], ...doc.meta, ...(doc.status ? [["Status", doc.status]] : [])].map(([k, v]) => <Text key={k} style={s.meta}>{k}: {v}</Text>)}</View>
      </View>
      {doc.parties.length ? <View style={s.parties}>{doc.parties.map((p) => <View key={p.label} style={s.party}><Text style={s.plabel}>{p.label}</Text>{p.lines.filter(Boolean).map((l, i) => <Text key={i}>{l}</Text>)}</View>)}</View> : null}
      {doc.table && doc.table.rows.length ? <View>
        <View style={s.th}>{doc.table.head.map((h, i) => <Text key={i} style={[s.cell, i === 0 ? { flex: 3 } : {}, num.has(i) ? { textAlign: "right" } : {}]}>{h}</Text>)}</View>
        {doc.table.rows.map((r, ri) => <View key={ri} style={s.tr} wrap={false}>{r.map((c, i) => <Text key={i} style={[s.cell, i === 0 ? { flex: 3 } : {}, num.has(i) ? { textAlign: "right" } : {}]}>{c}</Text>)}</View>)}
      </View> : null}
      {doc.totals?.length ? <View style={s.totals}>{doc.totals.map(([k, v, b]) => <View key={k} style={[s.trow, b ? { borderTopWidth: 1.5, borderTopColor: NAVY, marginTop: 2, paddingTop: 4 } : {}]}><Text style={b ? { fontFamily: "Helvetica-Bold" } : {}}>{k}</Text><Text style={b ? { fontFamily: "Helvetica-Bold" } : {}}>{v}</Text></View>)}</View> : null}
      {doc.sections.filter((x) => x.body?.trim()).map((x) => <View key={x.heading} style={s.section} wrap={false}><Text style={s.sh}>{x.heading}</Text><Text>{x.body}</Text></View>)}
      {doc.signatures?.length ? <View style={s.sigs} wrap={false}>{doc.signatures.map((g) => <View key={g.label} style={{ flex: 1 }}>
        {g.image ? <Image src={g.image} style={{ height: 40, objectFit: "contain", marginBottom: 2 }} /> : <View style={{ height: 42 }} />}
        <View style={s.sig}><Text style={{ fontFamily: "Helvetica-Bold" }}>{g.label}</Text><Text>{g.name ?? ""}</Text><Text style={{ color: MUTED }}>{g.date ? `Date: ${g.date}` : "Date:"}</Text></View>
      </View>)}</View> : null}
      <View style={s.foot} fixed><Text>{FOOTER}</Text><Text>{doc.number}</Text><Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} /></View>
    </Page>
  </Document>;
}
