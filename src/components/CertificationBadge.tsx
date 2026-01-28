import React from "react";
import { Badge } from "@/components/ui/badge";
import { Star, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CertificationBadgeProps {
  rating: number;
  isCompliant: boolean;
}

/**
 * Displays certification badge with acoustic rating
 * Shows compliance status with visual indicators
 * @component
 */
const CertificationBadgeComponent: React.FC<CertificationBadgeProps> = ({
  rating,
  isCompliant,
}) => {
  const getStatus = (rating: number): string => {
    if (rating >= 90) return "Excellent";
    if (rating >= 80) return "Very Good";
    if (rating >= 70) return "Good";
    if (rating >= 60) return "Fair";
    return "Poor";
  };

  const getStatusColor = (rating: number): string => {
    if (rating >= 90) return "bg-green-100 text-green-800";
    if (rating >= 80) return "bg-blue-100 text-blue-800";
    if (rating >= 70) return "bg-yellow-100 text-yellow-800";
    if (rating >= 60) return "bg-orange-100 text-orange-800";
    return "bg-red-100 text-red-800";
  };

  const status = getStatus(rating);

  return (
    <Card
      className="border-2 border-primary/20"
      role="region"
      aria-label={`Certification badge: ${status} rating`}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Certification</span>
          {isCompliant && <Star className="h-5 w-5 text-yellow-500 fill-current" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="text-center space-y-2">
          <div
            className={`text-4xl font-bold ${getStatusColor(rating)} p-4 rounded-lg`}
            aria-label={`Acoustic rating: ${rating.toFixed(1)}`}
          >
            {rating.toFixed(1)}
          </div>
          <Badge variant="outline" className="w-full justify-center">
            {status}
          </Badge>
        </div>

        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            {isCompliant ? (
              <>
                <div className="h-2 w-2 bg-green-500 rounded-full" />
                <span className="text-green-700">Meets Standards</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-yellow-700">Review Needed</span>
              </>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const CertificationBadge = React.memo(CertificationBadgeComponent);
