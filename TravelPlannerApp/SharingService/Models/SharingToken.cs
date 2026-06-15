using System;

namespace SharingService.Models
{
    public class SharingToken
    {
        public string Token { get; set; }
        public int TravelPlanId { get; set; }
        public int OwnerId { get; set; }
        public string AccessType { get; set; } // "VIEW" ili "EDIT"
        public DateTime CreatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsRevoked { get; set; }
    }
}