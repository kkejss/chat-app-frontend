/* eslint-disable react-refresh/only-export-components */
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default:
          "bg-[#1a4a8a] text-[#e8f0fe] border border-[rgba(212,160,23,0.2)] hover:bg-[#1e5299] hover:border-[rgba(212,160,23,0.4)] shadow-[0_4px_14px_rgba(26,74,138,0.35)]",
        destructive:
          "bg-red-900 text-slate-50 hover:bg-red-800 border border-red-800",
        outline:
          "border border-[rgba(212,160,23,0.2)] bg-transparent text-[#e8f0fe] hover:bg-[rgba(212,160,23,0.06)] hover:border-[rgba(212,160,23,0.4)]",
        secondary:
          "bg-[#071e38] text-[#e8f0fe] border border-[rgba(212,160,23,0.15)] hover:bg-[#0a2545]",
        ghost:
          "text-[#e8f0fe] hover:bg-[rgba(212,160,23,0.06)] hover:text-[#d4a017]",
        link:
          "text-[#d4a017] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm:      "h-9 rounded-md px-3",
        lg:      "h-11 rounded-md px-8",
        icon:    "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const Button = React.forwardRef(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button, buttonVariants }