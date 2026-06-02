using Microsoft.EntityFrameworkCore;
using TravelService.DbContext;
using TravelService.Interfaces;
using TravelService.Models;

namespace TravelService.Repositories
{
    public class DestinationRepository : IDestinationRepository
    {
        private readonly TravelDbContext _context;

        public DestinationRepository(TravelDbContext context)
        {
            _context = context;
        }

        public async Task<Destination> AddAsync(Destination destination)
        {
            await _context.Destinations.AddAsync(destination);
            await _context.SaveChangesAsync();
            return destination;
        }

        public async Task<List<Destination>> GetAllByTravelPlanId(int travelPlanId)
        {
            return await _context.Destinations
                .Where(x => x.TravelPlanId == travelPlanId)
                .OrderBy(x => x.ArrivalDate)
                .ToListAsync();
        }

        public async Task<Destination> GetById(int id)
        {
            return await _context.Destinations.FindAsync(id);
        }

        public async Task Update(Destination destination)
        {
            _context.Destinations.Update(destination);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(Destination destination)
        {
            _context.Destinations.Remove(destination);
            await _context.SaveChangesAsync();
        }
    }
}