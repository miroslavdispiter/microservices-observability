using Shared.Common;
using Shared.DTOs.Activity;
using Shared.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TravelService.Interfaces;
using TravelService.Models;

namespace TravelService.Services
{
    public class ActivityImplementation : IActivityService
    {
        private readonly IActivityRepository _activityRepo;
        private readonly ITravelPlanRepository _travelPlanRepo;

        public ActivityImplementation(
            IActivityRepository activityRepo,
            ITravelPlanRepository travelPlanRepo)
        {
            _activityRepo = activityRepo;
            _travelPlanRepo = travelPlanRepo;
        }

        public async Task<ServiceResult<ActivityDto>> CreateActivity(int travelPlanId, CreateActivityDto dto)
        {
            var travelPlan = await _travelPlanRepo.GetById(travelPlanId);
            if (travelPlan == null)
                return ServiceResult<ActivityDto>.FailureResult("Travel plan not found.");

            if (dto.Date.Date < travelPlan.StartDate.Date || dto.Date.Date > travelPlan.EndDate.Date)
                return ServiceResult<ActivityDto>.FailureResult("Activity date must be within travel plan dates.");

            if (dto.EstimatedCost < 0)
                return ServiceResult<ActivityDto>.FailureResult("Estimated cost cannot be negative.");

            if (dto.Status < 0 || dto.Status > 3)
                return ServiceResult<ActivityDto>.FailureResult("Invalid status value.");

            var activity = new Activity
            {
                TravelPlanId = travelPlanId,
                Name = dto.Name,
                Date = dto.Date,
                Time = dto.Time,
                Location = dto.Location,
                Description = dto.Description,
                EstimatedCost = dto.EstimatedCost,
                Status = dto.Status,
                CreatedAt = DateTime.UtcNow
            };

            var saved = await _activityRepo.AddAsync(activity);

            return ServiceResult<ActivityDto>.SuccessResult(new ActivityDto
            {
                Id = saved.Id,
                TravelPlanId = saved.TravelPlanId,
                Name = saved.Name,
                Date = saved.Date,
                Time = saved.Time,
                Location = saved.Location,
                Description = saved.Description,
                EstimatedCost = saved.EstimatedCost,
                Status = saved.Status
            });
        }

        public async Task<ServiceResult<List<ActivityDto>>> GetAllActivities(int travelPlanId)
        {
            var travelPlan = await _travelPlanRepo.GetById(travelPlanId);
            if (travelPlan == null)
                return ServiceResult<List<ActivityDto>>.FailureResult("Travel plan not found.");

            var activities = await _activityRepo.GetAllByTravelPlanId(travelPlanId);

            var result = activities.Select(a => new ActivityDto
            {
                Id = a.Id,
                TravelPlanId = a.TravelPlanId,
                Name = a.Name,
                Date = a.Date,
                Time = a.Time,
                Location = a.Location,
                Description = a.Description,
                EstimatedCost = a.EstimatedCost,
                Status = a.Status
            }).ToList();

            return ServiceResult<List<ActivityDto>>.SuccessResult(result);
        }

        public async Task<ServiceResult<List<ActivityDto>>> GetActivitiesByDate(int travelPlanId, DateTime date)
        {
            var travelPlan = await _travelPlanRepo.GetById(travelPlanId);
            if (travelPlan == null)
                return ServiceResult<List<ActivityDto>>.FailureResult("Travel plan not found.");

            var activities = await _activityRepo.GetByDateRange(travelPlanId, date.Date, date.Date);

            var result = activities.Select(a => new ActivityDto
            {
                Id = a.Id,
                TravelPlanId = a.TravelPlanId,
                Name = a.Name,
                Date = a.Date,
                Time = a.Time,
                Location = a.Location,
                Description = a.Description,
                EstimatedCost = a.EstimatedCost,
                Status = a.Status
            }).ToList();

            return ServiceResult<List<ActivityDto>>.SuccessResult(result);
        }

        public async Task<ServiceResult<List<ActivityDto>>> GetActivitiesInRange(int travelPlanId, DateTime startDate, DateTime endDate)
        {
            var travelPlan = await _travelPlanRepo.GetById(travelPlanId);
            if (travelPlan == null)
                return ServiceResult<List<ActivityDto>>.FailureResult("Travel plan not found.");

            if (endDate < startDate)
                return ServiceResult<List<ActivityDto>>.FailureResult("End date cannot be before start date.");

            var activities = await _activityRepo.GetByDateRange(travelPlanId, startDate, endDate);

            var result = activities.Select(a => new ActivityDto
            {
                Id = a.Id,
                TravelPlanId = a.TravelPlanId,
                Name = a.Name,
                Date = a.Date,
                Time = a.Time,
                Location = a.Location,
                Description = a.Description,
                EstimatedCost = a.EstimatedCost,
                Status = a.Status
            }).ToList();

            return ServiceResult<List<ActivityDto>>.SuccessResult(result);
        }

        public async Task<ServiceResult<ActivityDto>> GetActivityById(int id)
        {
            var activity = await _activityRepo.GetById(id);

            if (activity == null)
                return ServiceResult<ActivityDto>.FailureResult("Activity not found.");

            return ServiceResult<ActivityDto>.SuccessResult(new ActivityDto
            {
                Id = activity.Id,
                TravelPlanId = activity.TravelPlanId,
                Name = activity.Name,
                Date = activity.Date,
                Time = activity.Time,
                Location = activity.Location,
                Description = activity.Description,
                EstimatedCost = activity.EstimatedCost,
                Status = activity.Status
            });
        }

        public async Task<ServiceResult<bool>> UpdateActivity(int id, CreateActivityDto dto)
        {
            var activity = await _activityRepo.GetById(id);

            if (activity == null)
                return ServiceResult<bool>.FailureResult("Activity not found.");

            var travelPlan = await _travelPlanRepo.GetById(activity.TravelPlanId);

            if (dto.Date.Date < travelPlan.StartDate.Date || dto.Date.Date > travelPlan.EndDate.Date)
                return ServiceResult<bool>.FailureResult("Activity date must be within travel plan dates.");

            if (dto.EstimatedCost < 0)
                return ServiceResult<bool>.FailureResult("Estimated cost cannot be negative.");

            if (dto.Status < 0 || dto.Status > 3)
                return ServiceResult<bool>.FailureResult("Invalid status value.");

            activity.Name = dto.Name;
            activity.Date = dto.Date;
            activity.Time = dto.Time;
            activity.Location = dto.Location;
            activity.Description = dto.Description;
            activity.EstimatedCost = dto.EstimatedCost;
            activity.Status = dto.Status;

            await _activityRepo.Update(activity);

            return ServiceResult<bool>.SuccessResult(true);
        }

        public async Task<ServiceResult<bool>> DeleteActivity(int id)
        {
            var activity = await _activityRepo.GetById(id);

            if (activity == null)
                return ServiceResult<bool>.FailureResult("Activity not found.");

            await _activityRepo.Delete(activity);

            return ServiceResult<bool>.SuccessResult(true);
        }
    }
}