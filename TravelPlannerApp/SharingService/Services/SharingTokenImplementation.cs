using Shared.Common;
using Shared.DTOs.Sharing;
using SharingService.Interfaces;
using SharingService.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace SharingService.Services
{
    public class SharingTokenImplementation : ISharingTokenService
    {
        private readonly ISharingTokenRepository _repository;

        public SharingTokenImplementation(ISharingTokenRepository repository)
        {
            _repository = repository;
        }

        public async Task<ServiceResult<SharingTokenDto>> CreateSharingToken(int userId, CreateSharingTokenDto dto)
        {
            try
            {
                // Validacija
                if (dto.AccessType != "VIEW" && dto.AccessType != "EDIT")
                {
                    return ServiceResult<SharingTokenDto>.FailureResult("Access type must be VIEW or EDIT.");
                }

                // Generiši unique token
                string token = Guid.NewGuid().ToString("N");

                DateTime? expiresAt = null;
                if (dto.ExpiresInDays.HasValue && dto.ExpiresInDays.Value > 0)
                {
                    expiresAt = DateTime.UtcNow.AddDays(dto.ExpiresInDays.Value);
                }

                var tokenData = new SharingTokenData
                {
                    Token = token,
                    TravelPlanId = dto.TravelPlanId,
                    OwnerId = userId,
                    AccessType = dto.AccessType,
                    CreatedAt = DateTime.UtcNow,
                    ExpiresAt = expiresAt
                };

                var created = await _repository.CreateAsync(tokenData);

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
            try
            {
                var tokenData = await _repository.GetByTokenAsync(token);

                if (tokenData == null)
                {
                    return ServiceResult<SharingTokenDto>.FailureResult("Sharing token not found.");
                }

                var tokenDto = MapToDto(tokenData);

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

                var tokenDtos = tokens.Select(t => MapToDto(t)).ToList();

                return ServiceResult<List<SharingTokenDto>>.SuccessResult(tokenDtos, "Sharing tokens retrieved successfully.");
            }
            catch (Exception ex)
            {
                return ServiceResult<List<SharingTokenDto>>.FailureResult($"Failed to retrieve sharing tokens: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> RevokeSharingToken(string token, int userId)
        {
            try
            {
                var tokenData = await _repository.GetByTokenAsync(token);

                if (tokenData == null)
                {
                    return ServiceResult<bool>.FailureResult("Sharing token not found.");
                }

                // Proveri da li je korisnik vlasnik tokena
                if (tokenData.OwnerId != userId)
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
            try
            {
                var tokenData = await _repository.GetByTokenAsync(dto.Token);

                if (tokenData == null)
                {
                    return ServiceResult<bool>.FailureResult("Invalid sharing token.");
                }

                // Proveri da li token pripada traženom travel planu
                if (tokenData.TravelPlanId != dto.TravelPlanId)
                {
                    return ServiceResult<bool>.FailureResult("Token does not match the travel plan.");
                }

                // Proveri da li je token istekao
                if (tokenData.ExpiresAt.HasValue && tokenData.ExpiresAt.Value < DateTime.UtcNow)
                {
                    return ServiceResult<bool>.FailureResult("Sharing token has expired.");
                }

                return ServiceResult<bool>.SuccessResult(true, "Sharing token is valid.");
            }
            catch (Exception ex)
            {
                return ServiceResult<bool>.FailureResult($"Failed to validate sharing token: {ex.Message}");
            }
        }

        private SharingTokenDto MapToDto(SharingTokenData tokenData)
        {
            bool isExpired = tokenData.ExpiresAt.HasValue && tokenData.ExpiresAt.Value < DateTime.UtcNow;

            return new SharingTokenDto
            {
                Token = tokenData.Token,
                TravelPlanId = tokenData.TravelPlanId,
                AccessType = tokenData.AccessType,
                CreatedAt = tokenData.CreatedAt,
                ExpiresAt = tokenData.ExpiresAt,
                IsExpired = isExpired
            };
        }
    }
}