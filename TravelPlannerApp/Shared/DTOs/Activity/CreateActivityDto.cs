using System;

namespace Shared.DTOs.Activity
{
    public class CreateActivityDto
    {
        public string Name { get; set; }
        public DateTime Date { get; set; }
        public TimeSpan? Time { get; set; }
        public string Location { get; set; }
        public string Description { get; set; }
        public decimal EstimatedCost { get; set; }
        public int Status { get; set; } // 0=Planned, 1=Reserved, 2=Completed, 3=Cancelled
    }
}