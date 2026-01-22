import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ProjectConfig, AnalysisResult, TreatmentPrescription } from "@/types/avTypes";

const MASKING_LABELS: Record<string, string> = {
  "fixed-240": "Fixed 2.40:1 (Standard)",
  "motorized": "Motorized Masking (Pro)",
  "16:9-no-masking": "16:9 (No Masking)",
};

function getTreatmentLabel(type: TreatmentPrescription["type"]): string {
  switch (type) {
    case "diaphragmatic":
      return "Diaphragmatic";
    case "hybrid-bass-trap":
      return "Hybrid Bass Trap";
    case "broadband-porous":
      return "Broadband Porous";
  }
}

export function generatePDFReport(
  config: ProjectConfig,
  analysis: AnalysisResult
): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Consistent layout margins for all sections/tables
  const leftMargin = 20;
  const rightMargin = 20;
  const contentWidth = pageWidth - leftMargin - rightMargin;

  // Header
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 40, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text("AV SAFEGUARD", 20, 20);

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text("Consultant-Grade Physics Analysis Report", 20, 28);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 35);

  // Certification Badge
  const certColor = 
    analysis.certification === "CEDIA Compliant" ? [34, 197, 94] :
    analysis.certification === "Acceptable" ? [234, 179, 8] : [239, 68, 68];
  
  doc.setFillColor(certColor[0], certColor[1], certColor[2]);
  doc.roundedRect(pageWidth - 70, 10, 55, 20, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text(analysis.certification.toUpperCase(), pageWidth - 65, 18);
  doc.setFontSize(14);
  doc.text(`${analysis.overallScore}%`, pageWidth - 50, 26);

  doc.setTextColor(0, 0, 0);
  let yPos = 55;

  // Room Configuration Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Room Configuration", 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Dimensions: ${config.room.length}' L × ${config.room.width}' W × ${config.room.height}' H`, 20, yPos);
  yPos += 6;
  doc.text(`Screen: ${config.screen.size}" diagonal (${config.screen.aspectRatio})`, 20, yPos);
  yPos += 6;
  doc.text(`Masking: ${MASKING_LABELS[config.screen.maskingConfig]}`, 20, yPos);
  yPos += 6;
  doc.text(`Wall Construction: ${config.wallConstruction.charAt(0).toUpperCase() + config.wallConstruction.slice(1)}`, 20, yPos);
  yPos += 6;
  doc.text(`Content Standard: ${config.contentStandard}`, 20, yPos);
  yPos += 15;

  // Seating Analysis Table
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Multi-Row Seating Analysis", 20, yPos);
  yPos += 5;

  const tableData = analysis.rows.map((row) => [
    `Row ${row.rowId}`,
    `${row.distFromScreen} ft`,
    `${row.verticalViewingAngle.toFixed(1)}°`,
    `${row.horizontalViewingAngle.toFixed(1)}°`,
    row.sightlineClearance !== null ? `${row.sightlineClearance.toFixed(1)}"` : "N/A",
    row.overallStatus.toUpperCase(),
  ]);

  autoTable(doc, {
    startY: yPos,
    head: [["Row", "Distance", "VVA", "HVA", "Clearance", "Status"]],
    body: tableData,
    theme: "striped",
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
    styles: { fontSize: 9 },
    columnStyles: {
      5: {
        cellWidth: 30,
        fontStyle: "bold",
      },
    },
    didParseCell: (data) => {
      if (data.column.index === 5 && data.section === "body") {
        const status = data.cell.raw as string;
        if (status === "OPTIMAL") {
          data.cell.styles.textColor = [34, 197, 94];
        } else if (status === "ACCEPTABLE") {
          data.cell.styles.textColor = [59, 130, 246];
        } else if (status === "WARNING" || status === "MARGINAL") {
          data.cell.styles.textColor = [234, 179, 8];
        } else {
          data.cell.styles.textColor = [239, 68, 68];
        }
      }
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 15;

  // RT60 & Reverb Analysis
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Reverb Analysis (RT60)", 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  doc.text(`Untreated RT60: ${analysis.rt60Analysis.untreatedRT60}s`, 20, yPos);
  yPos += 6;
  doc.text(`Target RT60: ${analysis.rt60Analysis.targetRT60}s (CEDIA Standard)`, 20, yPos);
  yPos += 6;
  
  if (analysis.rt60Analysis.coverageRequired > 0) {
    doc.text(`Treatment Coverage Required: ~${Math.abs(analysis.rt60Analysis.coverageRequired)}% (Calculated for High-Efficiency NRC 0.95 Panels).`, 20, yPos);
    yPos += 6;
    doc.setFontSize(9);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text(`Note: Standard NRC 0.70 foam would require ~${Math.round(Math.abs(analysis.rt60Analysis.coverageRequired) * 1.36)}% coverage.`, 20, yPos);
    doc.setTextColor(0, 0, 0);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    yPos += 6;
  }
  yPos += 8;

  // Room Modes Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Room Mode Analysis", 20, yPos);
  yPos += 5;

  const getEstimatedReduction = (intensity: number): string => {
    const pct = intensity * 100;
    if (pct > 80) return "-3 dB (Untreated)";
    if (pct >= 50) return "-6 dB (Natural Damping)";
    return "-9 dB (Flexible Boundary)";
  };

  // Parse axis to separate mode order from axis direction.
  // Defensive cleanup: some upstream strings may accidentally include a leading percent.
  const parseAxis = (axis: string): { direction: string; order: string } => {
    const cleaned = axis.replace(/^\s*\d+%\s*/i, "").trim();
    // axis format is like "Length (1st)" or "Width (2nd)"
    const match = cleaned.match(/^([A-Za-z]+)\s*\(([^)]+)\)$/);
    if (match) {
      return { direction: match[1], order: match[2] };
    }
    return { direction: cleaned, order: "" };
  };

  const modesData = analysis.roomModes.slice(0, 8).map((mode) => {
    const { direction, order } = parseAxis(mode.axis);
    // Ensure each value is a separate array element for distinct columns
    const intensityValue = `${(mode.intensity * 100).toFixed(0)}%`;
    const axisValue = `${direction}${order ? ` (${order})` : ""}`;
    return [
      `${mode.frequency} Hz`,                        // Col 0: Freq
      mode.type.charAt(0).toUpperCase() + mode.type.slice(1),  // Col 1: Type
      axisValue,                                     // Col 2: Axis (separate)
      intensityValue,                                // Col 3: Intensity (separate)
      getEstimatedReduction(mode.intensity),         // Col 4: Est. Reduction
      getTreatmentLabel(mode.treatment.type),        // Col 5: Treatment
      mode.treatment.placement,                      // Col 6: Placement
    ];
  });

  // Column widths (as % of table width) per audit:
  // - Intensity: 15%
  // - Axis: 20%
  // - Est. Reduction: 20%
  const wIntensity = contentWidth * 0.15;
  const wAxis = contentWidth * 0.20;
  const wReduction = contentWidth * 0.20;
  const remaining = contentWidth - wIntensity - wAxis - wReduction;
  const wFreq = remaining * 0.27;
  const wType = remaining * 0.22;
  const wTreatment = remaining * 0.26;
  const wPlacement = remaining * 0.25;

  autoTable(doc, {
    startY: yPos,
    head: [["Freq", "Type", "Axis", "Intensity", "Est. Reduction", "Treatment", "Placement"]],
    body: modesData,
    theme: "striped",
    headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255] },
    styles: { fontSize: 7, cellPadding: 2 },
    margin: { left: leftMargin, right: rightMargin },
    tableWidth: contentWidth,
    columnStyles: {
      0: { cellWidth: wFreq },
      1: { cellWidth: wType },
      2: { cellWidth: wAxis, overflow: "linebreak" },
      3: { cellWidth: wIntensity },
      4: { cellWidth: wReduction, overflow: "linebreak" },
      5: { cellWidth: wTreatment, overflow: "linebreak" },
      6: { cellWidth: wPlacement, overflow: "linebreak" },
    },
  });

  yPos = (doc as any).lastAutoTable.finalY + 5;
  
  // Intensity Footnote
  doc.setFontSize(7);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text(
    "Intensity % represents the theoretical modal energy distribution relative to a rigid boundary (100%). Lower values indicate damping from flexible wall construction.",
    20,
    yPos,
    { maxWidth: pageWidth - 40 }
  );

  yPos = (doc as any).lastAutoTable.finalY + 10;

  // Check if we need a new page
  if (yPos > 220) {
    doc.addPage();
    yPos = 20;
  }

  // Acoustic Treatment Strategy Section
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Acoustic Treatment Strategy", 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");

  if (analysis.treatmentPrescriptions.length > 0) {
    analysis.treatmentPrescriptions.forEach((treatment) => {
      doc.text(`• ${treatment.description} (${treatment.depth})`, 25, yPos);
      yPos += 6;
    });
  } else {
    doc.text("No specific treatment required based on current configuration.", 25, yPos);
    yPos += 6;
  }

  yPos += 5;

  // Wall Impedance Note
  doc.setFontSize(9);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  const wallType = config.wallConstruction.charAt(0).toUpperCase() + config.wallConstruction.slice(1);
  doc.text(
    `Calculations adjusted for ${wallType} impedance according to CEDIA CEB-22 standards.`,
    20,
    yPos
  );
  yPos += 5;
  doc.text(
    `Wall damping factor applied: ${analysis.wallDampingFactor.toFixed(2)}`,
    20,
    yPos
  );

  if (analysis.bassLeakageWarning) {
    yPos += 8;
    doc.setTextColor(100, 100, 100);
    doc.setFont("helvetica", "normal");
    doc.text("Note: Standard Residential Construction (Drywall) detected. Consider acoustic treatment", 20, yPos);
    yPos += 5;
    doc.text("or hybrid construction to improve bass containment.", 20, yPos);
  }

  // Issues & Recommendations
  const allNotes = analysis.rows.flatMap((r) => r.notes.map((n) => `Row ${r.rowId}: ${n}`));
  if (allNotes.length > 0) {
    yPos += 15;
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("Issues & Recommendations", 20, yPos);
    yPos += 8;

    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    const maxY = pageHeight - 25; // keep footer clear
    const bulletX = 25;
    const lineHeight = 4.5;
    allNotes.forEach((note) => {
      // Enable text wrapping for long notes (Issues & Recommendations)
      const maxWidth = pageWidth - rightMargin - bulletX;
      const lines = doc.splitTextToSize(`• ${note}`, maxWidth);
      const neededHeight = lines.length * lineHeight;

      // Page-break BEFORE printing multi-line notes to prevent cutoff (e.g., "Verify Acous...")
      if (yPos + neededHeight > maxY) {
        doc.addPage();
        yPos = 20;
      }

      doc.text(lines, bulletX, yPos);
      yPos += neededHeight + 2;
    });
  }

  // Commissioning Checklist Section
  yPos += 15;
  
  // Check if we need a new page
  if (yPos > 240) {
    doc.addPage();
    yPos = 20;
  }

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("Project Handover Checklist", 20, yPos);
  yPos += 10;

  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  
  const checklist = [
    "Verify RT60 decay (Target: 0.45s ±0.05s)",
    "Sweep 20-200Hz for Seat-to-Seat Variance (<5dB)",
    "Verify Subwoofer Phase alignment at Crossover",
  ];

  checklist.forEach((item) => {
    doc.rect(25, yPos - 4, 4, 4);
    doc.text(item, 32, yPos);
    yPos += 8;
  });

  // ============================================
  // ARCHITECTURAL PROVISIONS CHECKLIST (V5.1)
  // ============================================
  yPos += 15;
  
  // Check if we need a new page
  if (yPos > 200) {
    doc.addPage();
    yPos = 20;
  }

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text("ARCHITECTURAL PROVISIONS CHECKLIST", 20, yPos);
  yPos += 5;
  
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text("Engineer's Note to Architect — Pre-Construction Infrastructure Requirements", 20, yPos);
  yPos += 10;
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  
  const architecturalChecklist: string[] = [];
  
  // Conditional items based on Wall Construction
  const wallConstruction = config.wallConstruction;
  if (wallConstruction === "drywall" || wallConstruction === "hybrid" || wallConstruction === "treated-drywall") {
    architecturalChecklist.push(
      "In-Wall Speaker Depth: Verify minimum 3.5\" clear stud depth (Standard) or 5.5\" (Reference/Backbox)."
    );
    architecturalChecklist.push(
      "Recessed Subwoofers: Confirm 2x6 framing or 6\" cavity depth at designated sub locations."
    );
  }
  
  // Conditional items based on Masking and Screen Size
  const hasMotoizedMasking = config.screen.maskingConfig === "motorized";
  const isLargeScreen = config.screen.size > 120;
  
  if (hasMotoizedMasking || isLargeScreen) {
    architecturalChecklist.push(
      "Ceiling Pocket: Verify 8\" x 8\" continuous blocking/pocket for motorized screen housing."
    );
    architecturalChecklist.push(
      "Power: Dedicated 110V/220V AC drop at screen casing location (Left/Right per spec)."
    );
  }
  
  // General Items (Always Include)
  architecturalChecklist.push(
    "Projector Ventilation: Ensure 12\" clearance or active exhaust for High-Lumen unit."
  );
  architecturalChecklist.push(
    "Conduit: 2\" Smurf Tube from Rack Location to Display/Projector (Future Proofing)."
  );
  
  // Render the checklist with checkboxes
  const checkboxSize = 3.5;
  const checklistLineHeight = 7;
  const checklistMaxWidth = pageWidth - rightMargin - 35;
  
  architecturalChecklist.forEach((item) => {
    const lines = doc.splitTextToSize(item, checklistMaxWidth);
    const neededHeight = lines.length * 4.5;
    
    // Page-break check
    if (yPos + neededHeight > pageHeight - 25) {
      doc.addPage();
      yPos = 20;
    }
    
    // Draw checkbox
    doc.rect(25, yPos - checkboxSize, checkboxSize, checkboxSize);
    
    // Draw text
    doc.text(lines, 32, yPos);
    yPos += Math.max(checklistLineHeight, neededHeight + 2);
  });
  
  // Add separator line
  yPos += 5;
  doc.setDrawColor(200, 200, 200);
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 8;
  
  // Signature line for Engineer sign-off
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  doc.setTextColor(100, 100, 100);
  doc.text("Verified By: ________________________________    Date: ______________", 20, yPos);

  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("AV Safeguard V5.1 | CEDIA/CTA-CEB23 Compliant Analysis Engine", 20, 285);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - 30, 285);
  }

  // Save
  doc.save(`AV-Safeguard-Report-${new Date().toISOString().split("T")[0]}.pdf`);
}
