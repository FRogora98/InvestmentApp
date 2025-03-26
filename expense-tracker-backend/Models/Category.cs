namespace expense_tracker_backend.Models
{
    public enum CategoryType
    {
        Essential = 0,
        Extra = 1,
        Income = 2,
        Investment = 3 
    }

    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public CategoryType Type { get; set; }
        public string Color { get; set; }
        public string Icon { get; set; }
    }
}