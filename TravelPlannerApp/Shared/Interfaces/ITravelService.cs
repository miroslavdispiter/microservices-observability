using Microsoft.ServiceFabric.Services.Remoting;
using Shared.Common;
using Shared.DTOs.TravelPlan;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shared.Interfaces
{
    public interface ITravelService : IService
    {
        Task<ServiceResult<TravelPlanDto>> Create(int userId, CreateTravelPlanDto dto);
        Task<ServiceResult<List<TravelPlanDto>>> GetAll(int userId);
        Task<ServiceResult<TravelPlanDto>> GetById(int id);
        Task<ServiceResult<bool>> Update(int id, CreateTravelPlanDto dto);
        Task<ServiceResult<bool>> Delete(int id);
        Task<ServiceResult<List<TravelPlanDto>>> GetAllTravelPlans();
        Task<ServiceResult<bool>> DeleteByUserId(int userId);
    }
}