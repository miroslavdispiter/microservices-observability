using Shared.DTOs.User;
using System.Collections.Generic;

namespace WebAPIService.Validators
{
    public static class ChangePasswordValidator
    {
        public static (bool IsValid, Dictionary<string, string> Errors) Validate(ChangePasswordDto dto)
        {
            var errors = new Dictionary<string, string>();

            if (string.IsNullOrWhiteSpace(dto.NewPassword))
            {
                errors["newPassword"] = "New password is required.";
            }
            else if (dto.NewPassword.Length < 6)
            {
                errors["newPassword"] = "Password must be at least 6 characters long.";
            }
            else if (dto.NewPassword.Length > 100)
            {
                errors["newPassword"] = "Password cannot exceed 100 characters.";
            }

            return (errors.Count == 0, errors);
        }
    }
}