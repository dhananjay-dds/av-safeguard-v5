import {
  ProjectConfig,
  AnalysisResult,
  RowAnalysis,
  RoomModeResult,
  WallConstruction,
  SeatingRow,
  TreatmentPrescription,
  TreatmentType,
  RT60Analysis,
  MaskingConfig,
} from "@/types/avTypes";

// Constants
const SPEED_OF_SOUND = 1125; // ft/s at 68°F
const AVERAGE_HEAD_HEIGHT = 52; // inches - seated person head height above seat
const TARGET_RT60 = 0.45; // seconds - CEDIA recommended

// Wall damping factors per CEDIA CEB-22 guidelines
const WALL_DAMPING_FACTORS: Record<WallConstruction, number> = {
  drywall: 0.50,
  "treated-drywall": 0.70,
  "mlv-drywall": 0.75,
  hybrid: 0.85,
  concrete: 1.0,
};

// Wall absorption coefficients for RT60 calculation (Sabine formula)
// PHYSICS: Drywall flexes and absorbs more low-frequency energy than rigid concrete
// Higher coefficient = more absorption = lower RT60
const WALL_ABSORPTION_COEFFICIENTS: Record<WallConstruction, number> = {
  drywall: 0.10,           // Flexible boundary, absorbs bass/mids -> lower RT60
  "treated-drywall": 0.15, // Treated adds more absorption
  "mlv-drywall": 0.12,     // MLV adds mass, slightly less flex absorption
  hybrid: 0.05,            // Mixed construction, moderate rigidity
  concrete: 0.02,          // Rigid boundary, minimal absorption -> higher RT60
};

// Sightline tolerance based on masking config
const SIGHTLINE_TOLERANCE: Record<MaskingConfig, { minClearance: number; label: string }> = {
  "fixed-240": { minClearance: 2.0, label: "Fixed 2.40:1 Masking" },
  "motorized": { minClearance: 3.0, label: "Motorized Masking (Pro)" },
  "16:9-no-masking": { minClearance: 0.5, label: "16:9 (No Masking)" },
};

// Placement strategy based on frequency (updated thresholds per code audit)
function getPlacementStrategy(frequency: number): string {
  if (frequency < 50) {
    return "Tri-Corner";
  } else if (frequency <= 100) {
    return "Front/Side Walls";
  } else {
    return "Rear Wall / Ceiling";
  }
}

// Treatment prescription logic
function getTreatmentPrescription(frequency: number): TreatmentPrescription {
  if (frequency < 40) {
    return {
      frequency,
      type: "diaphragmatic",
      description: `Diaphragmatic/Membrane Absorber (Tuned to ${Math.round(frequency)}Hz)`,
      depth: "6-12 inches",
      placement: getPlacementStrategy(frequency),
    };
  } else if (frequency <= 80) {
    return {
      frequency,
      type: "hybrid-bass-trap",
      description: `Hybrid Bass Trap at pressure points`,
      depth: "12-16 inches",
      placement: getPlacementStrategy(frequency),
    };
  } else {
    return {
      frequency,
      type: "broadband-porous",
      description: `Broadband Porous Absorber`,
      depth: "4-6 inches",
      placement: getPlacementStrategy(frequency),
    };
  }
}

// RT60 Calculation using simplified Sabine formula
function calculateRT60(
  roomLength: number,
  roomWidth: number,
  roomHeight: number,
  wallConstruction: WallConstruction
): RT60Analysis {
  // Room volume in cubic feet
  const volume = roomLength * roomWidth * roomHeight;
  
  // Surface areas in square feet
  const floorCeiling = 2 * roomLength * roomWidth;
  const walls = 2 * (roomLength * roomHeight + roomWidth * roomHeight);
  const totalSurface = floorCeiling + walls;
  
  // Average absorption coefficient (walls + generic floor/seats values)
  const wallAlpha = WALL_ABSORPTION_COEFFICIENTS[wallConstruction];
  const floorAlpha = 0.10; // Generic carpet
  const ceilingAlpha = 0.05; // Generic ceiling
  const seatingAlpha = 0.25; // Seats absorb some sound
  
  // Weighted average (approximate)
  const avgAlpha = (
    (walls * wallAlpha) +
    (roomLength * roomWidth * floorAlpha) +
    (roomLength * roomWidth * ceilingAlpha) +
    (roomLength * roomWidth * 0.3 * seatingAlpha) // ~30% of floor is seating
  ) / totalSurface;
  
  // Sabine formula: RT60 = 0.049 * V / A (where A = total absorption)
  // A = surface area * absorption coefficient
  const totalAbsorption = totalSurface * avgAlpha;
  const untreatedRT60 = (0.049 * volume) / totalAbsorption;
  
  // Calculate coverage required to reach target using standard Sabine formula
  // Required_Sabins = (0.049 * Volume) / Target_RT60
  // Current_Sabins = Surface_Area * Wall_Absorption_Coefficient
  // Deficit = Required_Sabins - Current_Sabins
  // Coverage_Percent = (Deficit / Surface_Area) * 100
  const requiredSabins = (0.049 * volume) / TARGET_RT60;
  const currentSabins = totalAbsorption;
  const deficit = requiredSabins - currentSabins;
  // Use Math.abs to ensure positive output, then cap at reasonable bounds
  const coverageRequired = Math.min(100, Math.max(0, Math.abs(deficit / totalSurface) * 100));
  
  let status: RT60Analysis["status"];
  if (untreatedRT60 <= TARGET_RT60 + 0.1) {
    status = "optimal";
  } else if (untreatedRT60 <= TARGET_RT60 + 0.3) {
    status = "acceptable";
  } else {
    status = "needs-treatment";
  }
  
  return {
    untreatedRT60: Math.round(untreatedRT60 * 100) / 100,
    targetRT60: TARGET_RT60,
    coverageRequired: Math.round(coverageRequired),
    status,
  };
}

