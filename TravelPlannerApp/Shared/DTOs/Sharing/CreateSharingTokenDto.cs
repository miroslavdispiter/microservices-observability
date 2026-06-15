namespace Shared.DTOs.Sharing
{
    public class CreateSharingTokenDto
    {
        public int TravelPlanId { get; set; }
        public string AccessType { get; set; }
        public int? ExpiresInDays { get; set; }
    }
}