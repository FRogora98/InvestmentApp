// Models/DTOs/TransactionDto.cs
namespace expense_tracker_backend.Models.DTOs
{
    public class TransactionDto
    {
        public int? Id { get; set; }
        public decimal Amount { get; set; }
        public string Category { get; set; }
        public DateTime Date { get; set; }
        public TransactionType Type { get; set; }
        public int? CategoryId { get; set; }
    }
}