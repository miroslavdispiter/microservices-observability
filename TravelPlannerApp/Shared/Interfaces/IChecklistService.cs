using Microsoft.ServiceFabric.Services.Remoting;
using Shared.Common;
using Shared.DTOs.Checklist;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shared.Interfaces
{
    public interface IChecklistService : IService
    {
        Task<ServiceResult<ChecklistItemDto>> CreateChecklistItem(int travelPlanId, CreateChecklistItemDto dto);
        Task<ServiceResult<List<ChecklistItemDto>>> GetAllChecklistItems(int travelPlanId);
        Task<ServiceResult<ChecklistItemDto>> GetChecklistItemById(int id);
        Task<ServiceResult<bool>> UpdateChecklistItem(int id, CreateChecklistItemDto dto);
        Task<ServiceResult<bool>> ToggleChecklistItem(int id);
        Task<ServiceResult<bool>> DeleteChecklistItem(int id);
        Task<ServiceResult<int>> GetCompletedCount(int travelPlanId);
    }
}