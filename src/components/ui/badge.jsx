/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors border",
  {
    variants: {
      variant: {
        default:
          "border-[rgba(212,160,23,0.3)] bg-[#0a2545] text-[#f5dcaa]",
        secondary:
          "border-[rgba(212,160,23,0.15)] bg-[#051428] text-[rgba(232,240,254,0.7)]",
        destructive:
          "border-transparent bg-red-900 text-red-200",
        outline:
          "border-[rgba(212,160,23,0.25)] text-[#e8f0fe] bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }