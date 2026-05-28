using Shared.Common;
using Shared.DTOs.TravelPlan;
using Shared.Interfaces;
using TravelService.Models;
using TravelService.Repositories;

namespace TravelService.Services
{
    public class TravelPlanImplementation : ITravelService
    {
        private readonly TravelRepository _repo;

        public TravelPlanImplementation(TravelRepository repo)
        {
            _repo = repo;
        }

        public async Task<ServiceResult<TravelPlanDto>> Create(int userId, CreateTravelPlanDto dto)
        {
            if (dto.EndDate < dto.StartDate)
                return ServiceResult<TravelPlanDto>.FailureResult("End date cannot be before start date.");

            if (dto.Budget < 0)
                return ServiceResult<TravelPlanDto>.FailureResult("Budget cannot be negative.");

            var plan = new TravelPlan
            {
                UserId = userId,
                Title = dto.Title,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Budget = dto.Budget,
                Notes = dto.Notes,
                CreatedAt = DateTime.UtcNow
            };

            var saved = await _repo.AddAsync(plan);

            return ServiceResult<TravelPlanDto>.SuccessResult(new TravelPlanDto
            {
                Id = saved.Id,
                Title = saved.Title,
                Description = saved.Description,
                StartDate = saved.StartDate,
                EndDate = saved.EndDate,
                Budget = saved.Budget,
                Notes = saved.Notes
            });
        }

        public async Task<ServiceResult<List<TravelPlanDto>>> GetAll(int userId)
        {
            var plans = await _repo.GetAllByUserId(userId);

            var result = plans.Select(p => new TravelPlanDto
            {
                Id = p.Id,
                Title = p.Title,
                Description = p.Description,
                StartDate = p.StartDate,
                EndDate = p.EndDate,
                Budget = p.Budget,
                Notes = p.Notes
            }).ToList();

            return ServiceResult<List<TravelPlanDto>>.SuccessResult(result);
        }

        public async Task<ServiceResult<TravelPlanDto>> GetById(int id)
        {
            var plan = await _repo.GetById(id);

            if (plan == null)
                return ServiceResult<TravelPlanDto>.FailureResult("Not found");

            return ServiceResult<TravelPlanDto>.SuccessResult(new TravelPlanDto
            {
                Id = plan.Id,
                Title = plan.Title,
                Description = plan.Description,
                StartDate = plan.StartDate,
                EndDate = plan.EndDate,
                Budget = plan.Budget,
                Notes = plan.Notes
            });
        }

        public async Task<ServiceResult<bool>> Update(int id, CreateTravelPlanDto dto)
        {
            var plan = await _repo.GetById(id);

            if (plan == null)
                return ServiceResult<bool>.FailureResult("Not found");

            plan.Title = dto.Title;
            plan.Description = dto.Description;
            plan.StartDate = dto.StartDate;
            plan.EndDate = dto.EndDate;
            plan.Budget = dto.Budget;
            plan.Notes = dto.Notes;

            await _repo.Update();

            return ServiceResult<bool>.SuccessResult(true);
        }

        public async Task<ServiceResult<bool>> Delete(int id)
        {
            var plan = await _repo.GetById(id);

            if (plan == null)
                return ServiceResult<bool>.FailureResult("Not found");

            await _repo.Delete(plan);

            return ServiceResult<bool>.SuccessResult(true);
        }
    }
}