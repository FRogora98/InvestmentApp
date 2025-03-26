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
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Transaction>()
                .HasOne(t => t.CategoryObject)
                .WithMany()
                .HasForeignKey(t => t.CategoryId)
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}