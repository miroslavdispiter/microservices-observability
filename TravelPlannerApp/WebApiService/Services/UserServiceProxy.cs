using Microsoft.ServiceFabric.Services.Client;
using Microsoft.ServiceFabric.Services.Remoting.Client;
using Shared.Common;
using Shared.DTOs.User;
using Shared.Interfaces;
using System;
using System.Threading.Tasks;

namespace WebAPIService.Services
{
    public class UserServiceProxy
    {
        private readonly IUserService _userServiceProxy;

        public UserServiceProxy()
        {
            _userServiceProxy = ServiceProxy.Create<IUserService>(
                new Uri("fabric:/TravelPlannerApp/UserService")
            );
        }

        public async Task<ServiceResult<AuthResponseDto>> Register(RegisterRequestDto request)
        {
            return await _userServiceProxy.Register(request);
        }

        public async Task<ServiceResult<AuthResponseDto>> Login(LoginRequestDto request)
        {
            return await _userServiceProxy.Login(request);
        }
    }
}