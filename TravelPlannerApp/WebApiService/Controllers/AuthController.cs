using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOs.User;
using System.Threading.Tasks;
using WebAPIService.Services;
using WebAPIService.Validators;

namespace WebAPIService.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly UserServiceProxy _userServiceProxy;

        public AuthController()
        {
            _userServiceProxy = new UserServiceProxy();
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequestDto request)
        {
            var (isValid, errors) = RegisterRequestValidator.Validate(request);
            if (!isValid)
            {
                return BadRequest(new { success = false, message = "Validation failed.", errors });
            }

            var result = await _userServiceProxy.Register(request);

            if (result.Success)
            {
                return Ok(new { success = true, message = result.Message, data = result.Data });
            }
            else
            {
                return BadRequest(new { success = false, message = result.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
        {
            var (isValid, errors) = LoginRequestValidator.Validate(request);
            if (!isValid)
            {
                return BadRequest(new { success = false, message = "Validation failed.", errors });
            }

            var result = await _userServiceProxy.Login(request);

            if (result.Success)
            {
                return Ok(new { success = true, message = result.Message, data = result.Data });
            }
            else
            {
                return Unauthorized(new { success = false, message = result.Message });
            }
        }

        // TEST CONTROLLERS

        [HttpGet("public")]
        public IActionResult Public()
        {
            return Ok("Public endpoint");
        }

        [Authorize]
        [HttpGet("protected")]
        public IActionResult Protected()
        {
            return Ok("Authenticated user");
        }

        [Authorize(Roles = "Admin")]
        [HttpGet("admin")]
        public IActionResult AdminOnly()
        {
            return Ok("Admin only endpoint");
        }
    }
}