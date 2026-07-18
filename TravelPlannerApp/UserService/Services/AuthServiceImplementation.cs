using Shared.Common;
using Shared.DTOs.User;
using Shared.Enums;
using UserService.Interfaces;
using UserService.Models;
using UserService.Observability;
using Stopwatch = System.Diagnostics.Stopwatch;

namespace UserService.Services
{
    public class AuthServiceImplementation : IAuthService
    {
        private readonly IUserRepository _userRepository;
        private readonly IJwtService _jwtService;

        public AuthServiceImplementation(IUserRepository userRepository, IJwtService jwtService)
        {
            _userRepository = userRepository;
            _jwtService = jwtService;
        }

        public async Task<ServiceResult<AuthResponseDto>> Register(RegisterRequestDto request)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await RegisterCore(request);
            UserServiceMetrics.RecordOperation("Register", result.Success, stopwatch.Elapsed.TotalMilliseconds);
            return result;
        }

        private async Task<ServiceResult<AuthResponseDto>> RegisterCore(RegisterRequestDto request)
        {
            try
            {
                var existingUserByEmail = await _userRepository.GetByEmailAsync(request.Email);
                if (existingUserByEmail != null)
                {
                    return ServiceResult<AuthResponseDto>.FailureResult("User with this email already exists.");
                }

                var existingUserByUsername = await _userRepository.GetByUsernameAsync(request.Username);
                if (existingUserByUsername != null)
                {
                    return ServiceResult<AuthResponseDto>.FailureResult("User with this username already exists.");
                }

                string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

                var newUser = new User
                {
                    FirstName = request.FirstName,
                    LastName = request.LastName,
                    Username = request.Username,
                    Email = request.Email,
                    Password = hashedPassword,
                    Role = UserRole.User,
                    CreatedAt = DateTime.UtcNow
                };

                var savedUser = await _userRepository.AddAsync(newUser);

                string token = _jwtService.GenerateToken(savedUser);

                var response = new AuthResponseDto
                {
                    Id = savedUser.Id,
                    FirstName = savedUser.FirstName,
                    LastName = savedUser.LastName,
                    Username = savedUser.Username,
                    Email = savedUser.Email,
                    Token = token,
                    Role = savedUser.Role.ToString()
                };

                return ServiceResult<AuthResponseDto>.SuccessResult(response, "User registered successfully.");
            }
            catch (Exception ex)
            {
                return ServiceResult<AuthResponseDto>.FailureResult($"Registration failed: {ex.Message}");
            }
        }

        public async Task<ServiceResult<AuthResponseDto>> Login(LoginRequestDto request)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await LoginCore(request);
            UserServiceMetrics.RecordOperation("Login", result.Success, stopwatch.Elapsed.TotalMilliseconds);
            return result;
        }

        private async Task<ServiceResult<AuthResponseDto>> LoginCore(LoginRequestDto request)
        {
            try
            {
                var user = await _userRepository.GetByEmailAsync(request.Email);
                if (user == null)
                {
                    return ServiceResult<AuthResponseDto>.FailureResult("Invalid email or password.");
                }

                bool isPasswordValid = BCrypt.Net.BCrypt.Verify(request.Password, user.Password);
                if (!isPasswordValid)
                {
                    return ServiceResult<AuthResponseDto>.FailureResult("Invalid email or password.");
                }

                string token = _jwtService.GenerateToken(user);

                var response = new AuthResponseDto
                {
                    Id = user.Id,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Username = user.Username,
                    Email = user.Email,
                    Token = token,
                    Role = user.Role.ToString()
                };

                return ServiceResult<AuthResponseDto>.SuccessResult(response, "Login successful.");
            }
            catch (Exception ex)
            {
                return ServiceResult<AuthResponseDto>.FailureResult($"Login failed: {ex.Message}");
            }
        }
    }
}