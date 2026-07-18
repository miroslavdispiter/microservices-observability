using Shared.Common;
using Shared.DTOs.TravelPlan;
using Shared.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TravelService.Interfaces;
using TravelService.Models;
using TravelService.Observability;
using Stopwatch = System.Diagnostics.Stopwatch;

namespace TravelService.Services
{
    public class TravelPlanImplementation : ITravelService
    {
        private readonly ITravelPlanRepository _repository;

        public TravelPlanImplementation(ITravelPlanRepository repository)
        {
            _repository = repository;
        }

        public async Task<ServiceResult<TravelPlanDto>> Create(int userId, CreateTravelPlanDto dto)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await CreateCore(userId, dto);
            TravelServiceMetrics.RecordOperation("TravelPlan", "Create", result.Success, stopwatch.Elapsed.TotalMilliseconds);
            return result;
        }

        private async Task<ServiceResult<TravelPlanDto>> CreateCore(int userId, CreateTravelPlanDto dto)
        {
            try
            {
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

                var created = await _repository.CreateAsync(plan);

                var planDto = new TravelPlanDto
                {
                    Id = created.Id,
                    Title = created.Title,
                    Description = created.Description,
                    StartDate = created.StartDate,
                    EndDate = created.EndDate,
                    Budget = created.Budget,
                    Notes = created.Notes
                };

                return ServiceResult<TravelPlanDto>.SuccessResult(planDto, "Travel plan created successfully.");
            }
            catch (Exception ex)
            {
                return ServiceResult<TravelPlanDto>.FailureResult($"Failed to create travel plan: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<TravelPlanDto>>> GetAll(int userId)
        {
            try
            {
                var plans = await _repository.GetAllByUserIdAsync(userId);

                var planDtos = plans.Select(p => new TravelPlanDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    Budget = p.Budget,
                    Notes = p.Notes
                }).ToList();

                return ServiceResult<List<TravelPlanDto>>.SuccessResult(planDtos, "Travel plans retrieved successfully.");
            }
            catch (Exception ex)
            {
                return ServiceResult<List<TravelPlanDto>>.FailureResult($"Failed to retrieve travel plans: {ex.Message}");
            }
        }

        public async Task<ServiceResult<TravelPlanDto>> GetById(int id)
        {
            try
            {
                var plan = await _repository.GetByIdAsync(id);
                if (plan == null)
                {
                    return ServiceResult<TravelPlanDto>.FailureResult("Travel plan not found.");
                }

                var planDto = new TravelPlanDto
                {
                    Id = plan.Id,
                    Title = plan.Title,
                    Description = plan.Description,
                    StartDate = plan.StartDate,
                    EndDate = plan.EndDate,
                    Budget = plan.Budget,
                    Notes = plan.Notes
                };

                return ServiceResult<TravelPlanDto>.SuccessResult(planDto, "Travel plan retrieved successfully.");
            }
            catch (Exception ex)
            {
                return ServiceResult<TravelPlanDto>.FailureResult($"Failed to retrieve travel plan: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> Update(int id, CreateTravelPlanDto dto)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await UpdateCore(id, dto);
            TravelServiceMetrics.RecordOperation("TravelPlan", "Update", result.Success, stopwatch.Elapsed.TotalMilliseconds);
            return result;
        }

        private async Task<ServiceResult<bool>> UpdateCore(int id, CreateTravelPlanDto dto)
        {
            try
            {
                var plan = await _repository.GetByIdAsync(id);
                if (plan == null)
                {
                    return ServiceResult<bool>.FailureResult("Travel plan not found.");
                }

                plan.Title = dto.Title;
                plan.Description = dto.Description;
                plan.StartDate = dto.StartDate;
                plan.EndDate = dto.EndDate;
                plan.Budget = dto.Budget;
                plan.Notes = dto.Notes;

                var result = await _repository.UpdateAsync(plan);

                return result
                    ? ServiceResult<bool>.SuccessResult(true, "Travel plan updated successfully.")
                    : ServiceResult<bool>.FailureResult("Failed to update travel plan.");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Failed to update travel plan: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> Delete(int id)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await DeleteCore(id);
            TravelServiceMetrics.RecordOperation("TravelPlan", "Delete", result.Success, stopwatch.Elapsed.TotalMilliseconds);
            return result;
        }

        private async Task<ServiceResult<bool>> DeleteCore(int id)
        {
            try
            {
                var result = await _repository.DeleteAsync(id);

                return result
                    ? ServiceResult<bool>.SuccessResult(true, "Travel plan deleted successfully.")
                    : ServiceResult<bool>.FailureResult("Travel plan not found.");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Failed to delete travel plan: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<TravelPlanDto>>> GetAllTravelPlans()
        {
            try
            {
                var plans = await _repository.GetAllAsync();

                var planDtos = plans.Select(p => new TravelPlanDto
                {
                    Id = p.Id,
                    Title = p.Title,
                    Description = p.Description,
                    StartDate = p.StartDate,
                    EndDate = p.EndDate,
                    Budget = p.Budget,
                    Notes = p.Notes
                }).ToList();

                return ServiceResult<List<TravelPlanDto>>.SuccessResult(planDtos, "All travel plans retrieved successfully.");
            }
            catch (Exception ex)
            {
                return ServiceResult<List<TravelPlanDto>>.FailureResult($"Failed to retrieve travel plans: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> DeleteByUserId(int userId)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await DeleteByUserIdCore(userId);
            TravelServiceMetrics.RecordOperation("TravelPlan", "DeleteByUserId", result.Success, stopwatch.Elapsed.TotalMilliseconds);
            return result;
        }

        private async Task<ServiceResult<bool>> DeleteByUserIdCore(int userId)
        {
            try
            {
                var result = await _repository.DeleteByUserIdAsync(userId);
                return ServiceResult<bool>.SuccessResult(result, "User travel plans deleted successfully.");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Failed to delete user travel plans: {ex.Message}");
            }
        }
    }
}