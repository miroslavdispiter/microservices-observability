import { pdf } from "@react-pdf/renderer";
import { TravelPlanPDFDocument } from "../components/pdf/TravelPlanPDFDocument";
import type { TravelPlan } from "../models/travel/TravelPlan";
import type { Destination } from "../models/travel/Destination";
import type { Activity } from "../models/travel/Activity";
import type { BudgetSummary } from "../models/travel/BudgetSummary";
import type { ChecklistItem } from "../models/travel/ChecklistItem";

interface GeneratePDFParams {
  plan: TravelPlan;
  destinations: Destination[];
  activities: Activity[];
  budgetSummary: BudgetSummary | null;
  checklistItems: ChecklistItem[];
}

export const generateTravelPlanPDF = async ({
  plan,
  destinations,
  activities,
  budgetSummary,
  checklistItems,
}: GeneratePDFParams): Promise<void> => {
  try {
    // Create PDF document
    const doc = TravelPlanPDFDocument({
      plan,
      destinations,
      activities,
      budgetSummary,
      checklistItems,
    });

    // Generate blob
    const blob = await pdf(doc).toBlob();

    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    
    // Format filename
    const fileName = `${plan.title.replace(/[^a-z0-9]/gi, "_")}_TravelPlan.pdf`;
    link.download = fileName;

    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to generate PDF:", error);
    throw new Error("Failed to generate PDF report");
  }
};