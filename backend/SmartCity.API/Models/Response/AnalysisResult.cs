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

        // Bounding box in original image pixel coordinates (null if no detection)
        public double? BoxX1 { get; set; }
        public double? BoxY1 { get; set; }
        public double? BoxX2 { get; set; }
        public double? BoxY2 { get; set; }
    }
}