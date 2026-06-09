using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOs.Activity;
using WebAPIService.Services;
using WebAPIService.Validators;

namespace WebAPIService.Controllers
{
    [ApiController]
    [Route("api/travel/{travelPlanId}/activities")]
    [Authorize]
    public class ActivityController : ControllerBase
    {
        private readonly TravelServiceProxy _proxy;

        public ActivityController(TravelServiceProxy proxy)
        {
            _proxy = proxy;
        }

        [HttpPost]
        public async Task<IActionResult> Create(int travelPlanId, CreateActivityDto dto)
        {
            var (isValid, errors) = ActivityValidator.Validate(dto);

            if (!isValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Validation failed.",
                    errors
                });
            }

            var service = _proxy.GetActivityProxy();
            var result = await service.CreateActivity(travelPlanId, dto);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(int travelPlanId)
        {
            var service = _proxy.GetActivityProxy();
            var result = await service.GetAllActivities(travelPlanId);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("date/{date}")]
        public async Task<IActionResult> GetByDate(int travelPlanId, DateTime date)
        {
            var service = _proxy.GetActivityProxy();
            var result = await service.GetActivitiesByDate(travelPlanId, date);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("range")]
        public async Task<IActionResult> GetByDateRange(int travelPlanId, [FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var service = _proxy.GetActivityProxy();
            var result = await service.GetActivitiesInRange(travelPlanId, startDate, endDate);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int travelPlanId, int id)
        {
            var service = _proxy.GetActivityProxy();
            var result = await service.GetActivityById(id);

            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int travelPlanId, int id, CreateActivityDto dto)
        {
            var (isValid, errors) = ActivityValidator.Validate(dto);

            if (!isValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Validation failed.",
                    errors
                });
            }

            var service = _proxy.GetActivityProxy();
            var result = await service.UpdateActivity(id, dto);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int travelPlanId, int id)
        {
            var service = _proxy.GetActivityProxy();
            var result = await service.DeleteActivity(id);

            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}