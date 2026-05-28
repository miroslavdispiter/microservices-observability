using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TravelService.DbContext;
using TravelService.Models;

namespace TravelService.Repositories
{
    public class TravelRepository
    {
        private readonly TravelDbContext _context;

        public TravelRepository(TravelDbContext context)
        {
            _context = context;
        }

        public async Task<TravelPlan> AddAsync(TravelPlan plan)
        {
            await _context.TravelPlans.AddAsync(plan);
            await _context.SaveChangesAsync();
            return plan;
        }

        public async Task<List<TravelPlan>> GetAllByUserId(int userId)
        {
            return await _context.TravelPlans
                .Where(x => x.UserId == userId)
                .ToListAsync();
        }

        public async Task<TravelPlan> GetById(int id)
        {
            return await _context.TravelPlans.FindAsync(id);
        }

        public async Task Update()
        {
            await _context.SaveChangesAsync();
        }

        public async Task Delete(TravelPlan plan)
        {
            _context.TravelPlans.Remove(plan);
            await _context.SaveChangesAsync();
        }
    }
}
