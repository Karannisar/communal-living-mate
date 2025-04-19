
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: number;
  className?: string;
}

export function Logo({ size = 24, className }: LogoProps) {
  return (
    <div 
      className={cn(
        "relative flex items-center justify-center rounded-md bg-primary text-primary-foreground font-bold",
        className
      )}
      style={{ width: size, height: size }}
    >
      <span className="text-xs">DM</span>
    </div>
  );
}
