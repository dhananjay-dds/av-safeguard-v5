import {
  ProjectConfig,
  AnalysisResult,
  SeatingRow,
  ContentStandard,
} from "@/types/avTypes";

/**
 * Calculates distance from screen in feet
 * @param distance - Distance in feet
 * @returns Validated distance
 * @throws Error if distance is invalid
 */
export const validateDistance = (distance: number): number => {
  if (distance <= 0) {
    throw new Error("Distance must be greater than 0");
  }
  if (!isFinite(distance)) {
    throw new Error("Distance must be a valid number");
  }
  return distance;
};

/**
 * Analyzes AV project configuration for acoustic compliance
 * Validates input and performs comprehensive acoustic analysis
 * @param config - Project configuration with room, screen, and seating details
 * @returns Analysis results with acoustic ratings and recommendations
 * @throws Error if configuration is invalid
 */
export const analyzeProject = (config: ProjectConfig): AnalysisResult => {
  try {
    // Validate config exists
    if (!config) {
      throw new Error("Project configuration is required");
    }

    // Validate room dimensions
    if (
      !config.room ||
      config.room.length <= 0 ||
      config.room.width <= 0 ||
      config.room.height <= 0
    ) {
      throw new Error("Room dimensions must be positive numbers");
    }

    // Validate screen configuration
    if (!config.screen || config.screen.size <= 0) {
      throw new Error("Screen size must be positive");
    }

    // Validate seating rows
    if (!Array.isArray(config.rows) || config.rows.length === 0) {
      throw new Error("At least one seating row is required");
    }

    // Validate each row
    config.rows.forEach((row: SeatingRow, index: number) => {
      if (!row || row.distFromScreen < 0 || row.earHeight < 0) {
        throw new Error(
          \`Row \${index + 1} has invalid dimensions\`
        );
      }
    });

    // Calculate room volume
    const roomVolume =
      config.room.length * config.room.width * config.room.height;
    const areaPerPerson = (config.room.length * config.room.width) / config.rows.length;

    // Determine content standard compliance
    const standardCompliance = getContentStandardCompliance(
      config.contentStandard
    );

    // Calculate acoustic rating (0-100)
    const acousticRating = Math.min(
      100,
      Math.max(
        0,
        50 +
          (areaPerPerson / 100) * 10 +
          (roomVolume / 1000) * 5 +
          standardCompliance * 10
      )
    );

    // Generate recommendations
    const recommendations = generateRecommendations(
      acousticRating,
      config
    );

    return {
      roomVolume,
      areaPerPerson,
      acousticRating: Math.round(acousticRating * 100) / 100,
      standardCompliance: standardCompliance * 100,
      recommendations,
      isCompliant: acousticRating >= 70,
    };
  } catch (error) {
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Unknown error during project analysis");
  }
};

/**
 * Gets content standard compliance rating
 * @param standard - Content standard type
 * @returns Compliance rating 0-1
 */
const getContentStandardCompliance = (standard: ContentStandard): number => {
  const complianceMap: Record<ContentStandard, number> = {
    HDR: 0.95,
    "4K": 0.9,
    Standard: 0.75,
  };
  return complianceMap[standard] || 0.75;
};

/**
 * Generates recommendations based on analysis
 * @param rating - Acoustic rating
 * @param config - Project configuration
 * @returns Array of recommendations
 */
const generateRecommendations = (
  rating: number,
  config: ProjectConfig
): string[] => {
  const recommendations: string[] = [];

  if (rating < 70) {
    recommendations.push(
      "Consider improving room acoustics with treatment materials"
    );
    recommendations.push("Evaluate wall construction improvements");
  }

  if (config.room.height < 8) {
    recommendations.push(
      "Room height is below optimal - may impact acoustics"
    );
  }

  if (config.rows.length > 3 && config.room.width < 12) {
    recommendations.push("Room width may be tight for multiple seating rows");
  }

  if (recommendations.length === 0) {
    recommendations.push("Configuration meets recommended standards");
  }

  return recommendations;
};
