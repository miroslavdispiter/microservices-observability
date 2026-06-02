using Microsoft.ServiceFabric.Services.Remoting;
using Shared.Common;
using Shared.DTOs.Destination;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shared.Interfaces
{
    public interface IDestinationService : IService
    {
        Task<ServiceResult<DestinationDto>> CreateDestination(int travelPlanId, CreateDestinationDto dto);
        Task<ServiceResult<List<DestinationDto>>> GetAllDestinations(int travelPlanId);
        Task<ServiceResult<DestinationDto>> GetDestinationById(int id);
        Task<ServiceResult<bool>> UpdateDestination(int id, CreateDestinationDto dto);
        Task<ServiceResult<bool>> DeleteDestination(int id);
    }
}
