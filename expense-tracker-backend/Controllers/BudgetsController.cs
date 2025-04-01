using Microsoft.AspNetCore.Mvc;
using expense_tracker_backend.Interfaces;
using expense_tracker_backend.Models;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace expense_tracker_backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BudgetsController : ControllerBase
    {
        private readonly IBudgetRepository _budgetRepository;

        public BudgetsController(IBudgetRepository budgetRepository)
        {
            _budgetRepository = budgetRepository;
        }

        // GET: api/Budgets
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Budget>>> GetBudgets()
        {
            var budgets = await _budgetRepository.GetAllBudgetsAsync();
            return Ok(budgets);
        }

        // GET: api/Budgets/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Budget>> GetBudget(int id)
        {
            var budget = await _budgetRepository.GetBudgetByIdAsync(id);

            if (budget == null)
            {
                return NotFound();
            }

            return Ok(budget);
        }

        // GET: api/Budgets/Category/5
        [HttpGet("Category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<Budget>>> GetBudgetsByCategory(int categoryId)
        {
            var budgets = await _budgetRepository.GetBudgetsByCategoryIdAsync(categoryId);
            return Ok(budgets);
        }

        // GET: api/Budgets/Summary
        [HttpGet("Summary")]
        public async Task<ActionResult> GetBudgetSummary()
        {
            var totalBudgeted = await _budgetRepository.GetTotalBudgetedAmountAsync();
            var totalSpent = await _budgetRepository.GetTotalSpentAmountAsync();

            return Ok(new { 
                TotalBudgeted = totalBudgeted,
                TotalSpent = totalSpent,
                Remaining = totalBudgeted - totalSpent,
                PercentUsed = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0
            });
        }

        // POST: api/Budgets
        [HttpPost]
        public async Task<ActionResult<Budget>> CreateBudget(Budget budget)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var newBudget = await _budgetRepository.CreateBudgetAsync(budget);
            return CreatedAtAction(nameof(GetBudget), new { id = newBudget.Id }, newBudget);
        }

        // PUT: api/Budgets/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateBudget(int id, Budget budget)
        {
            if (id != budget.Id)
            {
                return BadRequest();
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            try
            {
                await _budgetRepository.UpdateBudgetAsync(budget);
            }
            catch
            {
                // Check if the budget still exists
                var existingBudget = await _budgetRepository.GetBudgetByIdAsync(id);
                if (existingBudget == null)
                {
                    return NotFound();
                }
                throw;
            }

            return NoContent();
        }

        // PATCH: api/Budgets/5/Spent
        [HttpPatch("{id}/Spent")]
        public async Task<IActionResult> UpdateSpentAmount(int id, [FromBody] decimal amount)
        {
            var budget = await _budgetRepository.GetBudgetByIdAsync(id);
            if (budget == null)
            {
                return NotFound();
            }

            await _budgetRepository.UpdateSpentAmountAsync(id, amount);
            return NoContent();
        }

        // DELETE: api/Budgets/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteBudget(int id)
        {
            var result = await _budgetRepository.DeleteBudgetAsync(id);
            if (!result)
            {
                return NotFound();
            }

            return NoContent();
        }
    }
}
