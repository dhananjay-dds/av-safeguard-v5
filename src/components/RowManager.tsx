import { Plus, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SeatingRow } from "@/types/avTypes";

interface RowManagerProps {
  rows: SeatingRow[];
  onChange: (rows: SeatingRow[]) => void;
}

export function RowManager({ rows, onChange }: RowManagerProps) {
  const addRow = () => {
    const newId = rows.length > 0 ? Math.max(...rows.map((r) => r.id)) + 1 : 1;
    const lastRow = rows[rows.length - 1];
    
    onChange([
      ...rows,
      {
        id: newId,
        distFromScreen: lastRow ? lastRow.distFromScreen + 4 : 10,
        earHeight: lastRow ? lastRow.earHeight : 44,
        riserHeight: lastRow ? lastRow.riserHeight + 8 : 0,
      },
    ]);
  };

  const removeRow = (id: number) => {
    if (rows.length > 1) {
      onChange(rows.filter((r) => r.id !== id));
    }
  };

  const updateRow = (id: number, field: keyof SeatingRow, value: number) => {
    onChange(
      rows.map((row) =>
        row.id === id ? { ...row, [field]: value } : row
      )
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Seating Rows</h3>
        </div>
        <Button
          onClick={addRow}
          size="sm"
          className="gap-1"
        >
          <Plus className="h-4 w-4" />
          Add Row
        </Button>
      </div>

      <div className="space-y-3">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="card-dashboard p-4 fade-in"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-sm font-medium text-primary">
                ROW {index + 1}
              </span>
              {rows.length > 1 && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  onClick={() => removeRow(row.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Distance (ft)
                </Label>
                <Input
                  type="number"
                  value={row.distFromScreen}
                  onChange={(e) =>
                    updateRow(row.id, "distFromScreen", Number(e.target.value))
                  }
                  className="input-dark font-mono h-12 md:h-9 text-base md:text-sm touch-manipulation"
                  min={1}
                  step={0.5}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Ear Height (in)
                </Label>
                <Input
                  type="number"
                  value={row.earHeight}
                  onChange={(e) =>
                    updateRow(row.id, "earHeight", Number(e.target.value))
                  }
                  className="input-dark font-mono h-12 md:h-9 text-base md:text-sm touch-manipulation"
                  min={30}
                  max={60}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-muted-foreground">
                  Riser (in)
                </Label>
                <Input
                  type="number"
                  value={row.riserHeight}
                  onChange={(e) =>
                    updateRow(row.id, "riserHeight", Number(e.target.value))
                  }
                  className="input-dark font-mono h-12 md:h-9 text-base md:text-sm touch-manipulation"
                  min={0}
                  step={1}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
