import { z } from "zod";

// Validim i username dhe fjalekalimit per login (perdoret me react-hook-form)
export const LoginSchema = z.object({
  username: z.string().min(3, "Username must have at least 3 characters").trim(),
  password: z.string().min(8, "Password must have at least 8 characters"),
});