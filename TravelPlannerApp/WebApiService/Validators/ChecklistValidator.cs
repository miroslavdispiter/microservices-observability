using Shared.DTOs.Checklist;
using System.Collections.Generic;

namespace WebAPIService.Validators
{
    public class ChecklistValidator
    {
        public static (bool IsValid, List<string> Errors) Validate(CreateChecklistItemDto request)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(request.Name))
                errors.Add("Name is required.");
            else if (request.Name.Length < 2)
                errors.Add("Name must be at least 2 characters long.");
            else if (request.Name.Length > 200)
                errors.Add("Name cannot exceed 200 characters.");

            if (request.Priority < 0 || request.Priority > 2)
                errors.Add("Invalid priority. Must be 0 (Low), 1 (Medium), or 2 (High).");

            if (request.Description != null && request.Description.Length > 1000)
                errors.Add("Description cannot exceed 1000 characters.");

            return (errors.Count == 0, errors);
        }
    }
}