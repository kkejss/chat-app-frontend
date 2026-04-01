import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Ndihmes per te bashkuar klasa Tailwind pa konflikte (perdoret ne komponente UI)
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}