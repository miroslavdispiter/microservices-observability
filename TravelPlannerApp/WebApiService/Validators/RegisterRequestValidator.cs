using Shared.DTOs.User;
using System.Collections.Generic;

namespace WebAPIService.Validators
{
    public class RegisterRequestValidator
    {
        public static (bool IsValid, List<string> Errors) Validate(RegisterRequestDto request)
        {
            var errors = new List<string>();

            if (string.IsNullOrWhiteSpace(request.FirstName))
                errors.Add("First name is required.");

            if (string.IsNullOrWhiteSpace(request.LastName))
                errors.Add("Last name is required.");

            if (string.IsNullOrWhiteSpace(request.Username))
                errors.Add("Username is required.");
            else if (request.Username.Length < 3)
                errors.Add("Username must be at least 3 characters long.");

            if (string.IsNullOrWhiteSpace(request.Email))
                errors.Add("Email is required.");
            else if (!IsValidEmail(request.Email))
                errors.Add("Invalid email format.");

            if (string.IsNullOrWhiteSpace(request.Password))
                errors.Add("Password is required.");
            else if (request.Password.Length < 6)
                errors.Add("Password must be at least 6 characters long.");

            return (errors.Count == 0, errors);
        }

        private static bool IsValidEmail(string email)
        {
            try
            {
                var addr = new System.Net.Mail.MailAddress(email);
                return addr.Address == email;
            }
            catch
            {
                return false;
            }
        }
    }
}