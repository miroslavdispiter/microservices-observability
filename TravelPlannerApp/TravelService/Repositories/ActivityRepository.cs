using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TravelService.DbContext;
using TravelService.Interfaces;
using TravelService.Models;

namespace TravelService.Repositories
{
    public class ActivityRepository : IActivityRepository
    {
        private readonly TravelDbContext _context;

        public ActivityRepository(TravelDbContext context)
        {
            _context = context;
        }

        public async Task<Activity> AddAsync(Activity activity)
        {
            await _context.Activities.AddAsync(activity);
            await _context.SaveChangesAsync();
            return activity;
        }

        public async Task<List<Activity>> GetAllByTravelPlanId(int travelPlanId)
        {
            return await _context.Activities
                .Where(x => x.TravelPlanId == travelPlanId)
                .OrderBy(x => x.Date)
                .ThenBy(x => x.Time)
                .ToListAsync();
        }

        public async Task<List<Activity>> GetByDateRange(int travelPlanId, DateTime startDate, DateTime endDate)
        {
            return await _context.Activities
                .Where(x => x.TravelPlanId == travelPlanId
                         && x.Date >= startDate.Date
                         && x.Date <= endDate.Date)
                .OrderBy(x => x.Date)
                .ThenBy(x => x.Time)
                .ToListAsync();
        }

        public async Task<Activity> GetById(int id)
        {
            return await _context.Activities.FindAsync(id);
        }

        public async Task Update(Activity activity)
        {
            _context.Activities.Update(activity);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(Activity activity)
        {
            _context.Activities.Remove(activity);
            await _context.SaveChangesAsync();
        }
    }
}