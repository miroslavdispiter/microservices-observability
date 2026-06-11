using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOs.Checklist;
using WebAPIService.Services;
using WebAPIService.Validators;

namespace WebAPIService.Controllers
{
    [ApiController]
    [Route("api/travel/{travelPlanId}/checklist")]
    [Authorize]
    public class ChecklistController : ControllerBase
    {
        private readonly TravelServiceProxy _proxy;

        public ChecklistController(TravelServiceProxy proxy)
        {
            _proxy = proxy;
        }

        [HttpPost]
        public async Task<IActionResult> Create(int travelPlanId, CreateChecklistItemDto dto)
        {
            var (isValid, errors) = ChecklistValidator.Validate(dto);

            if (!isValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Validation failed.",
                    errors
                });
            }

            var service = _proxy.GetChecklistProxy();
            var result = await service.CreateChecklistItem(travelPlanId, dto);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(int travelPlanId)
        {
            var service = _proxy.GetChecklistProxy();
            var result = await service.GetAllChecklistItems(travelPlanId);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("completed-count")]
        public async Task<IActionResult> GetCompletedCount(int travelPlanId)
        {
            var service = _proxy.GetChecklistProxy();
            var result = await service.GetCompletedCount(travelPlanId);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int travelPlanId, int id)
        {
            var service = _proxy.GetChecklistProxy();
            var result = await service.GetChecklistItemById(id);

            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int travelPlanId, int id, CreateChecklistItemDto dto)
        {
            var (isValid, errors) = ChecklistValidator.Validate(dto);

            if (!isValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Validation failed.",
                    errors
                });
            }

            var service = _proxy.GetChecklistProxy();
            var result = await service.UpdateChecklistItem(id, dto);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPatch("{id}/toggle")]
        public async Task<IActionResult> Toggle(int travelPlanId, int id)
        {
            var service = _proxy.GetChecklistProxy();
            var result = await service.ToggleChecklistItem(id);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int travelPlanId, int id)
        {
            var service = _proxy.GetChecklistProxy();
            var result = await service.DeleteChecklistItem(id);

            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}