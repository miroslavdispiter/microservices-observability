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
        private readonly TravelServiceProxy _proxy = new();

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

            var result = await _proxy.Create(userId, dto);

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

            var result = await _proxy.GetAll(userId);

            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var result = await _proxy.GetById(id);
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

            var result = await _proxy.Update(id, dto);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var result = await _proxy.Delete(id);
            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}