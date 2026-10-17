namespace SmartCity.API.Models.Response
{
    public class AdminActionResult
    {
        public bool Success { get; set; }
        public int StatusCode { get; set; }
        public string Message { get; set; } = string.Empty;
        public string? UserId { get; set; }
    }
}