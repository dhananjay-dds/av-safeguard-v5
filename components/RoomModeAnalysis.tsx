import { Activity, AlertTriangle, Lightbulb, Timer } from "lucide-react";
import { RoomModeResult, WallConstruction, RT60Analysis, TreatmentPrescription } from "@/types/avTypes";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface RoomModeAnalysisProps {
  modes: RoomModeResult[];
  wallConstruction: WallConstruction;
  dampingFactor: number;
  bassLeakage: boolean;
  rt60Analysis: RT60Analysis;
  treatmentPrescriptions: TreatmentPrescription[];
}

export function RoomModeAnalysis({
  modes,
  wallConstruction,
  dampingFactor,
  bassLeakage,
  rt60Analysis,
  treatmentPrescriptions,
}: RoomModeAnalysisProps) {
  const getIntensityColor = (intensity: number) => {
    if (intensity > 0.7) return "bg-fail";
    if (intensity > 0.4) return "bg-warning";
    return "bg-optimal";
  };

  const getTreatmentIcon = (type: TreatmentPrescription["type"]) => {
    switch (type) {
      case "diaphragmatic":
        return "🔊";
      case "hybrid-bass-trap":
        return "🎚️";
      case "broadband-porous":
        return "🧱";
    }
  };

  const wallLabels: Record<WallConstruction, string> = {
    drywall: "Standard Residential (Drywall)",
    "treated-drywall": "Treated Drywall (Improved)",
    "mlv-drywall": "MLV + Drywall",
    hybrid: "Hybrid (Concrete + Studs)",
    concrete: "Concrete (Rigid)",
  };

  const rt60StatusColor = {
    optimal: "text-optimal",
    acceptable: "text-warning",
    "needs-treatment": "text-fail",
  };

  const rt60StatusLabel = {
    optimal: "Optimal",
    acceptable: "Acceptable",
    "needs-treatment": "Needs Treatment",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Room Modes & Acoustics</h3>
        </div>
        <span className="text-xs text-muted-foreground font-mono">
          CEDIA CEB-22
        </span>
      </div>

      {/* RT60 Analysis */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-secondary/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Untreated RT60</span>
          </div>
          <div className={cn("text-xl font-mono font-bold", rt60StatusColor[rt60Analysis.status])}>
            {rt60Analysis.untreatedRT60}s
          </div>
          <span className="text-xs text-muted-foreground">
            {rt60StatusLabel[rt60Analysis.status]}
          </span>
        </div>
        <div className="p-3 bg-secondary/50 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Timer className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Target RT60</span>
          </div>
          <div className="text-xl font-mono font-bold text-optimal">
            {rt60Analysis.targetRT60}s
          </div>
          <span className="text-xs text-muted-foreground">CEDIA Standard</span>
        </div>
      </div>

      {rt60Analysis.coverageRequired > 0 && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <p className="text-sm text-foreground">
            <span className="font-medium">Treatment Required:</span> ~{rt60Analysis.coverageRequired}% surface area coverage with acoustic treatment to reach target RT60.
          </p>
        </div>
      )}

      {/* Wall Construction Info */}
      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
        <span className="text-sm text-muted-foreground">Wall Construction</span>
        <span className="text-sm font-medium text-foreground">
          {wallLabels[wallConstruction]}
        </span>
      </div>

      <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
        <span className="text-sm text-muted-foreground">Damping Factor</span>
        <span className="font-mono text-primary">{dampingFactor.toFixed(2)}</span>
      </div>

      {bassLeakage && (
        <div className="p-3 bg-muted/50 border border-border rounded-lg">
          <div className="flex items-center gap-2 text-foreground mb-1">
            <Activity className="h-4 w-4 flex-shrink-0 text-primary" />
            <span className="text-sm font-medium">Standard Residential Construction</span>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Drywall is a flexible boundary (0.50 Damping). This is standard for most homes. 
            To improve bass containment, consider acoustic treatment or hybrid construction.
          </p>
        </div>
      )}

      {/* Treatment Prescriptions */}
      {treatmentPrescriptions.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span>Recommended Treatments</span>
          </div>
          <div className="space-y-2">
            {treatmentPrescriptions.map((treatment, index) => (
              <div
                key={index}
                className="p-3 bg-primary/5 border border-primary/20 rounded-lg flex items-start gap-3"
              >
                <span className="text-lg">{getTreatmentIcon(treatment.type)}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium text-foreground">
                    {treatment.description}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Depth: {treatment.depth}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mode Frequencies */}
      <div className="space-y-2">
        <div className="grid grid-cols-6 gap-2 text-xs text-muted-foreground uppercase tracking-wider pb-2 border-b border-border">
          <span>Frequency</span>
          <span>Type</span>
          <span>Axis</span>
          <span className="text-right">Intensity</span>
          <span>Placement</span>
          <span className="text-right">Rx</span>
        </div>

        <TooltipProvider>
          {modes.slice(0, 8).map((mode, index) => (
            <div
              key={index}
              className={cn(
                "grid grid-cols-6 gap-2 py-2 items-center fade-in",
                mode.isBassLeakage && "bg-warning/5 rounded px-2 -mx-2"
              )}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <span className="font-mono text-foreground text-sm">
                {mode.frequency} Hz
                {mode.isBassLeakage && (
                  <AlertTriangle className="h-3 w-3 text-warning inline ml-1" />
                )}
              </span>
              <span className="text-muted-foreground capitalize text-xs">
                {mode.type}
              </span>
              <span className="text-muted-foreground text-xs">{mode.axis}</span>
              <div className="flex items-center justify-end gap-2">
                <div className="meter-bar w-10">
                  <div
                    className={cn("meter-fill", getIntensityColor(mode.intensity))}
                    style={{ width: `${mode.intensity * 100}%` }}
                  />
                </div>
                <span className="font-mono text-xs text-muted-foreground w-5 text-right">
                  {(mode.intensity * 100).toFixed(0)}%
                </span>
              </div>
              <span className="text-xs text-muted-foreground truncate" title={mode.treatment.placement}>
                {mode.treatment.placement}
              </span>
              <div className="text-right">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="cursor-help text-lg">{getTreatmentIcon(mode.treatment.type)}</span>
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-xs">
                    <p className="font-medium">{mode.treatment.description}</p>
                    <p className="text-xs text-muted-foreground">Depth: {mode.treatment.depth}</p>
                    <p className="text-xs text-muted-foreground">Placement: {mode.treatment.placement}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
          ))}
        </TooltipProvider>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 pt-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-optimal" />
          Low
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-warning" />
          Medium
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-fail" />
          High
        </span>
      </div>
    </div>
  );
}
