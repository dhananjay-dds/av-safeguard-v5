import { useState, useMemo } from "react";
import {
  Monitor,
  Ruler,
  Volume2,
  FileText,
  Settings2,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RowManager } from "@/components/RowManager";
import { ResultsGrid } from "@/components/ResultsGrid";
import { RoomModeAnalysis } from "@/components/RoomModeAnalysis";
import { CertificationBadge } from "@/components/CertificationBadge";
import {
  ProjectConfig,
  SeatingRow,
  WallConstruction,
  ContentStandard,
  MaskingConfig,
} from "@/types/avTypes";
import { analyzeProject } from "@/utils/calculations";
import { generatePDFReport } from "@/utils/pdfGenerator";

const defaultRows: SeatingRow[] = [
  { id: 1, distFromScreen: 11, earHeight: 42, riserHeight: 0 },
  { id: 2, distFromScreen: 15, earHeight: 42, riserHeight: 10 },
];

const Index = () => {
  const [roomLength, setRoomLength] = useState(20);
  const [roomWidth, setRoomWidth] = useState(14);
  const [roomHeight, setRoomHeight] = useState(9);
  const [screenSize, setScreenSize] = useState(120);
  const [aspectRatio, setAspectRatio] = useState<"16:9" | "2.35:1" | "2.40:1">("16:9");
  const [bottomEdgeHeight, setBottomEdgeHeight] = useState(24);
  const [maskingConfig, setMaskingConfig] = useState<MaskingConfig>("fixed-240");
  const [rows, setRows] = useState<SeatingRow[]>(defaultRows);
  const [wallConstruction, setWallConstruction] = useState<WallConstruction>("hybrid");
  const [contentStandard, setContentStandard] = useState<ContentStandard>("HDR");

  const config: ProjectConfig = useMemo(
    () => ({
      room: { length: roomLength, width: roomWidth, height: roomHeight },
      screen: { size: screenSize, aspectRatio, bottomEdgeHeight, maskingConfig },
      rows,
      wallConstruction,
      contentStandard,
    }),
    [roomLength, roomWidth, roomHeight, screenSize, aspectRatio, bottomEdgeHeight, maskingConfig, rows, wallConstruction, contentStandard]
  );

  const analysis = useMemo(() => analyzeProject(config), [config]);

  const handleExportPDF = () => {
    generatePDFReport(config, analysis);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-xl font-bold header-gradient">AV SAFEGUARD</h1>
                <p className="text-xs text-muted-foreground font-mono">
                  V5 • CEDIA/CTA-CEB23 Physics Engine
                </p>
              </div>
            </div>
            <Button onClick={handleExportPDF} className="gap-2">
              <FileText className="h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Certification Badge */}
        <div className="mb-6 slide-up">
          <CertificationBadge
            certification={analysis.certification}
            score={analysis.overallScore}
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-1 space-y-6">
            <Tabs defaultValue="room" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-secondary">
                <TabsTrigger value="room" className="gap-1.5 text-xs">
                  <Ruler className="h-3.5 w-3.5" />
                  Room
                </TabsTrigger>
                <TabsTrigger value="screen" className="gap-1.5 text-xs">
                  <Monitor className="h-3.5 w-3.5" />
                  Screen
                </TabsTrigger>
                <TabsTrigger value="acoustics" className="gap-1.5 text-xs">
                  <Volume2 className="h-3.5 w-3.5" />
                  Acoustics
                </TabsTrigger>
              </TabsList>

              <TabsContent value="room" className="card-dashboard p-4 mt-4">
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Settings2 className="h-4 w-4" />
                    Room Dimensions
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Length (ft)
                      </Label>
                      <Input
                        type="number"
                        value={roomLength}
                        onChange={(e) => setRoomLength(Number(e.target.value))}
                        className="input-dark font-mono"
                        min={8}
                        max={50}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Width (ft)
                      </Label>
                      <Input
                        type="number"
                        value={roomWidth}
                        onChange={(e) => setRoomWidth(Number(e.target.value))}
                        className="input-dark font-mono"
                        min={8}
                        max={50}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Height (ft)
                      </Label>
                      <Input
                        type="number"
                        value={roomHeight}
                        onChange={(e) => setRoomHeight(Number(e.target.value))}
                        className="input-dark font-mono"
                        min={7}
                        max={20}
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="screen" className="card-dashboard p-4 mt-4">
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Monitor className="h-4 w-4" />
                    Screen Configuration
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Diagonal (in)
                      </Label>
                      <Input
                        type="number"
                        value={screenSize}
                        onChange={(e) => setScreenSize(Number(e.target.value))}
                        className="input-dark font-mono"
                        min={50}
                        max={200}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground">
                        Aspect Ratio
                      </Label>
                      <Select value={aspectRatio} onValueChange={(v) => setAspectRatio(v as typeof aspectRatio)}>
                        <SelectTrigger className="input-dark font-mono">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="16:9">16:9</SelectItem>
                          <SelectItem value="2.35:1">2.35:1 (Scope)</SelectItem>
                          <SelectItem value="2.40:1">2.40:1 (Ultra)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Bottom Edge Height (in from floor)
                    </Label>
                    <Input
                      type="number"
                      value={bottomEdgeHeight}
                      onChange={(e) => setBottomEdgeHeight(Number(e.target.value))}
                      className="input-dark font-mono"
                      min={12}
                      max={60}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Content Standard
                    </Label>
                    <Select value={contentStandard} onValueChange={(v) => setContentStandard(v as ContentStandard)}>
                      <SelectTrigger className="input-dark font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="SDR">SDR (45° limit)</SelectItem>
                        <SelectItem value="HDR">HDR (40° limit)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Masking Configuration
                    </Label>
                    <Select value={maskingConfig} onValueChange={(v) => setMaskingConfig(v as MaskingConfig)}>
                      <SelectTrigger className="input-dark font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fixed-240">Fixed 2.40:1 (Standard)</SelectItem>
                        <SelectItem value="motorized">Motorized Masking (Pro)</SelectItem>
                        <SelectItem value="16:9-no-masking">16:9 (No Masking)</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Masking affects sightline tolerance. No masking = stricter requirements.
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="acoustics" className="card-dashboard p-4 mt-4">
                <div className="space-y-4">
                  <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Volume2 className="h-4 w-4" />
                    Acoustic Properties
                  </h3>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">
                      Wall Construction
                    </Label>
                    <Select value={wallConstruction} onValueChange={(v) => setWallConstruction(v as WallConstruction)}>
                      <SelectTrigger className="input-dark font-mono">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="drywall">Drywall (Standard) - 0.50</SelectItem>
                        <SelectItem value="treated-drywall">Treated Drywall (Improved) - 0.70</SelectItem>
                        <SelectItem value="mlv-drywall">MLV + Drywall - 0.75</SelectItem>
                        <SelectItem value="hybrid">Hybrid (Concrete + Studs) - 0.85</SelectItem>
                        <SelectItem value="concrete">Concrete (Rigid) - 1.0</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Wall impedance affects bass response and room mode intensity.
                    Drywall allows bass frequencies to escape, reducing boominess
                    but causing leakage to adjacent rooms.
                  </p>
                </div>
              </TabsContent>
            </Tabs>

            {/* Row Manager */}
            <div className="card-dashboard p-4">
              <RowManager rows={rows} onChange={setRows} />
            </div>
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2 space-y-6">
            {/* Row Analysis Grid */}
            <div className="card-dashboard p-6">
              <ResultsGrid rows={analysis.rows} />
            </div>

            {/* Room Mode Analysis */}
            <div className="card-dashboard p-6">
              <RoomModeAnalysis
                modes={analysis.roomModes}
                wallConstruction={wallConstruction}
                dampingFactor={analysis.wallDampingFactor}
                bassLeakage={analysis.bassLeakageWarning}
                rt60Analysis={analysis.rt60Analysis}
                treatmentPrescriptions={analysis.treatmentPrescriptions}
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="card-dashboard p-4 text-center">
                <div className="text-2xl font-bold font-mono text-primary">
                  {rows.length}
                </div>
                <div className="text-xs text-muted-foreground">Rows</div>
              </div>
              <div className="card-dashboard p-4 text-center">
                <div className="text-2xl font-bold font-mono text-optimal">
                  {analysis.rows.filter((r) => r.overallStatus === "optimal").length}
                </div>
                <div className="text-xs text-muted-foreground">Optimal</div>
              </div>
              <div className="card-dashboard p-4 text-center">
                <div className="text-2xl font-bold font-mono text-warning">
                  {analysis.rows.filter((r) => r.overallStatus === "warning").length}
                </div>
                <div className="text-xs text-muted-foreground">Warnings</div>
              </div>
              <div className="card-dashboard p-4 text-center">
                <div className="text-2xl font-bold font-mono text-fail">
                  {analysis.rows.filter((r) => r.overallStatus === "fail").length}
                </div>
                <div className="text-xs text-muted-foreground">Failures</div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-8 py-4">
        <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
          <p>AV Safeguard V5 • Consultant-Grade Physics Engine</p>
          <p className="mt-1">CEDIA/CTA-CEB23 Compliant Analysis • Built for Professional Integrators</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
