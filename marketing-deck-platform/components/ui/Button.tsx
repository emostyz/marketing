import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "secondary" | "ghost" | "outline" | "destructive";
  asChild?: boolean;
  size?: "default" | "lg" | "sm";
}

const variantClasses = {
  default: "bg-blue-600 hover:bg-blue-700 text-white border-none shadow-none",
  secondary: "bg-white/10 border border-white/20 text-white hover:bg-white/20",
  ghost: "bg-transparent text-blue-600 hover:bg-blue-50 border-none",
  outline: "border border-blue-600 text-blue-600 bg-transparent hover:bg-blue-50",
  destructive: "bg-red-600 hover:bg-red-700 text-white border-none",
};

const sizeClasses = {
  sm: "px-3 py-1 text-xs",
  default: "px-4 py-2 text-sm",
  lg: "px-8 py-3 text-lg",
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button }; 