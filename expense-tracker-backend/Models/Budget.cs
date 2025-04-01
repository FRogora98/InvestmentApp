using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace expense_tracker_backend.Models
{
    public class Budget
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string Name { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Amount { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        public decimal Spent { get; set; }
        
        public int? CategoryId { get; set; }
        
        [Required]
        public DateTime StartDate { get; set; }
        
        [Required]
        public DateTime EndDate { get; set; }
        
        public bool IsRecurring { get; set; }
        
        [StringLength(20)]
        public string? RecurringFrequency { get; set; }
        
        [StringLength(500)]
        public string? Notes { get; set; }
        
        // Navigation property
        public Category? Category { get; set; }
    }
}
