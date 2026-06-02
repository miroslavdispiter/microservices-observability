using TravelService.Models;

namespace TravelService.Interfaces
{
    public interface IDestinationRepository
    {
        Task<Destination> AddAsync(Destination destination);
        Task<List<Destination>> GetAllByTravelPlanId(int travelPlanId);
        Task<Destination> GetById(int id);
        Task Update(Destination destination);
        Task Delete(Destination destination);
    }
}
