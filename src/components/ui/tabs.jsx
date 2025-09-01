import * as React from "react";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

function Tabs({ className, ...props }) {
  return <TabsPrimitive.Root className={cn("flex flex-col gap-2", className)} {...props} />;
}

function TabsList({ className, ...props }) {
  return (
    <TabsPrimitive.List
      className={cn(
        "bg-gray-100 text-gray-700 inline-flex h-9 items-center justify-start rounded-lg p-[3px] gap-1",
        className
      )}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }) {
  return (
    <TabsPrimitive.Trigger
      className={cn(
        "inline-flex h-8 flex-1 items-center justify-center rounded-md border border-transparent px-3 text-sm font-medium transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none data-[state=active]:bg-white data-[state=active]:text-blue-900 data-[state=active]:shadow",
        className
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }) {
  return <TabsPrimitive.Content className={cn("flex-1 outline-none p-2", className)} {...props} />;
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
