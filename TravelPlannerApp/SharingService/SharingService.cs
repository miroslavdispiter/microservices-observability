using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Shared.Common;
using Shared.DTOs.Sharing;
using Shared.Interfaces;
using SharingService.Interfaces;
using SharingService.Repositories;
using SharingService.Services;
using System;
using System.Collections.Generic;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;

namespace SharingService
{
    internal sealed class SharingService : StatelessService, ISharingService
    {
        public SharingService(StatefulServiceContext context)
            : base(context)
        {
        }

        protected override IEnumerable<ServiceReplicaListener> CreateServiceInstanceListeners()
        {
            return this.CreateServiceRemotingReplicaListeners();
        }

        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            try
            {
                ServiceEventSource.Current.ServiceMessage(
                    this.Context,
                    "SharingService RunAsync started"
                );

                if (this.StateManager == null)
                {
                    ServiceEventSource.Current.ServiceMessage(
                        this.Context,
                        "ERROR: StateManager is null!"
                    );
                    throw new InvalidOperationException("StateManager is not initialized");
                }

                ServiceEventSource.Current.ServiceMessage(
                    this.Context,
                    "SharingService initialized successfully"
                );

                while (!cancellationToken.IsCancellationRequested)
                {
                    await Task.Delay(TimeSpan.FromSeconds(30), cancellationToken);
                }
            }
            catch (Exception ex)
            {
                ServiceEventSource.Current.ServiceMessage(
                    this.Context,
                    $"SharingService ERROR: {ex.GetType().Name} - {ex.Message}\n{ex.StackTrace}"
                );

                throw;
            }
        }

        #region ISharingService Implementation

        public async Task<ServiceResult<SharingTokenDto>> CreateSharingToken(int userId, CreateSharingTokenDto dto)
        {
            try
            {
                var repository = new SharingTokenRepository(this.StateManager);
                var service = new SharingTokenImplementation(repository);

                return await service.CreateSharingToken(userId, dto);
            }
            catch (Exception ex)
            {
                ServiceEventSource.Current.ServiceMessage(
                    this.Context,
                    $"CreateSharingToken ERROR: {ex.Message}"
                );
                return ServiceResult<SharingTokenDto>.FailureResult($"Failed to create sharing token: {ex.Message}");
            }
        }

        public async Task<ServiceResult<SharingTokenDto>> GetSharingToken(string token)
        {
            try
            {
                var repository = new SharingTokenRepository(this.StateManager);
                var service = new SharingTokenImplementation(repository);

                return await service.GetSharingToken(token);
            }
            catch (Exception ex)
            {
                ServiceEventSource.Current.ServiceMessage(
                    this.Context,
                    $"GetSharingToken ERROR: {ex.Message}"
                );
                return ServiceResult<SharingTokenDto>.FailureResult($"Failed to get sharing token: {ex.Message}");
            }
        }

        public async Task<ServiceResult<List<SharingTokenDto>>> GetUserSharingTokens(int userId)
        {
            try
            {
                var repository = new SharingTokenRepository(this.StateManager);
                var service = new SharingTokenImplementation(repository);

                return await service.GetUserSharingTokens(userId);
            }
            catch (Exception ex)
            {
                ServiceEventSource.Current.ServiceMessage(
                    this.Context,
                    $"GetUserSharingTokens ERROR: {ex.Message}"
                );
                return ServiceResult<List<SharingTokenDto>>.FailureResult($"Failed to get user tokens: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> RevokeSharingToken(string token, int userId)
        {
            try
            {
                var repository = new SharingTokenRepository(this.StateManager);
                var service = new SharingTokenImplementation(repository);

                return await service.RevokeSharingToken(token, userId);
            }
            catch (Exception ex)
            {
                ServiceEventSource.Current.ServiceMessage(
                    this.Context,
                    $"RevokeSharingToken ERROR: {ex.Message}"
                );
                return ServiceResult<bool>.FailureResult($"Failed to revoke token: {ex.Message}");
            }
        }

        public async Task<ServiceResult<bool>> ValidateSharingToken(ValidateSharingTokenDto dto)
        {
            try
            {
                var repository = new SharingTokenRepository(this.StateManager);
                var service = new SharingTokenImplementation(repository);

                return await service.ValidateSharingToken(dto);
            }
            catch (Exception ex)
            {
                ServiceEventSource.Current.ServiceMessage(
                    this.Context,
                    $"ValidateSharingToken ERROR: {ex.Message}"
                );
                return ServiceResult<bool>.FailureResult($"Failed to validate token: {ex.Message}");
            }
        }

        #endregion
    }
}