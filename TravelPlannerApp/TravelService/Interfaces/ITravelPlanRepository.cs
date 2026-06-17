using TravelService.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace TravelService.Interfaces
{
    public interface ITravelPlanRepository
    {
        Task<TravelPlan> CreateAsync(TravelPlan plan);
        Task<List<TravelPlan>> GetAllByUserIdAsync(int userId);
        Task<TravelPlan> GetByIdAsync(int id);
        Task<bool> UpdateAsync(TravelPlan plan);
        Task<bool> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);
        Task<List<TravelPlan>> GetAllAsync();
        Task<bool> DeleteByUserIdAsync(int userId);
    }
}