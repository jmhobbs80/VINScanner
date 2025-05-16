
import { cn } from "@/lib/utils";

type LogoProps = {
  className?: string;
  textClassName?: string;
};

export function Logo({ className, textClassName }: LogoProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="h-8 w-8 rounded-md vin-gradient flex items-center justify-center">
        <span className="font-bold text-white text-lg">V</span>
      </div>
      <span className={cn("font-bold text-xl", textClassName)}>
        VINScanner
      </span>
    </div>
  );
}
