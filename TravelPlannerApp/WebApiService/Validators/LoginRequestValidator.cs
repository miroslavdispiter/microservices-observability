using Shared.DTOs.User;
using System.Collections.Generic;

namespace WebAPIService.Validators
{
    public class LoginRequestValidator
    {
        public static (bool IsValid, List<string> Errors) Validate(LoginRequestDto request)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(request.Email))
                errors.Add("Email is required.");

            if (string.IsNullOrWhiteSpace(request.Password))
                errors.Add("Password is required.");

            return (errors.Count == 0, errors);
        }
    }
}