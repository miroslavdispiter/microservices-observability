using System;

namespace Shared.DTOs.Expense
{
    public class CreateExpenseDto
    {
        public string Name { get; set; }
        public int Category { get; set; }
        public decimal Amount { get; set; }
        public DateTime Date { get; set; }
        public string Description { get; set; }
    }
}