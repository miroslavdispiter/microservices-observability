using Shared.DTOs.Sharing;
using System.Collections.Generic;

namespace WebAPIService.Validators
{
    public static class CreateSharingTokenValidator
    {
        public static (bool IsValid, Dictionary<string, string> Errors) Validate(CreateSharingTokenDto dto)
        {
            var errors = new Dictionary<string, string>();

            if (dto.TravelPlanId <= 0)
            {
                errors["travelPlanId"] = "Invalid travel plan ID.";
            }

            if (string.IsNullOrWhiteSpace(dto.AccessType))
            {
                errors["accessType"] = "Access type is required.";
            }
            else if (dto.AccessType != "VIEW" && dto.AccessType != "EDIT")
            {
                errors["accessType"] = "Access type must be VIEW or EDIT.";
            }

            if (dto.ExpiresInDays.HasValue && dto.ExpiresInDays.Value <= 0)
            {
                errors["expiresInDays"] = "Expiration days must be greater than 0.";
            }

            return (errors.Count == 0, errors);
        }
    }
}