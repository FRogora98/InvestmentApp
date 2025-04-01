using expense_tracker_backend.Data;
using expense_tracker_backend.Interfaces;
using expense_tracker_backend.Models;
using Microsoft.EntityFrameworkCore;

namespace expense_tracker_backend.Repositories
{
    public class BudgetRepository : IBudgetRepository
    {
        private readonly ApplicationDbContext _context;

        public BudgetRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Budget>> GetAllBudgetsAsync()
        {
            return await _context.Budgets
                .Include(b => b.Category)
                .ToListAsync();
        }

        public async Task<Budget> GetBudgetByIdAsync(int id)
        {
            return await _context.Budgets
                .Include(b => b.Category)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<Budget> CreateBudgetAsync(Budget budget)
        {
            _context.Budgets.Add(budget);
            await _context.SaveChangesAsync();
            return budget;
        }

        public async Task<Budget> UpdateBudgetAsync(Budget budget)
        {
            _context.Entry(budget).State = EntityState.Modified;
            await _context.SaveChangesAsync();
            return budget;
        }

        public async Task<bool> DeleteBudgetAsync(int id)
        {
            var budget = await _context.Budgets.FindAsync(id);
            if (budget == null)
            {
                return false;
            }

            _context.Budgets.Remove(budget);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<Budget>> GetBudgetsByCategoryIdAsync(int categoryId)
        {
            return await _context.Budgets
                .Include(b => b.Category)
                .Where(b => b.CategoryId == categoryId)
                .ToListAsync();
        }

        public async Task<decimal> GetTotalBudgetedAmountAsync()
        {
            return await _context.Budgets.SumAsync(b => b.Amount);
        }

        public async Task<decimal> GetTotalSpentAmountAsync()
        {
            return await _context.Budgets.SumAsync(b => b.Spent);
        }

        public async Task UpdateSpentAmountAsync(int id, decimal amount)
        {
            var budget = await _context.Budgets.FindAsync(id);
            if (budget != null)
            {
                budget.Spent = amount;
                await _context.SaveChangesAsync();
            }
        }
    }
}
