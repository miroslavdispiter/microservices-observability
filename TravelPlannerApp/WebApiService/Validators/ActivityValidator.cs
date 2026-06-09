using Shared.DTOs.Activity;
using System;
using System.Collections.Generic;

namespace WebAPIService.Validators
{
    public class ActivityValidator
    {
        public static (bool IsValid, List<string> Errors) Validate(CreateActivityDto request)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(request.Name))
                errors.Add("Name is required.");
            else if (request.Name.Length < 2)
                errors.Add("Name must be at least 2 characters long.");
            else if (request.Name.Length > 200)
                errors.Add("Name cannot exceed 200 characters.");

            if (request.Date == default)
                errors.Add("Date is required.");

            if (request.Location != null && request.Location.Length > 300)
                errors.Add("Location cannot exceed 300 characters.");

            if (request.Description != null && request.Description.Length > 1000)
                errors.Add("Description cannot exceed 1000 characters.");

            if (request.EstimatedCost < 0)
                errors.Add("Estimated cost cannot be negative.");

            if (request.Status < 0 || request.Status > 3)
                errors.Add("Invalid status value. Must be 0 (Planned), 1 (Reserved), 2 (Completed), or 3 (Cancelled).");

            return (errors.Count == 0, errors);
        }
    }
}