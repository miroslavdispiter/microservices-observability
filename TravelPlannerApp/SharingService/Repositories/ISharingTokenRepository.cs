using SharingService.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace SharingService.Repositories
{
    public interface ISharingTokenRepository
    {
        Task<SharingToken> CreateAsync(SharingToken token);
        Task<SharingToken> GetByTokenAsync(string token);
        Task<List<SharingToken>> GetByOwnerIdAsync(int ownerId);
        Task<bool> RevokeAsync(string token);
        Task<bool> ExistsAsync(string token);
    }
}