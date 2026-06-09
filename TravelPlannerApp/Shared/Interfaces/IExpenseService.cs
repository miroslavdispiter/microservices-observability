using Microsoft.ServiceFabric.Services.Remoting;
using Shared.Common;
using Shared.DTOs.Expense;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace Shared.Interfaces
{
    public interface IExpenseService : IService
    {
        Task<ServiceResult<ExpenseDto>> CreateExpense(int travelPlanId, CreateExpenseDto dto);
        Task<ServiceResult<List<ExpenseDto>>> GetAllExpenses(int travelPlanId);
        Task<ServiceResult<List<ExpenseDto>>> GetExpensesByCategory(int travelPlanId, int category);
        Task<ServiceResult<ExpenseDto>> GetExpenseById(int id);
        Task<ServiceResult<bool>> UpdateExpense(int id, CreateExpenseDto dto);
        Task<ServiceResult<bool>> DeleteExpense(int id);
        Task<ServiceResult<BudgetSummaryDto>> GetBudgetSummary(int travelPlanId);
    }
}