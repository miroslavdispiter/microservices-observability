using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Data.Collections;
using SharingService.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace SharingService.Repositories
{
    public class SharingTokenRepository : ISharingTokenRepository
    {
        private readonly IReliableStateManager _stateManager;
        private const string DictionaryName = "sharingTokens";

        public SharingTokenRepository(IReliableStateManager stateManager)
        {
            _stateManager = stateManager;
        }

        public async Task<SharingToken> CreateAsync(SharingToken token)
        {
            var tokens = await _stateManager.GetOrAddAsync<IReliableDictionary<string, SharingToken>>(DictionaryName);

            using (var tx = _stateManager.CreateTransaction())
            {
                await tokens.AddAsync(tx, token.Token, token);
                await tx.CommitAsync();
            }

            return token;
        }

        public async Task<SharingToken> GetByTokenAsync(string token)
        {
            var tokens = await _stateManager.GetOrAddAsync<IReliableDictionary<string, SharingToken>>(DictionaryName);

            using (var tx = _stateManager.CreateTransaction())
            {
                var result = await tokens.TryGetValueAsync(tx, token);
                return result.HasValue ? result.Value : null;
            }
        }

        public async Task<List<SharingToken>> GetByOwnerIdAsync(int ownerId)
        {
            var tokens = await _stateManager.GetOrAddAsync<IReliableDictionary<string, SharingToken>>(DictionaryName);

            using (var tx = _stateManager.CreateTransaction())
            {
                var enumerable = await tokens.CreateEnumerableAsync(tx);
                var enumerator = enumerable.GetAsyncEnumerator();

                var result = new List<SharingToken>();

                while (await enumerator.MoveNextAsync(CancellationToken.None))
                {
                    if (enumerator.Current.Value.OwnerId == ownerId)
                    {
                        result.Add(enumerator.Current.Value);
                    }
                }

                return result;
            }
        }

        public async Task<bool> RevokeAsync(string token)
        {
            var tokens = await _stateManager.GetOrAddAsync<IReliableDictionary<string, SharingToken>>(DictionaryName);

            using (var tx = _stateManager.CreateTransaction())
            {
                var existing = await tokens.TryGetValueAsync(tx, token);
                if (!existing.HasValue)
                    return false;

                var updated = existing.Value;
                updated.IsRevoked = true;

                await tokens.SetAsync(tx, token, updated);
                await tx.CommitAsync();

                return true;
            }
        }

        public async Task<bool> ExistsAsync(string token)
        {
            var tokens = await _stateManager.GetOrAddAsync<IReliableDictionary<string, SharingToken>>(DictionaryName);

            using (var tx = _stateManager.CreateTransaction())
            {
                var result = await tokens.ContainsKeyAsync(tx, token);
                return result;
            }
        }
    }
}