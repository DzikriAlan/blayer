import * as React from "react"

import { cn } from "@/shared/lib/utils"

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { variant?: "underline" | "boxed" }
>(({ className, type, variant = "boxed", ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "h-10 w-full text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground/70 disabled:cursor-not-allowed disabled:opacity-50",
        variant === "underline" &&
          "border-0 border-b border-border bg-transparent px-0 focus:border-primary",
        variant === "boxed" &&
          "rounded-lg border border-border bg-muted/40 px-3 focus:border-primary/70 focus:bg-muted/60 focus:ring-2 focus:ring-primary/25",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
