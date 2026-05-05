import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
  {
    variants: {
      variant: {
        default: "bg-[var(--surface-3)] text-[color:var(--text-primary)] hover:bg-[var(--surface-4)] border border-[color:var(--border-color)]",
        glow: "bg-[color:var(--accent)] text-[color:var(--accent-foreground)] shadow-lg shadow-[color:var(--accent-glow)] hover:shadow-xl hover:brightness-110",
        destructive: "bg-rose-500/15 text-rose-500 border border-rose-500/20 hover:bg-rose-500/25",
        outline: "border border-[color:var(--border-color)] bg-transparent text-[color:var(--text-primary)] hover:bg-[var(--surface-2)] hover:border-[color:var(--border-strong)]",
        secondary: "bg-[var(--surface-2)] text-[color:var(--text-primary)] border border-[color:var(--border-color)] hover:bg-[var(--surface-3)]",
        ghost: "text-[color:var(--text-secondary)] hover:text-[color:var(--text-primary)] hover:bg-[var(--surface-2)]",
        link: "text-[color:var(--accent)] underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-8 rounded-lg px-3 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-9 w-9 rounded-lg",
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
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
})
Button.displayName = "Button"

export { Button, buttonVariants }