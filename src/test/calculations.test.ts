import { describe, it, expect, beforeEach } from "vitest";
import { analyzeProject, validateDistance } from "@/utils/calculations";
import {
  ProjectConfig,
  SeatingRow,
} from "@/types/avTypes";

describe("Utility Functions", () => {
  describe("validateDistance", () => {
    it("should validate positive distances", () => {
      expect(validateDistance(10)).toBe(10);
      expect(validateDistance(0.5)).toBe(0.5);
    });

    it("should throw error for zero distance", () => {
      expect(() => validateDistance(0)).toThrow(
        "Distance must be greater than 0"
      );
    });

    it("should throw error for negative distance", () => {
      expect(() => validateDistance(-5)).toThrow(
        "Distance must be greater than 0"
      );
    });

    it("should throw error for non-finite numbers", () => {
      expect(() => validateDistance(Infinity)).toThrow(
        "Distance must be a valid number"
      );
      expect(() => validateDistance(NaN)).toThrow(
        "Distance must be a valid number"
      );
    });
  });

  describe("analyzeProject", () => {
    let validConfig: ProjectConfig;

    beforeEach(() => {
      const defaultRows: SeatingRow[] = [
        { id: 1, distFromScreen: 11, earHeight: 42, riserHeight: 0 },
        { id: 2, distFromScreen: 15, earHeight: 42, riserHeight: 10 },
      ];

      validConfig = {
        room: { length: 20, width: 14, height: 9 },
        screen: {
          size: 120,
          aspectRatio: "16:9",
          bottomEdgeHeight: 24,
          maskingConfig: "fixed-240",
        },
        rows: defaultRows,
        wallConstruction: "hybrid",
        contentStandard: "HDR",
      };
    });

    it("should analyze valid configuration", () => {
      const result = analyzeProject(validConfig);

      expect(result).toBeDefined();
      expect(result.roomVolume).toBe(2520);
      expect(result.areaPerPerson).toBe(140);
      expect(result.acousticRating).toBeGreaterThan(0);
      expect(result.acousticRating).toBeLessThanOrEqual(100);
      expect(result.isCompliant).toBeDefined();
      expect(Array.isArray(result.recommendations)).toBe(true);
    });

    it("should throw error for missing config", () => {
      expect(() => analyzeProject(null as any)).toThrow(
        "Project configuration is required"
      );
    });

    it("should throw error for invalid room dimensions", () => {
      validConfig.room.length = 0;
      expect(() => analyzeProject(validConfig)).toThrow(
        "Room dimensions must be positive numbers"
      );
    });

    it("should throw error for negative room dimensions", () => {
      validConfig.room.width = -5;
      expect(() => analyzeProject(validConfig)).toThrow(
        "Room dimensions must be positive numbers"
      );
    });

    it("should throw error for zero screen size", () => {
      validConfig.screen.size = 0;
      expect(() => analyzeProject(validConfig)).toThrow(
        "Screen size must be positive"
      );
    });

    it("should throw error for empty seating rows", () => {
      validConfig.rows = [];
      expect(() => analyzeProject(validConfig)).toThrow(
        "At least one seating row is required"
      );
    });

    it("should throw error for invalid seating row", () => {
      validConfig.rows[0].distFromScreen = -5;
      expect(() => analyzeProject(validConfig)).toThrow(
        "Row 1 has invalid dimensions"
      );
    });

    it("should mark as compliant when rating >= 70", () => {
      const result = analyzeProject(validConfig);
      if (result.acousticRating >= 70) {
        expect(result.isCompliant).toBe(true);
      }
    });

    it("should generate recommendations", () => {
      const result = analyzeProject(validConfig);
      expect(result.recommendations.length).toBeGreaterThan(0);
      expect(result.recommendations[0]).toBeTruthy();
      expect(typeof result.recommendations[0]).toBe("string");
    });

    it("should handle different content standards", () => {
      const standards = ["HDR", "4K", "Standard"] as const;

      standards.forEach((standard) => {
        validConfig.contentStandard = standard;
        const result = analyzeProject(validConfig);
        expect(result.standardCompliance).toBeGreaterThan(0);
      });
    });

    it("should calculate correct acoustic rating", () => {
      const result = analyzeProject(validConfig);
      expect(result.acousticRating).toBeGreaterThanOrEqual(0);
      expect(result.acousticRating).toBeLessThanOrEqual(100);
    });
  });

  describe("Analysis Edge Cases", () => {
    it("should handle very small rooms", () => {
      const smallRoomConfig: ProjectConfig = {
        room: { length: 1, width: 1, height: 1 },
        screen: {
          size: 20,
          aspectRatio: "16:9",
          bottomEdgeHeight: 24,
          maskingConfig: "fixed-240",
        },
        rows: [{ id: 1, distFromScreen: 0.5, earHeight: 30, riserHeight: 0 }],
        wallConstruction: "hybrid",
        contentStandard: "Standard",
      };

      const result = analyzeProject(smallRoomConfig);
      expect(result).toBeDefined();
      expect(result.isCompliant).toBeDefined();
    });

    it("should handle large rooms", () => {
      const largeRoomConfig: ProjectConfig = {
        room: { length: 100, width: 50, height: 20 },
        screen: {
          size: 400,
          aspectRatio: "2.40:1",
          bottomEdgeHeight: 48,
          maskingConfig: "fixed-240",
        },
        rows: Array.from({ length: 10 }, (_, i) => ({
          id: i + 1,
          distFromScreen: 10 + i * 5,
          earHeight: 42,
          riserHeight: i * 12,
        })),
        wallConstruction: "concrete",
        contentStandard: "4K",
      };

      const result = analyzeProject(largeRoomConfig);
      expect(result).toBeDefined();
      expect(result.roomVolume).toBeGreaterThan(0);
    });

    it("should calculate area per person correctly", () => {
      const config: ProjectConfig = {
        room: { length: 20, width: 10, height: 8 },
        screen: {
          size: 100,
          aspectRatio: "16:9",
          bottomEdgeHeight: 24,
          maskingConfig: "fixed-240",
        },
        rows: Array.from({ length: 4 }, (_, i) => ({
          id: i + 1,
          distFromScreen: 5 + i * 3,
          earHeight: 42,
          riserHeight: 0,
        })),
        wallConstruction: "hybrid",
        contentStandard: "HDR",
      };

      const result = analyzeProject(config);
      const expectedAreaPerPerson = (20 * 10) / 4;
      expect(result.areaPerPerson).toBe(expectedAreaPerPerson);
    });
  });
});
