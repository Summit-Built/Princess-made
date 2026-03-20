import { cn } from "@/lib/utils";

function Spinner({ className, size = 16, ...props }: { className?: string; size?: number } & React.ComponentProps<"span">) {
  return (
    <span
      role="status"
      aria-label="Loading"
      className={cn("inline-block rounded-full border-2 border-accent border-t-transparent animate-spin", className)}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}

export { Spinner };
