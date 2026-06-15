using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOs.User;
using WebAPIService.Services;
using WebAPIService.Validators;

namespace WebAPIService.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "Admin")]
    public class AdminController : ControllerBase
    {
        private readonly UserServiceProxy _userProxy;
        private readonly TravelServiceProxy _travelProxy;

        public AdminController(UserServiceProxy userProxy, TravelServiceProxy travelProxy)
        {
            _userProxy = userProxy;
            _travelProxy = travelProxy;
        }

        #region User Management

        [HttpGet("users")]
        public async Task<IActionResult> GetAllUsers()
        {
            var service = _userProxy.GetUserServiceProxy();
            var result = await service.GetAllUsers();

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("users/{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var service = _userProxy.GetUserServiceProxy();
            var result = await service.GetUserById(id);

            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPut("users/{id}")]
        public async Task<IActionResult> UpdateUser(int id, UpdateUserDto dto)
        {
            var (isValid, errors) = UpdateUserValidator.Validate(dto);

            if (!isValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Validation failed.",
                    errors
                });
            }

            var service = _userProxy.GetUserServiceProxy();
            var result = await service.UpdateUser(id, dto);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("users/{id}")]
        public async Task<IActionResult> DeleteUser(int id)
        {
            var service = _userProxy.GetUserServiceProxy();
            var result = await service.DeleteUser(id);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpPatch("users/{id}/change-password")]
        public async Task<IActionResult> ChangeUserPassword(int id, ChangePasswordDto dto)
        {
            var (isValid, errors) = ChangePasswordValidator.Validate(dto);

            if (!isValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Validation failed.",
                    errors
                });
            }

            var service = _userProxy.GetUserServiceProxy();
            var result = await service.ChangeUserPassword(id, dto);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        #endregion

        #region Travel Plans Management

        [HttpGet("travel-plans")]
        public async Task<IActionResult> GetAllTravelPlans()
        {
            var service = _travelProxy.GetTravelPlanProxy();
            var result = await service.GetAllTravelPlans();

            return result.Success ? Ok(result) : BadRequest(result);
        }

        #endregion
    }
}