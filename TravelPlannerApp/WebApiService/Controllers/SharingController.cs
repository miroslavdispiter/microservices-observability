using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOs.Sharing;
using System.Security.Claims;
using System.Threading.Tasks;
using WebAPIService.Services;
using WebAPIService.Validators;

namespace WebAPIService.Controllers
{
    [ApiController]
    [Route("api/sharing")]
    public class SharingController : ControllerBase
    {
        private readonly SharingServiceProxy _proxy;

        public SharingController(SharingServiceProxy proxy)
        {
            _proxy = proxy;
        }

        [HttpPost("create")]
        [Authorize]
        public async Task<IActionResult> CreateSharingToken(CreateSharingTokenDto dto)
        {
            var (isValid, errors) = CreateSharingTokenValidator.Validate(dto);

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
                return Unauthorized(new { success = false, message = "Invalid token." });
            }

            int userId = int.Parse(userIdClaim.Value);

            var service = _proxy.GetSharingServiceProxy();
            var result = await service.CreateSharingToken(userId, dto);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("token/{token}")]
        public async Task<IActionResult> GetSharingToken(string token)
        {
            var service = _proxy.GetSharingServiceProxy();
            var result = await service.GetSharingToken(token);

            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpGet("my-tokens")]
        [Authorize]
        public async Task<IActionResult> GetMyTokens()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { success = false, message = "Invalid token." });
            }

            int userId = int.Parse(userIdClaim.Value);

            var service = _proxy.GetSharingServiceProxy();
            var result = await service.GetUserSharingTokens(userId);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("revoke/{token}")]
        [Authorize]
        public async Task<IActionResult> RevokeToken(string token)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { success = false, message = "Invalid token." });
            }

            int userId = int.Parse(userIdClaim.Value);

            var service = _proxy.GetSharingServiceProxy();
            var result = await service.RevokeSharingToken(token, userId);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPost("validate")]
        public async Task<IActionResult> ValidateToken(ValidateSharingTokenDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Token))
            {
                return BadRequest(new { success = false, message = "Token is required." });
            }

            if (dto.TravelPlanId <= 0)
            {
                return BadRequest(new { success = false, message = "Invalid travel plan ID." });
            }

            var service = _proxy.GetSharingServiceProxy();
            var result = await service.ValidateSharingToken(dto);

            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}