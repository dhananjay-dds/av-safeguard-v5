export interface SeatingRow {
  id: number;
  distFromScreen: number; // feet
  earHeight: number; // inches from floor
  riserHeight: number; // inches
}

export type WallConstruction = "drywall" | "treated-drywall" | "mlv-drywall" | "hybrid" | "concrete";
export type ContentStandard = "SDR" | "HDR";
export type MaskingConfig = "fixed-240" | "motorized" | "16:9-no-masking";

export interface RoomDimensions {
  length: number; // feet
  width: number; // feet
  height: number; // feet
}

export interface ScreenConfig {
  size: number; // diagonal inches
  aspectRatio: "16:9" | "2.35:1" | "2.40:1";
  bottomEdgeHeight: number; // inches from floor
  maskingConfig: MaskingConfig;
}

export interface ProjectConfig {
  room: RoomDimensions;
  screen: ScreenConfig;
  rows: SeatingRow[];
  wallConstruction: WallConstruction;
  contentStandard: ContentStandard;
}

export interface RowAnalysis {
  rowId: number;
  distFromScreen: number;
  verticalViewingAngle: number; // degrees
  horizontalViewingAngle: number; // degrees
  vvaPass: boolean;
  hvaPass: boolean;
  sightlineBlocked: boolean;
  sightlineClearance: number | null; // inches, null for row 1
  overallStatus: "optimal" | "acceptable" | "warning" | "fail";
  notes: string[];
}

export type TreatmentType = "diaphragmatic" | "hybrid-bass-trap" | "broadband-porous";

export interface TreatmentPrescription {
  frequency: number;
  type: TreatmentType;
  description: string;
  depth: string;
  placement: string;
}

export interface RoomModeResult {
  frequency: number; // Hz
  type: "axial" | "tangential" | "oblique";
  axis: string;
  intensity: number; // 0-1, adjusted for wall damping
  isBassLeakage: boolean;
  treatment: TreatmentPrescription;
}

export interface RT60Analysis {
  untreatedRT60: number; // seconds
  targetRT60: number; // seconds (0.45s standard)
  coverageRequired: number; // percentage of surface area
  status: "optimal" | "acceptable" | "needs-treatment";
}

export interface AnalysisResult {
  rows: RowAnalysis[];
  roomModes: RoomModeResult[];
  bassLeakageWarning: boolean;
  wallDampingFactor: number;
  overallScore: number; // 0-100
  certification: "CEDIA Compliant" | "Acceptable" | "Requires Revision";
  rt60Analysis: RT60Analysis;
  treatmentPrescriptions: TreatmentPrescription[];
}
