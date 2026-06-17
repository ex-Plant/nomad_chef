# Lessons Learned

> Append-only register of recurring rules and patterns. Re-read at start by /10x-frame, /10x-research, /10x-plan, /10x-plan-review, /10x-implement, /10x-impl-review.

## Redirect from the server after a mutating action — don't hand off via window.location

- **Context**: Any server action that mutates (sets a cookie / revalidates) and then sends the browser onward, especially cross-origin handoffs — e.g. `createOrder` → P24 paywall.
- **Problem**: A mutating server action triggers Next's automatic router refresh (an RSC re-fetch of the current route). That fetch races a client-side `window.location.href` navigation; WebKit cancels the in-flight load and flashes its native "this page couldn't load" error before the destination commits. Chromium tolerates the race, so the bug ships unnoticed.
- **Rule**: When a mutating server action must send the user onward, redirect from the server with `redirect()` (303) — never return a URL for the client to assign to `window.location`. The server redirect supersedes the post-mutation refresh, so there's no race.
- **Applies to**: plan, implement, impl-review

## The Lighthouse mobile score is misleading for this project — judge from field data, not the lab

- **Context**: Assessing home-page performance. The default Lighthouse/PageSpeed mobile run is the obvious yardstick, but this is a deliberately rich, animation- and image-heavy brand site whose audience comes from Instagram in Poland (mostly LTE/5G).
- **Problem**: The mobile lab preset is **hardwired** to _Slow 4G_ (1.6 Mbps, 150 ms RTT) + an _Emulated Moto G Power_ 4× CPU slowdown — you cannot change it in PageSpeed Insights, and the CLI/DevTools default to it too. For the real audience (Polish mobile averages ~110 Mbps; LTE ~64 Mbps) that network throttle is ~40× too slow, so it inflates the **network-bound** metrics into deep red (we saw LCP 17.5 s / 8.4 s, Speed Index ~8 s) while the metrics that are actually honest for a cheap phone — **TBT (~240 ms) and CLS (0)** — pass fine. We nearly shipped a risky hero change (removing the loader veil) to "fix" an LCP that only exists under that fiction. Two extra traps: the 4× CPU multiplier is _relative to the audit host_, so on a fast Mac it can **understate** a real budget phone; and the "Moto G4/G Power" label is anachronistic — it stands in for _cheap_, not _old_.
- **Rule**: Do not treat the lab Performance number as a verdict on real-user speed here. **Decompose the metrics**: discount the network-bound ones (LCP, Speed Index) as throttle artifacts; trust the device/layout-bound ones (TBT, CLS). Judge real UX from **CrUX field data** (the origin/field section of PSI) or, if traffic is too low for field data, a custom throttle matched to the audience (fast LTE network + keep the CPU multiplier). Use the lab score only as a _relative regression detector_, never an absolute target. Ship only fixes that help real users regardless of the throttle (e.g. CPU/main-thread cuts, contrast/a11y, load-priority ordering) — not ones chasing a fictional LCP.
- **Applies to**: research, plan, impl-review
