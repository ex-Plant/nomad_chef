import { useEffect } from "react";

/* Stripped-down scroll lock: just toggle html + body overflow on/off.

   No refcounting, no saved-styles snapshot. All callers cover the viewport
   with their own overlay while locked, so user touches never reach body
   (the iOS Safari rubber-band caveat doesn't apply in practice).

   Trade-off: if two owners ever overlap (e.g. hero loader still active when
   a dialog opens), the inner unmount will clear the lock while the outer
   still expects it. Promote back to the refcounted version below if that
   ever becomes a real path. */

export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;
    const { body, documentElement: html } = document;
    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    return () => {
      html.style.overflow = "";
      body.style.overflow = "";
      // Kept for back-compat — services-sticky listens to refresh ScrollTrigger.
      window.dispatchEvent(new CustomEvent("scroll-lock-released"));
    };
  }, [isLocked]);
}

/* -----------------------------------------------------------------------
   Previous refcounted version — kept commented for reference. Restore if
   the stripped version above ever causes overlap stomping.

import { useEffect } from "react";

type SavedStylesT = {
  bodyOverflow: string;
  bodyPaddingRight: string;
  htmlOverflow: string;
};

let lockCount = 0;
let savedStyles: SavedStylesT | undefined;

function acquireLock() {
  lockCount++;
  if (lockCount > 1) return; // already locked by another owner

  const { body, documentElement: html } = document;
  savedStyles = {
    bodyOverflow: body.style.overflow,
    bodyPaddingRight: body.style.paddingRight,
    htmlOverflow: html.style.overflow,
  };
  const scrollbarWidth = window.innerWidth - html.clientWidth;
  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
  if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
}

function releaseLock() {
  if (lockCount === 0) return;
  lockCount--;
  if (lockCount > 0 || !savedStyles) return;

  const { body, documentElement: html } = document;
  html.style.overflow = savedStyles.htmlOverflow;
  body.style.overflow = savedStyles.bodyOverflow;
  body.style.paddingRight = savedStyles.bodyPaddingRight;
  savedStyles = undefined;
  window.dispatchEvent(new CustomEvent("scroll-lock-released"));
}

export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;
    acquireLock();
    return releaseLock;
  }, [isLocked]);
}

----------------------------------------------------------------------- */