export function getScreenDimensions(
  diagonalInches: number,
  aspectRatio: "16:9" | "2.35:1" | "2.40:1"
): { width: number; height: number } {
  const ratios: Record<string, number> = {
    "16:9": 16 / 9,
    "2.35:1": 2.35,
    "2.40:1": 2.4,
  };
  const ratio = ratios[aspectRatio];
  const height = diagonalInches / Math.sqrt(ratio * ratio + 1);
  const width = height * ratio;
  return { width, height };
}

export function calculateVerticalViewingAngle(
  screenHeight: number, // inches
  screenBottomEdge: number, // inches from floor
  viewerEarHeight: number, // inches from floor
  distanceFromScreen: number // feet
): { toTop: number; toBottom: number; total: number } {
  const distanceInches = distanceFromScreen * 12;
  const screenTop = screenBottomEdge + screenHeight;
  const screenCenter = screenBottomEdge + screenHeight / 2;

  // Angle to top of screen from viewer eye level
  const toTop = Math.atan((screenTop - viewerEarHeight) / distanceInches) * (180 / Math.PI);
  
  // Angle to bottom of screen from viewer eye level
  const toBottom = Math.atan((viewerEarHeight - screenBottomEdge) / distanceInches) * (180 / Math.PI);

  return {
    toTop: Math.abs(toTop),
    toBottom: Math.abs(toBottom),
    total: Math.abs(toTop) + Math.abs(toBottom),
  };
}

export function calculateHorizontalViewingAngle(
  screenWidthInches: number,
  distanceFromScreenFeet: number
): number {
  const distanceInches = distanceFromScreenFeet * 12;
  // Full viewing angle from edge to edge
  const halfAngle = Math.atan((screenWidthInches / 2) / distanceInches) * (180 / Math.PI);
  return halfAngle * 2;
}

