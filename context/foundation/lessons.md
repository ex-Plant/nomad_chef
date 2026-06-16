# Lessons Learned

> Append-only register of recurring rules and patterns. Re-read at start by /10x-frame, /10x-research, /10x-plan, /10x-plan-review, /10x-implement, /10x-impl-review.

## Redirect from the server after a mutating action — don't hand off via window.location

- **Context**: Any server action that mutates (sets a cookie / revalidates) and then sends the browser onward, especially cross-origin handoffs — e.g. `createOrder` → P24 paywall.
- **Problem**: A mutating server action triggers Next's automatic router refresh (an RSC re-fetch of the current route). That fetch races a client-side `window.location.href` navigation; WebKit cancels the in-flight load and flashes its native "this page couldn't load" error before the destination commits. Chromium tolerates the race, so the bug ships unnoticed.
- **Rule**: When a mutating server action must send the user onward, redirect from the server with `redirect()` (303) — never return a URL for the client to assign to `window.location`. The server redirect supersedes the post-mutation refresh, so there's no race.
- **Applies to**: plan, implement, impl-review
