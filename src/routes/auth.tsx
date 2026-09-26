import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { SiteLayout, PageHeader } from "@/components/site/SiteLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Customer Login | Zentric Electrical Services" },
      {
        name: "description",
        content:
          "Sign in to your Zentric Electrical Services account to track quotes, jobs, invoices and receipts.",
      },
      { property: "og:title", content: "Customer Login | Zentric" },
      { property: "og:description", content: "Track your quotes, jobs and invoices." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { full_name: fullName.trim() },
          },
        });
        if (error) throw error;
        toast.success("Account created. You are signed in.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (error) throw error;
        toast.success("Welcome back.");
      }
      void navigate({ to: "/" });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Authentication failed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SiteLayout>
      <PageHeader
        eyebrow="Customer account"
        title={mode === "signin" ? "Sign in" : "Create an account"}
        description="Track your quotes, appointments, jobs, invoices and receipts in one place."
      />
      <section className="section">
        <div className="mx-auto max-w-md px-4">
          <form onSubmit={submit} className="space-y-4 rounded-md border border-border bg-card p-6">
            {mode === "signup" ? (
              <div className="space-y-2">
                <Label htmlFor="a-name">Full name</Label>
                <Input id="a-name" value={fullName} onChange={(e) => setFullName(e.target.value)} />
              </div>
            ) : null}
            <div className="space-y-2">
              <Label htmlFor="a-email">Email</Label>
              <Input
                id="a-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="a-password">Password</Label>
              <Input
                id="a-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"}
            </Button>
            <button
              type="button"
              className="w-full text-sm text-muted-foreground underline"
              onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
            >
              {mode === "signin"
                ? "New customer? Create an account"
                : "Already have an account? Sign in"}
            </button>
          </form>
        </div>
      </section>
    </SiteLayout>
  );
}
