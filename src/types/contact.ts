// Optional context attached to a help/contact message so the recipient can tie
// it back to a download or checkout flow.
export type ContactContextT = {
  surface: "download" | "checkout";
  status?: string;
  token?: string;
  orderNumber?: string;
};
