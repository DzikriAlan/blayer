import { cn } from "@/shared/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "animate-pulse border-2 border-foreground bg-muted",
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