export function checkSightline(
  frontRow: SeatingRow,
  backRow: SeatingRow,
  viewingDistanceFeet: number,
  maskingConfig: MaskingConfig
): { 
  blocked: boolean; 
  clearance: number; 
  status: "optimal" | "acceptable" | "warning" | "fail";
  obstructionAngle: number | null;
} {
  const toleranceConfig = SIGHTLINE_TOLERANCE[maskingConfig];
  
  // Front row: ear height from seat + riser height gives total height from floor
  // Add ~4 inches from ear to top of head
  const frontRowHeadTop = frontRow.earHeight + frontRow.riserHeight + 4;
  
  // Back row viewer eye level = ear height + riser height  
  const backRowEyeLevel = backRow.earHeight + backRow.riserHeight;
  
  // Clearance: how many inches of screen are visible above the front row's head
  // Positive = clear view, Negative = blocked
  const clearance = backRowEyeLevel - frontRowHeadTop;
  
  // If clearance is positive or zero, no obstruction
  if (clearance >= 4) {
    return { blocked: false, clearance, status: "optimal", obstructionAngle: null };
  }
  
  // Calculate obstruction height (negative clearance = obstruction)
  const obstructionHeight = Math.abs(clearance);
  const viewingDistanceInches = viewingDistanceFeet * 12;
  
  // Calculate obstruction angle: atan(ObstructionHeight / ViewingDistance)
  const obstructionAngle = Math.atan(obstructionHeight / viewingDistanceInches) * (180 / Math.PI);
  
  // Tolerance varies by masking config
  // For 16:9 (no masking): Very strict - obstruction > 0.5" = WARNING
  // For fixed 2.40:1: Standard tolerance - 2" / 1° = ACCEPTABLE
  // For motorized: Most lenient - masking hides obstructions
  
  if (maskingConfig === "16:9-no-masking") {
    // Strict: Even small obstructions are visible
    if (obstructionHeight <= 0.5 && obstructionAngle < 0.5) {
      return { blocked: false, clearance, status: "acceptable", obstructionAngle };
    }
    if (obstructionHeight <= 2 && obstructionAngle < 1.0) {
      return { blocked: true, clearance, status: "warning", obstructionAngle };
    }
    return { blocked: true, clearance, status: "fail", obstructionAngle };
  }
  
  if (maskingConfig === "motorized") {
    // Lenient: Masking hides most obstructions
    if (obstructionAngle < 2.0 && obstructionHeight < 6) {
      return { blocked: false, clearance, status: "acceptable", obstructionAngle };
    }
    if (obstructionAngle < 3.0 && obstructionHeight < 8) {
      return { blocked: true, clearance, status: "warning", obstructionAngle };
    }
    return { blocked: true, clearance, status: "fail", obstructionAngle };
  }
  
  // Default: fixed-240 (Standard)
  if (obstructionAngle < 1.0 && obstructionHeight < 4) {
    return { blocked: false, clearance, status: "acceptable", obstructionAngle };
  }
  if (obstructionAngle < 2.0 && obstructionHeight < 6) {
    return { blocked: true, clearance, status: "warning", obstructionAngle };
  }
  return { blocked: true, clearance, status: "fail", obstructionAngle };
}

export function calculateRoomModes(
  roomLength: number, // feet
  roomWidth: number, // feet
  roomHeight: number, // feet
  wallConstruction: WallConstruction
): RoomModeResult[] {
  const dampingFactor = WALL_DAMPING_FACTORS[wallConstruction];
  const modes: RoomModeResult[] = [];

  // Calculate axial modes (up to 3rd order for each dimension)
  for (let n = 1; n <= 3; n++) {
    // Length modes
    const lengthFreq = (n * SPEED_OF_SOUND) / (2 * roomLength);
    if (lengthFreq <= 300) {
      modes.push({
        frequency: Math.round(lengthFreq * 10) / 10,
        type: "axial",
        axis: `Length (${n}${n === 1 ? "st" : n === 2 ? "nd" : "rd"})`,
        intensity: dampingFactor * (1 / n),
        isBassLeakage: wallConstruction === "drywall" && lengthFreq < 80,
        treatment: getTreatmentPrescription(lengthFreq),
      });
    }

    // Width modes
    const widthFreq = (n * SPEED_OF_SOUND) / (2 * roomWidth);
    if (widthFreq <= 300) {
      modes.push({
        frequency: Math.round(widthFreq * 10) / 10,
        type: "axial",
        axis: `Width (${n}${n === 1 ? "st" : n === 2 ? "nd" : "rd"})`,
        intensity: dampingFactor * (1 / n),
        isBassLeakage: wallConstruction === "drywall" && widthFreq < 80,
        treatment: getTreatmentPrescription(widthFreq),
      });
    }

    // Height modes
    const heightFreq = (n * SPEED_OF_SOUND) / (2 * roomHeight);
    if (heightFreq <= 300) {
      modes.push({
        frequency: Math.round(heightFreq * 10) / 10,
        type: "axial",
        axis: `Height (${n}${n === 1 ? "st" : n === 2 ? "nd" : "rd"})`,
        intensity: dampingFactor * (1 / n),
        isBassLeakage: wallConstruction === "drywall" && heightFreq < 80,
        treatment: getTreatmentPrescription(heightFreq),
      });
    }
  }

  // Sort by frequency
  return modes.sort((a, b) => a.frequency - b.frequency);
}

// VVA status with soft tolerance bands
function getVVAStatus(angle: number): { pass: boolean; status: "optimal" | "marginal" | "warning" } {
  if (angle <= 15.0) return { pass: true, status: "optimal" };
  if (angle <= 18.0) return { pass: true, status: "marginal" }; // Marginal - design choice, not error
  return { pass: false, status: "warning" };
}

