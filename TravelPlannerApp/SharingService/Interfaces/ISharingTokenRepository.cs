using SharingService.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SharingService.Interfaces
{
    public interface ISharingTokenRepository
    {
        Task<SharingTokenData> CreateAsync(SharingTokenData tokenData);
        Task<SharingTokenData> GetByTokenAsync(string token);
        Task<List<SharingTokenData>> GetByOwnerIdAsync(int ownerId);
        Task<bool> RevokeAsync(string token);
        Task<bool> ExistsAsync(string token);
    }
}