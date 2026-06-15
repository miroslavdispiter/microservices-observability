using Shared.DTOs.User;
using System.Collections.Generic;

namespace WebAPIService.Validators
{
    public static class UpdateUserValidator
    {
        public static (bool IsValid, Dictionary<string, string> Errors) Validate(UpdateUserDto dto)
        {
            var errors = new Dictionary<string, string>();

            if (string.IsNullOrWhiteSpace(dto.FirstName))
            {
                errors["firstName"] = "First name is required.";
            }
            else if (dto.FirstName.Length < 2)
            {
                errors["firstName"] = "First name must be at least 2 characters long.";
            }
            else if (dto.FirstName.Length > 100)
            {
                errors["firstName"] = "First name cannot exceed 100 characters.";
            }

            if (string.IsNullOrWhiteSpace(dto.LastName))
            {
                errors["lastName"] = "Last name is required.";
            }
            else if (dto.LastName.Length < 2)
            {
                errors["lastName"] = "Last name must be at least 2 characters long.";
            }
            else if (dto.LastName.Length > 100)
            {
                errors["lastName"] = "Last name cannot exceed 100 characters.";
            }

            if (string.IsNullOrWhiteSpace(dto.Username))
            {
                errors["username"] = "Username is required.";
            }
            else if (dto.Username.Length < 3)
            {
                errors["username"] = "Username must be at least 3 characters long.";
            }
            else if (dto.Username.Length > 50)
            {
                errors["username"] = "Username cannot exceed 50 characters.";
            }

            if (string.IsNullOrWhiteSpace(dto.Email))
            {
                errors["email"] = "Email is required.";
            }
            else if (!IsValidEmail(dto.Email))
            {
                errors["email"] = "Invalid email format.";
            }
            else if (dto.Email.Length > 255)
            {
                errors["email"] = "Email cannot exceed 255 characters.";
            }

            if (string.IsNullOrWhiteSpace(dto.Role))
            {
                errors["role"] = "Role is required.";
            }
            else if (dto.Role != "User" && dto.Role != "Admin")
            {
                errors["role"] = "Role must be either 'User' or 'Admin'.";
            }

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