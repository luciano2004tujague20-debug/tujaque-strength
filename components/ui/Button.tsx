// components/ui/Button.tsx
import * as React from "react";
import { cn } from "@/lib/utils"; // Asegurate de tener clsx y tailwind-merge instalados

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "ghost" | "outline";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={isLoading || props.disabled}
        className={cn(
          "btn-base relative overflow-hidden", // clase base definida en globals.css
          {
            "bg-emerald-500 text-zinc-950 hover:bg-emerald-400 font-bold shadow-lg shadow-emerald-900/20": variant === "primary",
            "bg-zinc-800/50 text-zinc-100 hover:bg-zinc-800 border border-zinc-700": variant === "ghost",
            "border border-zinc-700 bg-transparent hover:bg-zinc-800/50 text-zinc-300": variant === "outline",
            "h-9 px-4 text-xs": size === "sm",
            "h-12 px-6 text-base": size === "md",
            "h-14 px-8 text-lg": size === "lg",
          },
          className
        )}
        {...props}
      >
        {isLoading && (
          <span className="absolute inset-0 grid place-items-center bg-inherit">
            <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </span>
        )}
        <span className={cn(isLoading && "opacity-0")}>{children}</span>
      </button>
    );
  }
);
Button.displayName = "Button";
