import { describe, it, expect } from "vitest";
import {
  getScreenDimensions,
  calculateHorizontalViewingAngle,
  calculateVerticalViewingAngle,
  analyzeProject,
} from "@/utils/calculations";
import { ProjectConfig, SeatingRow } from "@/types/avTypes";

describe("Physics and Scoring Calculations", () => {
  const screen140 = getScreenDimensions(140, "2.40:1");

  it("calculates correct screen width for 140 inch 2.40:1 screen", () => {
    expect(screen140.width).toBeCloseTo(129.23, 1);
  });

  describe("Horizontal Viewing Angle (HVA)", () => {
    it("calculates Row 1 (8 ft / 96 in) HVA as ~67.9°", () => {
      const hva = calculateHorizontalViewingAngle(screen140.width, 8);
      expect(hva).toBeCloseTo(67.89, 1);
      expect(hva.toFixed(1)).toBe("67.9");
    });

    it("calculates Row 2 (12 ft / 144 in) HVA as ~48.3°", () => {
      const hva = calculateHorizontalViewingAngle(screen140.width, 12);
      expect(hva).toBeCloseTo(48.33, 1);
      expect(hva.toFixed(1)).toBe("48.3");
    });
  });

  describe("Vertical Viewing Angle (VVA)", () => {
    it("calculates Row 1 (8 ft) VVA toTop as ~20.5°", () => {
      // 140" 2.40:1 screen height ~ 53.85", bottom edge 24", viewer ear height 42"
      const vva = calculateVerticalViewingAngle(screen140.height, 24, 42, 8);
      expect(vva.toTop).toBeCloseTo(20.48, 1);
      expect(vva.toTop.toFixed(1)).toBe("20.5");
    });
  });

  describe("CEDIA Compliance & Room Mode Stacking Test Case", () => {
    const testConfig: ProjectConfig = {
      room: { length: 16, width: 16, height: 7 },
      screen: {
        size: 140,
        aspectRatio: "2.40:1",
        bottomEdgeHeight: 24,
        maskingConfig: "fixed-240",
      },
      rows: [
        { id: 1, distFromScreen: 8, earHeight: 42, riserHeight: 0 },
        { id: 2, distFromScreen: 12, earHeight: 42, riserHeight: 10 },
      ],
      wallConstruction: "hybrid",
      contentStandard: "HDR",
    };

    it("evaluates 16x16x7 test case correctly with failures and Requires Revision badge", () => {
      const result = analyzeProject(testConfig);

      console.log("=== TEST CASE VERIFICATION RESULTS ===");
      console.log(`Certification: ${result.certification}`);
      console.log(`Overall Compliance Score: ${result.overallScore}%`);
      result.rows.forEach((r) => {
        console.log(`Row ${r.rowId} (${r.distFromScreen} ft): HVA = ${r.horizontalViewingAngle.toFixed(1)}°, VVA = ${r.verticalViewingAngle.toFixed(1)}°, Status = ${r.overallStatus.toUpperCase()}`);
        r.notes.forEach((n) => console.log(`   - Note: ${n}`));
      });
      console.log(`Degenerate Modes Detected: ${result.hasDegenerateModes}`);
      console.log("=======================================");

      // 1. Verify HVA values
      expect(result.rows[0].horizontalViewingAngle.toFixed(1)).toBe("67.9");
      expect(result.rows[1].horizontalViewingAngle.toFixed(1)).toBe("48.3");

      // 2. Verify VVA values
      expect(result.rows[0].verticalViewingAngle.toFixed(1)).toBe("20.5");

      // 3. Verify Pass/Fail flags
      expect(result.rows[0].vvaPass).toBe(false);
      expect(result.rows[0].hvaPass).toBe(false);
      expect(result.rows[1].hvaPass).toBe(false);

      // 4. Verify Row Statuses
      expect(result.rows[0].overallStatus).toBe("fail");
      expect(result.rows[1].overallStatus).toBe("fail");

      // 5. Verify Notes (Issues & Recommendations)
      expect(result.rows[0].notes).toContain(
        "Vertical angle to top: 20.5° exceeds 18° comfort limit"
      );
      expect(result.rows[0].notes).toContain(
        "Horizontal viewing angle 67.9° exceeds 40° HDR limit"
      );
      expect(result.rows[1].notes).toContain(
        "Horizontal viewing angle 48.3° exceeds 40° HDR limit"
      );

      // 6. Verify Overlapping / Degenerate Axial Room Modes
      expect(result.hasDegenerateModes).toBe(true);
      const l1 = result.roomModes.find((m) => m.axis.includes("Length (1st)"));
      const w1 = result.roomModes.find((m) => m.axis.includes("Width (1st)"));
      expect(l1?.frequency).toBe(35.2);
      expect(w1?.frequency).toBe(35.2);

      const l2 = result.roomModes.find((m) => m.axis.includes("Length (2nd)"));
      const w2 = result.roomModes.find((m) => m.axis.includes("Width (2nd)"));
      expect(l2?.frequency).toBe(70.3);
      expect(w2?.frequency).toBe(70.3);

      const l3 = result.roomModes.find((m) => m.axis.includes("Length (3rd)"));
      const w3 = result.roomModes.find((m) => m.axis.includes("Width (3rd)"));
      expect(l3?.frequency).toBe(105.5);
      expect(w3?.frequency).toBe(105.5);

      // 7. Verify Overall Compliance Score & Badge
      expect(result.overallScore).toBeLessThanOrEqual(50);
      expect(result.overallScore).toBe(25);
      expect(result.certification).toBe("Requires Revision");
    });
  });
});
