using Shared.DTOs.Expense;
using System;
using System.Collections.Generic;

namespace WebAPIService.Validators
{
    public class ExpenseValidator
    {
        public static (bool IsValid, List<string> Errors) Validate(CreateExpenseDto request)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(request.Name))
                errors.Add("Name is required.");
            else if (request.Name.Length < 2)
                errors.Add("Name must be at least 2 characters long.");
            else if (request.Name.Length > 200)
                errors.Add("Name cannot exceed 200 characters.");

            if (request.Category < 0 || request.Category > 5)
                errors.Add("Invalid category. Must be 0 (Transportation), 1 (Accommodation), 2 (Food), 3 (Tickets), 4 (Shopping), or 5 (Other).");

            if (request.Amount < 0)
                errors.Add("Amount cannot be negative.");

            if (request.Amount == 0)
                errors.Add("Amount must be greater than zero.");

            if (request.Date == default)
                errors.Add("Date is required.");

            if (request.Description != null && request.Description.Length > 1000)
                errors.Add("Description cannot exceed 1000 characters.");

            return (errors.Count == 0, errors);
        }
    }
}