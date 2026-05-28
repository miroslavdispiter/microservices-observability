using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using Shared.Common;
using Shared.DTOs.TravelPlan;
using Shared.Interfaces;

namespace WebAPIService.Services
{
    public class TravelServiceProxy
    {
        private readonly ITravelService _proxy;

        public TravelServiceProxy()
        {
            _proxy = ServiceProxy.Create<ITravelService>(
                new Uri("fabric:/TravelPlannerApp/TravelService")
            );
        }

        public Task<ServiceResult<TravelPlanDto>> Create(int userId, CreateTravelPlanDto dto)
            => _proxy.Create(userId, dto);

        public Task<ServiceResult<List<TravelPlanDto>>> GetAll(int userId)
            => _proxy.GetAll(userId);

        public Task<ServiceResult<TravelPlanDto>> GetById(int id)
            => _proxy.GetById(id);

        public Task<ServiceResult<bool>> Update(int id, CreateTravelPlanDto dto)
            => _proxy.Update(id, dto);

        public Task<ServiceResult<bool>> Delete(int id)
            => _proxy.Delete(id);
    }
}