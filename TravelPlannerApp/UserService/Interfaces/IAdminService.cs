using Shared.Common;
using Shared.DTOs.User;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace UserService.Interfaces
{
    public interface IAdminService
    {
        Task<ServiceResult<List<UserDto>>> GetAllUsers();
        Task<ServiceResult<UserDto>> GetUserById(int id);
        Task<ServiceResult<bool>> UpdateUser(int id, UpdateUserDto dto);
        Task<ServiceResult<bool>> DeleteUser(int id);
        Task<ServiceResult<bool>> ChangeUserPassword(int id, ChangePasswordDto dto);
    }
}