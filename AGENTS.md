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

## Application architecture
- Keep the receipt interaction in a browser-safe dedicated component rendered by the index route; audio initializes only after a user action to preserve SSR compatibility.
- Define receipt materials, hardware lighting, and print/tear keyframes through semantic global CSS tokens; the app uses Tailwind v4 rather than uploaded v3 configuration.
- Keep editable receipt data and total calculation shared between the live receipt and browser-generated vector PDF; unit price multiplied by quantity determines each line amount, with an optional total override.
- Receipt edits and undo/redo history are session-only frontend state; named presets persist only in browser localStorage, with no backend unless requested.
