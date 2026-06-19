namespace SmartCity.API.Models.Response
{
    public class PriorityUpdateResult
    {
        public string ComplaintId { get; set; } = string.Empty;
        public string OldPriority { get; set; } = string.Empty;
        public string NewPriority { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
    }
}