using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Shared.DTOs.Expense;
using WebAPIService.Services;
using WebAPIService.Validators;

namespace WebAPIService.Controllers
{
    [ApiController]
    [Route("api/travel/{travelPlanId}/expenses")]
    [Authorize]
    public class ExpenseController : ControllerBase
    {
        private readonly TravelServiceProxy _proxy;

        public ExpenseController(TravelServiceProxy proxy)
        {
            _proxy = proxy;
        }

        [HttpPost]
        public async Task<IActionResult> Create(int travelPlanId, CreateExpenseDto dto)
        {
            var (isValid, errors) = ExpenseValidator.Validate(dto);

            if (!isValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Validation failed.",
                    errors
                });
            }

            var service = _proxy.GetExpenseProxy();
            var result = await service.CreateExpense(travelPlanId, dto);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAll(int travelPlanId)
        {
            var service = _proxy.GetExpenseProxy();
            var result = await service.GetAllExpenses(travelPlanId);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("category/{category}")]
        public async Task<IActionResult> GetByCategory(int travelPlanId, int category)
        {
            var service = _proxy.GetExpenseProxy();
            var result = await service.GetExpensesByCategory(travelPlanId, category);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("budget-summary")]
        public async Task<IActionResult> GetBudgetSummary(int travelPlanId)
        {
            var service = _proxy.GetExpenseProxy();
            var result = await service.GetBudgetSummary(travelPlanId);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int travelPlanId, int id)
        {
            var service = _proxy.GetExpenseProxy();
            var result = await service.GetExpenseById(id);

            return result.Success ? Ok(result) : NotFound(result);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int travelPlanId, int id, CreateExpenseDto dto)
        {
            var (isValid, errors) = ExpenseValidator.Validate(dto);

            if (!isValid)
            {
                return BadRequest(new
                {
                    success = false,
                    message = "Validation failed.",
                    errors
                });
            }

            var service = _proxy.GetExpenseProxy();
            var result = await service.UpdateExpense(id, dto);

            return result.Success ? Ok(result) : BadRequest(result);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int travelPlanId, int id)
        {
            var service = _proxy.GetExpenseProxy();
            var result = await service.DeleteExpense(id);

            return result.Success ? Ok(result) : BadRequest(result);
        }
    }
}