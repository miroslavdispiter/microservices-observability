using System;

namespace Shared.DTOs.Destination
{
    public class DestinationDto
    {
        public int Id { get; set; }
        public int TravelPlanId { get; set; }
        public string Name { get; set; }
        public string Location { get; set; }
        public DateTime ArrivalDate { get; set; }
        public DateTime DepartureDate { get; set; }
        public string Description { get; set; }
    }
}