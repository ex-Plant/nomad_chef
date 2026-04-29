import { useEffect } from "react";

/* Reliable scroll lock with refcounting so multiple owners (mobile menu,
   lightbox, hero loader, …) can lock concurrently without stomping each
   other on cleanup.

   `overflow: hidden` on body alone fails on iOS Safari — you can still
   rubber-band the page. Pinning body with `position: fixed` and restoring the
   scroll offset on release is the only approach that holds up across
   iOS/Android/desktop. */

type SavedStylesT = {
  bodyOverflow: string;
  bodyPosition: string;
  bodyTop: string;
  bodyLeft: string;
  bodyRight: string;
  bodyWidth: string;
  bodyPaddingRight: string; /*  */
  htmlOverflow: string;
};

let lockCount = 0;
let savedScrollY = 0;
let savedStyles: SavedStylesT | undefined;

function acquireLock() {
  lockCount++;
  if (lockCount > 1) return; // already locked by another owner

  const { body, documentElement: html } = document;
  savedScrollY = window.scrollY;
  savedStyles = {
    bodyOverflow: body.style.overflow,
    bodyPosition: body.style.position,
    bodyTop: body.style.top,
    bodyLeft: body.style.left,
    bodyRight: body.style.right,
    bodyWidth: body.style.width,
    bodyPaddingRight: body.style.paddingRight,
    htmlOverflow: html.style.overflow,
  };
  const scrollbarWidth = window.innerWidth - html.clientWidth;

  /* Lock both html and body. body alone fails on iOS Safari (rubber-band);
     html alone fails on some Android Chromes (body still scrolls). */
  html.style.overflow = "hidden";
  body.style.overflow = "hidden";
  body.style.position = "fixed";
  body.style.top = `-${savedScrollY}px`;
  body.style.left = "0";
  body.style.right = "0";
  body.style.width = "100%";
  if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`;
}

function releaseLock() {
  if (lockCount === 0) return;
  lockCount--;
  if (lockCount > 0 || !savedStyles) return; // still held by another owner

  const { body, documentElement: html } = document;
  html.style.overflow = savedStyles.htmlOverflow;
  body.style.overflow = savedStyles.bodyOverflow;
  body.style.position = savedStyles.bodyPosition;
  body.style.top = savedStyles.bodyTop;
  body.style.left = savedStyles.bodyLeft;
  body.style.right = savedStyles.bodyRight;
  body.style.width = savedStyles.bodyWidth;
  body.style.paddingRight = savedStyles.bodyPaddingRight;
  savedStyles = undefined;
  // Two-arg form is always instant — bypasses html.scroll-smooth.
  window.scrollTo(0, savedScrollY);
  // Notify subscribers that the lock just released — used by GSAP
  // ScrollTrigger consumers (services-sticky) to refresh positions that were
  // computed against the locked layout (body { position: fixed; top: -Y }).
  window.dispatchEvent(new CustomEvent("scroll-lock-released"));
}

export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;
    acquireLock();
    return releaseLock;
  }, [isLocked]);
}
