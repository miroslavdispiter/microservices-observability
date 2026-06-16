import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import type { TravelPlan } from "../../models/travel/TravelPlan";
import type { Destination } from "../../models/travel/Destination";
import type { Activity } from "../../models/travel/Activity";
import type { BudgetSummary } from "../../models/travel/BudgetSummary";
import type { ChecklistItem } from "../../models/travel/ChecklistItem";

// Font
Font.register({
  family: "Roboto",
  fonts: [
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf",
    },
    {
      src: "https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf",
      fontWeight: "bold",
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: "Roboto",
    fontSize: 10,
    backgroundColor: "#FFFFFF",
  },
  header: {
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: "#6366F1",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#6366F1",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  dateRow: {
    flexDirection: "row",
    gap: 20,
    marginTop: 8,
  },
  dateItem: {
    fontSize: 10,
    color: "#4B5563",
  },
  statsContainer: {
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    padding: 12,
    backgroundColor: "#F0F9FF",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#3B82F6",
  },
  statLabel: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1E40AF",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  descriptionBox: {
    padding: 10,
    backgroundColor: "#F9FAFB",
    borderRadius: 6,
    marginBottom: 10,
  },
  descriptionText: {
    fontSize: 10,
    color: "#4B5563",
    lineHeight: 1.5,
  },
  notesBox: {
    padding: 10,
    backgroundColor: "#FEF3C7",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FCD34D",
  },
  destinationItem: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: "#F0FDFA",
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#14B8A6",
  },
  destinationName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#0F766E",
    marginBottom: 4,
  },
  destinationLocation: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 4,
  },
  destinationDates: {
    fontSize: 9,
    color: "#4B5563",
  },
  activityItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: "#EEF2FF",
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: "#6366F1",
  },
  activityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  activityName: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#4338CA",
    flex: 1,
  },
  activityTime: {
    fontSize: 9,
    color: "#6366F1",
    fontWeight: "bold",
  },
  activityLocation: {
    fontSize: 9,
    color: "#6B7280",
    marginBottom: 2,
  },
  activityStatus: {
    fontSize: 8,
    color: "#4B5563",
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: "#DBEAFE",
    borderRadius: 4,
    marginTop: 4,
  },
  budgetRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: "#F0FDF4",
    borderRadius: 6,
    marginBottom: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#10B981",
  },
  budgetLabel: {
    fontSize: 10,
    color: "#4B5563",
  },
  budgetValue: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#047857",
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
    padding: 8,
    backgroundColor: "#FFF7ED",
    borderRadius: 6,
  },
  checkbox: {
    width: 12,
    height: 12,
    borderWidth: 2,
    borderColor: "#F97316",
    borderRadius: 3,
    backgroundColor: "#FFFFFF",
  },
  checkboxChecked: {
    backgroundColor: "#F97316",
  },
  checklistText: {
    fontSize: 10,
    color: "#4B5563",
    flex: 1,
  },
  checklistTextCompleted: {
    color: "#9CA3AF",
    textDecoration: "line-through",
  },
  emptyState: {
    padding: 20,
    textAlign: "center",
    color: "#9CA3AF",
    fontSize: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: "center",
    fontSize: 8,
    color: "#9CA3AF",
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
    paddingTop: 10,
  },
});

interface TravelPlanPDFDocumentProps {
  plan: TravelPlan;
  destinations: Destination[];
  activities: Activity[];
  budgetSummary: BudgetSummary | null;
  checklistItems: ChecklistItem[];
}

