using System.Collections.Generic;
using System.Threading.Tasks;
using TravelService.Models;

namespace TravelService.Interfaces
{
    public interface IChecklistRepository
    {
        Task<ChecklistItem> AddAsync(ChecklistItem item);
        Task<List<ChecklistItem>> GetAllByTravelPlanId(int travelPlanId);
        Task<ChecklistItem> GetById(int id);
        Task Update(ChecklistItem item);
        Task Delete(ChecklistItem item);
        Task<int> GetCompletedCount(int travelPlanId);
        Task<int> GetTotalCount(int travelPlanId);
    }
}