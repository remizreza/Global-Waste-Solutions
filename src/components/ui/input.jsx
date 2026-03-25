import { cn } from "@/lib/utils";

export const Input = ({ className, ...props }) => (
  <input
    className={cn(
      "flex h-14 w-full rounded-2xl border bg-white px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-ring",
      className,
    )}
    {...props}
  />
);
