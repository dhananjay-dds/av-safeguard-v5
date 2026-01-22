import { Shield, Check, AlertTriangle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface CertificationBadgeProps {
  certification: "CEDIA Compliant" | "Acceptable" | "Requires Revision";
  score: number;
}

const certConfig = {
  "CEDIA Compliant": {
    icon: Shield,
    className: "border-optimal bg-optimal/10 text-optimal",
    description: "Meets all CEDIA/CTA-CEB23 standards",
  },
  Acceptable: {
    icon: Check,
    className: "border-acceptable bg-acceptable/10 text-acceptable",
    description: "Minor deviations from optimal specs",
  },
  "Requires Revision": {
    icon: XCircle,
    className: "border-fail bg-fail/10 text-fail",
    description: "Critical issues must be addressed",
  },
};

export function CertificationBadge({
  certification,
  score,
}: CertificationBadgeProps) {
  const config = certConfig[certification];
  const Icon = config.icon;

  const getScoreColor = (s: number) => {
    if (s >= 90) return "text-optimal";
    if (s >= 70) return "text-acceptable";
    if (s >= 50) return "text-warning";
    return "text-fail";
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border-2 pulse-glow",
        config.className
      )}
    >
      <div className="flex-shrink-0">
        <Icon className="h-10 w-10" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-lg">{certification}</h3>
        <p className="text-sm opacity-80">{config.description}</p>
      </div>
      <div className="text-right">
        <div className={cn("text-4xl font-bold font-mono", getScoreColor(score))}>
          {score}
        </div>
        <div className="text-xs uppercase tracking-wider opacity-60">Score</div>
      </div>
    </div>
  );
}
