namespace SmartCity.API.Models.Request
{
    public class AnalyzeComplaintRequest
    {
        public string? ImageUrl { get; set; }
        public string? ImageBase64 { get; set; }
        public string ComplaintId { get; set; } = string.Empty;
    }
}