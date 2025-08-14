import * as React from "react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

export type SwitchProps = React.ComponentPropsWithoutRef<
  typeof SwitchPrimitive.Root
>;

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ className, ...props }, ref) => (
    <SwitchPrimitive.Root
      ref={ref}
      className={cn(
        "relative inline-flex h-5 w-9 items-center rounded-full bg-gray-300 data-[state=checked]:bg-black transition-colors",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block h-4 w-4 translate-x-0.5 rounded-full bg-white transition-transform data-[state=checked]:translate-x-[18px]" />
    </SwitchPrimitive.Root>
  )
);
Switch.displayName = "Switch";
