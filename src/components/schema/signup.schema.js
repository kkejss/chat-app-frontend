import { z } from "zod";

// Regex per fjalekalim te forte: min 8 karaktere, shifre, simbol, shkronje te madhe dhe te vogel
const passwordValidation = new RegExp(
  /^(?=.*\d)(?=.*[!@#$%^&*])(?=.*[a-z])(?=.*[A-Z]).{8,}$/
);

// Validim i te gjitha fushave per regjistrim (perdoret me react-hook-form)
export const SignUpSchema = z.object({
  firstName: z.string().min(2, {
    message: "First name must be at least 2 characters",
  }).max(100),
  lastName: z.string().min(2, {
    message: "Last name must be at least 2 characters",
  }).max(100),
  username: z.string().min(3, {
    message: "Username must be at least 3 characters",
  }),
  phone: z.string().min(7, {
    message: "Please enter a valid phone number",
  }),
  // Fjalekalimi verifikohet kunder regex-it te siper
  password: z.string().regex(passwordValidation, {
    message:
      "Password must be at least 8 characters and include an uppercase letter, a lowercase letter, a number, and a special character (!@#$%^&*)",
  }),
});