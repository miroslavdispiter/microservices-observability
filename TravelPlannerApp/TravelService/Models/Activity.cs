using System;

namespace TravelService.Models
{
    public class Activity
    {
        public int Id { get; set; }
        public int TravelPlanId { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public TimeSpan? Time { get; set; }
        public string Location { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal EstimatedCost { get; set; }
        public int Status { get; set; } // 0=Planned, 1=Reserved, 2=Completed, 3=Cancelled
        public DateTime CreatedAt { get; set; }
        public TravelPlan TravelPlan { get; set; }
    }
}