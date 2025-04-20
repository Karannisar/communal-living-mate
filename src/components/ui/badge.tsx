import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground shadow-sm hover:bg-primary/80",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/80",
        outline: "text-foreground shadow-sm",
        success:
          "border-transparent bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100 shadow-sm hover:bg-green-200 dark:hover:bg-green-800",
        warning:
          "border-transparent bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100 shadow-sm hover:bg-yellow-200 dark:hover:bg-yellow-800",
        info:
          "border-transparent bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100 shadow-sm hover:bg-blue-200 dark:hover:bg-blue-800",
        gradient:
          "border-transparent bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-sm hover:opacity-90",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
