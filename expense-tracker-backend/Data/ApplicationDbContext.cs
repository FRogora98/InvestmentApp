using Microsoft.EntityFrameworkCore;
using expense_tracker_backend.Models;

namespace expense_tracker_backend.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {}

        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Investment> Investments { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<Budget> Budgets { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Transaction - Category relationship
            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.CategoryObject)
                .WithMany()
                .HasForeignKey(t => t.CategoryId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);
            
            // Budget - Category relationship
            modelBuilder.Entity<Budget>()
                .HasOne(b => b.Category)
                .WithMany()
                .HasForeignKey(b => b.CategoryId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}