export const TravelPlanPDFDocument = ({
  plan,
  destinations,
  activities,
  budgetSummary,
  checklistItems,
}: TravelPlanPDFDocumentProps) => {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const calculateDuration = (start: string, end: string) => {
    const days = Math.ceil(
      (new Date(end).getTime() - new Date(start).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    return days;
  };

  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return "All day";
    return timeStr.substring(0, 5);
  };

  const completedCount = checklistItems.filter((item) => item.isCompleted).length;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{plan.title}</Text>
          <View style={styles.dateRow}>
            <Text style={styles.dateItem}>{formatDate(plan.startDate)}</Text>
            <Text style={styles.dateItem}>→</Text>
            <Text style={styles.dateItem}>{formatDate(plan.endDate)}</Text>
            <Text style={styles.dateItem}>
              {calculateDuration(plan.startDate, plan.endDate)} days
            </Text>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Total Budget</Text>
            <Text style={styles.statValue}>
              {formatCurrency(plan.budget)}
            </Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Destinations</Text>
            <Text style={styles.statValue}>{destinations.length}</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Activities</Text>
            <Text style={styles.statValue}>{activities.length}</Text>
          </View>
        </View>

        {plan.description && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionText}>{plan.description}</Text>
            </View>
          </View>
        )}

        {plan.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <View style={styles.notesBox}>
              <Text style={styles.descriptionText}>{plan.notes}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Destinations ({destinations.length})
          </Text>
          {destinations.length === 0 ? (
            <Text style={styles.emptyState}>No destinations added yet</Text>
          ) : (
            destinations.map((dest, index) => (
              <View key={dest.id} style={styles.destinationItem}>
                <Text style={styles.destinationName}>
                  {index + 1}. {dest.name}
                </Text>
                <Text style={styles.destinationLocation}>
                  {dest.location}
                </Text>
                <Text style={styles.destinationDates}>
                  {formatDate(dest.arrivalDate)} → {formatDate(dest.departureDate)}
                </Text>
                {dest.description && (
                  <Text style={styles.descriptionText}>{dest.description}</Text>
                )}
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Activities ({activities.length})
          </Text>
          {activities.length === 0 ? (
            <Text style={styles.emptyState}>No activities planned yet</Text>
          ) : (
            activities.slice(0, 5).map((activity) => (
              <View key={activity.id} style={styles.activityItem}>
                <View style={styles.activityHeader}>
                  <Text style={styles.activityName}>{activity.name}</Text>
                  <Text style={styles.activityTime}>
                    {formatTime(activity.time)}
                  </Text>
                </View>
                {activity.location && (
                  <Text style={styles.activityLocation}>
                    {activity.location}
                  </Text>
                )}
                <Text style={styles.activityStatus}>
                  {formatDate(activity.date)}
                </Text>
              </View>
            ))
          )}
          {activities.length > 5 && (
            <Text style={styles.emptyState}>
              +{activities.length - 5} more activities...
            </Text>
          )}
        </View>

        {budgetSummary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Budget Summary</Text>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Planned Budget</Text>
              <Text style={styles.budgetValue}>
                {formatCurrency(budgetSummary.plannedBudget)}
              </Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Total Expenses</Text>
              <Text style={styles.budgetValue}>
                {formatCurrency(budgetSummary.totalExpenses)}
              </Text>
            </View>
            <View style={styles.budgetRow}>
              <Text style={styles.budgetLabel}>Remaining Budget</Text>
              <Text
                style={[
                  styles.budgetValue,
                  {
                    color:
                      budgetSummary.remainingBudget < 0 ? "#DC2626" : "#047857",
                  },
                ]}
              >
                {formatCurrency(budgetSummary.remainingBudget)}
              </Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Packing List ({completedCount}/{checklistItems.length})
          </Text>
          {checklistItems.length === 0 ? (
            <Text style={styles.emptyState}>No checklist items yet</Text>
          ) : (
            checklistItems.slice(0, 8).map((item) => (
              <View key={item.id} style={styles.checklistItem}>
                <View
                  style={[
                    styles.checkbox,
                    ...(item.isCompleted ? [styles.checkboxChecked] : []),
                  ]}
                />
                <Text
                  style={[
                    styles.checklistText,
                    ...(item.isCompleted ? [styles.checklistTextCompleted] : []),
                  ]}
                >
                  {item.name}
                </Text>
              </View>
            ))
          )}
        </View>

        <Text style={styles.footer}>
          Generated on {new Date().toLocaleString("en-US")} | Travel Planner App
        </Text>
      </Page>
    </Document>
  );
};