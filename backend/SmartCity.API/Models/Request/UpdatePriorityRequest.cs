namespace SmartCity.API.Models.Request
{
    public class UpdatePriorityRequest
    {
        public string ComplaintId { get; set; } = string.Empty;
        public int DuplicateCount { get; set; }
        public int DaysOld { get; set; }
        public string CurrentPriority { get; set; } = string.Empty;
    }
}