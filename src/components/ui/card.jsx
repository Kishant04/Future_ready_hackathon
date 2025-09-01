import * as React from "react";
import { cn } from "@/lib/utils";

function Card({ className, children, ...props }) {
  return (
    <div
      className={cn("bg-white rounded-xl shadow-md flex flex-col gap-4 p-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CardContent({ className, children, ...props }) {
  return (
    <div className={cn("text-gray-900", className)} {...props}>
      {children}
    </div>
  );
}

export { Card, CardContent };
