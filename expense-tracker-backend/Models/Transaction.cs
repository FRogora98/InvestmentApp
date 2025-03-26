namespace expense_tracker_backend.Models
{
    public enum TransactionType
    {
        Expense = 0,
        Income = 1,
        Investment = 2
    }

    public class Transaction
    {
        public int Id { get; set; }
        public decimal Amount { get; set; }
        public string Category { get; set; }
        public DateTime Date { get; set; }
        public TransactionType Type { get; set; }
        
        public int? CategoryId { get; set; }
        public Category CategoryObject { get; set; }
    }
}