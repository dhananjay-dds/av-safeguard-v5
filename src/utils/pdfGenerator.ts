import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { ProjectConfig, AnalysisResult } from "@/types/avTypes";

/**
 * Generates a comprehensive PDF report for AV project analysis
 * Includes configuration details, acoustic analysis, and recommendations
 * @param config - Project configuration
 * @param analysis - Analysis results from analyzeProject
 * @throws Error if PDF generation fails
 */
export const generatePDFReport = (
  config: ProjectConfig,
  analysis: AnalysisResult
): void => {
  try {
    // Validate inputs
    if (!config || !analysis) {
      throw new Error("Configuration and analysis results are required");
    }

    // Create PDF document
    const doc = new jsPDF();
    let yPosition = 10;

    // Add title
    doc.setFontSize(20);
    doc.text("AV Safeguard - Project Analysis Report", 10, yPosition);
    yPosition += 10;

    // Add timestamp
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(\`Generated: \${new Date().toLocaleString()}\`, 10, yPosition);
    yPosition += 8;

    // Reset color
    doc.setTextColor(0);

    // Section 1: Room Configuration
    doc.setFontSize(12);
    doc.setFont(undefined, "bold");
    doc.text("Room Configuration", 10, yPosition);
    yPosition += 2;

    const roomData = [
      ["Property", "Value"],
      ["Length (ft)", config.room.length.toString()],
      ["Width (ft)", config.room.width.toString()],
      ["Height (ft)", config.room.height.toString()],
      ["Volume (cu ft)", analysis.roomVolume.toFixed(0)],
    ];

    autoTable(doc, {
      head: [roomData[0]],
      body: roomData.slice(1),
      startY: yPosition,
      margin: 10,
    });

    yPosition = (doc as any).lastAutoTable.finalY + 5;

    // Section 2: Screen Configuration
    doc.setFont(undefined, "bold");
    doc.text("Screen Configuration", 10, yPosition);
    yPosition += 2;

    const screenData = [
      ["Property", "Value"],
      ["Screen Size", \`\${config.screen.size}"\`],
      ["Aspect Ratio", config.screen.aspectRatio],
      ["Bottom Edge Height (in)", config.screen.bottomEdgeHeight.toString()],
    ];

    autoTable(doc, {
      head: [screenData[0]],
      body: screenData.slice(1),
      startY: yPosition,
      margin: 10,
    });

    yPosition = (doc as any).lastAutoTable.finalY + 5;

    // Section 3: Analysis Results
    doc.setFont(undefined, "bold");
    doc.text("Analysis Results", 10, yPosition);
    yPosition += 2;

    const resultsData = [
      ["Metric", "Value"],
      [
        "Acoustic Rating",
        \`\${analysis.acousticRating}/100\`,
      ],
      [
        "Compliant",
        analysis.isCompliant ? " Yes" : " No",
      ],
      [
        "Standard Compliance",
        \`\${analysis.standardCompliance.toFixed(1)}%\`,
      ],
    ];

    autoTable(doc, {
      head: [resultsData[0]],
      body: resultsData.slice(1),
      startY: yPosition,
      margin: 10,
    });

    yPosition = (doc as any).lastAutoTable.finalY + 5;

    // Section 4: Recommendations
    doc.setFont(undefined, "bold");
    doc.text("Recommendations", 10, yPosition);
    yPosition += 5;

    doc.setFont(undefined, "normal");
    doc.setFontSize(10);

    analysis.recommendations.forEach((rec: string, index: number) => {
      // Add page if needed
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 10;
      }

      const wrappedText = doc.splitTextToSize(rec, 180);
      doc.text(wrappedText, 10, yPosition);
      yPosition += wrappedText.length * 5 + 3;
    });

    // Add footer
    const pageCount = (doc as any).internal.pages.length - 1;
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150);
      doc.text(
        \`Page \${i} of \${pageCount}\`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 5,
        { align: "center" }
      );
    }

    // Save PDF
    doc.save("av-safeguard-report.pdf");
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(\`PDF generation failed: \${error.message}\`);
    }
    throw new Error("Unknown error during PDF generation");
  }
};
