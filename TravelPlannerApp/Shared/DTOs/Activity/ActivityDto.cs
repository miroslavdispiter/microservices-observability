using System;

namespace Shared.DTOs.Activity
{
    public class ActivityDto
    {
        public int Id { get; set; }
        public int TravelPlanId { get; set; }
        public string Name { get; set; }
        public DateTime Date { get; set; }
        public TimeSpan? Time { get; set; }
        public string Location { get; set; }
        public string Description { get; set; }
        public decimal EstimatedCost { get; set; }
        public int Status { get; set; }
    }
}