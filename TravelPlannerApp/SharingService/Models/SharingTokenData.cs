using System;
using System.Runtime.Serialization;

namespace SharingService.Models
{
    [DataContract]
    public class SharingTokenData
    {
        [DataMember] public string Token { get; set; } = string.Empty;
        [DataMember] public int TravelPlanId { get; set; }
        [DataMember] public int OwnerId { get; set; }
        [DataMember] public string AccessType { get; set; } = string.Empty; // "VIEW" or "EDIT"
        [DataMember] public DateTime CreatedAt { get; set; }
        [DataMember] public DateTime? ExpiresAt { get; set; }
    }
}