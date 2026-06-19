namespace SmartCity.API.Models.Response
{
    public class DuplicateCheckResult
    {
        public bool IsDuplicate { get; set; }
        public string? OriginalComplaintId { get; set; }
        public int DuplicateCount { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}