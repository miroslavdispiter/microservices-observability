using Microsoft.ServiceFabric.Services.Remoting;
using Shared.Common;
using Shared.DTOs.Activity;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shared.Interfaces
{
    public interface IActivityService : IService
    {
        Task<ServiceResult<ActivityDto>> CreateActivity(int travelPlanId, CreateActivityDto dto);
        Task<ServiceResult<List<ActivityDto>>> GetAllActivities(int travelPlanId);
        Task<ServiceResult<List<ActivityDto>>> GetActivitiesByDate(int travelPlanId, DateTime date);
        Task<ServiceResult<List<ActivityDto>>> GetActivitiesInRange(int travelPlanId, DateTime startDate, DateTime endDate);
        Task<ServiceResult<ActivityDto>> GetActivityById(int id);
        Task<ServiceResult<bool>> UpdateActivity(int id, CreateActivityDto dto);
        Task<ServiceResult<bool>> DeleteActivity(int id);
    }
}