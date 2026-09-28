import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const askAccessAssistant = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) => z.object({ issue: z.string().trim().min(5).max(2000) }).parse(d))
  .handler(async ({ data, context }) => {
    const { data: isOwner, error } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "owner" });
    if (error || !isOwner) throw new Error("Only the super admin can use the access assistant.");
    const { buildAccountSnapshot, recommendAccessSteps } = await import("./access-assistant.server");
    const snapshot = await buildAccountSnapshot();
    const answer = await recommendAccessSteps(data.issue, snapshot);
    return { answer, accountsReviewed: snapshot.length };
  });
