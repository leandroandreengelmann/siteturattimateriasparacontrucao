import * as React from "react"
import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-10 w-full min-w-0 rounded-lg border border-input bg-transparent px-3 py-1 text-base transition-all outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-muted/50 disabled:opacity-50 aria-invalid:border-error md:text-sm dark:bg-input/30 dark:disabled:bg-input/80",
        className
      )}
      {...props}
    />
  )
}

export { Input }