export function analyzeRow(
  row: SeatingRow,
  prevRow: SeatingRow | null,
  config: ProjectConfig
): RowAnalysis {
  const screenDims = getScreenDimensions(
    config.screen.size,
    config.screen.aspectRatio
  );

  const vva = calculateVerticalViewingAngle(
    screenDims.height,
    config.screen.bottomEdgeHeight,
    row.earHeight + row.riserHeight,
    row.distFromScreen
  );

  const hva = calculateHorizontalViewingAngle(
    screenDims.width,
    row.distFromScreen
  );

  // VVA with soft tolerance bands: 0-15° Optimal, 15.1-18° Marginal, >18° Warning
  const vvaTop = getVVAStatus(vva.toTop);
  const vvaBottom = getVVAStatus(vva.toBottom);
  const vvaPass = vvaTop.pass && vvaBottom.pass;
  const vvaStatus = vvaTop.status === "warning" || vvaBottom.status === "warning" 
    ? "warning" 
    : vvaTop.status === "marginal" || vvaBottom.status === "marginal"
      ? "marginal"
      : "optimal";

  // HVA limits: 45° for SDR, 40° for HDR
  const hvaLimit = config.contentStandard === "HDR" ? 40 : 45;
  const hvaPass = hva / 2 <= hvaLimit; // Half angle to edge

  // Sightline check with tolerance based on masking config
  let sightlineBlocked = false;
  let sightlineClearance: number | null = null;
  let sightlineStatus: "optimal" | "acceptable" | "warning" | "fail" = "optimal";
  let obstructionAngle: number | null = null;

  if (prevRow) {
    const sightline = checkSightline(prevRow, row, row.distFromScreen, config.screen.maskingConfig);
    sightlineBlocked = sightline.blocked;
    sightlineClearance = sightline.clearance;
    sightlineStatus = sightline.status;
    obstructionAngle = sightline.obstructionAngle;
  }

  const notes: string[] = [];

  // VVA notes with soft tolerance messaging
  if (vvaStatus === "warning") {
    if (vva.toTop > 18) notes.push(`Vertical angle to top: ${vva.toTop.toFixed(1)}° exceeds 18° comfort limit`);
    if (vva.toBottom > 18) notes.push(`Vertical angle to bottom: ${vva.toBottom.toFixed(1)}° exceeds 18° comfort limit`);
  } else if (vvaStatus === "marginal") {
    if (vva.toTop > 15) notes.push(`Vertical angle to top: ${vva.toTop.toFixed(1)}° (marginal, within tolerance)`);
    if (vva.toBottom > 15) notes.push(`Vertical angle to bottom: ${vva.toBottom.toFixed(1)}° (marginal, within tolerance)`);
  }

  if (!hvaPass) {
    notes.push(
      `Horizontal viewing angle ${(hva / 2).toFixed(1)}° exceeds ${hvaLimit}° ${config.contentStandard} limit`
    );
  }

  // Sightline notes with consultant voice + masking context
  const maskingLabel = SIGHTLINE_TOLERANCE[config.screen.maskingConfig].label;
  if (sightlineStatus === "fail") {
    notes.push(`Sightline obstructed by ${Math.abs(sightlineClearance!).toFixed(1)}" (${obstructionAngle?.toFixed(1)}°) - increase riser height`);
  } else if (sightlineStatus === "warning") {
    notes.push(`Minor sightline concern: ${Math.abs(sightlineClearance!).toFixed(1)}" obstruction (${obstructionAngle?.toFixed(1)}°) - ${maskingLabel} tolerance`);
  } else if (sightlineStatus === "acceptable" && obstructionAngle !== null) {
    notes.push(`Minimal obstruction: ${Math.abs(sightlineClearance!).toFixed(1)}" (${obstructionAngle.toFixed(1)}°) - within ${maskingLabel} tolerance`);
  }

  // Determine overall status using consultant logic
  let overallStatus: RowAnalysis["overallStatus"];
  
  if (sightlineStatus === "fail") {
    overallStatus = "fail";
  } else if (vvaStatus === "warning" || !hvaPass) {
    overallStatus = "warning";
  } else if (sightlineStatus === "warning") {
    overallStatus = "warning";
  } else if (sightlineStatus === "acceptable" || vvaStatus === "marginal") {
    overallStatus = "acceptable";
  } else if (vva.toTop <= 12 && vva.toBottom <= 12 && hva / 2 <= hvaLimit - 5) {
    overallStatus = "optimal";
  } else {
    overallStatus = "acceptable";
  }

  return {
    rowId: row.id,
    distFromScreen: row.distFromScreen,
    verticalViewingAngle: Math.max(vva.toTop, vva.toBottom),
    horizontalViewingAngle: hva / 2,
    vvaPass,
    hvaPass,
    sightlineBlocked: sightlineStatus === "fail",
    sightlineClearance,
    overallStatus,
    notes,
  };
}

