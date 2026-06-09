using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using Shared.Common;
using Shared.DTOs.TravelPlan;
using Shared.Interfaces;

namespace WebAPIService.Services
{
    public class TravelServiceProxy
    {
        public ITravelService GetTravelPlanProxy()
            => ServiceProxy.Create<ITravelService>(new Uri("fabric:/TravelPlannerApp/TravelService"));

        public IDestinationService GetDestinationProxy()
            => ServiceProxy.Create<IDestinationService>(new Uri("fabric:/TravelPlannerApp/TravelService"));

        public IActivityService GetActivityProxy()
            => ServiceProxy.Create<IActivityService>(new Uri("fabric:/TravelPlannerApp/TravelService"));
    }
}