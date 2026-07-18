using Shared.Common;
using Shared.DTOs.User;
using Shared.Enums;
using UserService.Interfaces;
using UserService.Models;
using UserService.Observability;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Stopwatch = System.Diagnostics.Stopwatch;

namespace UserService.Services
{
    public class AdminServiceImplementation : IAdminService
    {
        private readonly IUserRepository _userRepository;

        public AdminServiceImplementation(IUserRepository userRepository)
        {
            _userRepository = userRepository;
        }

        public async Task<ServiceResult<List<UserDto>>> GetAllUsers()
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await GetAllUsersCore();
            UserServiceMetrics.RecordOperation("GetAllUsers", result.Success, stopwatch.Elapsed.TotalMilliseconds);
            return result;
        }

        private async Task<ServiceResult<List<UserDto>>> GetAllUsersCore()
        {
            try
            {
                var users = await _userRepository.GetAllAsync();

                var userDtos = users.Select(u => new UserDto
                {
                    Id = u.Id,
                    FirstName = u.FirstName,
                    LastName = u.LastName,
                    Username = u.Username,
                    Email = u.Email,
                    Role = u.Role.ToString(),
                    CreatedAt = u.CreatedAt
                }).ToList();

                return ServiceResult<List<UserDto>>.SuccessResult(userDtos, "Users retrieved successfully.");
            }
            catch (Exception ex)
            {
                return ServiceResult<List<UserDto>>.FailureResult($"Failed to retrieve users: {ex.Message}");
            }
        }

        public async Task<ServiceResult<UserDto>> GetUserById(int id)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await GetUserByIdCore(id);
            UserServiceMetrics.RecordOperation("GetUserById", result.Success, stopwatch.Elapsed.TotalMilliseconds);
            return result;
        }

        private async Task<ServiceResult<UserDto>> GetUserByIdCore(int id)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(id);
                if (user == null)
                {
                    return ServiceResult<UserDto>.FailureResult("User not found.");
                }

                var userDto = new UserDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Username = user.Username,
                    Email = user.Email,
                    Role = user.Role.ToString(),
                    CreatedAt = user.CreatedAt
                };

                return ServiceResult<UserDto>.SuccessResult(userDto, "User retrieved successfully.");
            }
            catch (Exception ex)
            {
                return ServiceResult<UserDto>.FailureResult($"Failed to retrieve user: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> UpdateUser(int id, UpdateUserDto dto)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await UpdateUserCore(id, dto);
            UserServiceMetrics.RecordOperation("UpdateUser", result.Success, stopwatch.Elapsed.TotalMilliseconds);
            return result;
        }

        private async Task<ServiceResult<bool>> UpdateUserCore(int id, UpdateUserDto dto)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(id);
                if (user == null)
                {
                    return ServiceResult<bool>.FailureResult("User not found.");
                }

                if (dto.Username != user.Username)
                {
                    var existingUser = await _userRepository.GetByUsernameAsync(dto.Username);
                    if (existingUser != null && existingUser.Id != id)
                    {
                        return ServiceResult<bool>.FailureResult("Username is already taken.");
                    }
                }

                if (dto.Email != user.Email)
                {
                    var existingUser = await _userRepository.GetByEmailAsync(dto.Email);
                    if (existingUser != null && existingUser.Id != id)
                    {
                        return ServiceResult<bool>.FailureResult("Email is already taken.");
                    }
                }

                user.FirstName = dto.FirstName;
                user.LastName = dto.LastName;
                user.Username = dto.Username;
                user.Email = dto.Email;

                if (Enum.TryParse<UserRole>(dto.Role, out var role))
                {
                    user.Role = role;
                }

                var result = await _userRepository.UpdateAsync(user);

                return result
                    ? ServiceResult<bool>.SuccessResult(true, "User updated successfully.")
                    : ServiceResult<bool>.FailureResult("Failed to update user.");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Failed to update user: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> DeleteUser(int id)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await DeleteUserCore(id);
            UserServiceMetrics.RecordOperation("DeleteUser", result.Success, stopwatch.Elapsed.TotalMilliseconds);
            return result;
        }

        private async Task<ServiceResult<bool>> DeleteUserCore(int id)
        {
            try
            {
                var exists = await _userRepository.ExistsAsync(id);
                if (!exists)
                {
                    return ServiceResult<bool>.FailureResult("User not found.");
                }

                var result = await _userRepository.DeleteAsync(id);

                return result
                    ? ServiceResult<bool>.SuccessResult(true, "User deleted successfully.")
                    : ServiceResult<bool>.FailureResult("Failed to delete user.");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Failed to delete user: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> ChangeUserPassword(int id, ChangePasswordDto dto)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await ChangeUserPasswordCore(id, dto);
            UserServiceMetrics.RecordOperation("ChangeUserPassword", result.Success, stopwatch.Elapsed.TotalMilliseconds);
            return result;
        }

        private async Task<ServiceResult<bool>> ChangeUserPasswordCore(int id, ChangePasswordDto dto)
        {
            try
            {
                var user = await _userRepository.GetByIdAsync(id);
                if (user == null)
                {
                    return ServiceResult<bool>.FailureResult("User not found.");
                }

                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
                user.Password = hashedPassword;

                var result = await _userRepository.UpdateAsync(user);

                return result
                    ? ServiceResult<bool>.SuccessResult(true, "Password changed successfully.")
                    : ServiceResult<bool>.FailureResult("Failed to change password.");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Failed to change password: {ex.Message}");
            }
        }
    }
}