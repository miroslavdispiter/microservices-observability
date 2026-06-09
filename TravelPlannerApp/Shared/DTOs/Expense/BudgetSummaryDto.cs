using System.Collections.Generic;

namespace Shared.DTOs.Expense
{
    public class BudgetSummaryDto
    {
        public decimal PlannedBudget { get; set; }
        public decimal TotalExpenses { get; set; }
        public decimal RemainingBudget { get; set; }
        public Dictionary<string, decimal> ExpensesByCategory { get; set; }
    }
}