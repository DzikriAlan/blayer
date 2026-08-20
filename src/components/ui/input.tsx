import * as React from "react"

import { cn } from "@/shared/lib/utils"

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { variant?: "underline" | "boxed" }
>(({ className, type, variant = "underline", ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "w-full bg-transparent font-mono text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-40",
        variant === "underline" &&
          "border-0 border-b-[3px] border-foreground px-0 py-2 focus:border-primary",
        variant === "boxed" &&
          "border-2 border-foreground bg-paper px-3 py-2 focus:border-primary",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
