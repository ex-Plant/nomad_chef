"use client";

import { useEffect } from "react";

// fbq is injected as a global by the inline script in <MetaPixel>; there is no
// package providing its types, so declare the minimal surface we call.
declare global {
  interface Window {
    fbq?: (
      command: "track",
      event: "Purchase",
      params: {
        value: number;
        currency: string;
        content_name?: string;
        content_ids?: (string | number)[];
        content_type?: string;
        num_items?: number;
      },
      options?: { eventID: string },
    ) => void;
  }
}

type MetaPixelPurchasePropsT = {
  value: number;
  currency: string;
  orderNumber: string;
  contentName?: string;
  contentId?: string | number;
  numItems?: number;
};

export function MetaPixelPurchase({
  value,
  currency,
  orderNumber,
  contentName,
  contentId,
  numItems,
}: MetaPixelPurchasePropsT) {
  // Firing the conversion is a one-shot side effect on render — there is no
  // render output and no better hook for "do this once when shown".
  useEffect(() => {
    // No-ops when the pixel isn't present: dev/preview builds, or the visitor
    // declined measurement consent (the pixel script never loads).
    if (typeof window.fbq !== "function") return;

    // The download link lives for 72h, so the buyer can re-open this page.
    // Skip if we already counted this order in this browser; the eventID below
    // is Meta's own cross-device dedup backstop keyed on the same order.
    const storageKey = `fb_purchase_${orderNumber}`;
    try {
      if (localStorage.getItem(storageKey)) return;
    } catch {
      // localStorage can throw (private mode, blocked storage) — fall through
      // and still fire; eventID dedup keeps the count honest.
    }

    window.fbq(
      "track",
      "Purchase",
      {
        value,
        currency,
        content_type: "product",
        ...(contentName ? { content_name: contentName } : {}),
        ...(contentId != null ? { content_ids: [contentId] } : {}),
        ...(numItems != null ? { num_items: numItems } : {}),
      },
      { eventID: orderNumber },
    );

    try {
      localStorage.setItem(storageKey, "1");
    } catch {
      // ignore — see above
    }
  }, [value, currency, orderNumber, contentName, contentId, numItems]);

  return null;
}
