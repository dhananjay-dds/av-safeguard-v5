import React from "react";
import { AnalysisResult } from "@/types/avTypes";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ResultsGridProps {
  analysis: AnalysisResult;
}

/**
 * Displays analysis results in a grid format
 * Shows acoustic rating, compliance status, and recommendations
 * @component
 */
const ResultsGridComponent: React.FC<ResultsGridProps> = ({ analysis }) => {
  return (
    <div
      className="space-y-4"
      role="region"
      aria-label="Analysis results summary"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {analysis.isCompliant ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            Results Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div
              className="p-3 bg-muted rounded-lg"
              role="img"
              aria-label={`Acoustic rating: ${analysis.acousticRating} out of 100`}
            >
              <p className="text-sm text-muted-foreground">Acoustic Rating</p>
              <p className="text-2xl font-bold">{analysis.acousticRating}/100</p>
            </div>
            <div
              className="p-3 bg-muted rounded-lg"
              role="img"
              aria-label={`Standards compliance: ${analysis.standardCompliance.toFixed(1)}%`}
            >
              <p className="text-sm text-muted-foreground">Compliance</p>
              <p className="text-2xl font-bold">
                {analysis.standardCompliance.toFixed(0)}%
              </p>
            </div>
          </div>

          <div
            className={`p-3 rounded-lg ${
              analysis.isCompliant
                ? "bg-green-50 border border-green-200"
                : "bg-yellow-50 border border-yellow-200"
            }`}
          >
            <p className="font-semibold">
              {analysis.isCompliant
                ? " Configuration is Compliant"
                : " Review Recommendations"}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2" role="list">
            {analysis.recommendations.map((rec, idx) => (
              <li
                key={idx}
                className="text-sm flex gap-2"
                role="listitem"
              >
                <span className="text-primary font-bold"></span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export const ResultsGrid = React.memo(ResultsGridComponent);
