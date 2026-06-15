using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Data.Collections;
using SharingService.Interfaces;
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

        public async Task<SharingTokenData> CreateAsync(SharingTokenData tokenData)
        {
            var dictionary = await _stateManager.GetOrAddAsync<IReliableDictionary<string, SharingTokenData>>(DictionaryName);

            using (var tx = _stateManager.CreateTransaction())
            {
                await dictionary.AddAsync(tx, tokenData.Token, tokenData);
                await tx.CommitAsync();
            }

            return tokenData;
        }

        public async Task<SharingTokenData> GetByTokenAsync(string token)
        {
            var dictionary = await _stateManager.GetOrAddAsync<IReliableDictionary<string, SharingTokenData>>(DictionaryName);

            using (var tx = _stateManager.CreateTransaction())
            {
                var result = await dictionary.TryGetValueAsync(tx, token);
                return result.HasValue ? result.Value : null;
            }
        }

        public async Task<List<SharingTokenData>> GetByOwnerIdAsync(int ownerId)
        {
            var dictionary = await _stateManager.GetOrAddAsync<IReliableDictionary<string, SharingTokenData>>(DictionaryName);
            var tokens = new List<SharingTokenData>();

            using (var tx = _stateManager.CreateTransaction())
            {
                var enumerable = await dictionary.CreateEnumerableAsync(tx);
                var enumerator = enumerable.GetAsyncEnumerator();

                while (await enumerator.MoveNextAsync(CancellationToken.None))
                {
                    if (enumerator.Current.Value.OwnerId == ownerId)
                    {
                        tokens.Add(enumerator.Current.Value);
                    }
                }
            }

            return tokens;
        }

        public async Task<bool> RevokeAsync(string token)
        {
            var dictionary = await _stateManager.GetOrAddAsync<IReliableDictionary<string, SharingTokenData>>(DictionaryName);

            using (var tx = _stateManager.CreateTransaction())
            {
                var result = await dictionary.TryRemoveAsync(tx, token);
                await tx.CommitAsync();
                return result.HasValue;
            }
        }

        public async Task<bool> ExistsAsync(string token)
        {
            var dictionary = await _stateManager.GetOrAddAsync<IReliableDictionary<string, SharingTokenData>>(DictionaryName);

            using (var tx = _stateManager.CreateTransaction())
            {
                return await dictionary.ContainsKeyAsync(tx, token);
            }
        }
    }
}