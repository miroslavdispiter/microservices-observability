using Shared.Common;
using Shared.DTOs.Destination;
using Shared.Interfaces;
using TravelService.Interfaces;
using TravelService.Models;

namespace TravelService.Services
{
    public class DestinationImplementation : IDestinationService
    {
        private readonly IDestinationRepository _destinationRepo;
        private readonly ITravelPlanRepository _travelPlanRepo;

        public DestinationImplementation(
            IDestinationRepository destinationRepo,
            ITravelPlanRepository travelPlanRepo)
        {
            _destinationRepo = destinationRepo;
            _travelPlanRepo = travelPlanRepo;
        }

        public async Task<ServiceResult<DestinationDto>> CreateDestination(int travelPlanId, CreateDestinationDto dto)
        {
            var travelPlan = await _travelPlanRepo.GetByIdAsync(travelPlanId);
            if (travelPlan == null)
                return ServiceResult<DestinationDto>.FailureResult("Travel plan not found.");

            if (dto.DepartureDate < dto.ArrivalDate)
                return ServiceResult<DestinationDto>.FailureResult("Departure date cannot be before arrival date.");

            if (dto.ArrivalDate < travelPlan.StartDate || dto.DepartureDate > travelPlan.EndDate)
                return ServiceResult<DestinationDto>.FailureResult("Destination dates must be within travel plan dates.");

            var destination = new Destination
            {
                TravelPlanId = travelPlanId,
                Name = dto.Name,
                Location = dto.Location,
                ArrivalDate = dto.ArrivalDate,
                DepartureDate = dto.DepartureDate,
                Description = dto.Description,
                CreatedAt = DateTime.UtcNow
            };

            var saved = await _destinationRepo.AddAsync(destination);

            return ServiceResult<DestinationDto>.SuccessResult(new DestinationDto
            {
                Id = saved.Id,
                TravelPlanId = saved.TravelPlanId,
                Name = saved.Name,
                Location = saved.Location,
                ArrivalDate = saved.ArrivalDate,
                DepartureDate = saved.DepartureDate,
                Description = saved.Description
            });
        }

        public async Task<ServiceResult<List<DestinationDto>>> GetAllDestinations(int travelPlanId)
        {
            var travelPlan = await _travelPlanRepo.GetByIdAsync(travelPlanId);
            if (travelPlan == null)
                return ServiceResult<List<DestinationDto>>.FailureResult("Travel plan not found.");

            var destinations = await _destinationRepo.GetAllByTravelPlanId(travelPlanId);

            var result = destinations.Select(d => new DestinationDto
            {
                Id = d.Id,
                TravelPlanId = d.TravelPlanId,
                Name = d.Name,
                Location = d.Location,
                ArrivalDate = d.ArrivalDate,
                DepartureDate = d.DepartureDate,
                Description = d.Description
            }).ToList();

            return ServiceResult<List<DestinationDto>>.SuccessResult(result);
        }

        public async Task<ServiceResult<DestinationDto>> GetDestinationById(int id)
        {
            var destination = await _destinationRepo.GetById(id);

            if (destination == null)
                return ServiceResult<DestinationDto>.FailureResult("Destination not found.");

            return ServiceResult<DestinationDto>.SuccessResult(new DestinationDto
            {
                Id = destination.Id,
                TravelPlanId = destination.TravelPlanId,
                Name = destination.Name,
                Location = destination.Location,
                ArrivalDate = destination.ArrivalDate,
                DepartureDate = destination.DepartureDate,
                Description = destination.Description
            });
        }

        public async Task<ServiceResult<bool>> UpdateDestination(int id, CreateDestinationDto dto)
        {
            var destination = await _destinationRepo.GetById(id);

            if (destination == null)
                return ServiceResult<bool>.FailureResult("Destination not found.");

            var travelPlan = await _travelPlanRepo.GetByIdAsync(destination.TravelPlanId);

            if (dto.DepartureDate < dto.ArrivalDate)
                return ServiceResult<bool>.FailureResult("Departure date cannot be before arrival date.");

            if (dto.ArrivalDate < travelPlan.StartDate || dto.DepartureDate > travelPlan.EndDate)
                return ServiceResult<bool>.FailureResult("Destination dates must be within travel plan dates.");

            destination.Name = dto.Name;
            destination.Location = dto.Location;
            destination.ArrivalDate = dto.ArrivalDate;
            destination.DepartureDate = dto.DepartureDate;
            destination.Description = dto.Description;

            await _destinationRepo.Update(destination);

            return ServiceResult<bool>.SuccessResult(true);
        }

        public async Task<ServiceResult<bool>> DeleteDestination(int id)
        {
            var destination = await _destinationRepo.GetById(id);

            if (destination == null)
                return ServiceResult<bool>.FailureResult("Destination not found.");

            await _destinationRepo.Delete(destination);

            return ServiceResult<bool>.SuccessResult(true);
        }
    }
}
