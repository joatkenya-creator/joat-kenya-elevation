import { z } from "zod";

export const ContactInput = z.object({
  first: z.string().trim().min(1).max(80),
  last: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(160),
  area: z.string().trim().min(1).max(120),
  message: z.string().trim().min(10).max(4000),
  source: z.string().trim().max(80).optional(),
});

export type ContactPayload = z.infer<typeof ContactInput>;
