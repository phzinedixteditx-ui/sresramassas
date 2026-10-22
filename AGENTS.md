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

- Stock changes must be confirmed by the database before showing success; use compare-and-set per-item writes so concurrent panels cannot replace each other's changes.
- All stock screens use the shared singleton-row subscription with reconnect/focus reconciliation; browser cache is only a fallback, not durable storage.
