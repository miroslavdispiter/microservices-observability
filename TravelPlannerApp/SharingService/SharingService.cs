using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Services.Communication.Runtime;
using Microsoft.ServiceFabric.Services.Remoting.Runtime;
using Microsoft.ServiceFabric.Services.Runtime;
using Shared.Common;
using Shared.DTOs.Sharing;
using Shared.Interfaces;
using SharingService.Repositories;
using SharingService.Services;
using System;
using System.Collections.Generic;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;

namespace SharingService
{
    internal sealed class SharingService : StatefulService, ISharingService
    {
        private ISharingTokenRepository _repository;
        private ISharingBusinessLogic _businessLogic;

        public SharingService(StatefulServiceContext context)
            : base(context)
        { }

        public async Task<ServiceResult<SharingTokenDto>> CreateSharingToken(int userId, CreateSharingTokenDto dto)
        {
            return await _businessLogic.CreateSharingToken(userId, dto);
        }

        public async Task<ServiceResult<SharingTokenDto>> GetSharingToken(string token)
        {
            return await _businessLogic.GetSharingToken(token);
        }

        public async Task<ServiceResult<List<SharingTokenDto>>> GetUserSharingTokens(int userId)
        {
            return await _businessLogic.GetUserSharingTokens(userId);
        }

        public async Task<ServiceResult<bool>> RevokeSharingToken(string token, int userId)
        {
            return await _businessLogic.RevokeSharingToken(token, userId);
        }

        public async Task<ServiceResult<bool>> ValidateSharingToken(ValidateSharingTokenDto dto)
        {
            return await _businessLogic.ValidateSharingToken(dto);
        }

        protected override IEnumerable<ServiceReplicaListener> CreateServiceReplicaListeners()
        {
            return this.CreateServiceRemotingReplicaListeners();
        }

        protected override async Task RunAsync(CancellationToken cancellationToken)
        {
            _repository = new SharingTokenRepository(this.StateManager);
            _businessLogic = new SharingBusinessLogic(_repository);

            while (true)
            {
                cancellationToken.ThrowIfCancellationRequested();
                await Task.Delay(TimeSpan.FromSeconds(30), cancellationToken);
            }
        }
    }
}