using Microsoft.EntityFrameworkCore;
using TravelService.DbContext;
using TravelService.Interfaces;
using TravelService.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace TravelService.Repositories
{
    public class TravelPlanRepository : ITravelPlanRepository
    {
        private readonly TravelDbContext _context;

        public TravelPlanRepository(TravelDbContext context)
        {
            _context = context;
        }

        public async Task<TravelPlan> CreateAsync(TravelPlan plan)
        {
            await _context.TravelPlans.AddAsync(plan);
            await _context.SaveChangesAsync();
            return plan;
        }

        public async Task<List<TravelPlan>> GetAllByUserIdAsync(int userId)
        {
            return await _context.TravelPlans
                .Where(tp => tp.UserId == userId)
                .OrderByDescending(tp => tp.CreatedAt)
                .ToListAsync();
        }

        public async Task<TravelPlan> GetByIdAsync(int id)
        {
            return await _context.TravelPlans.FindAsync(id);
        }

        public async Task<bool> UpdateAsync(TravelPlan plan)
        {
            _context.TravelPlans.Update(plan);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> DeleteAsync(int id)
        {
            var plan = await _context.TravelPlans.FindAsync(id);
            if (plan == null)
                return false;

            _context.TravelPlans.Remove(plan);
            var result = await _context.SaveChangesAsync();
            return result > 0;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.TravelPlans.AnyAsync(tp => tp.Id == id);
        }

        public async Task<List<TravelPlan>> GetAllAsync()
        {
            return await _context.TravelPlans
                .OrderByDescending(tp => tp.CreatedAt)
                .ToListAsync();
        }

        public async Task<bool> DeleteByUserIdAsync(int userId)
        {
            var plans = await _context.TravelPlans
                .Where(tp => tp.UserId == userId)
                .ToListAsync();

            if (plans.Any())
            {
                _context.TravelPlans.RemoveRange(plans);
                await _context.SaveChangesAsync();
            }

            return true;
        }
    }
}