using Microsoft.ServiceFabric.Services.Remoting;
using Shared.Common;
using Shared.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Shared.Interfaces
{
    public interface IUserService : IService
    {
        Task<ServiceResult<AuthResponseDto>> Register(RegisterRequestDto request);
        Task<ServiceResult<AuthResponseDto>> Login(LoginRequestDto request);
    }
}
