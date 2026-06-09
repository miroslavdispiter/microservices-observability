using System.Collections.Generic;
using System.Threading.Tasks;
using TravelService.Models;

namespace TravelService.Interfaces
{
    public interface IExpenseRepository
    {
        Task<Expense> AddAsync(Expense expense);
        Task<List<Expense>> GetAllByTravelPlanId(int travelPlanId);
        Task<List<Expense>> GetByCategory(int travelPlanId, int category);
        Task<Expense> GetById(int id);
        Task Update(Expense expense);
        Task Delete(Expense expense);
        Task<decimal> GetTotalExpenses(int travelPlanId);
        Task<Dictionary<int, decimal>> GetExpensesByCategory(int travelPlanId);
    }
}