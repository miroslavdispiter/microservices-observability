using SharingService.Models;
using SharingService.Observability;
using SharingService.Repositories;
using Shared.Common;
using Shared.DTOs.Sharing;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Threading.Tasks;
using Stopwatch = System.Diagnostics.Stopwatch;

namespace SharingService.Services
{
    public class SharingBusinessLogic : ISharingBusinessLogic
    {
        private readonly ISharingTokenRepository _repository;

        public SharingBusinessLogic(ISharingTokenRepository repository)
        {
            _repository = repository;
        }

        public async Task<ServiceResult<SharingTokenDto>> CreateSharingToken(int userId, CreateSharingTokenDto dto)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await CreateSharingTokenCore(userId, dto);
            SharingServiceMetrics.RecordOperation("CreateSharingToken", result.Success, stopwatch.Elapsed.TotalMilliseconds);
            return result;
        }

        private async Task<ServiceResult<SharingTokenDto>> CreateSharingTokenCore(int userId, CreateSharingTokenDto dto)
        {
            try
            {
                var tokenString = GenerateUniqueToken();

                var token = new SharingToken
                {
                    Token = tokenString,
                    TravelPlanId = dto.TravelPlanId,
                    OwnerId = userId,
                    AccessType = dto.AccessType,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = dto.ExpiresInDays.HasValue
                        ? DateTime.UtcNow.AddDays(dto.ExpiresInDays.Value)
                        : (DateTime?)null,
                    IsRevoked = false
                };

                var created = await _repository.CreateAsync(token);
                var tokenDto = MapToDto(created);

                return ServiceResult<SharingTokenDto>.SuccessResult(tokenDto, "Sharing token created successfully.");
            }
            catch (Exception ex)
            {
                return ServiceResult<SharingTokenDto>.FailureResult($"Failed to create sharing token: {ex.Message}");
            }
        }

        public async Task<ServiceResult<SharingTokenDto>> GetSharingToken(string token)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await GetSharingTokenCore(token);
            SharingServiceMetrics.RecordOperation("GetSharingToken", result.Success, stopwatch.Elapsed.TotalMilliseconds);
            return result;
        }

        private async Task<ServiceResult<SharingTokenDto>> GetSharingTokenCore(string token)
        {
            try
            {
                var sharingToken = await _repository.GetByTokenAsync(token);

                if (sharingToken == null)
                {
                    return ServiceResult<SharingTokenDto>.FailureResult("Sharing token not found.");
                }

                var tokenDto = MapToDto(sharingToken);

                return ServiceResult<SharingTokenDto>.SuccessResult(tokenDto, "Sharing token retrieved successfully.");
            }
            catch (Exception ex)
            {
                return ServiceResult<SharingTokenDto>.FailureResult($"Failed to retrieve sharing token: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<SharingTokenDto>>> GetUserSharingTokens(int userId)
        {
            try
            {
                var tokens = await _repository.GetByOwnerIdAsync(userId);
                var tokenDtos = tokens.Select(MapToDto).ToList();

                return ServiceResult<List<SharingTokenDto>>.SuccessResult(tokenDtos, "Sharing tokens retrieved successfully.");
            }
            catch (Exception ex)
            {
                return ServiceResult<List<SharingTokenDto>>.FailureResult($"Failed to retrieve sharing tokens: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> RevokeSharingToken(string token, int userId)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await RevokeSharingTokenCore(token, userId);
            SharingServiceMetrics.RecordOperation("RevokeSharingToken", result.Success, stopwatch.Elapsed.TotalMilliseconds);
            return result;
        }

        private async Task<ServiceResult<bool>> RevokeSharingTokenCore(string token, int userId)
        {
            try
            {
                var sharingToken = await _repository.GetByTokenAsync(token);

                if (sharingToken == null)
                {
                    return ServiceResult<bool>.FailureResult("Sharing token not found.");
                }

                if (sharingToken.OwnerId != userId)
                {
                    return ServiceResult<bool>.FailureResult("You are not authorized to revoke this token.");
                }

                var result = await _repository.RevokeAsync(token);

                return result
                    ? ServiceResult<bool>.SuccessResult(true, "Sharing token revoked successfully.")
                    : ServiceResult<bool>.FailureResult("Failed to revoke sharing token.");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Failed to revoke sharing token: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> ValidateSharingToken(ValidateSharingTokenDto dto)
        {
            var stopwatch = Stopwatch.StartNew();
            var result = await ValidateSharingTokenCore(dto);
            SharingServiceMetrics.RecordOperation("ValidateSharingToken", result.Success, stopwatch.Elapsed.TotalMilliseconds);
            return result;
        }

        private async Task<ServiceResult<bool>> ValidateSharingTokenCore(ValidateSharingTokenDto dto)
        {
            try
            {
                var sharingToken = await _repository.GetByTokenAsync(dto.Token);

                if (sharingToken == null)
                {
                    return ServiceResult<bool>.FailureResult("Invalid sharing token.");
                }

                if (sharingToken.IsRevoked)
                {
                    return ServiceResult<bool>.FailureResult("This sharing token has been revoked.");
                }

                if (sharingToken.ExpiresAt.HasValue && sharingToken.ExpiresAt.Value < DateTime.UtcNow)
                {
                    return ServiceResult<bool>.FailureResult("This sharing token has expired.");
                }

                if (sharingToken.TravelPlanId != dto.TravelPlanId)
                {
                    return ServiceResult<bool>.FailureResult("Token does not match the travel plan.");
                }

                return ServiceResult<bool>.SuccessResult(true, "Token is valid.");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Token validation failed: {ex.Message}");
            }
        }

        private SharingTokenDto MapToDto(SharingToken token)
        {
            bool isExpired = token.IsRevoked ||
                             (token.ExpiresAt.HasValue && token.ExpiresAt.Value < DateTime.UtcNow);

            return new SharingTokenDto
            {
                Token = token.Token,
                TravelPlanId = token.TravelPlanId,
                AccessType = token.AccessType,
                CreatedAt = token.CreatedAt,
                ExpiresAt = token.ExpiresAt,
                IsExpired = isExpired
            };
        }

        private string GenerateUniqueToken()
        {
            using (var rng = new RNGCryptoServiceProvider())
            {
                var tokenBytes = new byte[32];
                rng.GetBytes(tokenBytes);
                return Convert.ToBase64String(tokenBytes)
                    .Replace("+", "-")
                    .Replace("/", "_")
                    .Replace("=", "");
            }
        }
    }
}