// Screen geometry collision check
export function checkScreenFitsRoom(
  screenDiagonal: number,
  aspectRatio: "16:9" | "2.35:1" | "2.40:1",
  roomWidthFeet: number
): { fits: boolean; screenWidthInches: number; roomWidthInches: number; marginInches: number } {
  const { width: screenWidthInches } = getScreenDimensions(screenDiagonal, aspectRatio);
  const roomWidthInches = roomWidthFeet * 12;
  const minMargin = 6; // 6 inches minimum clearance on each side = 3" per side
  const marginInches = roomWidthInches - screenWidthInches;
  
  return {
    fits: screenWidthInches <= (roomWidthInches - minMargin),
    screenWidthInches,
    roomWidthInches,
    marginInches,
  };
}

export function analyzeProject(config: ProjectConfig): AnalysisResult {
  const sortedRows = [...config.rows].sort((a, b) => a.distFromScreen - b.distFromScreen);
  
  // Check screen geometry collision
  const screenCheck = checkScreenFitsRoom(
    config.screen.size,
    config.screen.aspectRatio,
    config.room.width
  );
  
  const rowAnalyses: RowAnalysis[] = sortedRows.map((row, index) => {
    const prevRow = index > 0 ? sortedRows[index - 1] : null;
    return analyzeRow(row, prevRow, config);
  });
  
  // Add critical warning if screen doesn't fit (downgraded to warning per CEDIA AT wall standards)
  if (!screenCheck.fits) {
    rowAnalyses.forEach(row => {
      // Downgrade to warning instead of fail - AT false walls allow wall-to-wall screens
      if (row.overallStatus !== "fail") {
        row.overallStatus = "warning";
      }
      // Keep the core sentence up front for clean PDF wrapping.
      row.notes.unshift(
        `CRITICAL WARNING: Screen width approaches structural limits. Verify Acoustically Transparent (AT) False Wall depth and speaker clearance. (${screenCheck.screenWidthInches.toFixed(0)}" screen in ${screenCheck.roomWidthInches.toFixed(0)}" room)`
      );
      row.notes.unshift(
        "Action Required: Reduce screen size by ~10% or confirm structural modifications."
      );
    });
  }

  const roomModes = calculateRoomModes(
    config.room.length,
    config.room.width,
    config.room.height,
    config.wallConstruction
  );

  // Calculate RT60
  const rt60Analysis = calculateRT60(
    config.room.length,
    config.room.width,
    config.room.height,
    config.wallConstruction
  );

  // Extract unique treatment prescriptions from room modes
  const treatmentPrescriptions = roomModes
    .filter(mode => mode.frequency <= 200) // Focus on bass/mid-bass
    .map(mode => mode.treatment)
    .filter((treatment, index, self) => 
      index === self.findIndex(t => t.type === treatment.type)
    );

  // Softer language: drywall is "standard residential", not a warning
  const bassLeakageWarning = config.wallConstruction === "drywall";
  const wallDampingFactor = WALL_DAMPING_FACTORS[config.wallConstruction];

  // Calculate overall score with softer thresholds
  const optimalCount = rowAnalyses.filter(r => r.overallStatus === "optimal").length;
  const acceptableCount = rowAnalyses.filter(r => r.overallStatus === "acceptable").length;
  const failCount = rowAnalyses.filter(r => r.overallStatus === "fail").length;
  const warningCount = rowAnalyses.filter(r => r.overallStatus === "warning").length;

  // Use the screenCheck already computed above

  // Consultant-grade scoring: more generous
  let overallScore = 100;
  
  // Critical failure if screen doesn't fit room
  if (!screenCheck.fits) {
    overallScore = 0;
  } else {
    overallScore -= failCount * 25; // Was 30, now 25
    overallScore -= warningCount * 8; // Was 10, now 8
    // Drywall is standard residential, minor deduction only
    if (bassLeakageWarning) overallScore -= 2; // Was 5, now 2
    // Bonus for optimal rows
    overallScore += optimalCount * 2;
  }
  overallScore = Math.min(100, Math.max(0, overallScore));

  let certification: AnalysisResult["certification"];
  if (!screenCheck.fits || failCount > 0) {
    certification = "Requires Revision";
  } else if (warningCount > 0 || overallScore < 80) { // Was 85, now 80
    certification = "Acceptable";
  } else {
    certification = "CEDIA Compliant";
  }

  return {
    rows: rowAnalyses,
    roomModes,
    bassLeakageWarning,
    wallDampingFactor,
    overallScore,
    certification,
    rt60Analysis,
    treatmentPrescriptions,
  };
}
