import * as React from "react"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-[color:var(--accent)] bg-[color:var(--accent-glow)] text-[color:var(--accent)]",
        secondary: "border-[color:var(--border-color)] bg-[var(--surface-2)] text-[color:var(--text-secondary)]",
        destructive: "border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400",
        outline: "border-[color:var(--border-strong)] text-[color:var(--text-secondary)]",
        cyan: "border-blue-500/20 bg-blue-500/12 text-blue-600 dark:text-blue-400",
        emerald: "border-emerald-500/20 bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
        amber: "border-amber-500/20 bg-amber-500/12 text-amber-600 dark:text-amber-400",
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