import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full bg-gray-900 text-white px-2.5 py-1 text-xs",
        className
      )}
      {...props}
    />
  );
}
