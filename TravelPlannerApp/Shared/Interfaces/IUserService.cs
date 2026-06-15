using Microsoft.ServiceFabric.Services.Remoting;
using Shared.Common;
using Shared.DTOs.User;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shared.Interfaces
{
    public interface IUserService : IService
    {
        Task<ServiceResult<AuthResponseDto>> Register(RegisterRequestDto request);
        Task<ServiceResult<AuthResponseDto>> Login(LoginRequestDto request);

        // Admin funkcionalnosti
        Task<ServiceResult<List<UserDto>>> GetAllUsers();
        Task<ServiceResult<UserDto>> GetUserById(int id);
        Task<ServiceResult<bool>> UpdateUser(int id, UpdateUserDto dto);
        Task<ServiceResult<bool>> DeleteUser(int id);
        Task<ServiceResult<bool>> ChangeUserPassword(int id, ChangePasswordDto dto);
    }
}
