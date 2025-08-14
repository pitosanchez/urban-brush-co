import * as React from "react";
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";

export const Select = SelectPrimitive.Root;
export const SelectTrigger = React.forwardRef<
  HTMLButtonElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Trigger
    ref={ref}
    className={cn(
      "inline-flex h-9 w-full items-center justify-between rounded-lg border border-gray-300 bg-white px-3 text-sm",
      className
    )}
    {...props}
  />
));
SelectTrigger.displayName = "SelectTrigger";

export const SelectValue = SelectPrimitive.Value;
export const SelectContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Content
    ref={ref}
    className={cn(
      "overflow-hidden rounded-md border border-gray-200 bg-white shadow-md",
      className
    )}
    {...props}
  />
));
SelectContent.displayName = "SelectContent";

export const SelectItem = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<typeof SelectPrimitive.Item>
>(({ className, ...props }, ref) => (
  <SelectPrimitive.Item
    ref={ref}
    className={cn(
      "relative flex w-full cursor-pointer select-none items-center px-3 py-2 text-sm hover:bg-gray-100",
      className
    )}
    {...props}
  />
));
SelectItem.displayName = "SelectItem";
