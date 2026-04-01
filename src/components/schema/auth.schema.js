import { z } from "zod";

export const LoginSchema = z.object({
  username: z
    .string()
    .min(3, "Username must have at keast 3 characters")
    .trim(),
  password: z
    .string()
    .min(8, "Password must have at least 8 characters"),
});

export const SignUpSchema = z.object({
  firstName: z.string().min(1, "First name is required").trim(),
  lastName:  z.string().min(1, "Last name is required").trim(),
  username:  z
    .string()
    .min(3, "Username must have at keast 3 characters")
    .trim(),
  phone: z
    .string()
    .min(7, "Phone number is not valid")
    .trim(),
  password: z
    .string()
    .min(8, "Password must have at least 8 characters"),
});