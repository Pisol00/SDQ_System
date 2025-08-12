// components/ui/sonner.tsx
"use client"

import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      position="top-right"
      expand={true}
      richColors={true}
      closeButton={true}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-slate-800 group-[.toaster]:border group-[.toaster]:border-blue-200 group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:px-4 group-[.toaster]:py-3 group-[.toaster]:transition-all group-[.toaster]:duration-300 group-[.toaster]:ease-out",
          description: "group-[.toast]:text-slate-600 group-[.toast]:text-sm group-[.toast]:mt-1 group-[.toast]:leading-relaxed",
          actionButton:
            "group-[.toast]:bg-blue-600 group-[.toast]:text-white group-[.toast]:hover:bg-blue-700 group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:transition-colors group-[.toast]:duration-200",
          cancelButton:
            "group-[.toast]:bg-slate-100 group-[.toast]:text-slate-600 group-[.toast]:hover:bg-slate-200 group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:text-sm group-[.toast]:font-medium group-[.toast]:transition-colors group-[.toast]:duration-200",
          closeButton:
            "group-[.toast]:bg-transparent group-[.toast]:text-slate-500 group-[.toast]:hover:text-slate-700 group-[.toast]:hover:bg-slate-100 group-[.toast]:rounded-md group-[.toast]:transition-colors group-[.toast]:duration-200",
          title: "group-[.toast]:text-sm group-[.toast]:font-semibold group-[.toast]:leading-none group-[.toast]:tracking-tight group-[.toast]:text-slate-800",
          success: "group-[.toast]:border-emerald-300 group-[.toast]:bg-emerald-50",
          error: "group-[.toast]:border-red-300 group-[.toast]:bg-red-50",
          warning: "group-[.toast]:border-amber-300 group-[.toast]:bg-amber-50",
          info: "group-[.toast]:border-blue-300 group-[.toast]:bg-blue-50",
        },
      }}
      gap={12}
      offset={20}
      visibleToasts={5}
      {...props}
    />
  )
}

export { Toaster }