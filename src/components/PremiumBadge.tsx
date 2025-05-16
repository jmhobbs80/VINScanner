
import { Badge } from "@/components/ui/badge";

type PremiumBadgeProps = {
  className?: string;
}

export default function PremiumBadge({ className }: PremiumBadgeProps) {
  return (
    <Badge 
      className={`bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs px-2 py-1 rounded-full font-medium ${className || ""}`}
    >
      Premium 🚀
    </Badge>
  );
}
