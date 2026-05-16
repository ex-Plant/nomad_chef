import { z } from "zod";

export const newsletterEmailSchema = z
  .email("Nieprawidłowy adres e-mail")
  .trim()
  .toLowerCase();

export const newsletterFormSchema = z.object({
  email: newsletterEmailSchema,
  acceptsPrivacy: z.boolean().refine((v) => v === true, {
    error: "Wymagana akceptacja polityki prywatności",
  }),
});

export type NewsletterFormValuesT = z.infer<typeof newsletterFormSchema>;

export const defaultNewsletterValues = (): NewsletterFormValuesT => ({
  email: "",
  acceptsPrivacy: false,
});
