import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";
import { createLovableAiGatewayRunIdFetch } from "./ai/run-id.server";

const MODEL = "openai/gpt-6-astra";

export async function buildAccountSnapshot() {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 200 });
  if (error) throw new Error("Could not read account records.");
  const { data: roles } = await supabaseAdmin.from("user_roles").select("user_id, role");
  const { data: techs } = await supabaseAdmin.from("technicians").select("profile_id, is_active");
  const { data: customers } = await supabaseAdmin.from("customers").select("profile_id, customer_number");
  return data.users.map((u) => ({
    id: u.id,
    email: u.email,
    name: u.user_metadata?.['full_name'] ?? u.user_metadata?.['name'] ?? null,
    created_at: u.created_at,
    last_sign_in_at: u.last_sign_in_at ?? null,
    email_confirmed: !!u.email_confirmed_at,
    sign_in_methods: (u.identities ?? []).map((i) => i.provider),
    banned_until: (u as { banned_until?: string }).banned_until ?? null,
    roles: (roles ?? []).filter((r) => r.user_id === u.id).map((r) => r.role),
    technician_record: (techs ?? []).find((t) => t.profile_id === u.id) ?? null,
    customer_number: (customers ?? []).find((c) => c.profile_id === u.id)?.customer_number ?? null,
  }));
}

export async function recommendAccessSteps(issue: string, snapshot: unknown) {
  const apiKey = process.env['LOVABLE_API_KEY'];
  if (!apiKey) throw new Error("AI is not configured for this app.");
  const gw = createLovableAiGatewayRunIdFetch();
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey,
    headers: { "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: gw.fetch,
  });
  const result = streamText({
    model: provider.responses(MODEL),
    system: `You are the account & access advisor for Zentric Electrical Services' internal admin system.
Roles: owner (full access), admin (operations: customers, enquiries, bookings, jobs, quotes, invoices, services, projects, reviews), technician (only assigned jobs; needs a technicians record linked to their profile), customer (only own data; needs a customers record for portal data).
Sign-in methods: email/password (requires confirmed email) and Google.
Given the super admin's description and the account records JSON, identify the affected account(s) and give concise, numbered, actionable steps (e.g. grant/remove a role, confirm email, link a technician record, ask the user to reset password, use Google sign-in, check they use the same email). Cite the exact email and current roles you based this on. If no matching account exists, say so and explain how to proceed. Never invent records. Warn before any step that grants owner/admin. Use short markdown.`,
    prompt: `Issue described by the super admin:\n${issue}\n\nAccount records (JSON):\n${JSON.stringify(snapshot)}`,
    providerOptions: {
      openai: {
        forceReasoning: true,
        reasoningEffort: "medium",
        reasoningSummary: "auto",
        store: false,
        include: ["reasoning.encrypted_content"],
      },
    },
  });
  try {
    const text = await result.text;
    if (!text.trim()) throw new Error("The AI returned no recommendation. Please try again later.");
    return text;
  } catch (e) {
    const status = (e as { statusCode?: number }).statusCode;
    if (status === 402) throw new Error("AI credits are used up. Add credits in your workspace billing to continue.");
    if (status === 429) throw new Error("The AI is busy right now. Please wait a minute and try again.");
    if (status === 403) throw new Error("AI access is blocked for this workspace.");
    throw e instanceof Error ? e : new Error("AI request failed.");
  }
}
