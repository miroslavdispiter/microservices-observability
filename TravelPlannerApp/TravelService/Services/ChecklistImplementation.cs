using Shared.Common;
using Shared.DTOs.Checklist;
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
    public class ChecklistImplementation : IChecklistService
    {
        private readonly IChecklistRepository _checklistRepo;
        private readonly ITravelPlanRepository _travelPlanRepo;

        public ChecklistImplementation(
            IChecklistRepository checklistRepo,
            ITravelPlanRepository travelPlanRepo)
        {
            _checklistRepo = checklistRepo;
            _travelPlanRepo = travelPlanRepo;
        }

        public async Task<ServiceResult<ChecklistItemDto>> CreateChecklistItem(int travelPlanId, CreateChecklistItemDto dto)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await CreateChecklistItemCore(travelPlanId, dto);
            TravelServiceMetrics.RecordOperation("ChecklistItem", "Create", result.Success, stopwatch.Elapsed.TotalMilliseconds);
            return result;
        }

        private async Task<ServiceResult<ChecklistItemDto>> CreateChecklistItemCore(int travelPlanId, CreateChecklistItemDto dto)
        {
            var travelPlan = await _travelPlanRepo.GetByIdAsync(travelPlanId);
            if (travelPlan == null)
                return ServiceResult<ChecklistItemDto>.FailureResult("Travel plan not found.");

            if (string.IsNullOrWhiteSpace(dto.Name))
                return ServiceResult<ChecklistItemDto>.FailureResult("Name is required.");

            if (dto.Priority < 0 || dto.Priority > 2)
                return ServiceResult<ChecklistItemDto>.FailureResult("Invalid priority value.");

            var item = new ChecklistItem
            {
                TravelPlanId = travelPlanId,
                Name = dto.Name,
                Description = dto.Description ?? string.Empty,
                Priority = dto.Priority,
                IsCompleted = false,
                CreatedAt = DateTime.UtcNow
            };

            var saved = await _checklistRepo.AddAsync(item);

            return ServiceResult<ChecklistItemDto>.SuccessResult(new ChecklistItemDto
            {
                Id = saved.Id,
                TravelPlanId = saved.TravelPlanId,
                Name = saved.Name,
                Description = saved.Description,
                IsCompleted = saved.IsCompleted,
                Priority = saved.Priority
            });
        }

        public async Task<ServiceResult<List<ChecklistItemDto>>> GetAllChecklistItems(int travelPlanId)
        {
            var travelPlan = await _travelPlanRepo.GetByIdAsync(travelPlanId);
            if (travelPlan == null)
                return ServiceResult<List<ChecklistItemDto>>.FailureResult("Travel plan not found.");

            var items = await _checklistRepo.GetAllByTravelPlanId(travelPlanId);

            var result = items.Select(i => new ChecklistItemDto
            {
                Id = i.Id,
                TravelPlanId = i.TravelPlanId,
                Name = i.Name,
                Description = i.Description,
                IsCompleted = i.IsCompleted,
                Priority = i.Priority
            }).ToList();

            return ServiceResult<List<ChecklistItemDto>>.SuccessResult(result);
        }

        public async Task<ServiceResult<ChecklistItemDto>> GetChecklistItemById(int id)
        {
            var item = await _checklistRepo.GetById(id);

            if (item == null)
                return ServiceResult<ChecklistItemDto>.FailureResult("Checklist item not found.");

            return ServiceResult<ChecklistItemDto>.SuccessResult(new ChecklistItemDto
            {
                Id = item.Id,
                TravelPlanId = item.TravelPlanId,
                Name = item.Name,
                Description = item.Description,
                IsCompleted = item.IsCompleted,
                Priority = item.Priority
            });
        }

        public async Task<ServiceResult<bool>> UpdateChecklistItem(int id, CreateChecklistItemDto dto)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await UpdateChecklistItemCore(id, dto);
            TravelServiceMetrics.RecordOperation("ChecklistItem", "Update", result.Success, stopwatch.Elapsed.TotalMilliseconds);
            return result;
        }

        private async Task<ServiceResult<bool>> UpdateChecklistItemCore(int id, CreateChecklistItemDto dto)
        {
            var item = await _checklistRepo.GetById(id);

            if (item == null)
                return ServiceResult<bool>.FailureResult("Checklist item not found.");

            if (string.IsNullOrWhiteSpace(dto.Name))
                return ServiceResult<bool>.FailureResult("Name is required.");

            if (dto.Priority < 0 || dto.Priority > 2)
                return ServiceResult<bool>.FailureResult("Invalid priority value.");

            item.Name = dto.Name;
            item.Description = dto.Description ?? string.Empty;
            item.Priority = dto.Priority;

            await _checklistRepo.Update(item);

            return ServiceResult<bool>.SuccessResult(true);
        }

        public async Task<ServiceResult<bool>> ToggleChecklistItem(int id)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await ToggleChecklistItemCore(id);
            TravelServiceMetrics.RecordOperation("ChecklistItem", "Toggle", result.Success, stopwatch.Elapsed.TotalMilliseconds);
            return result;
        }

        private async Task<ServiceResult<bool>> ToggleChecklistItemCore(int id)
        {
            var item = await _checklistRepo.GetById(id);

            if (item == null)
                return ServiceResult<bool>.FailureResult("Checklist item not found.");

            item.IsCompleted = !item.IsCompleted;

            await _checklistRepo.Update(item);

            return ServiceResult<bool>.SuccessResult(true);
        }

        public async Task<ServiceResult<bool>> DeleteChecklistItem(int id)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await DeleteChecklistItemCore(id);
            TravelServiceMetrics.RecordOperation("ChecklistItem", "Delete", result.Success, stopwatch.Elapsed.TotalMilliseconds);
            return result;
        }

        private async Task<ServiceResult<bool>> DeleteChecklistItemCore(int id)
        {
            var item = await _checklistRepo.GetById(id);

            if (item == null)
                return ServiceResult<bool>.FailureResult("Checklist item not found.");

            await _checklistRepo.Delete(item);

            return ServiceResult<bool>.SuccessResult(true);
        }

        public async Task<ServiceResult<int>> GetCompletedCount(int travelPlanId)
        {
            var travelPlan = await _travelPlanRepo.GetByIdAsync(travelPlanId);
            if (travelPlan == null)
                return ServiceResult<int>.FailureResult("Travel plan not found.");

            var count = await _checklistRepo.GetCompletedCount(travelPlanId);

            return ServiceResult<int>.SuccessResult(count);
        }
    }
}