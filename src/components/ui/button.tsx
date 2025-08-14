import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const variantClass =
      variant === "secondary"
        ? "bg-gray-100 text-gray-900 hover:bg-gray-200"
        : variant === "ghost"
        ? "bg-transparent hover:bg-gray-100 text-gray-900"
        : "bg-black text-white hover:bg-gray-900";
    const sizeClass =
      size === "sm"
        ? "h-8 px-3 rounded-lg text-sm"
        : size === "lg"
        ? "h-11 px-5 rounded-xl"
        : "h-9 px-4 rounded-lg";
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center transition-colors",
          variantClass,
          sizeClass,
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
