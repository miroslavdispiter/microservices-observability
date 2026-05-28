using Shared.DTOs.TravelPlan;
using System;
using System.Collections.Generic;

namespace WebAPIService.Validators
{
    public class TravelPlanValidator
    {
        public static (bool IsValid, List<string> Errors) Validate(CreateTravelPlanDto request)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(request.Title))
                errors.Add("Title is required.");
            else if (request.Title.Length < 3)
                errors.Add("Title must be at least 3 characters long.");

            if (request.StartDate == default)
                errors.Add("Start date is required.");

            if (request.EndDate == default)
                errors.Add("End date is required.");

            if (request.EndDate < request.StartDate)
                errors.Add("End date cannot be before start date.");

            if (request.Budget < 0)
                errors.Add("Budget cannot be negative.");

            if (request.Description != null && request.Description.Length > 1000)
                errors.Add("Description is too long.");

            if (request.Notes != null && request.Notes.Length > 2000)
                errors.Add("Notes are too long.");

            return (errors.Count == 0, errors);
        }
    }
}