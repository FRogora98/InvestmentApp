namespace expense_tracker_backend.Models
{
    public class Investment
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal InitialAmount { get; set; }
        public DateTime PurchaseDate { get; set; }
        public decimal CurrentValue { get; set; }
        
        public decimal Return => CurrentValue - InitialAmount;
        public decimal ReturnPercentage => InitialAmount != 0 ? (Return / InitialAmount) * 100 : 0;
    }
}