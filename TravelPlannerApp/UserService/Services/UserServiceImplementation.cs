using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Shared.Common;
using Shared.DTOs.User;
using Shared.Enums;
using Shared.Interfaces;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using UserService.Models;
using UserService.Repositories;

namespace UserService.Services
{
    public class UserServiceImplementation : IUserService
    {
        private readonly UserRepository _userRepository;
        private readonly string _jwtSecret;
        private readonly string _jwtIssuer;
        private readonly string _jwtAudience;
        private readonly int _jwtExpirationMinutes;

        public UserServiceImplementation(UserRepository userRepository, IConfiguration configuration)
        {
            _userRepository = userRepository;

            var jwtSettings = configuration.GetSection("JwtSettings");

            _jwtSecret = jwtSettings["Secret"];
            _jwtIssuer = jwtSettings["Issuer"];
            _jwtAudience = jwtSettings["Audience"];
            _jwtExpirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"]);
        }

        public async Task<ServiceResult<AuthResponseDto>> Register(RegisterRequestDto request)
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

                string token = GenerateJwtToken(savedUser);

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

                string token = GenerateJwtToken(user);

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

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSecret);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Email, user.Email),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role.ToString())
                }),
                IssuedAt = DateTime.UtcNow,
                Expires = DateTime.UtcNow.AddMinutes(_jwtExpirationMinutes),
                Issuer = _jwtIssuer,
                Audience = _jwtAudience,
                SigningCredentials = new SigningCredentials(
                    new SymmetricSecurityKey(key),
                    SecurityAlgorithms.HmacSha256Signature
                )
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }
    }
}