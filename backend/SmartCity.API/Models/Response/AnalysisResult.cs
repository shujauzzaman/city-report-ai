namespace SmartCity.API.Models.Response
{
    public class AnalysisResult
    {
        public bool Success { get; set; }
        public string IssueType { get; set; } = string.Empty;
        public string Department { get; set; } = string.Empty;
        public string Priority { get; set; } = string.Empty;
        public string HazardLevel { get; set; } = string.Empty;
        public double Confidence { get; set; }
        public string Message { get; set; } = string.Empty;
    }
}