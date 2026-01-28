import { useState, useMemo, useCallback } from "react";
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
import { useToast } from "@/hooks/use-toast";

const defaultRows: SeatingRow[] = [
  { id: 1, distFromScreen: 11, earHeight: 42, riserHeight: 0 },
  { id: 2, distFromScreen: 15, earHeight: 42, riserHeight: 10 },
];

/**
 * Main application page for AV Safeguard project analysis
 * Provides UI for configuring room, screen, and seating parameters
 */
const Index = () => {
  const { toast } = useToast();
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

  const analysis = useMemo(() => {
    try {
      return analyzeProject(config);
    } catch (error) {
      console.error("Analysis error:", error);
      toast({
        title: "Analysis Error",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive",
      });
      return null;
    }
  }, [config, toast]);

  const handleExportPDF = useCallback(() => {
    try {
      if (!analysis) {
        toast({
          title: "Export Error",
          description: "Cannot export: Analysis failed",
          variant: "destructive",
        });
        return;
      }
      generatePDFReport(config, analysis);
      toast({
        title: "Success",
        description: "PDF report exported successfully",
      });
    } catch (error) {
      console.error("PDF export error:", error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export PDF",
        variant: "destructive",
      });
    }
  }, [config, analysis, toast]);

  if (!analysis) {
    return (
      <div className="min-h-screen bg-background p-4 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-semibold">Unable to load analysis</p>
          <p className="text-sm text-muted-foreground">Please refresh the page</p>
        </div>
      </div>
    );
  }

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
                <p className="text-xs text-muted-foreground">Acoustic Analysis System</p>
              </div>
            </div>
            <Button
              onClick={handleExportPDF}
              variant="default"
              className="gap-2"
              aria-label="Export project analysis as PDF report"
            >
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Export Report</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Panel - Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <Tabs defaultValue="room" className="w-full">
              <TabsList className="grid w-full grid-cols-3" aria-label="Configuration sections">
                <TabsTrigger value="room" aria-label="Room configuration settings">
                  <Monitor className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Room</span>
                </TabsTrigger>
                <TabsTrigger value="screen" aria-label="Screen configuration settings">
                  <Ruler className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Screen</span>
                </TabsTrigger>
                <TabsTrigger value="seating" aria-label="Seating configuration settings">
                  <Volume2 className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Seating</span>
                </TabsTrigger>
              </TabsList>

              {/* Room Tab */}
              <TabsContent value="room" className="space-y-4">
                <div className="bg-card p-6 rounded-lg border">
                  <h2 className="text-lg font-semibold mb-4">Room Dimensions</h2>

                  <div className="grid gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="room-length">Length (feet)</Label>
                      <Input
                        id="room-length"
                        type="number"
                        min="1"
                        max="100"
                        value={roomLength}
                        onChange={(e) => setRoomLength(Number(e.target.value))}
                        aria-describedby="room-length-desc"
                      />
                      <p id="room-length-desc" className="text-xs text-muted-foreground">
                        Room length in feet
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="room-width">Width (feet)</Label>
                      <Input
                        id="room-width"
                        type="number"
                        min="1"
                        max="100"
                        value={roomWidth}
                        onChange={(e) => setRoomWidth(Number(e.target.value))}
                        aria-describedby="room-width-desc"
                      />
                      <p id="room-width-desc" className="text-xs text-muted-foreground">
                        Room width in feet
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="room-height">Height (feet)</Label>
                      <Input
                        id="room-height"
                        type="number"
                        min="1"
                        max="100"
                        value={roomHeight}
                        onChange={(e) => setRoomHeight(Number(e.target.value))}
                        aria-describedby="room-height-desc"
                      />
                      <p id="room-height-desc" className="text-xs text-muted-foreground">
                        Room height in feet
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label htmlFor="wall-construction">Wall Construction</Label>
                    <Select
                      value={wallConstruction}
                      onValueChange={(value) =>
                        setWallConstruction(value as WallConstruction)
                      }
                    >
                      <SelectTrigger id="wall-construction">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="wood">Wood Framing</SelectItem>
                        <SelectItem value="concrete">Concrete</SelectItem>
                        <SelectItem value="hybrid">Hybrid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>

              {/* Screen Tab */}
              <TabsContent value="screen" className="space-y-4">
                <div className="bg-card p-6 rounded-lg border">
                  <h2 className="text-lg font-semibold mb-4">Screen Configuration</h2>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="screen-size">Screen Size (inches)</Label>
                      <Input
                        id="screen-size"
                        type="number"
                        min="40"
                        max="600"
                        step="10"
                        value={screenSize}
                        onChange={(e) => setScreenSize(Number(e.target.value))}
                        aria-describedby="screen-size-desc"
                      />
                      <p id="screen-size-desc" className="text-xs text-muted-foreground">
                        Diagonal screen size in inches
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="aspect-ratio">Aspect Ratio</Label>
                      <Select
                        value={aspectRatio}
                        onValueChange={(value) =>
                          setAspectRatio(value as typeof aspectRatio)
                        }
                      >
                        <SelectTrigger id="aspect-ratio">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="16:9">16:9 (Standard)</SelectItem>
                          <SelectItem value="2.35:1">2.35:1 (Scope)</SelectItem>
                          <SelectItem value="2.40:1">2.40:1 (DCI/4K)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content-standard">Content Standard</Label>
                      <Select
                        value={contentStandard}
                        onValueChange={(value) =>
                          setContentStandard(value as ContentStandard)
                        }
                      >
                        <SelectTrigger id="content-standard">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Standard">Standard</SelectItem>
                          <SelectItem value="4K">4K UHD</SelectItem>
                          <SelectItem value="HDR">HDR</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Seating Tab */}
              <TabsContent value="seating" className="space-y-4">
                <div className="bg-card p-6 rounded-lg border">
                  <h2 className="text-lg font-semibold mb-4">Seating Configuration</h2>
                  <RowManager rows={rows} setRows={setRows} />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Panel - Results */}
          <aside className="space-y-4">
            <CertificationBadge
              rating={analysis.acousticRating}
              isCompliant={analysis.isCompliant}
            />
            <RoomModeAnalysis analysis={analysis} />
            <ResultsGrid analysis={analysis} />
          </aside>
        </div>
      </main>
    </div>
  );
};

export default Index;
