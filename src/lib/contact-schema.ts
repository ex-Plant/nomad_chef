import { z } from "zod";

export const contactFormSchema = z.object({
  email: z.email('"Nieprawidłowy adres e-mail"').trim(),
  message: z.string().trim().max(5000),
});
