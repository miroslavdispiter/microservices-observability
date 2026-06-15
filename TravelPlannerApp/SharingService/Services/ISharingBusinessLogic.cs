using Shared.Common;
using Shared.DTOs.Sharing;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SharingService.Services
{
    public interface ISharingBusinessLogic
    {
        Task<ServiceResult<SharingTokenDto>> CreateSharingToken(int userId, CreateSharingTokenDto dto);
        Task<ServiceResult<SharingTokenDto>> GetSharingToken(string token);
        Task<ServiceResult<List<SharingTokenDto>>> GetUserSharingTokens(int userId);
        Task<ServiceResult<bool>> RevokeSharingToken(string token, int userId);
        Task<ServiceResult<bool>> ValidateSharingToken(ValidateSharingTokenDto dto);
    }
}