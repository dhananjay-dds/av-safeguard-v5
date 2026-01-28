import React, { useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash2 } from "lucide-react";
import { SeatingRow } from "@/types/avTypes";

interface RowManagerProps {
  rows: SeatingRow[];
  setRows: (rows: SeatingRow[]) => void;
}

/**
 * Manages seating row configuration
 * Allows adding, editing, and removing seating rows
 * @component
 */
const RowManagerComponent: React.FC<RowManagerProps> = ({ rows, setRows }) => {
  const handleAddRow = useCallback(() => {
    const newId = Math.max(...rows.map((r) => r.id), 0) + 1;
    const newRow: SeatingRow = {
      id: newId,
      distFromScreen: 15,
      earHeight: 42,
      riserHeight: 0,
    };
    setRows([...rows, newRow]);
  }, [rows, setRows]);

  const handleUpdateRow = useCallback(
    (id: number, updates: Partial<SeatingRow>) => {
      setRows(
        rows.map((row) => (row.id === id ? { ...row, ...updates } : row))
      );
    },
    [rows, setRows]
  );

  const handleDeleteRow = useCallback(
    (id: number) => {
      if (rows.length > 1) {
        setRows(rows.filter((row) => row.id !== id));
      }
    },
    [rows, setRows]
  );

  return (
    <div className="space-y-4" role="region" aria-label="Seating rows configuration">
      {rows.map((row) => (
        <div
          key={row.id}
          className="flex gap-3 items-end p-4 bg-muted rounded-lg"
          role="group"
          aria-label={`Seating row ${row.id}`}
        >
          <div className="flex-1 grid grid-cols-3 gap-2">
            <div className="space-y-2">
              <Label htmlFor={`dist-${row.id}`} className="text-sm">
                Distance (ft)
              </Label>
              <Input
                id={`dist-${row.id}`}
                type="number"
                min="0"
                value={row.distFromScreen}
                onChange={(e) =>
                  handleUpdateRow(row.id, {
                    distFromScreen: Number(e.target.value),
                  })
                }
                aria-label="Distance from screen in feet"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`ear-${row.id}`} className="text-sm">
                Ear Height (in)
              </Label>
              <Input
                id={`ear-${row.id}`}
                type="number"
                min="0"
                value={row.earHeight}
                onChange={(e) =>
                  handleUpdateRow(row.id, { earHeight: Number(e.target.value) })
                }
                aria-label="Ear height in inches"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`riser-${row.id}`} className="text-sm">
                Riser (in)
              </Label>
              <Input
                id={`riser-${row.id}`}
                type="number"
                min="0"
                value={row.riserHeight}
                onChange={(e) =>
                  handleUpdateRow(row.id, {
                    riserHeight: Number(e.target.value),
                  })
                }
                aria-label="Riser height in inches"
              />
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteRow(row.id)}
            disabled={rows.length === 1}
            aria-label={`Delete seating row ${row.id}`}
            aria-disabled={rows.length === 1}
          >
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      ))}
      <Button
        onClick={handleAddRow}
        variant="outline"
        className="w-full"
        aria-label="Add new seating row"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add Row
      </Button>
    </div>
  );
};

export const RowManager = React.memo(RowManagerComponent);
