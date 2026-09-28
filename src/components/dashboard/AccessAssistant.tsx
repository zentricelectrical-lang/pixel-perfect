import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { ShieldQuestion, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { askAccessAssistant } from "@/lib/access-assistant.functions";

export function AccessAssistant() {
  const ask = useServerFn(askAccessAssistant);
  const [issue, setIssue] = useState("");
  const run = useMutation({ mutationFn: (text: string) => ask({ data: { issue: text } }) });
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-center gap-2"><ShieldQuestion className="h-5 w-5 text-primary" /><h3 className="font-semibold">Account & access assistant</h3></div>
      <p className="mt-1 text-sm text-muted-foreground">Describe a sign-in or permission problem in plain words. AI reviews your user roles and sign-in records and suggests steps.</p>
      <form className="mt-4 space-y-3" onSubmit={(e) => { e.preventDefault(); if (issue.trim().length >= 5) run.mutate(issue.trim()); }}>
        <Textarea value={issue} onChange={(e) => setIssue(e.target.value)} maxLength={2000} rows={3} placeholder="e.g. Our technician James signed up but can't see his jobs" />
        <Button type="submit" disabled={run.isPending || issue.trim().length < 5}>{run.isPending ? <><Loader2 className="animate-spin" /> Reviewing accounts…</> : "Get recommendations"}</Button>
      </form>
      {run.isError ? <p className="mt-4 text-sm text-destructive">{run.error instanceof Error ? run.error.message : "Something went wrong."}</p> : null}
      {run.data ? <div className="mt-4 rounded-md border border-border bg-secondary/40 p-4"><p className="mb-2 text-xs text-muted-foreground">Based on {run.data.accountsReviewed} account records. Review before acting.</p><div className="whitespace-pre-wrap text-sm leading-relaxed">{run.data.answer}</div></div> : null}
    </div>
  );
}
