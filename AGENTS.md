<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep customer, admin, and technician dashboards in separate role-gated routes and query through the signed-in browser client; RLS remains the authoritative data boundary.
- Use a shared DashboardShell for the reference-style navigation and stat panels so dashboard layouts stay consistent.
- Admin AI access assistant: owner-only createServerFn (requireSupabaseAuth + has_role owner) reads auth users via admin client inside handler and calls Lovable AI Gateway Responses (openai/gpt-6-astra, streamed, consumed server-side). Why: keeps account data and AI key server-side.
