namespace Shared.DTOs.Checklist
{
    public class CreateChecklistItemDto
    {
        public string Name { get; set; }
        public string Description { get; set; }
        public int Priority { get; set; }
    }
}