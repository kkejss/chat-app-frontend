import * as React from "react"
import { cn } from "@/lib/utils"

const Input = React.forwardRef(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md px-3 py-2 text-sm transition-all outline-none",
        "bg-[rgba(255,255,255,0.04)] border border-[rgba(212,160,23,0.15)]",
        "text-[#e8f0fe] placeholder:text-[rgba(232,240,254,0.25)]",
        "focus:border-[rgba(212,160,23,0.45)] focus:bg-[rgba(212,160,23,0.04)] focus:ring-2 focus:ring-[rgba(212,160,23,0.08)]",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-[#e8f0fe]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }