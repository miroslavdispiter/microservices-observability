using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TravelService.DbContext;
using TravelService.Interfaces;
using TravelService.Models;

namespace TravelService.Repositories
{
    public class ChecklistRepository : IChecklistRepository
    {
        private readonly TravelDbContext _context;

        public ChecklistRepository(TravelDbContext context)
        {
            _context = context;
        }

        public async Task<ChecklistItem> AddAsync(ChecklistItem item)
        {
            await _context.ChecklistItems.AddAsync(item);
            await _context.SaveChangesAsync();
            return item;
        }

        public async Task<List<ChecklistItem>> GetAllByTravelPlanId(int travelPlanId)
        {
            return await _context.ChecklistItems
                .Where(x => x.TravelPlanId == travelPlanId)
                .OrderByDescending(x => x.Priority)
                .ThenBy(x => x.IsCompleted)
                .ThenBy(x => x.CreatedAt)
                .ToListAsync();
        }

        public async Task<ChecklistItem> GetById(int id)
        {
            return await _context.ChecklistItems.FindAsync(id);
        }

        public async Task Update(ChecklistItem item)
        {
            _context.ChecklistItems.Update(item);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(ChecklistItem item)
        {
            _context.ChecklistItems.Remove(item);
            await _context.SaveChangesAsync();
        }

        public async Task<int> GetCompletedCount(int travelPlanId)
        {
            return await _context.ChecklistItems
                .Where(x => x.TravelPlanId == travelPlanId && x.IsCompleted)
                .CountAsync();
        }

        public async Task<int> GetTotalCount(int travelPlanId)
        {
            return await _context.ChecklistItems
                .Where(x => x.TravelPlanId == travelPlanId)
                .CountAsync();
        }
    }
}