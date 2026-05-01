export const EMAIL_STATUS = {
  pending: "pending",
  sent: "sent",
  failed: "failed",
} as const;

export type EmailStatusT = (typeof EMAIL_STATUS)[keyof typeof EMAIL_STATUS];
