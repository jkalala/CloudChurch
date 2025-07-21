import type React from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

interface DialogShellProps {
  children: React.ReactNode
  title?: string
  description?: string
  isOpen: boolean
  onClose: () => void
  className?: string
  size?: "sm" | "md" | "lg" | "xl"
}

const sizeClasses = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
}

export function DialogShell({
  children,
  title,
  description,
  isOpen,
  onClose,
  className,
  size = "md",
}: DialogShellProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn("w-full max-w-[90vw] sm:max-w-xl overflow-y-auto max-h-[90vh]", sizeClasses[size], className)}>
        {title && (
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </DialogHeader>
        )}
        {children}
      </DialogContent>
    </Dialog>
  )
}
