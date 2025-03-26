using expense_tracker_backend.Models;

namespace expense_tracker_backend.Interfaces
{
    public interface IInvestmentRepository
    {
        Task<IEnumerable<Investment>> GetAllAsync();
        Task<Investment> GetByIdAsync(int id);
        Task<Investment> CreateAsync(Investment investment);
        Task UpdateAsync(Investment investment);
        Task DeleteAsync(int id);
    }
}