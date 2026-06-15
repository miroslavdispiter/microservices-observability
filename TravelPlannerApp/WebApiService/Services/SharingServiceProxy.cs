using Microsoft.ServiceFabric.Services.Remoting.Client;
using Shared.Interfaces;
using System;

namespace WebAPIService.Services
{
    public class SharingServiceProxy
    {
        public ISharingService GetSharingServiceProxy()
            => ServiceProxy.Create<ISharingService>(
                new Uri("fabric:/TravelPlannerApp/SharingService")
            );
    }
}