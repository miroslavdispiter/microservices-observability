using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOs.Destination;
using WebAPIService.Services;
using WebAPIService.Validators;
using System.Security.Claims;

namespace WebAPIService.Controllers
{
    [ApiController]
    [Route("api/travel/{travelPlanId}/destinations")]
    [Authorize]
    public class DestinationController : ControllerBase
    {
        private readonly TravelServiceProxy _proxy;

        public DestinationController(TravelServiceProxy proxy)
        {
            _proxy = proxy;
        }

        [HttpPost]
        public async Task<IActionResult> Create(int travelPlanId, CreateDestinationDto dto)
        {
            var (isValid, errors) = DestinationValidator.Validate(dto);

            if (!isValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Validation failed.",
                    errors
                });
            }

            var service = _proxy.GetDestinationProxy();
            var result = await service.CreateDestination(travelPlanId, dto);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(int travelPlanId)
        {
            var service = _proxy.GetDestinationProxy();
            var result = await service.GetAllDestinations(travelPlanId);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int travelPlanId, int id)
        {
            var service = _proxy.GetDestinationProxy();
            var result = await service.GetDestinationById(id);

            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int travelPlanId, int id, CreateDestinationDto dto)
        {
            var (isValid, errors) = DestinationValidator.Validate(dto);

            if (!isValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Validation failed.",
                    errors
                });
            }

            var service = _proxy.GetDestinationProxy();
            var result = await service.UpdateDestination(id, dto);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int travelPlanId, int id)
        {
            var service = _proxy.GetDestinationProxy();
            var result = await service.DeleteDestination(id);

            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}