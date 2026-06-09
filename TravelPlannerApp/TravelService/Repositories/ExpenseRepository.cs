using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TravelService.DbContext;
using TravelService.Interfaces;
using TravelService.Models;

namespace TravelService.Repositories
{
    public class ExpenseRepository : IExpenseRepository
    {
        private readonly TravelDbContext _context;

        public ExpenseRepository(TravelDbContext context)
        {
            _context = context;
        }

        public async Task<Expense> AddAsync(Expense expense)
        {
            await _context.Expenses.AddAsync(expense);
            await _context.SaveChangesAsync();
            return expense;
        }

        public async Task<List<Expense>> GetAllByTravelPlanId(int travelPlanId)
        {
            return await _context.Expenses
                .Where(x => x.TravelPlanId == travelPlanId)
                .OrderByDescending(x => x.Date)
                .ToListAsync();
        }

        public async Task<List<Expense>> GetByCategory(int travelPlanId, int category)
        {
            return await _context.Expenses
                .Where(x => x.TravelPlanId == travelPlanId && x.Category == category)
                .OrderByDescending(x => x.Date)
                .ToListAsync();
        }

        public async Task<Expense> GetById(int id)
        {
            return await _context.Expenses.FindAsync(id);
        }

        public async Task Update(Expense expense)
        {
            _context.Expenses.Update(expense);
            await _context.SaveChangesAsync();
        }

        public async Task Delete(Expense expense)
        {
            _context.Expenses.Remove(expense);
            await _context.SaveChangesAsync();
        }

        public async Task<decimal> GetTotalExpenses(int travelPlanId)
        {
            return await _context.Expenses
                .Where(x => x.TravelPlanId == travelPlanId)
                .SumAsync(x => x.Amount);
        }

        public async Task<Dictionary<int, decimal>> GetExpensesByCategory(int travelPlanId)
        {
            return await _context.Expenses
                .Where(x => x.TravelPlanId == travelPlanId)
                .GroupBy(x => x.Category)
                .Select(g => new { Category = g.Key, Total = g.Sum(x => x.Amount) })
                .ToDictionaryAsync(x => x.Category, x => x.Total);
        }
    }
}