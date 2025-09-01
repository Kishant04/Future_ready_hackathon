import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

/**
 * Simple, HMR-safe button
 * Use 'asChild' to render as another element (Radix pattern)
 */
const Button = ({ className, asChild = false, ...props }) => {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center gap-2 px-4 py-2 h-9 text-sm font-medium rounded-md bg-blue-600 text-white hover:bg-blue-700 transition-all disabled:opacity-50 disabled:pointer-events-none focus:outline-none focus:ring-2 focus:ring-blue-500",
        className
      )}
      {...props}
    />
  );
};

// ✅ Named export
export { Button };

// ✅ Optional: default export for simpler imports
export default Button;


