using Shared.Common;
using Shared.DTOs.Expense;
using Shared.Interfaces;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using TravelService.Interfaces;
using TravelService.Models;

namespace TravelService.Services
{
    public class ExpenseImplementation : IExpenseService
    {
        private readonly IExpenseRepository _expenseRepo;
        private readonly ITravelPlanRepository _travelPlanRepo;

        public ExpenseImplementation(
            IExpenseRepository expenseRepo,
            ITravelPlanRepository travelPlanRepo)
        {
            _expenseRepo = expenseRepo;
            _travelPlanRepo = travelPlanRepo;
        }

        public async Task<ServiceResult<ExpenseDto>> CreateExpense(int travelPlanId, CreateExpenseDto dto)
        {
            var travelPlan = await _travelPlanRepo.GetByIdAsync(travelPlanId);
            if (travelPlan == null)
                return ServiceResult<ExpenseDto>.FailureResult("Travel plan not found.");

            if (dto.Amount < 0)
                return ServiceResult<ExpenseDto>.FailureResult("Amount cannot be negative.");

            if (dto.Category < 0 || dto.Category > 5)
                return ServiceResult<ExpenseDto>.FailureResult("Invalid category value.");

            if (dto.Date.Date < travelPlan.StartDate.Date || dto.Date.Date > travelPlan.EndDate.Date)
                return ServiceResult<ExpenseDto>.FailureResult("Expense date must be within travel plan dates.");

            var expense = new Expense
            {
                TravelPlanId = travelPlanId,
                Name = dto.Name,
                Category = dto.Category,
                Amount = dto.Amount,
                Date = dto.Date,
                Description = dto.Description ?? string.Empty,
                CreatedAt = DateTime.UtcNow
            };

            var saved = await _expenseRepo.AddAsync(expense);

            return ServiceResult<ExpenseDto>.SuccessResult(new ExpenseDto
            {
                Id = saved.Id,
                TravelPlanId = saved.TravelPlanId,
                Name = saved.Name,
                Category = saved.Category,
                Amount = saved.Amount,
                Date = saved.Date,
                Description = saved.Description
            });
        }

        public async Task<ServiceResult<List<ExpenseDto>>> GetAllExpenses(int travelPlanId)
        {
            var travelPlan = await _travelPlanRepo.GetByIdAsync(travelPlanId);
            if (travelPlan == null)
                return ServiceResult<List<ExpenseDto>>.FailureResult("Travel plan not found.");

            var expenses = await _expenseRepo.GetAllByTravelPlanId(travelPlanId);

            var result = expenses.Select(e => new ExpenseDto
            {
                Id = e.Id,
                TravelPlanId = e.TravelPlanId,
                Name = e.Name,
                Category = e.Category,
                Amount = e.Amount,
                Date = e.Date,
                Description = e.Description
            }).ToList();

            return ServiceResult<List<ExpenseDto>>.SuccessResult(result);
        }

        public async Task<ServiceResult<List<ExpenseDto>>> GetExpensesByCategory(int travelPlanId, int category)
        {
            var travelPlan = await _travelPlanRepo.GetByIdAsync(travelPlanId);
            if (travelPlan == null)
                return ServiceResult<List<ExpenseDto>>.FailureResult("Travel plan not found.");

            if (category < 0 || category > 5)
                return ServiceResult<List<ExpenseDto>>.FailureResult("Invalid category value.");

            var expenses = await _expenseRepo.GetByCategory(travelPlanId, category);

            var result = expenses.Select(e => new ExpenseDto
            {
                Id = e.Id,
                TravelPlanId = e.TravelPlanId,
                Name = e.Name,
                Category = e.Category,
                Amount = e.Amount,
                Date = e.Date,
                Description = e.Description
            }).ToList();

            return ServiceResult<List<ExpenseDto>>.SuccessResult(result);
        }

        public async Task<ServiceResult<ExpenseDto>> GetExpenseById(int id)
        {
            var expense = await _expenseRepo.GetById(id);

            if (expense == null)
                return ServiceResult<ExpenseDto>.FailureResult("Expense not found.");

            return ServiceResult<ExpenseDto>.SuccessResult(new ExpenseDto
            {
                Id = expense.Id,
                TravelPlanId = expense.TravelPlanId,
                Name = expense.Name,
                Category = expense.Category,
                Amount = expense.Amount,
                Date = expense.Date,
                Description = expense.Description
            });
        }

        public async Task<ServiceResult<bool>> UpdateExpense(int id, CreateExpenseDto dto)
        {
            var expense = await _expenseRepo.GetById(id);

            if (expense == null)
                return ServiceResult<bool>.FailureResult("Expense not found.");

            var travelPlan = await _travelPlanRepo.GetByIdAsync(expense.TravelPlanId);

            if (dto.Amount < 0)
                return ServiceResult<bool>.FailureResult("Amount cannot be negative.");

            if (dto.Category < 0 || dto.Category > 5)
                return ServiceResult<bool>.FailureResult("Invalid category value.");

            if (dto.Date.Date < travelPlan.StartDate.Date || dto.Date.Date > travelPlan.EndDate.Date)
                return ServiceResult<bool>.FailureResult("Expense date must be within travel plan dates.");

            expense.Name = dto.Name;
            expense.Category = dto.Category;
            expense.Amount = dto.Amount;
            expense.Date = dto.Date;
            expense.Description = dto.Description ?? string.Empty;

            await _expenseRepo.Update(expense);

            return ServiceResult<bool>.SuccessResult(true);
        }

        public async Task<ServiceResult<bool>> DeleteExpense(int id)
        {
            var expense = await _expenseRepo.GetById(id);

            if (expense == null)
                return ServiceResult<bool>.FailureResult("Expense not found.");

            await _expenseRepo.Delete(expense);

            return ServiceResult<bool>.SuccessResult(true);
        }

        public async Task<ServiceResult<BudgetSummaryDto>> GetBudgetSummary(int travelPlanId)
        {
            var travelPlan = await _travelPlanRepo.GetByIdAsync(travelPlanId);
            if (travelPlan == null)
                return ServiceResult<BudgetSummaryDto>.FailureResult("Travel plan not found.");

            var totalExpenses = await _expenseRepo.GetTotalExpenses(travelPlanId);
            var expensesByCategory = await _expenseRepo.GetExpensesByCategory(travelPlanId);

            var categoryNames = new Dictionary<int, string>
            {
                { 0, "Transportation" },
                { 1, "Accommodation" },
                { 2, "Food" },
                { 3, "Tickets" },
                { 4, "Shopping" },
                { 5, "Other" }
            };

            var categorySummary = expensesByCategory.ToDictionary(
                kvp => categoryNames[kvp.Key],
                kvp => kvp.Value
            );

            var summary = new BudgetSummaryDto
            {
                PlannedBudget = travelPlan.Budget,
                TotalExpenses = totalExpenses,
                RemainingBudget = travelPlan.Budget - totalExpenses,
                ExpensesByCategory = categorySummary
            };

            return ServiceResult<BudgetSummaryDto>.SuccessResult(summary);
        }
    }
}