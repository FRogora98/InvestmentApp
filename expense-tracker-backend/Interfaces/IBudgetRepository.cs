using expense_tracker_backend.Models;

namespace expense_tracker_backend.Interfaces
{
    public interface IBudgetRepository
    {
        Task<IEnumerable<Budget>> GetAllBudgetsAsync();
        Task<Budget> GetBudgetByIdAsync(int id);
        Task<Budget> CreateBudgetAsync(Budget budget);
        Task<Budget> UpdateBudgetAsync(Budget budget);
        Task<bool> DeleteBudgetAsync(int id);
        Task<IEnumerable<Budget>> GetBudgetsByCategoryIdAsync(int categoryId);
        Task<decimal> GetTotalBudgetedAmountAsync();
        Task<decimal> GetTotalSpentAmountAsync();
        Task UpdateSpentAmountAsync(int id, decimal amount);
    }
}
