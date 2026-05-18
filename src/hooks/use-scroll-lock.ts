import { useEffect } from "react";

/* iOS-safe scroll lock.

   `overflow: hidden` on <html>/<body> does NOT stop touch scroll on iOS
   Safari — the layout viewport still drags. The only reliable lock is to
   pin <body> with position: fixed + top: -scrollY, then restore scrollY
   on release. We keep the overflow toggle for desktop browsers and to
   suppress scrollbar flicker.

   No refcounting: all callers cover the viewport with their own overlay
   while locked, so two owners overlapping is not a real path. Promote
   back to the refcounted variant (kept below for reference) if it ever
   becomes one. */

export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;

    const { body, documentElement: html } = document;
    const scrollY = window.scrollY;

    const prev = {
      htmlOverflow: html.style.overflow,
      bodyOverflow: body.style.overflow,
      bodyPosition: body.style.position,
      bodyTop: body.style.top,
      bodyLeft: body.style.left,
      bodyRight: body.style.right,
      bodyWidth: body.style.width,
    };

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      html.style.overflow = prev.htmlOverflow;
      body.style.overflow = prev.bodyOverflow;
      body.style.position = prev.bodyPosition;
      body.style.top = prev.bodyTop;
      body.style.left = prev.bodyLeft;
      body.style.right = prev.bodyRight;
      body.style.width = prev.bodyWidth;
      // position:fixed reset window scroll to 0 — put it back.
      window.scrollTo(0, scrollY);
      // Kept for back-compat — services-sticky listens to refresh ScrollTrigger.
      window.dispatchEvent(new CustomEvent("scroll-lock-released"));
    };
  }, [isLocked]);
}

/* -----------------------------------------------------------------------
   Previous refcounted version — kept commented for reference. Restore if
   the single-owner version above ever causes overlap stomping.

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
