using Shared.DTOs.Destination;

namespace WebAPIService.Validators
{
    public class DestinationValidator
    {
        public static (bool IsValid, List<string> Errors) Validate(CreateDestinationDto request)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(request.Name))
                errors.Add("Name is required.");
            else if (request.Name.Length < 2)
                errors.Add("Name must be at least 2 characters long.");
            else if (request.Name.Length > 200)
                errors.Add("Name cannot exceed 200 characters.");

            if (string.IsNullOrWhiteSpace(request.Location))
                errors.Add("Location is required.");
            else if (request.Location.Length > 300)
                errors.Add("Location cannot exceed 300 characters.");

            if (request.ArrivalDate == default)
                errors.Add("Arrival date is required.");

            if (request.DepartureDate == default)
                errors.Add("Departure date is required.");

            if (request.DepartureDate < request.ArrivalDate)
                errors.Add("Departure date cannot be before arrival date.");

            if (request.Description != null && request.Description.Length > 1000)
                errors.Add("Description cannot exceed 1000 characters.");

            return (errors.Count == 0, errors);
        }
    }
}