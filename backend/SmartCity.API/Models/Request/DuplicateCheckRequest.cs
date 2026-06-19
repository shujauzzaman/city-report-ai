namespace SmartCity.API.Models.Request
{
    public class DuplicateCheckRequest
    {
        public string ComplaintId { get; set; } = string.Empty;
        public string IssueType { get; set; } = string.Empty;
        public double Latitude { get; set; }
        public double Longitude { get; set; }
        public string Department { get; set; } = string.Empty;
    }
}