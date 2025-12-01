import * as React from "react";
import { cn } from "./utils";

export function Separator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div role="separator" aria-orientation="horizontal" className={cn("shrink-0 bg-gray-200 h-[1px] w-full", className)} {...props} />;
}
