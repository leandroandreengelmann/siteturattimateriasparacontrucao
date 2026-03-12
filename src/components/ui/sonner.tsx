"use client"

import { useTheme } from "next-themes"
import { Toaster as Sonner, type ToasterProps } from "sonner"
import { CircleCheckIcon, InfoIcon, TriangleAlertIcon, OctagonXIcon, Loader2Icon } from "lucide-react"

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      icons={{
        success: (
          <CircleCheckIcon className="size-4" />
        ),
        info: (
          <InfoIcon className="size-4" />
        ),
        warning: (
          <TriangleAlertIcon className="size-4" />
        ),
        error: (
          <OctagonXIcon className="size-4" />
        ),
        loading: (
          <Loader2Icon className="size-4 animate-spin" />
        ),
      }}
      toastOptions={{
        classNames: {
          toast: "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-none",
          description: "group-[.toast]:text-muted-foreground",
          actionButton: "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton: "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
          success: "group-[.toaster]:bg-blue-600 group-[.toaster]:text-white group-[.toaster]:border-transparent group-[.toaster]:shadow-none",
          error: "group-[.toaster]:bg-red-600 group-[.toaster]:text-white group-[.toaster]:border-transparent group-[.toaster]:shadow-none",
          info: "group-[.toaster]:bg-blue-500 group-[.toaster]:text-white group-[.toaster]:border-transparent group-[.toaster]:shadow-none",
          warning: "group-[.toaster]:bg-amber-500 group-[.toaster]:text-white group-[.toaster]:border-transparent group-[.toaster]:shadow-none",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
