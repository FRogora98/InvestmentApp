using Microsoft.EntityFrameworkCore;
using expense_tracker_backend.Data;
using expense_tracker_backend.Interfaces;
using expense_tracker_backend.Models;

namespace expense_tracker_backend.Repositories
{
    public class InvestmentRepository : IInvestmentRepository
    {
        private readonly ApplicationDbContext _context;

        public InvestmentRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Investment>> GetAllAsync()
        {
            return await _context.Investments.ToListAsync();
        }

        public async Task<Investment> GetByIdAsync(int id)
        {
            return await _context.Investments.FindAsync(id);
        }
        
        public async Task<Investment> CreateAsync(Investment investment)
        {
            _context.Investments.Add(investment);
            await _context.SaveChangesAsync();
            return investment;
        }

        public async Task UpdateAsync(Investment investment)
        {
            _context.Entry(investment).State = EntityState.Modified;
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var investment = await _context.Investments.FindAsync(id);
            if (investment != null)
            {
                _context.Investments.Remove(investment);
                await _context.SaveChangesAsync();
            }
        }
    }
}