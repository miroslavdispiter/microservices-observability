using System;

namespace Shared.DTOs.Sharing
{
    public class SharingTokenDto
    {
        public string Token { get; set; }
        public int TravelPlanId { get; set; }
        public string AccessType { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
        public bool IsExpired { get; set; }
    }
}