using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using TravelService.Models;

namespace TravelService.Interfaces
{
    public interface IActivityRepository
    {
        Task<Activity> AddAsync(Activity activity);
        Task<List<Activity>> GetAllByTravelPlanId(int travelPlanId);
        Task<List<Activity>> GetByDateRange(int travelPlanId, DateTime startDate, DateTime endDate);
        Task<Activity> GetById(int id);
        Task Update(Activity activity);
        Task Delete(Activity activity);
    }
}