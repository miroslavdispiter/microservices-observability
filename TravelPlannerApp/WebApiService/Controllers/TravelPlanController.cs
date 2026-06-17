using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOs.TravelPlan;
using WebAPIService.Services;
using WebAPIService.Validators;
using System.Security.Claims;

namespace WebAPIService.Controllers
{
    [ApiController]
    [Route("api/travel")]
    [Authorize]
    public class TravelPlanController : ControllerBase
    {
        private readonly TravelServiceProxy _proxy;

        public TravelPlanController(TravelServiceProxy proxy)
        {
            _proxy = proxy;
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateTravelPlanDto dto)
        {
            var (isValid, errors) = TravelPlanValidator.Validate(dto);

            if (!isValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Validation failed.",
                    errors
                });
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            int userId = int.Parse(userIdClaim.Value);

            var service = _proxy.GetTravelPlanProxy();
            var result = await service.Create(userId, dto);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);

            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "Invalid token." });
            }

            int userId = int.Parse(userIdClaim.Value);

            var service = _proxy.GetTravelPlanProxy();
            var result = await service.GetAll(userId);

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var service = _proxy.GetTravelPlanProxy();
            var result = await service.GetById(id);
            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, CreateTravelPlanDto dto)
        {
            var (isValid, errors) = TravelPlanValidator.Validate(dto);

            if (!isValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Validation failed.",
                    errors
                });
            }

            var service = _proxy.GetTravelPlanProxy();
            var result = await service.Update(id, dto);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var service = _proxy.GetTravelPlanProxy();
            var result = await service.Delete(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("user/{userId}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteByUserId(int userId)
        {
            var service = _proxy.GetTravelPlanProxy();
            var result = await service.DeleteByUserId(userId);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}